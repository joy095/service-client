<script lang="ts">
	import PendingBusinessCard from '$lib/components/PendingBusinessCard.svelte';
	import { userPendingBusiness } from '$lib/store';
	import type { User, Business } from '$lib/types';
	import { initializeFromServer } from '$lib/stores/authStore';
	import { tryRefreshToken } from '$lib/utils/refreshToken';
	import { onMount } from 'svelte';

	export let data: {
		user: User | null;
		businesses: Business[];
	};

	let businesses: Business[] = data.businesses;
	userPendingBusiness.set(businesses);

	onMount(async () => {
		if (data.user) {
			initializeFromServer(data.user);
		} else {
			try {
				await tryRefreshToken();
			} catch (err) {
				console.error('Token refresh failed', err);
			}
		}
	});

	function handleBusinessDeletion(event: CustomEvent<{ publicId: string }>) {
		const deletedPublicId = event.detail.publicId;
		businesses = businesses.filter((b) => b.publicId !== deletedPublicId);
		userPendingBusiness.set(businesses);
	}
</script>

<div class="mx-auto mt-10 max-w-[95vw]">
	<h1 class="text-2xl font-bold">Your listing</h1>
	<div class="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
		{#each businesses as business (business.publicId)}
			<PendingBusinessCard {business} on:businessDeleted={handleBusinessDeletion} />
		{:else}
			<p>No pending businesses to display.</p>
		{/each}
	</div>
</div>

<style>
</style>
