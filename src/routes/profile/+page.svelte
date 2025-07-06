<script lang="ts">
	import { authStore } from '$lib/store/authStore';
	import type { AuthState } from '$lib/types';
	import { onDestroy } from 'svelte';

	let auth: AuthState = {
		isAuthenticated: false,
		user: null
	};

	const unsubscribe = authStore.subscribe((val) => {
		auth = val;
	});

	onDestroy(() => {
		unsubscribe(); // Cleanup on component destroy
	});

	// Fallback profile data if auth.user is not available (optional)
	const fallbackName = 'Alex Johnson';
	const fallbackAvatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400';

	const profile = {
		avatar: fallbackAvatar,
		location: 'San Francisco, CA',
		joined: 'March 2018',
		bio: 'Passionate about creating unique travel experiences. I love sharing my carefully curated homes...',
		reviews: 124,
		rating: 4.9,
		listings: [
			{
				id: 1,
				title: 'Cozy Downtown Loft',
				image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400',
				location: 'San Francisco, CA',
				price: 150
			},
			{
				id: 2,
				title: 'Beachfront Retreat',
				image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400',
				location: 'Santa Cruz, CA',
				price: 250
			}
		]
	};
</script>

{#if auth.isAuthenticated && auth.user}
	<!-- Authenticated View -->
	<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
		<!-- Profile Header -->
		<div
			class="flex flex-col items-center space-y-6 md:flex-row md:items-start md:space-y-0 md:space-x-8"
		>
			{#if auth.user}
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700"
				>
					{auth.user.firstName.charAt(0).toUpperCase()}
					{auth.user.lastName.charAt(0).toUpperCase()}
				</div>
			{/if}

			<!-- <img
				src={auth.user.avatar ?? profile.avatar}
				alt={`${auth.user.firstName}'s avatar`}
				class="h-32 w-32 rounded-full border-4 border-white object-cover shadow-md"
			/> -->
			<div class="text-center md:text-left">
				<h1 class="text-3xl font-bold text-gray-900">{auth.user.firstName} {auth.user.lastName}</h1>
				<p class="mt-2 text-gray-600">{profile.location}</p>
				<p class="text-sm text-gray-500">Joined {profile.joined}</p>
				<div class="mt-4 flex space-x-4">
					<div>
						<span class="font-semibold text-gray-900">{profile.reviews}</span>
						<span class="text-gray-600"> Reviews</span>
					</div>
					<div>
						<span class="font-semibold text-gray-900">{profile.rating} ★</span>
						<span class="text-gray-600"> Rating</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Bio Section -->
		<div class="mt-12">
			<h2 class="text-2xl font-semibold text-gray-900">About {auth.user.firstName}</h2>
			<p class="mt-4 leading-relaxed text-gray-700">{profile.bio}</p>
		</div>

		<!-- Listings Section -->
		<div class="mt-12">
			<h2 class="text-2xl font-semibold text-gray-900">{auth.user.firstName}'s Listings</h2>
			<div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each profile.listings as listing}
					<div
						class="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
					>
						<img src={listing.image} alt={listing.title} class="h-48 w-full object-cover" />
						<div class="p-4">
							<h3 class="text-lg font-semibold text-gray-900">{listing.title}</h3>
							<p class="text-sm text-gray-600">{listing.location}</p>
							<p class="mt-2 font-medium text-gray-900">${listing.price} / night</p>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Call to Action -->
		<div class="mt-12 text-center">
			<a
				href="/contact"
				class="inline-block rounded-full bg-pink-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-pink-700"
			>
				Contact {auth.user.firstName}
			</a>
		</div>
	</div>
{:else}
	<!-- Unauthenticated View -->
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
