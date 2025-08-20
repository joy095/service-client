<script lang="ts">
	import '@fontsource-variable/inter';
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import { initializeFromServer } from '$lib/stores/authStore';

	import { setBusiness } from '$lib/stores/businessStore';
	import type { User, Business } from '$lib/types';
	import { tryRefreshToken } from '$lib/utils/refreshToken';
	import Footer from '$lib/components/Footer.svelte';
	import { browser } from '$app/environment';

	export let data: { user: User | null; businessData: Business | null };

	onMount(() => {
		if (data.user) {
			initializeFromServer(data.user);
		} else {
			tryRefreshToken();
		}

		// Keep the store in sync with data across navigations
		$: if (browser) setBusiness(data.businessData ?? null);
	});
</script>

<div class="app-container">
	<Header {data} />
	<main>
		<slot />
	</main>
	<Footer />
</div>

<style>
	.app-container {
		min-height: 100vh;
	}
</style>
