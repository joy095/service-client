<script lang="ts">
	import PendingBusinessCard from '$lib/components/PendingBusinessCard.svelte';
	import { initializeFromServer } from '$lib/store/authStore';
	import type { User, Business } from '$lib/types';
	import { tryRefreshToken } from '$lib/utils/refreshToken';
	import { onMount } from 'svelte';

	export let data: {
		user: User | null;
		businesses: Business[];
	};

	const user = data.user;

	onMount(() => {
		if (data.user) {
			initializeFromServer(data.user);
		} else {
			tryRefreshToken();
		}
	});
</script>

{#if user}
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<div
			class="flex flex-col items-center space-y-6 md:flex-row md:items-start md:space-y-0 md:space-x-8"
		>
			<div
				class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700"
			>
				{user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
			</div>
			<div>
				<h1 class="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
			</div>
		</div>

		<div class="mt-12">
			<h2 class="text-2xl font-semibold text-gray-900">About {user.firstName}</h2>
			<p class="mt-4 text-gray-700">
				This is where you could add more detailed bio information, which would come from your `User`
				type and the API response.
			</p>
		</div>

		<!-- Businesses -->
		<div class="property-grid">
			{#each data.businesses as business (business.id)}
				<PendingBusinessCard {business} />
			{/each}
		</div>
	</div>
{:else}
	<div class="py-20 text-center">
		<h1 class="text-2xl font-semibold text-gray-700">Please log in to view your profile</h1>
		<a
			href="/login"
			class="mt-4 inline-block rounded-full bg-pink-600 px-6 py-2 text-white hover:bg-pink-700"
		>
			Go to Login
		</a>
	</div>
{/if}

<style>
	.property-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}
</style>
