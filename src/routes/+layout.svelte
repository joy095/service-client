<script>
	import Header from '$lib/components/Header.svelte';
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

	main {
		flex: 1;
		padding: 1rem;
	}
</style>
