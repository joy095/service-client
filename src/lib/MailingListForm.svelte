<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import type { SubscriptionRequestBody, SubscriptionResponse, ErrorResponse } from './types';

	let email: string = '';
	let isValidEmail: boolean = true;
	let message: string = '';
	let isSubmitting: boolean = false;
	let submittedSuccessfully: boolean = false;

	// Basic email validation regex
	const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	function validateEmail(): void {
		isValidEmail = emailRegex.test(email);
		if (!isValidEmail) {
			message = 'Please enter a valid email address.';
		} else {
			message = ''; // Clear message if valid
		}
	}

	async function handleSubmit(): Promise<void> {
		validateEmail();

		if (!isValidEmail) {
			return; // Stop if email is not valid
		}

		isSubmitting = true;
		message = ''; // Clear previous messages
		submittedSuccessfully = false; // Reset success state

		try {
			const requestBody: SubscriptionRequestBody = { email };

			// The endpoint path will be /api/subscribe
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
				message = data.message || 'Thank you for subscribing!';
				email = ''; // Clear the email input
			} else {
				const errorData: ErrorResponse = await response.json();
				submittedSuccessfully = false;
				message = errorData.message || 'Something went wrong. Please try again.';
			}
		} catch (error) {
			console.error('Submission error:', error);
			submittedSuccessfully = false;
			message = 'Network error. Please try again later.';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="mailing-list-container">
	<h2>Join Our Mailing List!</h2>
	<p>Stay up-to-date with our latest news and offers.</p>

	{#if submittedSuccessfully}
		<div class="success-message" in:fly={{ y: -20, duration: 300, easing: quintOut }}>
			{message}
		</div>
	{:else}
		<form on:submit|preventDefault={handleSubmit}>
			<div class="form-group">
				<label for="email">Email Address:</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					on:blur={validateEmail}
					class:invalid={!isValidEmail && email.length > 0}
					placeholder="your.email@example.com"
					required
				/>
				{#if !isValidEmail && email.length > 0}
					<p class="error-text" in:fly={{ y: -10, duration: 200 }}>
						{message}
					</p>
				{/if}
			</div>

			<button type="submit" disabled={isSubmitting}>
				{#if isSubmitting}
					Subscribing...
				{:else}
					Subscribe
				{/if}
			</button>
		</form>
		{#if message && !isValidEmail}{:else if message}
			<p class="info-message">{message}</p>
		{/if}
	{/if}
</div>

<style>
	/* Add your CSS styles here, as provided in the previous response */
	.mailing-list-container {
		max-width: 500px;
		margin: 50px auto;
		padding: 30px;
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
		text-align: center;
		font-family: 'Arial', sans-serif;
		color: #333;
	}

	h2 {
		color: #007bff;
		margin-bottom: 15px;
		font-size: 2em;
	}

	p {
		margin-bottom: 25px;
		line-height: 1.6;
	}

	.form-group {
		margin-bottom: 20px;
		text-align: left;
	}

	label {
		display: block;
		margin-bottom: 8px;
		font-weight: bold;
		color: #555;
	}

	input[type='email'] {
		width: calc(100% - 20px);
		padding: 12px 10px;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 1em;
		transition:
			border-color 0.2s ease-in-out,
			box-shadow 0.2s ease-in-out;
	}

	input[type='email']:focus {
		border-color: #007bff;
		box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
		outline: none;
	}

	input[type='email'].invalid {
		border-color: #dc3545;
	}

	button {
		background-color: #007bff;
		color: white;
		padding: 12px 25px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		font-size: 1.1em;
		font-weight: bold;
		transition:
			background-color 0.3s ease,
			transform 0.1s ease;
	}

	button:hover {
		background-color: #0056b3;
		transform: translateY(-2px);
	}

	button:disabled {
		background-color: #cccccc;
		cursor: not-allowed;
		transform: none;
	}

	.error-text {
		color: #dc3545;
		font-size: 0.85em;
		margin-top: 5px;
	}

	.success-message {
		background-color: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
		padding: 15px;
		border-radius: 5px;
		margin-top: 20px;
	}

	.info-message {
		margin-top: 20px;
		color: #007bff;
		font-style: italic;
	}
</style>
