<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import type { Map, Marker } from 'leaflet';
	import debounce from 'lodash.debounce';

	// Types
	interface LocationDetails {
		latitude: number;
		longitude: number;
		address?: string;
		road?: string;
		house_number?: string;
		city?: string;
		state?: string;
		country?: string;
		postalCode?: string;
	}

	interface SearchResult {
		place_id: string;
		display_name: string;
		lat: string;
		lon: string;
		type?: string;
		importance?: number;
	}

	interface MapPickerProps {
		initialLat?: number;
		initialLng?: number;
		zoom?: number;
		height?: string;
		searchPlaceholder?: string;
		countryCode?: string;
		disabled?: boolean;
	}

	// Props with defaults
	let {
		initialLat,
		initialLng,
		zoom = 10,
		height = 'h-96',
		searchPlaceholder = 'Search for a location...',
		countryCode = 'in',
		disabled = false
	}: MapPickerProps = $props();

	// Event dispatcher
	const dispatch = createEventDispatcher<{
		locationSelected: LocationDetails;
		locationError: string;
		mapReady: void;
	}>();

	// Component state
	let mapContainer: HTMLElement;
	let map: Map | undefined;
	let marker: Marker | undefined;
	let L: typeof import('leaflet') | undefined;

	let searchQuery = $state('');
	let searchResults = $state<SearchResult[]>([]);
	let isSearching = $state(false);
	let isLoadingLocation = $state(false);
	let isMapLoading = $state(true);
	let mapStatusMessage = $state('Initializing map...');
	let showSearchResults = $state(false);

	// Reactive values
	const isDisabled = $derived(disabled || isMapLoading);
	const hasSearchResults = $derived(searchResults.length > 0);

	onMount(() => {
		initMap();

		// Handle map resizing
		const resizeObserver = new ResizeObserver(() => {
			if (map) {
				setTimeout(() => map?.invalidateSize(), 100);
			}
		});

		if (mapContainer) {
			resizeObserver.observe(mapContainer);
		}

		return () => {
			cleanup();
			if (mapContainer) {
				resizeObserver.unobserve(mapContainer);
			}
		};
	});

	async function initMap(): Promise<void> {
		if (!browser || !mapContainer) {
			mapStatusMessage = 'Map requires browser environment';
			return;
		}

		try {
			isMapLoading = true;
			mapStatusMessage = 'Loading map components...';

			// Dynamic imports
			L = await import('leaflet');
			await import('leaflet/dist/leaflet.css');

			// Fix marker icons
			setupLeafletIcons();

			const lat = initialLat ?? 20.5937; // Default to India center
			const lng = initialLng ?? 78.9629;

			// Create map
			map = L.map(mapContainer, {
				center: [lat, lng],
				zoom: zoom,
				zoomControl: true,
				attributionControl: true
			});

			// Add tile layer
			const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
				maxZoom: 19,
				tileSize: 256
			});

			tileLayer.on('tileerror', handleTileError);
			tileLayer.addTo(map);

			// Setup map events
			map.whenReady(() => {
				isMapLoading = false;
				mapStatusMessage = 'Click on the map to select a location';

				if (initialLat !== undefined && initialLng !== undefined) {
					updateLocationOnMap(initialLat, initialLng);
				}

				dispatch('mapReady');
			});

			map.on('click', handleMapClick);
		} catch (error) {
			console.error('Failed to initialize map:', error);
			mapStatusMessage = 'Failed to load map. Please refresh the page.';
			isMapLoading = false;
			dispatch('locationError', 'Map initialization failed');
		}
	}

	function setupLeafletIcons(): void {
		if (!L) return;

		// @ts-ignore - Leaflet icon fix
		delete L.Icon.Default.prototype._getIconUrl;

		L.Icon.Default.mergeOptions({
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
		});
	}

	function handleTileError(): void {
		mapStatusMessage = 'Failed to load map tiles. Check your connection.';
		dispatch('locationError', mapStatusMessage);
	}

	async function handleMapClick(e: any): Promise<void> {
		const { lat, lng } = e.latlng;
		await updateLocationOnMap(lat, lng);
	}

	async function updateLocationOnMap(lat: number, lng: number): Promise<void> {
		if (!map || !L) return;

		try {
			// Update or create marker
			if (marker) {
				marker.setLatLng([lat, lng]);
			} else {
				marker = L.marker([lat, lng], {
					draggable: true
				}).addTo(map);

				// Make marker draggable
				marker.on('dragend', async (e) => {
					const position = e.target.getLatLng();
					await updateLocationOnMap(position.lat, position.lng);
				});
			}

			// Center map
			map.setView([lat, lng], Math.max(map.getZoom() || 10, 15));
			mapStatusMessage = 'Fetching address details...';

			// Get address
			await reverseGeocode(lat, lng);
		} catch (error) {
			console.error('Error updating location:', error);
			dispatch('locationError', 'Failed to update location');
		}
	}

	async function reverseGeocode(lat: number, lng: number): Promise<void> {
		try {
			const url = new URL('https://nominatim.openstreetmap.org/reverse');
			url.searchParams.set('format', 'json');
			url.searchParams.set('lat', lat.toString());
			url.searchParams.set('lon', lng.toString());
			url.searchParams.set('addressdetails', '1');

			const response = await fetch(url.toString(), {
				headers: {
					'User-Agent': 'SvelteKit-MapPicker/1.0'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const result = await response.json();
			const details: LocationDetails = {
				latitude: lat,
				longitude: lng
			};

			if (result?.address) {
				const addr = result.address;

				Object.assign(details, {
					address: result.display_name?.trim() || '',
					road: addr.road?.trim() || addr.pedestrian?.trim() || '',
					house_number: addr.house_number?.trim() || '',
					city:
						addr.city?.trim() ||
						addr.town?.trim() ||
						addr.village?.trim() ||
						addr.municipality?.trim() ||
						'',
					state: addr.state?.trim() || addr.region?.trim() || '',
					country: addr.country?.trim() || '',
					postalCode: addr.postcode?.trim() || ''
				});

				mapStatusMessage = `Selected: ${details.city || 'Location'}, ${details.state || details.country}`;
			} else {
				mapStatusMessage = 'Location selected (address unavailable)';
			}

			dispatch('locationSelected', details);
		} catch (error) {
			console.error('Reverse geocoding failed:', error);
			mapStatusMessage = 'Location selected (address lookup failed)';
			dispatch('locationSelected', { latitude: lat, longitude: lng });
			dispatch('locationError', 'Could not fetch address details');
		}
	}

	async function searchLocation(): Promise<void> {
		const query = searchQuery.trim();
		if (!query) {
			searchResults = [];
			showSearchResults = false;
			return;
		}

		try {
			isSearching = true;
			mapStatusMessage = `Searching for "${query}"...`;

			const url = new URL('https://nominatim.openstreetmap.org/search');
			url.searchParams.set('format', 'json');
			url.searchParams.set('q', query);
			url.searchParams.set('limit', '5');
			url.searchParams.set('addressdetails', '1');

			if (countryCode) {
				url.searchParams.set('countrycodes', countryCode);
			}

			const response = await fetch(url.toString(), {
				headers: {
					'User-Agent': 'SvelteKit-MapPicker/1.0'
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const results = await response.json();
			searchResults = results;
			showSearchResults = results.length > 0;

			if (results.length === 0) {
				mapStatusMessage = `No results found for "${query}"`;
				dispatch('locationError', 'No search results found');
			} else {
				mapStatusMessage = `Found ${results.length} result${results.length === 1 ? '' : 's'}`;
			}
		} catch (error) {
			console.error('Search failed:', error);
			mapStatusMessage = 'Search failed. Please try again.';
			dispatch('locationError', 'Search request failed');
			searchResults = [];
			showSearchResults = false;
		} finally {
			isSearching = false;
		}
	}

	function selectSearchResult(result: SearchResult): void {
		searchQuery = result.display_name;
		searchResults = [];
		showSearchResults = false;
		updateLocationOnMap(parseFloat(result.lat), parseFloat(result.lon));
	}

	function handleSearchInput(): void {
		if (!searchQuery.trim()) {
			searchResults = [];
			showSearchResults = false;
			return;
		}
		debouncedSearch();
	}

	function handleSearchKeydown(event: KeyboardEvent): void {
		if (event.key === 'Enter') {
			event.preventDefault();
			debouncedSearch.cancel();
			searchLocation();
		} else if (event.key === 'Escape') {
			searchResults = [];
			showSearchResults = false;
		}
	}

	function handleSearchBlur(): void {
		// Delay hiding results to allow for clicks
		setTimeout(() => {
			showSearchResults = false;
		}, 150);
	}

	function cleanup(): void {
		if (marker) {
			marker.remove();
			marker = undefined;
		}
		if (map) {
			map.off();
			map.remove();
			map = undefined;
		}
		L = undefined;
	}

	// Debounced search
	const debouncedSearch = debounce(searchLocation, 300);
</script>

<div class="map-picker-container space-y-4">
	<!-- Search Input -->
	<div class="search-section">
		<label for="location-search" class="mb-2 block text-sm font-medium text-gray-700">
			Search Location
		</label>
		<div class="relative mb-20">
			<div class="flex gap-2">
				<div class="relative flex-1">
					<input
						id="location-search"
						type="text"
						bind:value={searchQuery}
						placeholder={searchPlaceholder}
						disabled={isDisabled}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
						on:input={handleSearchInput}
						on:keydown={handleSearchKeydown}
						on:blur={handleSearchBlur}
						on:focus={() => (showSearchResults = hasSearchResults)}
						autocomplete="off"
					/>

					<!-- Search Results Dropdown -->
					{#if showSearchResults && hasSearchResults}
						<div
							class="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg"
						>
							{#each searchResults as result (result.place_id)}
								<button
									type="button"
									class="w-full border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50 focus:bg-gray-50"
									on:click={() => selectSearchResult(result)}
								>
									<div class="font-medium text-gray-900">{result.display_name}</div>
									{#if result.type}
										<div class="mt-1 text-xs text-gray-500">{result.type}</div>
									{/if}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				<button
					type="button"
					on:click={searchLocation}
					disabled={isSearching || isDisabled}
					class="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#if isSearching}
						<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
					{:else}
						Search
					{/if}
				</button>
			</div>
		</div>
	</div>

	{#if browser && location.protocol !== 'https:' && location.hostname !== 'localhost'}
		<div class="rounded-lg border border-amber-200 bg-amber-50 p-3">
			<div class="flex items-start">
				<svg class="mt-0.5 mr-2 h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
						clip-rule="evenodd"
					></path>
				</svg>
				<div class="text-sm text-amber-700">
					<strong>Note:</strong> Location access requires a secure HTTPS connection. The current location
					feature may not work on HTTP.
				</div>
			</div>
		</div>
	{/if}

	<!-- Map Container -->
	<div class="map-container relative">
		<label class="mb-2 block text-sm font-medium text-gray-700"> Select Location on Map </label>
		<div
			bind:this={mapContainer}
			class="relative {height} w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100"
		>
			{#if isMapLoading}
				<div class="absolute inset-0 z-10 flex items-center justify-center bg-gray-50">
					<div class="text-center">
						<svg
							class="mx-auto mb-2 h-8 w-8 animate-spin text-blue-600"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<p class="text-sm font-medium text-gray-600">Loading Map...</p>
						<p class="mt-1 text-xs text-gray-500">Please wait...</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Status Message -->
	<!-- <div class="status-bar rounded-lg bg-gray-50 p-3 text-center">
		<p class="text-sm text-gray-600">
			<span class="font-medium">Status:</span>
			{mapStatusMessage}
		</p>
	</div> -->
</div>

<style>
	/* .map-picker-container {
		@apply mx-auto w-full max-w-4xl;
	} */

	:global(.leaflet-container) {
		font-family: inherit;
	}

	:global(.leaflet-popup-content-wrapper) {
		border-radius: 8px;
	}

	:global(.leaflet-control-zoom) {
		border-radius: 8px !important;
		border: 1px solid #d1d5db !important;
		box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
	}

	:global(.leaflet-control-zoom a) {
		border-radius: 0 !important;
		border: none !important;
	}

	:global(.leaflet-control-zoom a:first-child) {
		border-top-left-radius: 7px !important;
		border-top-right-radius: 7px !important;
	}

	:global(.leaflet-control-zoom a:last-child) {
		border-bottom-left-radius: 7px !important;
		border-bottom-right-radius: 7px !important;
	}
</style>
