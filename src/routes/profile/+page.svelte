<script lang="ts">
	import { initializeFromServer } from '$lib/stores/authStore';
	import type { User } from '$lib/types';
	import { tryRefreshToken } from '$lib/utils/refreshToken';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	export let data: { user: User | null };

	let user = data.user;
	$: user = data.user;

	let isEditing = false;
	let firstName = '';
	let lastName = '';
	let phone = '';

	$: {
		if (user) {
			firstName = user.firstName || '';
			lastName = user.lastName || '';
			phone = user.phone || '';
		}
	}

	const phoneRegex = /^\+?[1-9]\d{9,14}$/; // simple validation

	onMount(() => {
		if (data.user) {
			initializeFromServer(data.user);
		} else {
			tryRefreshToken();
		}
	});

	function toggleEdit() {
		isEditing = !isEditing;
	}

	async function saveProfile() {
		if (!firstName.trim() || !lastName.trim() || !phoneRegex.test(phone)) {
			alert('Please fill in all fields correctly.');
			return;
		}

		try {
			const res = await fetch('/api/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ firstName, lastName, phone })
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
				throw new Error(errorData.message || `HTTP ${res.status}`);
			}

			const updated = await res.json();
			user = updated.user;
			isEditing = false;
		} catch (error) {
			console.error('Profile update failed:', error);
			alert(`Failed to update profile: ${error.message}`);
		}
	}
</script>

{#if user}
	<div class="mx-auto max-w-3xl px-6 py-12">
		<div class="flex flex-col items-start space-y-6">
			<div
				class="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-xl font-bold text-white shadow-lg"
			>
				{user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
			</div>
			<div>
				<h1 class="text-3xl font-bold text-gray-900">
					{user.firstName}
					{user.lastName}
				</h1>
				<p class="mt-1 text-gray-500">{user.phone || 'No phone number added'}</p>
			</div>

			<button
				on:click={toggleEdit}
				class="rounded-full bg-pink-600 px-6 py-2 font-medium text-white shadow-md transition hover:bg-pink-700"
			>
				{isEditing ? 'Cancel' : 'Edit Profile'}
			</button>

			<a
				class="rounded-full bg-pink-600 px-6 py-2 font-medium text-white shadow-md transition hover:bg-pink-700"
				href="/orders">View orders</a
			>
		</div>

		{#if isEditing}
			<form
				on:submit|preventDefault={saveProfile}
				in:fly={{ y: 20, duration: 250 }}
				class="mt-10 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-lg"
			>
				<h2 class="text-xl font-semibold text-gray-800">Update your profile</h2>

				<div>
					<label class="block text-sm font-medium text-gray-700">First Name</label>
					<input
						bind:value={firstName}
						class="mt-1 w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-pink-500 focus:ring-pink-500"
						type="text"
						placeholder="Enter first name"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Last Name</label>
					<input
						bind:value={lastName}
						class="mt-1 w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-pink-500 focus:ring-pink-500"
						type="text"
						placeholder="Enter last name"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Phone Number</label>
					<input
						bind:value={phone}
						class="mt-1 w-full rounded-md border-gray-300 p-3 shadow-sm focus:border-pink-500 focus:ring-pink-500"
						type="text"
						placeholder="+91 9876543210"
					/>
					{#if phone && !phoneRegex.test(phone)}
						<p class="mt-1 text-sm text-red-500">Invalid phone number format</p>
					{/if}
				</div>

				<div class="flex justify-end">
					<button
						type="submit"
						class="rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-2 font-medium text-white shadow-md transition hover:opacity-90"
					>
						Save Changes
					</button>
				</div>
			</form>
		{/if}

		<div class="mt-16 text-gray-600">
			<h2 class="text-xl font-semibold text-gray-900">About {user.firstName}</h2>
			<p class="mt-2 leading-relaxed text-gray-500">
				This is your profile section where you can manage your personal details and keep your
				information up to date.
			</p>
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
