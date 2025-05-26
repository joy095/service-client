<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import type { SubscriptionResponse, ErrorResponse } from '$lib/types'; // Import types

	let message: string = 'Confirming your subscription...';
	let isError: boolean = false;
	let isLoading: boolean = true;

	// This function will be called when the component is mounted in the browser
	onMount(async () => {
		// Get the token from the URL query parameters
		const token = $page.url.searchParams.get('token');

		if (!token) {
			// If no token is found in the URL
			message = 'Confirmation link is invalid or missing a token.';
			isError = true;
			isLoading = false;
			return; // Stop execution
		}

		try {
			// Call the backend API endpoint for confirmation
			// The endpoint is a GET request that expects the token as a query parameter
			const response = await fetch(`/confirm-subscription?token=${token}`);

			const data: SubscriptionResponse | ErrorResponse = await response.json();

			if (response.ok) {
				// If the response status is 200 OK (success)
				message = data.message || 'Your subscription has been successfully confirmed!';
				isError = false; // It's a success message
			} else {
				// If the response status is not OK (e.g., 400, 404, 500)
				message = data.message || 'Failed to confirm your subscription. Please try again.';
				isError = true; // It's an error message
			}
		} catch (error) {
			// Catch network errors or issues with the fetch request
			console.error('Confirmation fetch error:', error);
			message = 'A network error occurred while confirming your subscription.';
			isError = true; // It's an error message
		} finally {
			// This block runs regardless of success or error
			isLoading = false; // Stop loading state
		}
	});
</script>

<svelte:head>
	<title>Confirm Subscription</title>
	<meta name="description" content="Confirm your email subscription." />
</svelte:head>

<div class="confirmation-container">
	<div class="confirmation-content" in:fly={{ y: -50, duration: 600, easing: quintOut }}>
		{#if isLoading}
			<p>{message}</p>
			<div class="spinner"></div>
		{:else if isError}
			<h1 class="error-title">Confirmation Failed</h1>
			<p class="error-message">{message}</p>
			<a href="/" class="home-button">Go to Homepage</a>
		{:else}
			<h1 class="success-title">Subscription Confirmed!</h1>
			<p class="success-message">{message}</p>
			<a href="/" class="home-button">Go to Homepage</a>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		background-color: #f0f2f5;
		color: #333;
		line-height: 1.6;
	}

	.confirmation-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 20px;
		box-sizing: border-box;
		text-align: center;
	}

	.confirmation-content {
		background-color: #ffffff;
		padding: 40px;
		border-radius: 10px;
		box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
		max-width: 500px;
		width: 100%;
	}

	h1 {
		font-size: 2.5em;
		margin-bottom: 15px;
	}

	.success-title {
		color: #28a745; /* Green */
	}

	.error-title {
		color: #dc3545; /* Red */
	}

	p {
		font-size: 1.1em;
		color: #555;
		margin-bottom: 20px;
	}

	.success-message {
		color: #28a745;
	}

	.error-message {
		color: #dc3545;
	}

	.home-button {
		display: inline-block;
		background-color: #007bff;
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

	/* Basic Spinner Style */
	.spinner {
		border: 4px solid rgba(0, 0, 0, 0.1);
		border-left-color: #007bff;
		border-radius: 50%;
		width: 30px;
		height: 30px;
		animation: spin 1s linear infinite;
		margin: 20px auto; /* Center the spinner */
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		h1 {
			font-size: 2em;
		}
		.confirmation-content {
			padding: 30px;
		}
	}
</style>
