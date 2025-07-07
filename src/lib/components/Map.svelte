<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { Map, LatLngExpression, LatLngBounds } from 'leaflet';

	// Define props with TypeScript
	let { storeLat, storeLng, zoom, businessName, className } = $props();

	let mapContainer: HTMLElement | undefined;
	let map: Map | undefined;
	let userLatLng: LatLngExpression = [storeLat, storeLng];
	let error: string | null = null;
	let L: typeof import('leaflet') | undefined;

	async function initializeMap() {
		if (!browser || !mapContainer) {
			error =
				'Map cannot be initialized. Ensure you are in a browser environment and map container exists.';
			return;
		}

		L = await import('leaflet');
		await import('leaflet-routing-machine');
		await import('leaflet/dist/leaflet.css');
		await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');

		// Fix for default Leaflet marker icons not showing up
		// This block is crucial for ensuring the default marker icons load correctly
		if (L.Icon.Default.prototype) {
			// @ts-ignore: _getIconUrl is not in types but exists at runtime
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
			});
		}

		// Initialize the map with maxZoom and minZoom options
		map = L.map(mapContainer, {
			// Set the initial view
			center: [storeLat, storeLng],
			zoom: zoom,
			// --- ADDED MAX/MIN ZOOM OPTIONS HERE ---
			maxZoom: 19, // You can adjust this value (e.g., 18-22 is common for max zoom in)
			minZoom: 2, // You can adjust this value (e.g., 0-5 is common for max zoom out)
			zoomControl: true, // Enable +/- zoom controls
			scrollWheelZoom: true // Enable scroll wheel zoom
		}).setView([storeLat, storeLng], zoom); // .setView is redundant if set in options, but harmless

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
			maxZoom: 19, // Max zoom level available from the tile provider (OSM is often up to 19/20)
			maxNativeZoom: 19 // Highest zoom level for which native tiles are available
		}).addTo(map);

		L.marker([storeLat, storeLng]).addTo(map).bindPopup(businessName).openPopup();

		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) => {
				// Request user's current geolocation
				navigator.geolocation.getCurrentPosition(resolve, reject);
			});
			userLatLng = [position.coords.latitude, position.coords.longitude];
			L.marker(userLatLng).addTo(map).bindPopup('Your Location').openPopup();

			const bounds: LatLngBounds = L.latLngBounds([userLatLng, [storeLat, storeLng]]);
			map.fitBounds(bounds); // Adjust map view to fit both markers

			// @ts-ignore: leaflet-routing-machine types are incomplete
			L.Routing.control({
				waypoints: [L.latLng(userLatLng), L.latLng(storeLat, storeLng)],
				routeWhileDragging: true,
				lineOptions: {
					styles: [{ color: '#0078A8', weight: 4 }],
					extendToWaypoints: true,
					missingRouteTolerance: 0
				},
				showAlternatives: true,
				fitSelectedRoutes: true
			}).addTo(map);
		} catch (err: unknown) {
			error =
				'Unable to get your location. Please enable geolocation or enter coordinates manually.';
			console.error(err);
		}
	}

	onMount(() => {
		initializeMap();
		return () => {
			if (map) {
				map.remove(); // Clean up map instance on component destroy
			}
		};
	});

	// Reactive statement for updates
	$effect.pre(() => {
		if (browser && map && L && storeLat && storeLng && zoom) {
			// Update map view and marker if props change
			map.setView([storeLat, storeLng], zoom);

			// Update store marker position
			map.eachLayer((layer) => {
				// Be careful with identifying the marker if you have many
				// Using popup content is one way, but a dedicated reference would be better
				if (layer instanceof L!.Marker && layer.getPopup()?.getContent() === businessName) {
					layer.setLatLng([storeLat, storeLng]);
				}
			});

			// Re-route if user location or store location changes (or initial load)
			if (userLatLng) {
				// Remove existing routing controls to prevent duplicates
				map.eachLayer((layer) => {
					// @ts-ignore: _routing is a private property of L.Routing.Control
					if (layer._routing) {
						map?.removeLayer(layer);
					}
				});

				// @ts-ignore: leaflet-routing-machine types are incomplete
				L.Routing.control({
					waypoints: [L.latLng(userLatLng), L.latLng(storeLat, storeLng)],
					routeWhileDragging: true,
					lineOptions: {
						styles: [{ color: '#0078A8', weight: 4 }],
						extendToWaypoints: true,
						missingRouteTolerance: 0
					},
					showAlternatives: true,
					fitSelectedRoutes: true
				}).addTo(map);
			}
		}
	});
</script>

<section class="container mx-auto">
	{#if error}
		<div class="text-red-600">{error}</div>
	{/if}

	<div
		class="{className} className h-full w-full"
		bind:this={mapContainer}
		style="height: 500px; width: 100%;"
	></div>
</section>
