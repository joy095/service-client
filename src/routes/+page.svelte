<script lang="ts">
	import PropertyCard from '$lib/components/PropertyCard.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const { meta, businesses } = data;
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.description} />

	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={meta.url} />
	<meta property="og:image" content={meta.image} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={meta.siteName} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
	<meta name="twitter:image" content={meta.image} />
	<meta name="twitter:site" content={meta.twitterHandle} />
	<meta name="twitter:creator" content={meta.twitterHandle} />
</svelte:head>

<div class="container">
	<h1>Find your perfect stay</h1>
	<p class="subtitle">Discover unique homes and experiences around the world</p>

	{#if businesses.length === 0}
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
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
			{#each businesses as business (business.publicId)}
				<PropertyCard {business} />
			{/each}
		</div>
	{/if}
</div>

<style>
	h1 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
	}

	.subtitle {
		color: var(--text-secondary);
		margin-bottom: 2rem;
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
