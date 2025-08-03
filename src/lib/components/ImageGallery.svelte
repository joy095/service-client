<script lang="ts">
	import type { Image } from '$lib/types';
	import { onMount } from 'svelte';

	export let images: Image[] = [];

	let currentIndex = 0;
	let thumbnailsContainer: HTMLDivElement;

	// Change image and scroll thumbnail into view
	function changeImage(index: number) {
		if (index < 0 || index >= images.length) return;
		currentIndex = index;

		// Smooth scroll active thumbnail into view
		const thumbnail = thumbnailsContainer.children[index] as HTMLElement;
		if (thumbnail) {
			thumbnail.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'nearest'
			});
		}
	}

	// Auto-scroll to active thumbnail on mount
	onMount(() => {
		const thumbnail = thumbnailsContainer.children[currentIndex] as HTMLElement;
		if (thumbnail) {
			thumbnail.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

<div class="gallery-container">
	<!-- Main Image -->
	<div class="main-image">
		<img
			src="{import.meta.env.VITE_IMAGE_URL}/{images[currentIndex].url}"
			alt={images[currentIndex].alt}
			loading="lazy"
		/>
	</div>

	<!-- Thumbnails (Scrollable, No Visible Scrollbar) -->
	<div class="thumbnails" bind:this={thumbnailsContainer}>
		{#each images as image (image.id)}
			<div
				class="thumbnail"
				class:active={currentIndex === image.index}
				on:click={() => changeImage(image.index)}
			>
				<img src="{import.meta.env.VITE_IMAGE_URL}/{image.url}" alt={image.alt} loading="lazy" />
			</div>
		{/each}
	</div>
</div>

<style>
	/* ========== Main Gallery Layout ========== */
	.gallery-container {
		display: flex;
		gap: 2rem;
		padding: 2rem;
	}

	/* Main Image */
	.main-image {
		width: 90%;
		border-radius: 1rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		position: relative;
	}

	.main-image img {
		width: 100%;
		height: 30rem;
		object-fit: cover;
		transition:
			opacity 0.4s ease,
			transform 0.4s ease;
	}

	/* Thumbnails Container */
	.thumbnails {
		width: 10%;
		min-width: 80px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow-y: auto; /* Enable scroll */
		scrollbar-width: none; /* Firefox: hide scrollbar */
		-ms-overflow-style: none; /* IE/Edge: hide scrollbar */
		scroll-behavior: smooth; /* Smooth scroll */
		position: relative;
		border-radius: 1rem;
		padding: 0.5rem 0;
	}

	.thumbnails::-webkit-scrollbar {
		display: none; /* Chrome/Safari: hide scrollbar */
	}

	/* Thumbnail Style */
	.thumbnail {
		position: relative;
		border-radius: 1rem;
		height: 5rem;
		overflow: hidden;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		flex-shrink: 0; /* Prevent shrinking */
	}

	.thumbnail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Active Thumbnail Indicator */
	.thumbnail.active::before {
		content: '';
		position: absolute;
		inset: 0;
		background: rgba(0, 123, 255, 0.2);
		border: 2px solid #007bff;
		z-index: 1;
		border-radius: 1rem;
	}

	.thumbnail:hover {
		transform: scale(1.05);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.gallery-container {
			flex-direction: column;
			padding: 1rem;
		}

		.main-image {
			width: 100%;
		}

		.main-image img {
			height: 20rem;
		}

		.thumbnails {
			width: 100%;
			max-height: 80px;
			flex-direction: row;
			overflow-x: auto;
			overflow-y: hidden;
			gap: 0.5rem;
			padding: 0.5rem 0;
		}

		.thumbnail {
			height: 80px;
			width: 80px;
		}
	}
</style>
