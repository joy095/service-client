<script lang="ts">
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	// The $page store contains information about the current page, including error details
</script>

<svelte:head>
	<title>Page Not Found - 404</title>
	<meta name="description" content="Oops! The page you're looking for doesn't exist." />
</svelte:head>

<div class="error-container">
	<div class="error-content" in:fly={{ y: -50, duration: 600, easing: quintOut }}>
		<h1>{$page.status}</h1>
		<h2>{$page.error?.message || 'Page Not Found'}</h2>
		<p>
			We're sorry, but the page you requested could not be found. It might have been moved, deleted,
			or never existed.
		</p>
		<a href="/" class="home-button">Go to Homepage</a>
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: #f0f2f5; /* Light background */
		color: #333;
		line-height: 1.6;
	}

	.error-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 20px;
		box-sizing: border-box;
		text-align: center;
	}

	.error-content {
		background-color: #ffffff;
		padding: 40px;
		border-radius: 10px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
		max-width: 600px;
		width: 100%;
	}

	h1 {
		font-size: 6em; /* Large 404 status */
		color: #dc3545; /* Red for error */
		margin-bottom: 10px;
		text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
	}

	h2 {
		font-size: 2.2em;
		color: #343a40;
		margin-bottom: 20px;
	}

	p {
		font-size: 1.1em;
		color: #555;
		margin-bottom: 30px;
	}

	.home-button {
		display: inline-block;
		background-color: #007bff; /* Blue button */
		color: white;
		padding: 12px 25px;
		border-radius: 8px;
		text-decoration: none;
		font-size: 1em;
		font-weight: bold;
		transition:
			background-color 0.3s ease,
			transform 0.2s ease;
		box-shadow: 0 3px 10px rgba(0, 123, 255, 0.2);
	}

	.home-button:hover {
		background-color: #0056b3;
		transform: translateY(-2px);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		h1 {
			font-size: 4.5em;
		}
		h2 {
			font-size: 1.8em;
		}
		.error-content {
			padding: 30px;
		}
	}
</style>
