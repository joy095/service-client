<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import { initializeFromServer } from '$lib/store/authStore';
	import type { User } from '$lib/types';
	import { tryRefreshToken } from '$lib/utils/refreshToken';
	import Footer from '$lib/components/Footer.svelte';

	export let data: { user: User | null };

	onMount(() => {
		if (data.user) {
			initializeFromServer(data.user);
		} else {
			tryRefreshToken();
		}
	});
</script>

<div class="app-container">
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>

<style>
	.app-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
