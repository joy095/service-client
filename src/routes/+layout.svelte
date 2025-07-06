<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { onMount } from 'svelte';
	import '../app.css';
	import { initializeFromServer } from '$lib/store/authStore';
	import type { User } from '$lib/types';

	export let data: { user: User | null };

	onMount(() => {
		try {
			initializeFromServer(data.user);
		} catch (error) {
			console.error('Failed to initialize auth from server:', error);
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
