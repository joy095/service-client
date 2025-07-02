<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
	import { isFormOpen } from '$lib/store'; // Assuming this import is correct for your project
	import { browser } from '$app/environment'; // To ensure cookie operations only run in the browser

	let email = '';
	let otp = '';
	let deviceName = 'Web Browser'; // Default device name, can be made user-editable
	let error = '';
	let step = 1; // 1 for email input, 2 for OTP input
	let isLoading = false;

	async function handleContinue(event: Event) {
		event.preventDefault();
		error = ''; // Clear previous errors
		isLoading = true;

		if (step === 1) {
			if (!email || !email.includes('@')) {
				error = 'Please enter a valid email.';
				isLoading = false;
				return;
			}

			try {
				const response = await fetch('http://localhost:8081/customer/request-login-otp', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ email })
				});

				if (response.ok) {
					step = 2; // Move to OTP step
				} else {
					const data = await response.json();
					error = data.message || 'Failed to request OTP. Please try again.';
				}
			} catch (err) {
				error = 'Network error or server is unreachable. Please try again later.';
			} finally {
				isLoading = false;
			}
		} else if (step === 2) {
			if (!otp) {
				error = 'Please enter the OTP.';
				isLoading = false;
				return;
			}

			try {
				const response = await fetch('http://localhost:8081/customer/verify-email', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ email, device: deviceName, otp })
				});

				if (response.ok) {
					const data = await response.json();
					if (data.accessToken && data.refreshToken) {
						if (browser) {
							// Set accessToken and refreshToken in cookies
							document.cookie = `accessToken=${data.accessToken}; path=/; max-age=${3600 * 24}; SameSite=Lax`; // Example: expires in 24 hours
							document.cookie = `refreshToken=${data.refreshToken}; path=/; max-age=${3600 * 24 * 30}; SameSite=Lax`; // Example: expires in 30 days
						}
						console.log('Login successful! Tokens set in cookies.');
						isFormOpen.set(false); // Close the form on successful login
					} else {
						error = 'Login successful, but tokens were not received.';
					}
				} else {
					const data = await response.json();
					error = data.message || 'Failed to verify OTP. Please try again.';
				}
			} catch (err) {
				error = 'Network error or server is unreachable. Please try again later.';
			} finally {
				isLoading = false;
			}
		}
	}

	function goBack() {
		step = 1;
		otp = ''; // Clear OTP when going back
		error = ''; // Clear error when going back
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
							required
						/>
					</div>
				{:else if step === 2}
					<div class="mb-6">
						<label for="otp" class="mb-1 block text-sm font-medium text-gray-700">OTP</label>
						<input
							type="text"
							id="otp"
							bind:value={otp}
							class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
							placeholder="Enter the OTP"
							required
						/>
					</div>
					<div class="mb-6">
						<label for="deviceName" class="mb-1 block text-sm font-medium text-gray-700"
							>Device Name (Optional)</label
						>
						<input
							type="text"
							id="deviceName"
							bind:value={deviceName}
							class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
							placeholder="e.g., My Laptop"
						/>
					</div>
				{/if}

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
						{step === 1 ? 'Request OTP' : 'Verify & Login'}
					{/if}
				</button>

				{#if step === 2}
					<button
						type="button"
						on:click={goBack}
						class="mt-3 w-full text-sm text-gray-500 hover:underline"
						disabled={isLoading}
					>
						← Back
					</button>
				{/if}
			</form>
		</div>
	</div>
{/if}
