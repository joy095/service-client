<script lang="ts">
	import SecureImage from '$lib/components/SecureImage.svelte';
	import { onMount } from 'svelte';

	import { fade } from 'svelte/transition';

	// Sample image data (replace with your own image URLs)
	let images: string[] = [
		'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
		'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde',
		'https://images.unsplash.com/photo-1600585154526-990dced4db0d',
		'https://images.unsplash.com/photo-1600585152915-d208bec867a1',
		'https://images.unsplash.com/photo-1600585153490-76fb20a0f2b0'
	];

	let mainImage: string = images[0];
	let isMounted: boolean = false;
	let showCarousel: boolean = false;
	let currentCarouselIndex: number = 0;

	onMount(() => {
		isMounted = true;
		return () => {
			isMounted = false;
		};
	});

	function openCarousel(image: string) {
		mainImage = image;
		currentCarouselIndex = images.indexOf(image);
		showCarousel = true;
		document.body.style.overflow = 'hidden';
	}

	function closeCarousel() {
		showCarousel = false;
		document.body.style.overflow = 'auto';
	}

	function nextImage() {
		currentCarouselIndex = (currentCarouselIndex + 1) % images.length;
		mainImage = images[currentCarouselIndex];
	}

	function prevImage() {
		currentCarouselIndex = (currentCarouselIndex - 1 + images.length) % images.length;
		mainImage = images[currentCarouselIndex];
	}

	function handleKeydown(event: KeyboardEvent) {
		if (showCarousel) {
			if (event.key === 'ArrowRight') nextImage();
			if (event.key === 'ArrowLeft') prevImage();
			if (event.key === 'Escape') closeCarousel();
		}
	}

	let healthData = null;
	let error = null;
	let loading = true;

	onMount(async () => {
		try {
			const url = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev/health';

			const response = await fetch(url);

			if (!response.ok) {
				const errorText = await response.text();
				console.log('❌ Error response body:', errorText);
				throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
			}

			const data = await response.json();

			healthData = data;
		} catch (err) {
			console.error('💥 Fetch error details:', {
				message: err.message,
				name: err.name,
				stack: err.stack
			});

			// More detailed error analysis
			if (err.name === 'TypeError' && err.message.includes('fetch')) {
				console.error('🌐 This is likely a CORS error or network issue');
				console.error('💡 Solutions:');
				console.error('   1. Add your frontend domain to CORS allowed origins in your Worker');
				console.error('   2. Check if the Worker URL is correct');
				console.error('   3. Verify the Worker is deployed and running');
			}

			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

<div style="font-family: monospace; padding: 20px;">
	<h1>Cloudflare Worker Debug</h1>

	{#if loading}
		<p>🔄 Loading...</p>
	{/if}

	{#if error}
		<div style="background: #ffebee; padding: 15px; border-radius: 5px;">
			<h3 style="color: #c62828; margin-top: 0;">❌ Error:</h3>
			<p><strong>{error}</strong></p>
			<p>Check browser console for detailed logs (F12 → Console)</p>
		</div>
	{/if}

	{#if healthData}
		<div style="background: #e8f5e8; padding: 15px; border-radius: 5px;">
			<h3 style="color: #2e7d32; margin-top: 0;">✅ Success!</h3>
			<pre>{JSON.stringify(healthData, null, 2)}</pre>
		</div>
	{/if}

	<h3>Debug Steps:</h3>
	<ol>
		<li>Open browser DevTools (F12)</li>
		<li>Go to Console tab</li>
		<li>Refresh this page</li>
		<li>Check detailed error logs</li>
	</ol>

	<SecureImage
		src="https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg"
		alt="No r2 image"
	/>
</div>

<svelte:window on:keydown={handleKeydown} />

<div class="container mx-auto px-4 py-8">
	{#if !showCarousel}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" transition:fade={{ duration: 300 }}>
			<!-- Main Image -->
			<div
				class="relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-2xl"
				on:click={() => openCarousel(mainImage)}
				on:keydown={(e) => e.key === 'Enter' && openCarousel(mainImage)}
				role="button"
				tabindex="0"
			>
				{#if isMounted}
					<SecureImage
						src={mainImage}
						alt="Main property image"
						className="h-full w-full object-cover"
					/>
				{/if}
				<div class="absolute right-4 bottom-4 rounded-full bg-black/50 px-4 py-2 text-white">
					{images.indexOf(mainImage) + 1} / {images.length}
				</div>
			</div>

			<!-- Thumbnail Grid -->
			<div class="grid grid-cols-2 gap-4">
				{#each images as image, index}
					{#if index < 4}
						<div
							class="relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl transition-transform hover:scale-105"
							on:click={() => openCarousel(image)}
							on:keydown={(e) => e.key === 'Enter' && openCarousel(image)}
							role="button"
							tabindex="0"
						>
							<img
								src={image}
								alt={`Thumbnail ${index + 1}`}
								class="h-full w-full object-cover"
								class:opacity-50={mainImage !== image}
							/>
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/if}

	<!-- Full-Screen Carousel -->
	{#if showCarousel}
		<div class="fixed inset-0 z-50 bg-black" transition:fade={{ duration: 300 }}>
			<div class="relative h-full w-full">
				<!-- Close Button -->
				<button
					class="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 text-gray-800 hover:bg-white"
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
						src={images[currentCarouselIndex]}
						alt={`Carousel image ${currentCarouselIndex + 1}`}
						className="max-h-full max-w-full object-contain"
					/>
				</div>

				<!-- Navigation Arrows -->
				<button
					class="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/80 p-3 hover:bg-white"
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
					class="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/80 p-3 hover:bg-white"
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
	/* Additional styles for focus states */
	[role='button']:focus,
	button:focus {
		outline: 2px solid #2563eb;
		outline-offset: 2px;
	}
</style>
