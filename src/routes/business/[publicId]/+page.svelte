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

<div class="container mx-auto mt-12 px-4 md:px-8 lg:px-12">
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

	<div class="business-header mt-8 text-center">
		<h1 class="text-primary text-4xl font-bold md:text-5xl">{business.name}</h1>
		<p class="text-accent mt-2 text-xl">{business.category}</p>
		<p class="mt-1 text-lg text-gray-600">{business.address}</p>
		<p class="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-gray-700">{business.about}</p>
	</div>

	<!-- Services -->
	<section class="services-section mt-16" in:fade={{ duration: 800, delay: 400, easing: cubicOut }}>
		<h2 class="section-title">Our Premium Services</h2>
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
							quality={90}
							className="h-[18rem] w-full object-cover rounded-t-3xl"
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
		<div class="map-container mt-16">
			<iframe
				src={`https://maps.google.com/maps?q=${business.latitude},${business.longitude} (${encodeURIComponent(business.name)})&z=16&output=embed`}
				class="h-[32rem] w-full rounded-3xl shadow-lg"
				style="border:0;"
				loading="lazy"
				referrerpolicy="no-referrer-when-downgrade"
			/>
		</div>
	{/if}
</div>

<style>
	:root {
		--primary-color: #1a3c5e; /* Navy blue for elegance */
		--accent-color: #d4a017; /* Gold for premium feel */
		--text-color: #333333;
		--background-color: #f9fafb;
		--card-background: #ffffff;
		--shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
		--transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
		--font-family: 'Inter', system-ui, -apple-system, sans-serif;
	}

	.container {
		font-family: var(--font-family);
		background: var(--background-color);
	}

	.business-header h1 {
		color: var(--primary-color);
		letter-spacing: -0.025em;
	}

	.business-header p {
		color: var(--text-color);
	}

	.services-section {
		margin-top: 4rem;
	}

	.section-title {
		font-size: 2.75rem;
		font-weight: 800;
		color: var(--primary-color);
		margin: 0 0 3rem;
		text-align: center;
		letter-spacing: -0.03em;
		position: relative;
	}

	.section-title::after {
		content: '';
		display: block;
		width: 60px;
		height: 3px;
		background: var(--accent-color);
		margin: 1rem auto 0;
	}

	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 3rem;
	}

	.service-card {
		background: var(--card-background);
		border-radius: 32px;
		overflow: hidden;
		box-shadow: var(--shadow);
		transition: var(--transition);
		position: relative;
		border: 1px solid rgba(0, 0, 0, 0.03);
	}

	.service-card:hover {
		transform: translateY(-12px);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
	}

	.service-image-wrapper {
		position: relative;
		overflow: hidden;
	}

	.service-image-wrapper img {
		transition: var(--transition);
	}

	.service-card:hover .service-image-wrapper img {
		transform: scale(1.05);
	}

	.service-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(rgba(26, 60, 94, 0.4), rgba(212, 160, 23, 0.3));
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
		padding: 1rem 2.5rem;
		background: var(--accent-color);
		color: white;
		border: none;
		border-radius: 50px;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		transition: var(--transition);
		box-shadow: 0 4px 12px rgba(212, 160, 23, 0.3);
	}

	.cta-button:hover {
		background: #b38b14;
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(212, 160, 23, 0.4);
	}

	.service-info {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.service-info h3 {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--primary-color);
		margin: 0;
	}

	.description {
		color: #4b5563;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.meta {
		display: flex;
		justify-content: space-between;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-color);
		margin-top: auto;
	}

	.price {
		color: var(--accent-color);
		font-weight: 700;
	}

	.map-container {
		border-radius: 32px;
		overflow: hidden;
		box-shadow: var(--shadow);
	}

	@media (max-width: 768px) {
		.section-title {
			font-size: 2.25rem;
		}

		.services-grid {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.business-header h1 {
			font-size: 3rem;
		}
	}
</style>
