<script lang="ts">
	import { userPendingBusiness } from '$lib/store';
	import type { Business } from '$lib/types';
	import { fade, slide } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import formatDate from '$lib/dateFormat';
	import { goto } from '$app/navigation';
	import { createEventDispatcher } from 'svelte'; // Import createEventDispatcher

	export let business: Business;

	userPendingBusiness.set([business]);

	// State to control popup visibility and confirmation
	let showPopup = false;
	let showConfirmDelete = false;
	let deleting = false; // New state for loading indicator on delete button

	// Create an event dispatcher
	const dispatch = createEventDispatcher();

	// Functions for edit and delete actions
	function handleEdit() {
		goto(`/become-a-professional/${business.publicId}`);
		showPopup = false; // Close popup after navigating
	}

	async function handleDeleteConfirm() {
		deleting = true; // Set loading state to true
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/business/${business.publicId}`,
				{
					method: 'DELETE',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include'
				}
			);

			if (!response.ok) {
				// Attempt to parse error message from response if available
				const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
				throw new Error(errorData.message || 'Failed to delete business');
			}

			console.log('Business deleted successfully:', business.publicId);
			showPopup = false; // Close the popup
			showConfirmDelete = false; // Reset confirmation state

			dispatch('businessDeleted', { publicId: business.publicId });
		} catch (error) {
			console.error('Error deleting business:', error);
			// You can add a user-friendly error message here, e.g., using a toast notification
			// alert(`Error deleting business: ${error.message}`); // Avoid alert(), use a custom modal or toast
		} finally {
			deleting = false; // Reset loading state
		}
	}

	function togglePopup() {
		showPopup = !showPopup;
		if (!showPopup) {
			showConfirmDelete = false; // Reset confirmation state when closing popup
		}
	}

	function handleDelete() {
		showConfirmDelete = true; // Show confirmation buttons
	}

	function handleCancel() {
		showConfirmDelete = false; // Revert to previous popup state
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
				<p class="font-semibold">Your listing stated on {formatDate(business.createdAt)}</p>
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
				class="hand-burger absolute top-5 left-5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-[#e7e7e7]"
				on:click={togglePopup}
			>
				<Icon class="h-5 w-5 text-black" icon="material-symbols:close-rounded" />
			</button>
			<!-- Popup Image -->
			<img src={business.ObjectName} alt={business.name} class="popup-image" />

			<div class="mb-3 text-center">
				<p class=" font-semibold">
					Your listing stated on {formatDate(business.createdAt)}
				</p>
				<p class="location">{business.city}, {business.state}, {business.country}</p>
			</div>

			<!-- Action Buttons or Confirmation -->
			<div class="popup-actions">
				{#if showConfirmDelete}
					<p class="mb-2 text-center text-xl font-semibold">Remove this listing?</p>

					<button class="edit-btn" on:click={handleDeleteConfirm} disabled={deleting}>
						{#if deleting}
							<svg
								class="h-5 w-5 animate-spin text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Removing...
						{:else}
							Yes, remove
						{/if}
					</button>
					<button class="delete-btn" on:click={handleCancel}>Cancel</button>
				{:else}
					<button class="edit-btn" on:click={handleEdit}>Edit listing</button>
					<button class="delete-btn" on:click={handleDelete}>
						<Icon icon="wpf:delete" class="h-4 w-4" /> Delete
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style lang="postcss">
	.property-card {
		display: block;
		text-decoration: none;
		color: inherit;
		overflow: hidden;
		cursor: pointer;
	}

	.property-card img {
		width: 100%;
		height: 25rem;
		object-fit: cover;
		border-radius: 0.8rem;
	}

	.property-card .details {
		padding-top: 1rem;
		text-align: left;
	}

	.property-card .details .price-type {
		margin-bottom: 0.2rem;
	}

	.property-card .details .location {
		color: #666;
		font-size: 0.9rem;
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
		/* Ensure flex properties for spinner are not overridden */
		display: flex; /* Explicitly set display to flex */
		align-items: center;
		justify-content: center;
		gap: 0.5rem; /* Gap for text and icon/spinner */
	}

	.edit-btn {
		background-color: #292929;
		color: white;
		transition: all 0.3s;
	}

	.edit-btn:hover {
		background-color: #000;
	}

	.delete-btn {
		color: #292929;
		transition: all 0.3s;
		/* Background color for delete button is handled by Tailwind in markup for consistency with loading state */
	}

	.delete-btn:hover {
		color: #000;
		background-color: rgb(235, 235, 235);
	}
</style>
