<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Image } from '$lib/types/index.js';
	import SecureImage from '$lib/components/SecureImage.svelte';
	import Gallery from '$lib/components/Gallery.svelte';
	import { isAuthenticated } from '$lib/stores/authStore';
	import Map from '$lib/components/Map.svelte';
	import { PUBLIC_BASE_URL, PUBLIC_IMAGEKIT_URL_ENDPOINT } from '$env/static/public';

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

<svelte:head>
	<title>{business.name}</title>
	<meta name="description" content={business.about} />

	<meta property="og:title" content={business.name} />
	<meta property="og:description" content={business.about} />
	<meta property="og:url" content={PUBLIC_BASE_URL + '/business/' + business.publicId} />
	<meta
		property="og:image"
		content={PUBLIC_IMAGEKIT_URL_ENDPOINT + '/' + business.images[0].objectName}
	/>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={business.name} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={business.name} />
	<meta name="twitter:description" content={business.about} />
	<meta
		name="twitter:image"
		content={PUBLIC_IMAGEKIT_URL_ENDPOINT + '/' + business.images[0].objectName}
	/>
	<!-- <meta name="twitter:site" content={meta.twitterHandle} />
	<meta name="twitter:creator" content={meta.twitterHandle} /> -->
</svelte:head>

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
					class="service-card group"
					in:slide={{ duration: 600, delay: Number(service.id) * 100, easing: cubicOut }}
				>
					<div class="service-image-wrapper">
						<SecureImage
							src={service.objectName}
							alt={service.name}
							width={450}
							height={320}
							quality={95}
							className="h-[20rem] w-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
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
						<h3 class="service-title">{service.name}</h3>
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
		<div class="mt-16">
			<Map
				className="mt-10 overflow-hidden shadow-xl rounded-3xl !z-0 h-[32rem]"
				storeLat={business.latitude}
				storeLng={business.longitude}
				businessName={business.name}
				zoom={15}
			/>
		</div>
	{/if}
</div>

<style>
	:global(:root) {
		--primary-color: #2d3748;
		--accent-color: #e53e3e;
		--card-background: #ffffff;
		--text-color: #4a5568;
		--shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
		--transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
		--gradient-start: #4facfe;
		--gradient-end: #00f2fe;
	}

	.services-section {
		padding: 3rem 1.5rem;
		max-width: 1440px;
		margin: 0 auto;
	}

	.section-title {
		font-size: 2.75rem;
		font-weight: 800;
		color: var(--primary-color);
		margin: 0 0 3rem;
		text-align: center;
		letter-spacing: -0.03em;
		position: relative;
		background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.section-title::after {
		content: '';
		display: block;
		width: 80px;
		height: 4px;
		background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
		margin: 1rem auto 0;
		border-radius: 2px;
	}

	.services-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
		gap: 3rem;
	}

	.service-card {
		background: var(--card-background);
		border-radius: 24px;
		overflow: hidden;
		box-shadow: var(--shadow);
		transition: var(--transition);
		position: relative;
		border: 1px solid rgba(0, 0, 0, 0.03);
		background: linear-gradient(145deg, #ffffff, #f9fafb);
	}

	.service-card:hover {
		transform: translateY(-12px);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
	}

	.service-image-wrapper {
		position: relative;
		overflow: hidden;
		border-radius: 24px 24px 0 0;
	}

	.service-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			to top,
			rgba(0, 0, 0, 0.8) 0%,
			rgba(0, 0, 0, 0.3) 50%,
			rgba(0, 0, 0, 0.1) 100%
		);
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
		background: linear-gradient(90deg, var(--gradient-start), var(--gradient-end));
		color: white;
		border: none;
		border-radius: 50px;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		transition: var(--transition);
		box-shadow: 0 4px 20px rgba(79, 172, 254, 0.4);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		position: relative;
		overflow: hidden;
	}

	.cta-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: 0.5s;
	}

	.cta-button:hover::before {
		left: 100%;
	}

	.cta-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 25px rgba(79, 172, 254, 0.6);
	}

	.service-info {
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.service-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--primary-color);
		margin: 0 0 0.5rem;
		transition: var(--transition);
	}

	.service-card:hover .service-title {
		color: var(--gradient-start);
	}

	.description {
		color: #4b5563;
		font-size: 1.05rem;
		line-height: 1.7;
		margin: 0;
	}

	.meta {
		display: flex;
		justify-content: space-between;
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--text-color);
		margin-top: auto;
		padding-top: 1rem;
		border-top: 1px solid rgba(0, 0, 0, 0.05);
	}

	.price {
		color: var(--accent-color);
		font-weight: 700;
		font-size: 1.25rem;
	}

	.duration {
		color: #718096;
		background: rgba(237, 242, 247, 0.8);
		padding: 0.25rem 0.75rem;
		border-radius: 50px;
		font-weight: 500;
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

		.service-info {
			padding: 1.5rem;
		}
	}

	/* Enhanced gallery styling */
	.svelte-gallery {
		border-radius: 24px;
		overflow: hidden;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
	}

	/* Map styling */
	.map-container {
		border-radius: 24px;
		overflow: hidden;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
	}
</style>
