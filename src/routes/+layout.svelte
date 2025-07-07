<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import { initializeFromServer } from '$lib/store/authStore';
	import type { User } from '$lib/types';
	import { tryRefreshToken } from '$lib/utils/refreshToken';

	export let data: { user: User | null };

	onMount(() => {
		if (data.user) {
			console.log('Initializing auth store with user from server:', data.user);
			initializeFromServer(data.user);
		} else {
			console.log('No user from server, attempting client-side token refresh...');
			tryRefreshToken();
		}
	});
</script>

<div class="app-container">
	<Header />
	<main>
		<slot />
	</main>
	<footer>
		<!-- Footer content -->
	</footer>
</div>

<style>
	.app-container {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
