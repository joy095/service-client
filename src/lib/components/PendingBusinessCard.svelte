<script lang="ts">
	import { userPendingBusiness } from '$lib/store';
	import type { Business } from '$lib/types';
	import { fade, slide } from 'svelte/transition';
	import Icon from '@iconify/svelte';

	export let business: Business;

	userPendingBusiness.set(business);

	// State to control popup visibility
	let showPopup = false;

	// Functions for edit and delete actions
	function handleEdit() {
		console.log('Edit business:', business);
		// Add your edit logic here
		showPopup = false;
	}

	function handleDelete() {
		console.log('Delete business:', business);
		// Add your delete logic here
		showPopup = false;
	}

	function togglePopup() {
		showPopup = !showPopup;
	}
</script>

<!-- Button wrapping the property card -->
<button on:click={togglePopup}>
	<div class="property-card">
		<div class="relative">
			<img src={business.ObjectName} alt={business.name} />

			<span
				class="absolute top-5 left-5 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800"
			>
				<div class="h-2 w-2 rounded-full bg-amber-600"></div>
				In progress
			</span>
		</div>

		<div class="details">
			<div class="price-type">
				<h3>{business.name}</h3>
			</div>
			<p class="location">{business.city}, {business.state}, {business.country}</p>
		</div>
	</div>
</button>

<!-- Popup Modal -->
{#if showPopup}
	<div class="popup-overlay" transition:fade={{ duration: 200 }} on:click={togglePopup}>
		<div
			class="popup-content relative"
			transition:slide={{ duration: 300, axis: 'y' }}
			on:click|stopPropagation
		>
			<button
				class="hand-burger absolute left-5 top-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-[#e7e7e7]"
				on:click={() => (showPopup = !showPopup)}
			>
				<Icon class="h-5 w-5 text-black" icon="material-symbols:close-rounded" />
			</button>
			<!-- Popup Image -->
			<img src={business.ObjectName} alt={business.name} class="popup-image" />

			<!-- Action Buttons -->
			<div class="popup-actions">
				<button class="edit-btn" on:click={handleEdit}>Edit listing</button>
				<button class="delete-btn" on:click={handleDelete}>
					<Icon icon="wpf:delete" class="h-4 w-4" /> Delete</button
				>
			</div>
		</div>
	</div>
{/if}

<style>
	.property-card {
		display: block;
		text-decoration: none;
		color: inherit;
		overflow: hidden;

		img {
			width: 100%;
			height: 25rem;
			object-fit: cover;
			border-radius: 0.8rem;
		}

		.details {
			padding: 1rem;
			text-align: left;

			.price-type {
				margin-bottom: 0.2rem;

				.price {
					font-weight: bold;
					color: #ff5a5f;
				}
			}

			.location {
				color: #666;
				margin-bottom: 0.5rem;
				font-size: 0.9rem;
			}
		}
	}

	/* Popup Styles */
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: flex-end;
		z-index: 100;
	}

	.popup-content {
		background: white;
		border-radius: 1.5rem;
		width: 100%;
		max-width: 28rem;
		padding: 1.5rem;
		margin: auto 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 1rem;
	}

	.popup-image {
		width: 8rem;
		height: 8rem;
		object-fit: cover;
		border-radius: 0.8rem;
		margin-bottom: 1rem;
		margin-top: 3rem;
	}

	.popup-actions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		justify-content: center;
		width: 100%;
	}

	.edit-btn,
	.delete-btn {
		padding: 0.7rem;
		border: none;
		border-radius: 0.4rem;
		cursor: pointer;
		font-weight: 500;
	}

	.edit-btn {
		background-color: #292929;
		color: white;
		transition: all 0.3;

		&:hover {
			background-color: #000;
		}
	}

	.delete-btn {
		color: #292929;
		transition: all 0.3;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;

		&:hover {
			color: #000;
			background-color: rgb(235, 235, 235);
		}
	}
</style>
