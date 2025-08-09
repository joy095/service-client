<script lang="ts">
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	export let data: { businesses: any[] };
</script>

<div class="page-container container mx-auto">
	<h1>Find your perfect stay</h1>
	<p class="subtitle">Discover unique homes and experiences around the world</p>

	{#if data.businesses.length === 0}
		<div class="empty-state">
			<img
				src="/image-placeholder.svg"
				alt="Illustration: No businesses found"
				class="mx-auto h-48 w-48 rounded-t object-contain"
				loading="lazy"
				decoding="async"
			/>
			<p class="mt-4">No businesses found</p>
		</div>
	{:else}
		<div class="property-grid">
			{#each data.businesses as business (business.publicId)}
				<PropertyCard {business} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-container {
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
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
