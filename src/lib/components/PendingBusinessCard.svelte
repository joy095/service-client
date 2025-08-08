<script lang="ts">
	import type { Business } from '$lib/types';
	import Icon from '@iconify/svelte';
	import formatDate from '$lib/dateFormat';
	import { goto } from '$app/navigation';
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import SecureImage from './SecureImage.svelte';
	import { browser } from '$app/environment';
	import { fade } from 'svelte/transition';

	export let business: Business;
	const dispatch = createEventDispatcher();

	let showMenu = false;
	let showConfirmDelete = false;
	let deleting = false;

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
</script>

<!-- Main Card -->

<div>
	<!-- Image Section -->
	<div class="relative">
		{#if business.images?.length > 0 && business.images[0].objectName}
			{#if business.isServiceBusiness}
				<a href="/dashboard/{business.publicId}" class="block">
					<SecureImage
						src="{import.meta.env.VITE_IMAGE_URL}/{business.images[0].objectName}"
						alt={business.name}
						on:error={(e) => ((e.currentTarget as HTMLImageElement).src = '/image-placeholder.svg')}
						className="h-[25rem] w-full rounded-lg object-cover"
					/>
				</a>
			{:else}
				<SecureImage
					src="{import.meta.env.VITE_IMAGE_URL}/{business.images[0].objectName}"
					alt={business.name}
					on:error={(e) => ((e.currentTarget as HTMLImageElement).src = '/image-placeholder.svg')}
					className="h-[25rem] w-full rounded-lg object-cover"
				/>
			{/if}
		{:else}
			<div class="h-[25rem] w-full rounded-lg bg-gray-200"></div>
		{/if}

		<!-- Status Badge -->
		{#if !business.isActive}
			<span
				class="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800"
			>
				<div class="h-2 w-2 rounded-full bg-amber-600"></div>
				In progress
			</span>
		{/if}
	</div>

	<!-- Card Details -->
	<div class="relative pt-3 pb-4">
		{#if business.isServiceBusiness}
			<a href="/dashboard/{business.publicId}" class="block w-fit max-w-[calc(100%-40px)]">
				{#if business.createdAt !== null && !business.isActive}
					<p class="font-semibold">Your listing started on {formatDate(business.createdAt)}</p>
				{/if}
				<p class="mt-1 text-sm text-gray-600">
					{business.city}, {business.state}, {business.country}
				</p>
			</a>
		{/if}

		<!-- Menu Button -->
		<div class="menu-wrapper absolute top-3 right-0 z-10" on:click|stopPropagation>
			<button
				class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-gray-300 focus:outline-none"
				on:click={() => (showMenu = !showMenu)}
				aria-label="More options"
			>
				<Icon class="h-5 w-5 text-black" icon="pepicons-pencil:dots-x" />
			</button>

			{#if showMenu}
				<div
					class="absolute right-0 mt-2 w-28 overflow-hidden rounded-md border border-gray-200 bg-white py-2 text-sm shadow-lg"
				>
					<a
						class="block cursor-pointer px-4 py-2 text-left font-medium hover:bg-gray-100"
						on:click={handleEdit}
					>
						Edit
					</a>
					<button
						class="block w-full cursor-pointer px-4 py-2 text-left font-medium text-red-600 hover:bg-gray-100"
						on:click={confirmDelete}
					>
						Delete
					</button>
				</div>
			{/if}
		</div>
	</div>
</div>

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
					class="rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-800 hover:bg-gray-300 disabled:opacity-70"
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

<!-- Remove the <style> block entirely -->
