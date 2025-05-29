<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import type { SubscriptionRequestBody, SubscriptionResponse, ErrorResponse } from './types';

	let name: string = '';
	let email: string = '';
	let phone: string = '';
	let addressCity: string = '';
	let addressState: string = '';
	let message: string = '';
	let formFeedback: string = ''; // Renamed from 'message' to avoid conflict
	let isValidEmail: boolean = true;
	let isSubmitting: boolean = false;
	let submittedSuccessfully: boolean = false;

	// Regex for basic email validation
	const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function validateEmail(): void {
		isValidEmail = emailRegex.test(email);
		if (!isValidEmail) {
			formFeedback = 'Please enter a valid email address.';
		} else {
			formFeedback = ''; // Clear feedback if valid
		}
	}

	async function handleSubmit(): Promise<void> {
		validateEmail();

		if (!isValidEmail) {
			return; // Stop if email is not valid
		}

		isSubmitting = true;
		formFeedback = ''; // Clear previous messages
		submittedSuccessfully = false; // Reset success state

		try {
			const requestBody: SubscriptionRequestBody = {
				name,
				email,
				phone: phone || undefined,
				addressCity,
				addressState,
				message: message || undefined // 'message' here refers to the user's input from the textarea
			};

			const response = await fetch('/api/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestBody)
			});

			if (response.ok) {
				const data: SubscriptionResponse = await response.json();
				submittedSuccessfully = true;
				formFeedback = data.message || 'Thank you for subscribing!';
				// Clear all inputs on success
				name = '';
				email = '';
				phone = '';
				addressCity = '';
				addressState = '';
				message = ''; // Clear the message input as well
			} else {
				const errorData: ErrorResponse = await response.json();
				submittedSuccessfully = false;
				formFeedback = errorData.message || 'Something went wrong. Please try again.';
			}
		} catch (error) {
			console.error('Submission error:', error);
			submittedSuccessfully = false;
			formFeedback = 'Network error. Please try again later.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div
	class="mx-auto my-16 max-w-xl rounded-xl bg-white p-10 text-center font-sans text-gray-800 shadow-lg transition-shadow duration-300 hover:shadow-xl"
>
	<div class="mb-8">
		<h2 class="mb-3 text-4xl font-bold tracking-tight text-blue-600">Join Our Newsletter</h2>
		<p class="leading-relaxed text-gray-600">
			Stay updated with our latest news and exclusive offers. We respect your privacy.
		</p>
	</div>

	{#if submittedSuccessfully}
		<div
			class="rounded-lg border border-green-300 bg-green-50 p-4 text-green-800"
			transition:fly={{ y: -20, duration: 300, easing: quintOut }}
		>
			{formFeedback}
		</div>
	{:else}
		<form on:submit|preventDefault={handleSubmit} class="space-y-6">
			<div class="text-left">
				<label for="name" class="mb-2 block text-lg font-semibold text-gray-700">Name</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					placeholder="Your Full Name"
					required
					class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-lg text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
				/>
			</div>

			<div class="text-left">
				<label for="email" class="mb-2 block text-lg font-semibold text-gray-700"
					>Email Address</label
				>
				<input
					type="email"
					id="email"
					bind:value={email}
					on:blur={validateEmail}
					class:border-red-500={!isValidEmail && email.length > 0}
					class:bg-red-50={!isValidEmail && email.length > 0}
					placeholder="email@example.com"
					required
					class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-lg text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
				/>
				{#if !isValidEmail && email.length > 0}
					<p class="mt-1 text-sm text-red-600" transition:fly={{ y: -10, duration: 200 }}>
						{formFeedback}
					</p>
				{/if}
			</div>

			<div class="text-left">
				<label for="phone" class="mb-2 block text-lg font-semibold text-gray-700"
					>Phone Number (Optional)</label
				>
				<input
					type="tel"
					id="phone"
					bind:value={phone}
					placeholder="+91-11-23456789"
					class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-lg text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
				/>
			</div>

			<div class="text-left">
				<label class="mb-2 block text-lg font-semibold text-gray-700">Address</label>
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
					<input
						type="text"
						id="addressState"
						bind:value={addressState}
						placeholder="State/Province"
						required
						class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-lg text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
					/>
					<input
						type="text"
						id="addressCity"
						bind:value={addressCity}
						placeholder="City"
						required
						class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-lg text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
					/>
				</div>
			</div>

			<div class="text-left">
				<label for="message" class="mb-2 block text-lg font-semibold text-gray-700"
					>Message (Optional)</label
				>
				<textarea
					id="message"
					bind:value={message}
					placeholder="Share any thoughts or questions..."
					rows="4"
					class="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-lg text-gray-900 placeholder-gray-500 transition-all duration-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200"
				></textarea>
			</div>

			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full rounded-lg bg-blue-600 px-6 py-3 text-xl font-bold text-white shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none"
			>
				{#if isSubmitting}
					Submitting...
				{:else}
					Subscribe
				{/if}
			</button>
		</form>
		{#if formFeedback && !isValidEmail}{:else if formFeedback}
			<p class="mt-6 text-base text-blue-600 italic">{formFeedback}</p>
		{/if}
	{/if}
</div>

<style>
	/* No custom CSS needed here as Tailwind handles everything! */
	/* If you have specific custom fonts, you might still load them here or in a global CSS file. */
</style>
