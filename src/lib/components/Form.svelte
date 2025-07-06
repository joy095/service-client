<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
	import { isFormOpen } from '$lib/store';
	import { login as authLogin } from '$lib/store/authStore';
	import { invalidateAll } from '$app/navigation';

	let email = '';
	let password = '';
	let error = '';
	let isLoading = false;

	const tryRefreshToken = async (): Promise<boolean> => {
		const res = await fetch(import.meta.env.VITE_API_URL + '/refresh-token', {
			method: 'POST',
			credentials: 'include'
		});

		if (!res.ok) {
			console.warn('Refresh token failed');
			return false;
		}

		console.info('Token refreshed successfully');
		return true;
	};

	const handleLoginSubmit = async () => {
		isLoading = true;
		error = '';

		const res = await fetch(import.meta.env.VITE_API_URL + '/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email, password }),
			credentials: 'include'
		});

		const raw = await res.text();

		if (!res.ok) {
			error = 'Login failed';
			isLoading = false;
			return;
		}

		let data;
		try {
			data = JSON.parse(raw);
		} catch {
			error = 'Invalid response format';
			isLoading = false;
			return;
		}

		// ✅ At this point, backend has already set the access & refresh tokens in HttpOnly cookies.
		authLogin(data.user);
		isFormOpen.set(false);
		await invalidateAll();
		isLoading = false;
	};
</script>

{#if $isFormOpen}
	<div
		class="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
		transition:fade={{ duration: 200 }}
		on:click={() => isFormOpen.set(false)}
	>
		<div class="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8" on:click|stopPropagation>
			<button
				transition:fade={{ duration: 200 }}
				on:click={() => isFormOpen.set(false)}
				class="absolute top-4 right-4 cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-200/30"
			>
				<Icon icon="charm:cross" class="h-6 w-6" />
			</button>

			<div class="mb-6 text-center">
				<h2 class="text-2xl font-bold text-gray-800">Welcome</h2>
			</div>

			<form method="POST" on:submit|preventDefault={handleLoginSubmit}>
				<div class="mb-2">
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
					<input
						type="email"
						id="email"
						name="email"
						bind:value={email}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						placeholder="Enter your email"
						required
					/>
				</div>

				<div class="mb-6">
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700">Password</label
					>
					<input
						type="password"
						id="password"
						name="password"
						bind:value={password}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						placeholder="Enter your password"
						required
					/>
				</div>

				{#if error}
					<p class="mb-4 text-sm text-red-500">{error}</p>
				{/if}

				<button
					type="submit"
					class="w-full rounded-lg bg-pink-600 py-2 text-white transition duration-200 hover:bg-pink-700 {isLoading
						? 'cursor-not-allowed opacity-50'
						: ''}"
					disabled={isLoading}
				>
					{#if isLoading}
						<Icon icon="mdi:loading" class="mr-2 inline-block h-5 w-5 animate-spin" />
						Loading...
					{:else}
						Sign In
					{/if}
				</button>
			</form>
		</div>
	</div>
{/if}
