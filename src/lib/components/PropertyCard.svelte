<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import SecureImage from './SecureImage.svelte';

	interface Business {
		name: string;
		category: string;
		city: string;
		state: string;
		country: string;
		publicId: string;
		images: { position: number; objectName: string }[];
	}

	export let business: Business = {
		name: '',
		category: '',
		city: '',
		state: '',
		country: '',
		publicId: '',
		images: []
	};

	let current = 0;

	function prev() {
		current = (current - 1 + business.images.length) % business.images.length;
	}

	function next() {
		current = (current + 1) % business.images.length;
	}
</script>

<div class="property-card group">
	<!-- Carousel -->
	<div class="group relative h-56 w-full overflow-hidden rounded-t-lg bg-gray-100">
		{#if business?.images?.length > 0}
			<div
				class="flex transition-transform duration-700"
				style="transform: translateX(-{current * 100}%); width: {business.images.length * 100}%"
			>
				{#each business.images as img (img.objectName)}
					<div class="w-full flex-shrink-0">
						<a href={`/business/${encodeURIComponent(business.publicId)}`}>
							<SecureImage
								src={`${PUBLIC_IMAGE_URL}/${img.objectName}`}
								alt={`${business.name} image ${img.position}`}
								width={600}
								height={400}
								className="h-80 w-96 object-cover transition-transform duration-500 group-hover:scale-105"
								on:error={(e) => {
									(e.currentTarget as HTMLImageElement).src = '/image-placeholder.svg';
								}}
							/>
						</a>
					</div>
				{/each}
			</div>
		{:else}
			<img
				src="/image-placeholder.svg"
				alt={`Placeholder image for ${business.name}`}
				class="h-56 w-full object-cover"
			/>
		{/if}

		{#if business?.images?.length > 1}
			<!-- Prev Button -->
			{#if current > 0}
				<button
					on:click={prev}
					class="absolute top-1/2 left-2 -translate-y-1/2 cursor-pointer rounded-full p-2 group-hover:bg-white/80 group-hover:shadow-md hover:scale-105"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						class="h-4 w-4 text-transparent group-hover:text-gray-900"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
			{/if}

			<!-- Next Button -->
			{#if current < business.images.length - 1}
				<button
					on:click={next}
					class="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-full p-2 group-hover:bg-white/80 group-hover:shadow-md hover:scale-105"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						class="h-4 w-4 text-transparent group-hover:text-gray-900"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>
			{/if}

			<!-- Pagination Dots -->
			<div class="absolute right-0 bottom-3 left-0 flex justify-center gap-2">
				{#each business.images as _, i}
					{@const distance = Math.abs(i - current)}

					<div
						class="h-2 w-2 cursor-pointer rounded-full bg-white transition-all duration-300"
						class:scale-125={distance === 0}
						class:scale-100={distance === 1}
						class:scale-75={distance > 1}
						on:click={() => (current = i)}
					></div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Business Details -->
	<div class="rounded-b-lg bg-white p-4">
		<div class="mb-2 flex items-center justify-between">
			<h3 class="truncate text-lg font-semibold text-gray-800">
				{business.name || 'Unknown Business'}
			</h3>
			<span class="rounded bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600">
				{business.category || 'Uncategorized'}
			</span>
		</div>
		<p class="text-sm text-gray-600">
			{business.city || 'Unknown City'}, {business.state || 'Unknown State'}, {business.country ||
				'Unknown Country'}
		</p>
	</div>
</div>

<style>
	.property-card {
		display: block;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}
	.property-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
	}
</style>
