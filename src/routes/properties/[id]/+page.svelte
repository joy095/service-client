<script>
	import { page } from '$app/stores';
	import { currentProperty, loadProperty, isLoading, error } from '$lib/stores/properties';

	// Load property when page mounts
	import { onMount } from 'svelte';
	$: propertyId = $page.params.id;
	onMount(() => loadProperty(propertyId));
</script>

{#if $isLoading}
	<p>Loading property details...</p>
{:else if $error}
	<p class="error">Error: {$error}</p>
{:else if $currentProperty}
	<div class="property-detail">
		<h1>{$currentProperty.title}</h1>
		<img src={$currentProperty.image} alt={$currentProperty.title} />
		<p>Location: {$currentProperty.location}</p>
		<p>Price: ${$currentProperty.price} night</p>
		<p>Rating: {$currentProperty.rating} ★</p>
		<p>{$currentProperty.description}</p>

		<button>Book Now</button>
	</div>
{:else}
	<p>Property not found</p>
{/if}

<style>
	.property-detail {
		max-width: 800px;
		margin: 0 auto;

		img {
			width: 100%;
			max-height: 500px;
			object-fit: cover;
			margin: 1rem 0;
		}

		button {
			padding: 0.75rem 1.5rem;
			background: #ff5a5f;
			color: white;
			border: none;
			border-radius: 4px;
			font-size: 1rem;
			cursor: pointer;
		}
	}

	.error {
		color: red;
	}
</style>
