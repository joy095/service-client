<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import SecureImage from './SecureImage.svelte';
	import type { Image } from '$lib/types';

	// Define props for dynamic configuration
	export let images: Image[] = []; // Array of Image objects
	export let maxThumbnails: number = 4; // Maximum number of thumbnails to display
	export let aspectRatio: string = '4/3'; // Aspect ratio for images (e.g., '4/3', '16/9')
	export let containerClass: string = ''; // Custom Tailwind classes for container
	export let transitionDuration: number = 300; // Transition duration in ms
	export let fallbackImage: string = 'https://archive.org/details/placeholder-image'; // Fallback image

	let mainImage: string = images.length > 0 ? images[0].url : '';
	let isMounted: boolean = false;
	let showCarousel: boolean = false;
	let currentCarouselIndex: number = 0;

	// Validate props
	$: if (images.length === 0) {
		console.warn('ImageGallery: No images provided');
	}
	$: if (maxThumbnails < 0) {
		maxThumbnails = 0;
	}
	$: if (images.length > 0 && !images.find((img) => img.url === mainImage)) {
		mainImage = images[0].url;
		currentCarouselIndex = 0;
	}

	onMount(() => {
		isMounted = true;
		return () => {
			isMounted = false;
		};
	});

	function openCarousel(image: Image) {
		if (images.some((img) => img.url === image.url)) {
			mainImage = image.url;
			currentCarouselIndex = images.findIndex((img) => img.url === image.url);
			showCarousel = true;
			document.body.style.overflow = 'hidden';
		}
	}

	function closeCarousel() {
		showCarousel = false;
		document.body.style.overflow = 'auto';
	}

	function nextImage() {
		if (images.length > 0) {
			currentCarouselIndex = (currentCarouselIndex + 1) % images.length;
			mainImage = images[currentCarouselIndex].url;
		}
	}

	function prevImage() {
		if (images.length > 0) {
			currentCarouselIndex = (currentCarouselIndex - 1 + images.length) % images.length;
			mainImage = images[currentCarouselIndex].url;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (showCarousel) {
			if (event.key === 'ArrowRight') nextImage();
			if (event.key === 'ArrowLeft') prevImage();
			if (event.key === 'Escape') closeCarousel();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class={containerClass}>
	{#if !showCarousel}
		{#if images.length === 0}
			<div class="flex justify-center">
				<SecureImage
					src={fallbackImage}
					alt="No images available"
					className="max-w-md rounded-3xl opacity-50"
				/>
			</div>
		{:else}
			<div
				class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6"
				transition:fade={{ duration: transitionDuration }}
			>
				<!-- Main Image -->
				<div
					class="relative w-full cursor-pointer overflow-hidden rounded-2xl"
					style="aspect-ratio: {aspectRatio};"
					on:click={() =>
						images.length > 0 &&
						openCarousel(images[images.findIndex((img) => img.url === mainImage)])}
					on:keydown={(e) =>
						e.key === 'Enter' &&
						images.length > 0 &&
						openCarousel(images[images.findIndex((img) => img.url === mainImage)])}
					role="button"
					tabindex="0"
				>
					{#if isMounted && mainImage}
						<SecureImage
							src={mainImage}
							alt={images.find((img) => img.url === mainImage)?.alt || 'Main property image'}
							fallback={fallbackImage}
							className="h-full w-full object-cover"
						/>
					{/if}
					<div class="absolute right-4 bottom-4 rounded-full bg-black/50 px-4 py-2 text-white">
						{images.findIndex((img) => img.url === mainImage) + 1} / {images.length}
					</div>
				</div>

				<!-- Thumbnail Grid -->
				<div class="grid grid-cols-2 gap-4">
					{#each images as image, index}
						{#if index < maxThumbnails}
							<div
								class="relative cursor-pointer overflow-hidden rounded-xl transition-transform hover:scale-105"
								style="aspect-ratio: {aspectRatio};"
								on:click={() => openCarousel(image)}
								on:keydown={(e) => e.key === 'Enter' && openCarousel(image)}
								role="button"
								tabindex="0"
							>
								<SecureImage
									src={image.url}
									alt={image.alt}
									fallback={fallbackImage}
									className={`h-full w-full object-cover ${mainImage !== image.url ? 'opacity-50' : ''}`}
								/>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}
	{/if}

	<!-- Full-Screen Carousel -->
	{#if showCarousel && images.length > 0}
		<div class="fixed inset-0 z-50 bg-black" transition:fade={{ duration: transitionDuration }}>
			<div class="relative h-full w-full">
				<!-- Close Button -->
				<button
					class="absolute top-4 right-4 z-10 cursor-pointer rounded-full bg-white/80 p-2 text-gray-800 hover:bg-white"
					on:click={closeCarousel}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>

				<!-- Carousel Image -->
				<div class="flex h-full w-full items-center justify-center">
					<SecureImage
						src={images[currentCarouselIndex].url}
						alt={images[currentCarouselIndex].alt}
						fallback={fallbackImage}
						className="max-h-full max-w-full object-contain"
					/>
				</div>

				<!-- Navigation Arrows -->
				<button
					class="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-3 hover:bg-white"
					on:click={prevImage}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						/>
					</svg>
				</button>
				<button
					class="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-full bg-white/80 p-3 hover:bg-white"
					on:click={nextImage}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 5l7 7-7 7"
						/>
					</svg>
				</button>

				<!-- Image Counter -->
				<div
					class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-white"
				>
					{currentCarouselIndex + 1} / {images.length}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	[role='button']:focus,
	button:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}
</style>
