<script lang="ts">
	import PendingBusinessCard from '$lib/components/PendingBusinessCard.svelte';
	import { userPendingBusiness } from '$lib/store';
	import { initializeFromServer } from '$lib/stores/authStore';
	import type { User, Business } from '$lib/types';
	import { tryRefreshToken } from '$lib/utils/refreshToken';
	import { onMount } from 'svelte';

	export let data: {
		user: User | null;
		businesses: Business[];
	};

	// Make 'businesses' a reactive variable so Svelte can update the UI when it changes.
	// It's initialized with the data from the server load function.
	let businesses: Business[] = data.businesses;
	userPendingBusiness.set(businesses);

	const user = data.user;

	onMount(() => {
		if (data.user) {
			initializeFromServer(data.user);
		} else {
			tryRefreshToken();
		}
	});

	/**
	 * Function to update the list of businesses after a deletion.
	 * This is called when the 'businessDeleted' event is received from PendingBusinessCard.
	 */
	function handleBusinessDeletion(event: CustomEvent<{ publicId: string }>) {
		const deletedPublicId = event.detail.publicId;

		// Filter out the deleted business directly from the local 'businesses' array
		businesses = businesses.filter((b) => b.publicId !== deletedPublicId);

		// Update the global store as well to keep it in sync
		userPendingBusiness.set(businesses);

		// No need to refetch all businesses if the deletion was successful on the backend
		// and you're just updating the local UI.
	}
</script>

<div class="container mx-auto">
	<div class="property-grid">
		{#each businesses as business (business.publicId)}
			<PendingBusinessCard {business} on:businessDeleted={handleBusinessDeletion} />
		{:else}
			<p>No pending businesses to display.</p>
		{/each}
	</div>
</div>

<style>
	.property-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}
</style>
