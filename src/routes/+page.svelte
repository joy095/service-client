<script>
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import { properties, loadProperties, isLoading, error } from '$lib/stores/properties';
	import { onMount } from 'svelte';

	// Load properties when page mounts
	onMount(() => {
		loadProperties().catch((err) => {
			console.error('Failed to load properties:', err);
		});
	});

	// Function to handle retry loading
	function retryLoad() {
		loadProperties().catch((err) => {
			console.error('Retry failed:', err);
		});
	}
</script>

<div class="page-container">
	<h1>Find your perfect stay</h1>
	<p class="subtitle">Discover unique homes and experiences around the world</p>

	{#if $isLoading && $properties.length === 0}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>Loading properties...</p>
		</div>
	{:else if $error}
		<div class="error-state">
			<p class="error-message">Error loading properties: {$error}</p>
			<button on:click={retryLoad} class="retry-button"> Try Again </button>
		</div>
	{:else if $properties.length === 0 && !$isLoading}
		<div class="empty-state">
			<p>No properties found</p>
			<button on:click={retryLoad} class="retry-button"> Refresh </button>
		</div>
	{:else}
		<div class="property-grid">
			{#each $properties as property (property.id)}
				<PropertyCard {property} />
			{/each}
		</div>

		{#if $isLoading}
			<div class="loading-more">
				<div class="small-spinner"></div>
				<p>Loading more properties...</p>
			</div>
		{/if}
	{/if}
</div>

<style>
	.page-container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 1rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.subtitle {
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.property-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}

	.loading-state,
	.empty-state,
	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		text-align: center;
		gap: 1rem;
	}

	.loading-more {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 2rem;
		color: var(--text-secondary);
	}

	.spinner,
	.small-spinner {
		border: 3px solid rgba(0, 0, 0, 0.1);
		border-radius: 50%;
		border-top: 3px solid var(--primary-color);
		width: 40px;
		height: 40px;
		animation: spin 1s linear infinite;
	}

	.small-spinner {
		width: 20px;
		height: 20px;
		border-width: 2px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.error-message {
		color: var(--error-color);
		margin-bottom: 1rem;
	}

	.retry-button {
		padding: 0.75rem 1.5rem;
		background-color: var(--primary-color);
		color: white;
		border: none;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;

		&:hover {
			background-color: var(--primary-dark);
		}
	}

	/* Add these to your global CSS or :global selector if using CSS modules */
	:global(:root) {
		--primary-color: #ff5a5f;
		--primary-dark: #e04a50;
		--text-primary: #222;
		--text-secondary: #666;
		--error-color: #d32f2f;
	}
</style>
