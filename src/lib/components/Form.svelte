<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
	import { isFormOpen } from '$lib/store';

	let email = '';
	let password = '';
	let error = '';
	let step = 1;

	function handleContinue(event: Event) {
		event.preventDefault();

		if (step === 1) {
			if (!email || !email.includes('@')) {
				error = 'Please enter a valid email.';
			} else {
				error = '';
				step = 2;
			}
		} else if (step === 2) {
			if (!password) {
				error = 'Please enter your password.';
			} else {
				error = '';
				// Submit the login data here
				console.log('Login with', email, password);
				isFormOpen.set(false);
			}
		}
	}
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

			<form on:submit={handleContinue}>
				{#if step === 1}
					<div class="mb-6">
						<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
						<input
							type="email"
							id="email"
							bind:value={email}
							class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
							placeholder="Enter your email"
						/>
					</div>
				{:else if step === 2}
					<div class="mb-6">
						<label for="password" class="mb-1 block text-sm font-medium text-gray-700"
							>Password</label
						>
						<input
							type="password"
							id="password"
							bind:value={password}
							class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
							placeholder="Enter your password"
						/>
					</div>
				{/if}

				{#if error}
					<p class="mb-4 text-sm text-red-500">{error}</p>
				{/if}

				<button
					type="submit"
					class="w-full rounded-lg bg-pink-600 py-2 text-white transition duration-200 hover:bg-pink-700"
				>
					{step === 1 ? 'Next' : 'Login'}
				</button>

				{#if step === 2}
					<button
						type="button"
						on:click={() => (step = 1)}
						class="mt-3 w-full text-sm text-gray-500 hover:underline"
					>
						← Back
					</button>
				{/if}
			</form>
		</div>
	</div>
{/if}
