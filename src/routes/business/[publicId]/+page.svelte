<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Map from '$lib/components/Map.svelte';

	export let data;
	const { business, services } = data;

	let isVisible = false;

	onMount(() => {
		isVisible = true;
		return () => (isVisible = false);
	});
</script>

<div class="container">
	<!-- Business Header -->
	<div class="hero-section" in:fade={{ duration: 800, easing: cubicOut }}>
		<div class="image-wrapper">
			<img loading="lazy" src={business.ObjectName} alt={business.name} class="main-image" />
			<div class="image-overlay">
				<h1 class="hero-title">{business.name}</h1>
				<p class="hero-subtitle">{business.category} in {business.city}, {business.country}</p>
			</div>
		</div>

		<div class="info-card" in:slide={{ duration: 600, delay: 200, easing: cubicOut }}>
			<div class="details-grid">
				<div class="detail-item">
					<span class="label">Location</span>
					<span>{business?.Latitude}, {business?.Longitude}</span>
				</div>
				<div class="detail-item">
					<span class="label">Postal Code</span>
					<span>{business.postalCode}</span>
				</div>
				<div class="detail-item">
					<span class="label">Status</span>
					<span class={business.isActive ? 'status-active' : 'status-inactive'}>
						{business.isActive ? 'Active' : 'Inactive'}
					</span>
				</div>
			</div>
		</div>
	</div>

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
						<img
							loading="lazy"
							src={service.object_name}
							alt={service.name}
							class="service-image"
						/>
						<div class="service-overlay">
							<a href="/booking/{business.publicId}?service={service.id}" class="cta-button"
								>Book Now</a
							>
						</div>
					</div>
					<div class="service-info">
						<h3>{service.name}</h3>
						<p class="description">{service.description}</p>
						<div class="meta">
							<span class="price">₹{service.price}</span>
							<span class="duration">
								{#if service.durationMinutes >= 60}
									{Math.floor(service.durationMinutes / 60)}h {service.durationMinutes % 60}m
								{:else}
									{service.durationMinutes}m
								{/if}
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Map -->
	{#if business.Latitude && business.Longitude !== 0}
		<Map
			className="mt-10 overflow-hidden rounded-md !z-0"
			storeLat={business.Latitude}
			storeLng={business.Longitude}
			businessName={business.name}
			zoom={15}
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

	.container {
		max-width: 1400px;
		margin: 0 auto;
		padding: 3rem 1.5rem;
		background: var(--background-color);
	}

	.hero-section {
		position: relative;
		margin-bottom: 4rem;
	}

	.image-wrapper {
		position: relative;
		border-radius: 24px;
		overflow: hidden;
		box-shadow: var(--shadow);
	}

	.main-image {
		width: 100%;
		max-height: 80vh;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.image-wrapper:hover .main-image {
		transform: scale(1.05);
	}

	.image-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 2rem;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
		color: white;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.hero-subtitle {
		font-size: 1.25rem;
		opacity: 0.9;
		margin: 0.5rem 0 0;
	}

	.info-card {
		background: var(--card-background);
		padding: 2.5rem;
		margin: -4rem 2rem 0;
		border-radius: 24px;
		box-shadow: var(--shadow);
		position: relative;
		z-index: 1;
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
	}

	.detail-item {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-size: 0.9rem;
		font-weight: 600;
		color: #666;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.status-active {
		color: #28a745;
		font-weight: 600;
	}

	.status-inactive {
		color: #dc3545;
		font-weight: 600;
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

	.service-image {
		width: 100%;
		height: 240px;
		object-fit: cover;
		transition: var(--transition);
	}

	.service-card:hover .service-image {
		transform: scale(1.1);
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
		.hero-title {
			font-size: 2rem;
		}

		.hero-subtitle {
			font-size: 1rem;
		}

		.info-card {
			margin: -2rem 1rem 0;
			padding: 1.5rem;
		}

		.section-title {
			font-size: 2rem;
		}

		.services-grid {
			grid-template-columns: 1fr;
		}

		.service-image {
			height: 200px;
		}
	}
</style>
