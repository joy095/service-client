<script lang="ts">
	import { userPendingBusiness } from '$lib/store';
	import type { Business } from '$lib/types';
	import { fade, slide } from 'svelte/transition';
	import Icon from '@iconify/svelte';
	import formatDate from '$lib/dateFormat';
	import { goto } from '$app/navigation';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import SecureImage from './SecureImage.svelte';
	import { browser } from '$app/environment';
	import { fadeAndSlide } from '$lib/transitions/fadeAndSlide';

	export let business: Business;

	userPendingBusiness.set([business]);

	// Event dispatcher
	const dispatch = createEventDispatcher();

	// Popup states
	let showMenu = false; // Dropdown menu (Edit/Delete)
	let showConfirmDelete = false; // Confirmation dialog
	let deleting = false; // Loading state during delete

	// Close menu on outside click
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		if (showMenu && !target.closest('.menu-wrapper')) {
			showMenu = false;
			showConfirmDelete = false;
		}
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}
	});

	// Actions
	function handleEdit() {
		showMenu = false;
		goto(`/become-a-professional/${business.publicId}/business`);
	}

	async function handleDelete() {
		deleting = true;
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
				const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
				throw new Error(errorData.message || 'Failed to delete business');
			}

			showMenu = false;
			dispatch('businessDeleted', { publicId: business.publicId });
		} catch (error) {
			console.error('Error deleting business:', error);
			// Consider using a toast notification instead of alert
		} finally {
			deleting = false;
		}
	}

	function confirmDelete() {
		showConfirmDelete = true;
	}

	function cancelDelete() {
		showConfirmDelete = false;
	}

	// console.log(business.isServiceBusiness);
</script>

{#if business.isServiceBusiness}
	<a href="/dashboard/{business.publicId}" class="property-card-link block">
		<div class="property-card-wrapper relative">
			<div class="property-card">
				<div class="relative">
					<!-- Menu Button -->
					<div class="menu-wrapper absolute top-2 left-2 z-10" on:click|stopPropagation>
						<button
							class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-[#e7e7e7]"
							on:click={() => (showMenu = !showMenu)}
							aria-label="More options"
						>
							<Icon class="h-5 w-5 text-black" icon="pepicons-pencil:dots-x" />
						</button>

						{#if showMenu}
							<div
								class="absolute right-0 mt-2 w-28 cursor-auto overflow-hidden rounded-md border border-gray-200 bg-white py-2 text-sm shadow-lg"
								transition:fadeAndSlide={{
									duration: 200,
									easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
								}}
							>
								<a
									class="flex w-full cursor-pointer px-4 py-2 text-left font-medium hover:bg-gray-100"
									on:click={handleEdit}
								>
									Edit
								</a>
								<button
									class="flex w-full cursor-pointer px-4 py-2 text-left font-medium text-red-600 hover:bg-gray-100"
									on:click={confirmDelete}
								>
									Delete
								</button>
							</div>
						{/if}
					</div>

					<!-- Image -->
					{#if business.images?.length > 0 && business.images[0].objectName}
						<SecureImage
							src="{import.meta.env.VITE_IMAGE_URL}/{business.images[0].objectName}"
							alt={business.name}
							on:error={(e) =>
								((e.currentTarget as HTMLImageElement).src = '/image-placeholder.svg')}
							className="h-[25rem] w-full rounded-md object-cover"
						/>
					{:else}
						<div class="h-[25rem] w-full rounded-md bg-gray-200 object-cover"></div>
					{/if}

					<!-- Status Badge -->
					{#if !business.isActive}
						<span
							class="absolute top-5 left-5 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800"
						>
							<div class="h-2 w-2 rounded-full bg-amber-600"></div>
							In progress
						</span>
					{/if}
				</div>

				<!-- Card Details -->
				<div class="details">
					<div class="price-type">
						{#if business.createdAt !== null && !business.isActive}
							<p class="font-semibold">Your listing started on {formatDate(business.createdAt)}</p>
						{/if}
					</div>
					<p class="location">{business.city}, {business.state}, {business.country}</p>
				</div>
			</div>
		</div>
	</a>
{:else}
	<!-- Static version (no link) -->
	<div class="property-card-wrapper relative">
		<div class="property-card">
			<div class="relative">
				<!-- Menu Button -->
				<div class="menu-wrapper absolute top-2 left-2 z-10" on:click|stopPropagation>
					<button
						class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-[#e7e7e7]"
						on:click={() => (showMenu = !showMenu)}
						aria-label="More options"
					>
						<Icon class="h-5 w-5 text-black" icon="pepicons-pencil:dots-x" />
					</button>

					{#if showMenu}
						<div
							class="absolute right-0 mt-2 w-28 cursor-auto overflow-hidden rounded-md border border-gray-200 bg-white py-2 text-sm shadow-lg"
							transition:fadeAndSlide={{
								duration: 200,
								easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
							}}
						>
							<a
								class="flex w-full cursor-pointer px-4 py-2 text-left font-medium hover:bg-gray-100"
								on:click={handleEdit}
							>
								Edit
							</a>
							<button
								class="flex w-full cursor-pointer px-4 py-2 text-left font-medium text-red-600 hover:bg-gray-100"
								on:click={confirmDelete}
							>
								Delete
							</button>
						</div>
					{/if}
				</div>

				<!-- Image -->
				{#if business.images?.length > 0 && business.images[0].objectName}
					<SecureImage
						src="{import.meta.env.VITE_IMAGE_URL}/{business.images[0].objectName}"
						alt={business.name}
						on:error={(e) => ((e.currentTarget as HTMLImageElement).src = '/image-placeholder.svg')}
						className="h-[25rem] w-full rounded-md object-cover"
					/>
				{:else}
					<div class="h-[25rem] w-full rounded-md bg-gray-200 object-cover"></div>
				{/if}

				<!-- Status Badge -->
				{#if !business.isActive}
					<span
						class="absolute top-5 left-5 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800"
					>
						<div class="h-2 w-2 rounded-full bg-amber-600"></div>
						In progress
					</span>
				{/if}
			</div>

			<!-- Card Details -->
			<div class="details">
				<div class="price-type">
					{#if business.createdAt !== null && !business.isActive}
						<p class="font-semibold">Your listing started on {formatDate(business.createdAt)}</p>
					{/if}
				</div>
				<p class="location">{business.city}, {business.state}, {business.country}</p>
			</div>
		</div>
	</div>
{/if}

<!-- Delete Confirmation Modal -->
{#if showConfirmDelete}
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
		transition:fade
		on:click={cancelDelete}
	>
		<div class="w-96 rounded-lg bg-white p-6 text-center shadow-xl" on:click|stopPropagation>
			<h3 class="mb-4 text-xl font-semibold">Remove this listing?</h3>
			<p class="mb-6 text-gray-600">This action cannot be undone.</p>

			<div class="flex justify-center gap-4">
				<button
					class="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300"
					on:click={cancelDelete}
					disabled={deleting}
				>
					Cancel
				</button>
				<button
					class="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-70"
					on:click={handleDelete}
					disabled={deleting}
				>
					{#if deleting}
						<svg class="mr-2 inline h-5 w-5 animate-spin" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
								fill="none"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
							/>
						</svg>
						Removing...
					{:else}
						Yes, remove
					{/if}
				</button>
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

	.menu-wrapper {
		position: absolute;
		top: 0.5rem;
		left: auto;
		right: 0.5rem;
		z-index: 20;
	}
</style>
