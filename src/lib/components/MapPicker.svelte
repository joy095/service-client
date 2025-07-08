<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { browser } from '$app/environment';
	import type { Map, Marker } from 'leaflet';
	import debounce from 'lodash.debounce';

	// Define the structure for location details
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

	// Define the structure for Nominatim search results
	interface SearchResult {
		place_id: string;
		display_name: string;
		lat: string;
		lon: string;
		[key: string]: any;
	}

	// Props
	let { initialLat, initialLng, error } = $props();

	// Event dispatcher to communicate with parent components
	const dispatch = createEventDispatcher<{
		locationSelected: LocationDetails;
		locationError: string;
	}>();

	// Component State
	let mapContainer: HTMLElement;
	let map: Map | undefined;
	let marker: Marker | undefined;
	let L: typeof import('leaflet') | undefined;

	let searchQuery = '';
	let searchResults: SearchResult[] = [];
	let isSearching = false;
	let isLoadingLocation = false;
	let isMapLoading = true;
	let mapStatusMessage: string = 'Initializing map...';

	// --- Lifecycle Hooks ---

	onMount(() => {
		// Initialize the map once the component is mounted
		initMap();

		// Set up a resize observer to keep the map correctly sized
		const resizeObserver = new ResizeObserver(() => {
			if (map) {
				map.invalidateSize();
			}
		});
		if (mapContainer) {
			resizeObserver.observe(mapContainer);
		}

		// Cleanup function to run when the component is destroyed
		return () => {
			if (map) {
				map.off();
				map.remove();
			}
			if (mapContainer) {
				resizeObserver.unobserve(mapContainer);
			}
			L = undefined;
		};
	});

	// --- Map Initialization ---

	async function initMap() {
		if (!browser || !mapContainer) {
			mapStatusMessage = 'Map cannot be initialized outside of a browser environment.';
			return;
		}

		isMapLoading = true;
		mapStatusMessage = 'Loading map resources...';

		try {
			// Dynamically import Leaflet to ensure it only runs on the client-side
			L = await import('leaflet');
			await import('leaflet/dist/leaflet.css');

			// Fix for default Leaflet icon path issues with bundlers
			// @ts-ignore
			delete L.Icon.Default.prototype._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
			});

			// Set default coordinates to center of India if none are provided
			const defaultLat = initialLat ?? 20.5937;
			const defaultLng = initialLng ?? 78.9629;

			// Create the map instance
			map = L.map(mapContainer).setView([defaultLat, defaultLng], 7);

			// Add the tile layer from OpenStreetMap
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© OpenStreetMap contributors',
				maxZoom: 19
			})
				.on('tileerror', () => {
					mapStatusMessage = 'Failed to load map tiles. Please check your internet connection.';
					dispatch('locationError', mapStatusMessage);
				})
				.addTo(map);

			// --- Map Event Handling ---
			map.whenReady(() => {
				isMapLoading = false;
				mapStatusMessage = 'Map ready. Click to select a location.';
				if (initialLat !== undefined && initialLng !== undefined) {
					updateLocationOnMap(initialLat, initialLng);
				}
				// Handle map clicks for location selection
				map!.on('click', async (e) => {
					const { lat, lng } = e.latlng;
					updateLocationOnMap(lat, lng);
				});
			});
		} catch (e) {
			console.error('MapPicker: Error loading Leaflet:', e);
			mapStatusMessage = 'Error loading map. Please check your internet connection.';
			dispatch('locationError', mapStatusMessage);
			isMapLoading = false;
		}
	}

	// --- Core Functions ---

	/**
	 * Updates the marker and view on the map and initiates reverse geocoding.
	 */
	async function updateLocationOnMap(lat: number, lng: number) {
		if (!map || !L) return;

		// Add or move the marker
		if (marker) {
			marker.setLatLng([lat, lng]);
		} else {
			marker = L.marker([lat, lng]).addTo(map);
		}

		// Center the map on the new location
		map.setView([lat, lng], Math.max(map.getZoom() || 0, 15));
		mapStatusMessage = `Location set. Fetching address...`;

		// Get address details for the coordinates
		await reverseGeocode(lat, lng);
	}

	/**
	 * Fetches address details from Nominatim for a given lat/lng.
	 */
	async function reverseGeocode(lat: number, lng: number) {
		mapStatusMessage = 'Fetching address details...';
		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
				{
					headers: {
						'User-Agent': 'YourAppName/1.0 (contact@example.com)'
					}
				}
			);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

			const result = await response.json();
			let details: LocationDetails = { latitude: lat, longitude: lng };

			if (result && result.address) {
				const addr = result.address;
				details = {
					...details,
					address: result.display_name,
					road: addr.road,
					house_number: addr.house_number,
					city: addr.city || addr.town || addr.village,
					state: addr.state,
					country: addr.country,
					postalCode: addr.postcode
				};
				mapStatusMessage = `Selected: ${result.display_name}`;
			} else {
				mapStatusMessage = 'Could not retrieve detailed address. Coordinates are selected.';
			}
			dispatch('locationSelected', details);
		} catch (err) {
			console.error('MapPicker: Reverse geocoding error:', err);
			mapStatusMessage = 'Error fetching address. Please check your connection.';
			dispatch('locationError', mapStatusMessage);
			// Still dispatch the coordinates even if address lookup fails
			dispatch('locationSelected', { latitude: lat, longitude: lng });
		}
	}

	/**
	 * Gets the user's current location using the browser's Geolocation API.
	 */
	const getCurrentLocation = () => {
		if (!navigator.geolocation) {
			dispatch('locationError', 'Geolocation is not supported by your browser.');
			return;
		}

		isLoadingLocation = true;
		mapStatusMessage = 'Getting your current location...';

		navigator.geolocation.getCurrentPosition(
			async (position) => {
				const { latitude, longitude } = position.coords;
				await updateLocationOnMap(latitude, longitude);
				isLoadingLocation = false;
			},
			(err) => {
				let errorMessage = 'Could not get your location. Please select manually.';
				if (err.code === err.PERMISSION_DENIED) {
					errorMessage = 'Location access denied. Please enable it in your browser settings.';
				} else if (err.code === err.TIMEOUT) {
					errorMessage = 'Location request timed out.';
				}
				dispatch('locationError', errorMessage);
				mapStatusMessage = errorMessage;
				isLoadingLocation = false;
			},
			{ enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
		);
	};

	/**
	 * Searches for a location using the Nominatim API.
	 */
	const searchLocation = async () => {
		if (!searchQuery.trim()) {
			searchResults = [];
			return;
		}

		isSearching = true;
		searchResults = [];
		mapStatusMessage = `Searching for "${searchQuery}"...`;

		try {
			const response = await fetch(
				`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in`,
				{
					headers: {
						'User-Agent': 'YourAppName/1.0 (contact@example.com)'
					}
				}
			);
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

			const results = await response.json();
			searchResults = results;
			if (results.length === 0) {
				mapStatusMessage = 'No results found.';
				dispatch('locationError', 'No search results found for your query.');
			}
		} catch (err) {
			console.error('MapPicker: Search error:', err);
			mapStatusMessage = 'Error during search.';
			dispatch('locationError', 'Could not perform search. Check your connection.');
		} finally {
			isSearching = false;
		}
	};

	/**
	 * Handles selecting a result from the search list.
	 */
	const selectSearchResult = (result: SearchResult) => {
		searchQuery = result.display_name;
		searchResults = []; // Hide the results list
		updateLocationOnMap(parseFloat(result.lat), parseFloat(result.lon));
	};

	// Debounce the search function to avoid excessive API calls while typing
	const debouncedSearch = debounce(searchLocation, 500);

	/**
	 * Handles the Enter key press for an immediate search.
	 */
	const handleSearchKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			debouncedSearch.cancel(); // Cancel any pending debounced search
			searchLocation(); // Trigger search immediately
		}
	};
</script>

<div class="space-y-4">
	<div class="mb-4">
		<label class="mb-2 block text-sm font-semibold text-gray-700" for="search-input"
			>Search for Location</label
		>
		<div class="flex space-x-3">
			<input
				id="search-input"
				type="text"
				bind:value={searchQuery}
				placeholder="e.g., Connaught Place, Delhi"
				class="input-focus flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
				on:input={debouncedSearch}
				on:keydown={handleSearchKeydown}
				disabled={isMapLoading}
				aria-label="Search for a location"
			/>
			<button
				type="button"
				on:click={searchLocation}
				disabled={isSearching || isMapLoading}
				class="rounded-xl bg-blue-500 px-6 py-3 font-medium text-white transition-colors duration-300 hover:bg-blue-600 disabled:opacity-50"
			>
				{isSearching ? 'Searching...' : 'Search'}
			</button>
		</div>

		{#if searchResults.length > 0}
			<div
				class="relative z-10 mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md"
				role="listbox"
				aria-label="Search results"
			>
				{#each searchResults as result (result.place_id)}
					<button
						type="button"
						on:click={() => selectSearchResult(result)}
						class="w-full border-b px-4 py-2 text-left text-gray-800 transition-colors duration-200 last:border-b-0 hover:bg-gray-100"
						role="option"
						aria-selected="false"
					>
						{result.display_name}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="text-center">
		<button
			type="button"
			on:click={getCurrentLocation}
			disabled={isLoadingLocation || isMapLoading}
			class="rounded-xl bg-gradient-to-r from-green-500 to-blue-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-green-600 hover:to-blue-600 disabled:opacity-50"
		>
			{#if isLoadingLocation}
				<span class="flex items-center">
					<svg
						class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Getting Location...
				</span>
			{:else}
				📍 Use Current Location
			{/if}
		</button>
	</div>

	<div class="relative">
		<label class="mb-2 block text-sm font-semibold text-gray-700"
			>Click on the map to set your exact location</label
		>
		<div
			id="map"
			bind:this={mapContainer}
			class="relative h-96 w-full overflow-hidden rounded-xl bg-gray-200 shadow-md"
		>
			{#if isMapLoading}
				<div
					class="bg-opacity-75 absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-300 text-gray-800"
				>
					<svg
						class="mb-3 h-10 w-10 animate-spin text-blue-600"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					<p class="font-semibold">Loading Map...</p>
					<p class="mt-1 px-4 text-center text-sm">
						Please ensure you have an internet connection.
					</p>
				</div>
			{/if}
		</div>
		{#if error}
			<p class="mt-2 text-sm text-red-500">{error}</p>
		{/if}
	</div>

	<div class="mt-4 rounded-xl bg-gray-50 p-3 text-center text-sm text-gray-600">
		<span class="font-semibold">Status:</span>
		{mapStatusMessage}
	</div>
</div>

<style>
	#map {
		z-index: 1;
		min-height: 200px;
	}
</style>
