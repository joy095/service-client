<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import SecureImage from './SecureImage.svelte';
	import {
		Carousel,
		CarouselContent,
		CarouselItem,
		CarouselPrevious,
		CarouselNext
	} from '$lib/components/ui/carousel';
	import type { CarouselAPI } from './ui/carousel/context';

	let api = $state<CarouselAPI>();

	const count = $derived(api ? api.scrollSnapList().length : 0);
	let current = $state(0);

	$effect(() => {
		if (!api) return;
		const update = () => (current = api.selectedScrollSnap() + 1);
		update();
		api.on('select', update);
		return () => api.off?.('select', update);
	});

	const {
		business = {
			name: '',
			category: '',
			city: '',
			state: '',
			country: '',
			publicId: '',
			images: []
		}
	} = $props();
</script>

<div class="property-card group">
	<!-- Carousel -->
	<div class="group relative h-56 w-full overflow-hidden rounded-t-lg bg-gray-100">
		{#if business?.images?.length > 0}
			<Carousel setApi={(emblaApi) => (api = emblaApi)} class="group h-full w-full">
				<CarouselContent>
					{#each business.images as img (img.objectName)}
						<CarouselItem class="h-56 w-full">
							<a href={`/business/${encodeURIComponent(business.publicId)}`}>
								<SecureImage
									src={img.objectName}
									alt={`${business.name} image ${img.position}`}
									width={600}
									height={400}
									className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105"
									on:error={(e) => {
										(e.currentTarget as HTMLImageElement).src = '/image-placeholder.svg';
									}}
								/>
							</a>
						</CarouselItem>
					{/each}
				</CarouselContent>

				{#if business.images.length > 1}
					<CarouselPrevious
						aria-label="Previous image"
						class="left-2 cursor-pointer border-0 bg-transparent text-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:bg-white/80 group-hover:text-black group-hover:opacity-100 hover:scale-105 aria-disabled:opacity-0"
					/>
					<CarouselNext
						aria-label="Next image"
						class="right-2 cursor-pointer border-0 bg-transparent text-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:bg-white/80 group-hover:text-black group-hover:opacity-100 hover:scale-105 aria-disabled:opacity-0"
					/>
				{/if}
			</Carousel>
		{:else}
			<img
				src="/image-placeholder.svg"
				alt={`Placeholder image for ${business.name}`}
				class="h-56 w-full object-cover"
			/>
		{/if}
	</div>

	<!-- Business Details -->
	<div class="relative rounded-b-lg bg-white p-4">
		<!-- Pagination Dots -->
		<div class="absolute -top-5 right-0 left-0 z-10 flex justify-center gap-2">
			{#each Array(count) as _, i}
				<button
					type="button"
					class={`h-2 w-2 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring focus-visible:ring-white/70 ${
						current === i + 1 ? 'scale-125 bg-white' : 'bg-white/50'
					}`}
					aria-label={`Go to image ${i + 1}`}
					aria-current={current === i + 1 ? 'true' : undefined}
					on:click={() => api?.scrollTo(i)}
				/>
			{/each}
		</div>

		<div class="mb-2 flex items-center justify-between">
			<h3 class="truncate text-lg font-semibold text-gray-800">
				{business.name}
			</h3>
			<span class="rounded bg-blue-50 px-2 py-1 text-sm font-medium text-blue-600">
				{business.category}
			</span>
		</div>
		<p class="text-sm text-gray-600">
			{[business.city, business.state, business.country].filter(Boolean).join(', ')}
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
