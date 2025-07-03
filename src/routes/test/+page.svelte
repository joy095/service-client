<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { Map, LatLngExpression, LatLngBounds } from 'leaflet';

	// props
	export let storeLat: number = 40.7128;
	export let storeLng: number = -74.006;
	export let zoom: number = 13;

	let mapContainer: HTMLElement;
	let map: Map | undefined;
	let userLatLng: LatLngExpression | null = null;
	let error: string | null = null;
	let L: typeof import('leaflet');
	let routingControl: any = null;

	async function initializeMap() {
		if (!browser || !mapContainer) {
			error = 'Map cannot be initialized. Ensure you are in a browser environment.';
			return;
		}

		L = await import('leaflet');
		await import('leaflet-routing-machine');
		await import('leaflet/dist/leaflet.css');
		await import('leaflet-routing-machine/dist/leaflet-routing-machine.css');

		if (L.Icon.Default.prototype) {
			delete (L.Icon.Default.prototype as any)._getIconUrl;
			L.Icon.Default.mergeOptions({
				iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
				iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
				shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
			});
		}

		map = L.map(mapContainer).setView([storeLat, storeLng], zoom);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		L.marker([storeLat, storeLng]).addTo(map).bindPopup('Store Location').openPopup();

		try {
			const position = await new Promise<GeolocationPosition>((resolve, reject) =>
				navigator.geolocation.getCurrentPosition(resolve, reject)
			);
			userLatLng = [position.coords.latitude, position.coords.longitude];

			L.marker(userLatLng).addTo(map).bindPopup('Your Location').openPopup();

			const bounds: LatLngBounds = L.latLngBounds([userLatLng, [storeLat, storeLng]]);
			map.fitBounds(bounds);

			addRoutingControl();
		} catch (err) {
			error = 'Unable to get your location. Please enable geolocation.';
			console.error(err);
		}
	}

	function addRoutingControl() {
		if (!L || !map || !userLatLng) return;

		// Clean up previous routing control if it exists
		if (routingControl) {
			map.removeControl(routingControl);
		}

		routingControl = L.Routing.control({
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

	onMount(() => {
		initializeMap();
		return () => {
			if (map) {
				map.remove();
			}
		};
	});
</script>

<section class="container mx-auto">
	{#if error}
		<div class="text-red-600">{error}</div>
	{/if}
	<div bind:this={mapContainer} style="height: 500px; width: 100%;"></div>
</section>
