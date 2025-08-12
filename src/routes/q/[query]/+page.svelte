<!-- src/routes/q/[query]/+page.svelte -->
<script lang="ts">
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	export let data;
</script>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-2xl font-bold">Search results for "{data.query}"</h1>
	<p class="subtitle mt-2 text-gray-600 dark:text-gray-400">
		Found {data.count}
		{data.count === 1 ? 'result' : 'results'}
	</p>

	{#if data.businesses.length === 0}
		<div class="empty-state my-16 text-center">
			<img
				src="/image-placeholder.svg"
				alt="No businesses found"
				class="mx-auto h-48 w-48 rounded object-contain opacity-70"
				loading="lazy"
			/>
			<p class="mt-4 text-lg text-gray-500">No businesses found for "{data.query}"</p>
		</div>
	{:else}
		<div
			class="property-grid mt-8 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
		>
			{#each data.businesses as business (business.publicId)}
				<PropertyCard {business} />
			{/each}
		</div>
	{/if}
</div>
