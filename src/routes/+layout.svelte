<script>
	import Header from '$lib/components/Header.svelte';
	import '../app.css';
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
