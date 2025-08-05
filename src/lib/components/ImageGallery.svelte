<script lang="ts">
	import type { Image } from '$lib/types';
	import { onMount } from 'svelte';
	import SecureImage from '$lib/components/SecureImage.svelte';

	export let images: Image[] = [];

	let currentIndex = 0;
	$: if (images.length === 0) currentIndex = 0;
	$: if (currentIndex >= images.length) currentIndex = Math.max(0, images.length - 1);
	let thumbnailsContainer: HTMLDivElement;

	function changeImage(index: number) {
		if (index < 0 || index >= images.length) return;
		currentIndex = index;

		const thumbnail = thumbnailsContainer.children[index] as HTMLElement;
		if (thumbnail) {
			thumbnail.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'nearest'
			});
		}
	}

	onMount(() => {
		const thumbnail = thumbnailsContainer.children[currentIndex] as HTMLElement;
		if (thumbnail) {
			thumbnail.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

<div class="gallery-container">
	<!-- Main Image -->
	{#if images.length > 0}
		{#key images[currentIndex].id}
			<SecureImage
				src={`${import.meta.env.VITE_IMAGE_URL}/${images[currentIndex].url}`}
				alt={images[currentIndex].alt}
				width={800}
				height={600}
				crop={true}
				quality={85}
				className="w-full h-[25rem] object-cover rounded-lg"
			/>
		{/key}
	{:else}
		<div class="flex h-full w-full items-center justify-center rounded-lg bg-gray-200">
			<p class="text-gray-500">No images available</p>
		</div>
	{/if}

	<!-- Thumbnails -->
	<div class="thumbnails" bind:this={thumbnailsContainer}>
		{#each images as image, index (image.id)}
			<div
				class="thumbnail"
				class:active={currentIndex === index}
				on:click={() => changeImage(index)}
				role="button"
				aria-label={`View image ${index + 1}`}
				tabindex="0"
				on:keydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') changeImage(index);
				}}
			>
				<SecureImage
					src={`${import.meta.env.VITE_IMAGE_URL}/${image.url}`}
					alt={image.alt}
					width={150}
					height={150}
					quality={85}
					className="rounded border h-full w-full object-cover"
				/>
			</div>
		{/each}
	</div>
</div>

<style>
	.gallery-container {
		display: flex;
		flex-direction: row;
		gap: 1.5rem;
		max-height: 25rem;
	}

	.thumbnails {
		width: 120px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		overflow-y: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
		scroll-behavior: smooth;
	}

	.thumbnails::-webkit-scrollbar {
		display: none;
	}

	.thumbnail {
		width: 100%;
		height: 100px;
		border-radius: 0.5rem;
		overflow: hidden;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
		position: relative;
		border: 2px solid transparent;
	}

	.thumbnail.active {
		border-color: #007bff;
		box-shadow:
			0 0 0 2px white,
			0 0 0 4px #007bff;
	}

	.thumbnail:hover {
		transform: scale(1.03);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.gallery-container {
			flex-direction: column;
			padding: 1rem;
		}

		.thumbnails {
			width: 100%;
			flex-direction: row;
			overflow-x: auto;
			overflow-y: hidden;
			max-height: 120px;
			gap: 0.75rem;
			padding: 0.5rem 0;
		}

		.thumbnail {
			width: 100px;
			height: 100px;
		}
	}
</style>
