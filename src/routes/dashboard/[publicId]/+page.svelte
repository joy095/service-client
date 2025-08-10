<!-- src/routes/dashboard/[publicId]/+page.svelte -->
<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import SecureImage from '$lib/components/SecureImage.svelte';
	import type { PageData } from './$types';

	// Receive data from +page.server.ts
	export let data: PageData;
</script>

<div class="container mx-auto p-6">
	{#if data.services?.length === 0}
		<div class="mt-8 rounded-lg border border-dashed p-10 text-center text-gray-500">
			<p class="text-lg">No services found.</p>
		</div>
	{:else}
		<div class="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			{#each data.services as service (service.id)}
				<div class="rounded-lg border bg-white shadow-sm">
					{#if service.objectName}
						<SecureImage
							src="{PUBLIC_IMAGE_URL}/{service.objectName}"
							alt={service.name}
							on:error={(e) => {
								const target = e.currentTarget as HTMLImageElement;
								console.warn(`Failed to load image for ${service.name}, using placeholder.`);
								target.src = '/image-placeholder.svg';
							}}
							className="h-[25rem] w-full rounded-lg object-cover"
						/>
					{:else}
						<div class="h-[25rem] w-full rounded-lg bg-gray-300"></div>
					{/if}

					<div class="mt-5 px-3 pb-2">
						<h3 class="text-xl font-semibold">{service.name}</h3>
						<p class="mt-2 line-clamp-2 text-gray-600">{service.description}</p>
						<div class="mt-2 flex items-center justify-between">
							<span class="text-lg font-bold text-indigo-600">₹{service.price}</span>
							<span class="text-sm text-gray-500">{service.duration} min</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	/* Keep your existing styles */
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
