<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Image } from '$lib/types/index.js';
	import SecureImage from '$lib/components/SecureImage.svelte';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import Gallery from '$lib/components/Gallery.svelte';
	import { isAuthenticated } from '$lib/stores/authStore';

	// import Map from '$lib/components/Map.svelte';

	export let data;
	const { business, services } = data;

	let isVisible = false;

	onMount(() => {
		isVisible = true;
		return () => (isVisible = false);
	});

	const images: Image[] =
		business.images
			?.filter((img) => img?.objectName) // Only valid images
			.map((img, index) => ({
				id: img.imageId?.toString() || crypto.randomUUID(), // Fallback ID
				url: img.objectName.trim(), // Trim whitespace
				alt: `${business.name} - Gallery image ${index + 1}`,
				index
			})) || [];
</script>

<div class="container">
	{#if images.length === 0}
		<div class="flex justify-center">
			<img
				src="https://archive.org/details/placeholder-image"
				alt="No images available"
				class="max-w-md rounded-3xl opacity-50"
			/>
		</div>
	{:else}
		<Gallery {images} />
	{/if}

	<!-- Services -->
	<section class="services-section" in:fade={{ duration: 800, delay: 400, easing: cubicOut }}>
		<h2 class="section-title">Our Services</h2>
		<div class="services-grid">
			{#each services as service (service.id)}
				<div
					class="service-card"
					in:slide={{ duration: 600, delay: Number(service.id) * 100, easing: cubicOut }}
				>
					<div class="service-image-wrapper">
						<SecureImage
							src="{PUBLIC_IMAGE_URL}/{service.objectName}"
							alt={service.name}
							width={450}
							height={320}
							quality={85}
							className="h-[15rem] object-cover"
						/>

						<div class="service-overlay">
							{#if $isAuthenticated}
								<a href="/book/{business.publicId}?service={service.id}" class="cta-button"
									>Book Now</a
								>
							{:else}
								<a href="/login" class="cta-button">Book Now</a>
							{/if}
						</div>
					</div>
					<div class="service-info">
						<h3>{service.name}</h3>
						<p class="description">{service.description}</p>
						<div class="meta">
							<span class="price">₹{service.price}</span>
							<span class="duration">
								{#if service.duration >= 60}
									{Math.floor(service.duration / 60)}h {service.duration % 60}m
								{:else}
									{service.duration}m
								{/if}
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Map -->
	{#if business.latitude && business.longitude !== 0}
		<iframe
			src={`https://maps.google.com/maps?q=${business.latitude},${business.longitude} (${encodeURIComponent(business.name)})&z=16&output=embed`}
			class="mt-10 h-[30rem] w-full rounded-md"
			style="border:0;"
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
		/>
	{/if}
</div>

<style>
	:root {
		--primary-color: #1a3c5e;
		--accent-color: #d4a017;
		--text-color: #333;
		--background-color: #f8f9fa;
		--card-background: #ffffff;
		--shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		--transition: all 0.3s ease;
	}

	.services-section {
		margin-top: 4rem;
	}

	.section-title {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--primary-color);
		margin: 0 0 2rem;
		text-align: center;
		letter-spacing: -0.02em;
	}

	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 0.33fr));
		gap: 2.5rem;
	}

	.service-card {
		background: var(--card-background);
		border-radius: 24px;
		overflow: hidden;
		box-shadow: var(--shadow);
		transition: var(--transition);
		position: relative;
	}

	.service-card:hover {
		transform: translateY(-8px);
	}

	.service-image-wrapper {
		position: relative;
		overflow: hidden;
	}

	.service-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		transition: var(--transition);
	}

	.service-card:hover .service-overlay {
		opacity: 1;
	}

	.cta-button {
		padding: 0.75rem 2rem;
		background: var(--accent-color);
		color: white;
		border: none;
		border-radius: 50px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: var(--transition);
	}

	.cta-button:hover {
		background: #b38b14;
	}

	.service-info {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.service-info h3 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--primary-color);
		margin: 0;
	}

	.description {
		color: #555;
		font-size: 1rem;
		line-height: 1.6;
	}

	.meta {
		display: flex;
		justify-content: space-between;
		font-size: 1rem;
		font-weight: 500;
		color: var(--text-color);
	}

	.price {
		color: var(--accent-color);
		font-weight: 600;
	}

	@media (max-width: 768px) {
		.section-title {
			font-size: 2rem;
		}

		.services-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
