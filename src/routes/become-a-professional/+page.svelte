<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';
	import MapPicker from '$lib/components/MapPicker.svelte';

	export let form: ActionData;

	interface ReceivedLocationDetails {
		latitude: number;
		longitude: number;
		address?: string;
		road?: string;
		house_number?: string;
		city?: string;
		state?: string;
		country?: string;
		postalCode?: string;
	}

	// Form data
	let formData = {
		name: '',
		category: '',
		latitude: '',
		longitude: '',
		address: '',
		city: '',
		state: '',
		country: '',
		postalCode: '',
		road: '',
		house_number: ''
	};

	let errors = {
		name: '',
		category: '',
		location: '',
		city: '',
		state: '',
		country: '',
		postalCode: '',
		address: ''
	};

	let currentStep = 1;
	let mapError: string | null = null;
	let isSubmitting = false;

	const categories = [
		'Barbershops',
		'Hair Salons',
		'Spa Salons',
		'Nail Salons',
		'Salons',
		'Make up artist'
	];

	const validateStep = (step: number) => {
		let isValid = true;
		errors = {
			name: '',
			category: '',
			location: '',
			city: '',
			state: '',
			country: '',
			postalCode: '',
			address: ''
		};

		if (step === 1) {
			if (!formData.name?.trim()) {
				errors.name = 'Business name is required.';
				isValid = false;
			}
			if (!formData.category) {
				errors.category = 'Please select a category.';
				isValid = false;
			}
		} else if (step === 2) {
			if (!formData.latitude || !formData.longitude) {
				errors.location = 'Please select a location on the map to set coordinates.';
				isValid = false;
			}
			if (!formData.address?.trim()) {
				errors.address = 'Detailed address information is required.';
				isValid = false;
			}
		} else if (step === 3) {
			if (!formData.name?.trim()) {
				errors.name = 'Business name is required.';
				isValid = false;
			}
			if (!formData.category) {
				errors.category = 'Please select a category.';
				isValid = false;
			}
			if (!formData.latitude || !formData.longitude) {
				errors.location = 'Location coordinates are required.';
				isValid = false;
			}
			if (!formData.address?.trim()) {
				errors.address = 'Address is required.';
				isValid = false;
			}
			if (!formData.city?.trim()) {
				errors.city = 'City is required.';
				isValid = false;
			}
			if (!formData.state?.trim()) {
				errors.state = 'State is required.';
				isValid = false;
			}
			if (!formData.country?.trim()) {
				errors.country = 'Country is required.';
				isValid = false;
			}
			if (!formData.postalCode?.trim()) {
				errors.postalCode = 'Postal code is required.';
				isValid = false;
			}
		}
		return isValid;
	};

	const nextStep = () => {
		if (validateStep(currentStep)) {
			currentStep++;
			mapError = null;
		}
	};

	const prevStep = () => {
		currentStep--;
		errors = {
			name: '',
			category: '',
			location: '',
			city: '',
			state: '',
			country: '',
			postalCode: '',
			address: ''
		};
		mapError = null;
	};

	function handleLocationSelected(event: CustomEvent<ReceivedLocationDetails>) {
		const { latitude, longitude, address, road, house_number, city, state, country, postalCode } =
			event.detail;
		formData.latitude = latitude.toString();
		formData.longitude = longitude.toString();
		formData.address = address || 'Not provided';
		formData.road = road || '';
		formData.house_number = house_number || '';
		formData.city = city || 'Not provided';
		formData.state = state || 'Not provided';
		formData.country = country || 'Not provided';
		formData.postalCode = postalCode || 'Not provided';
		errors.location = '';
		errors.city = '';
		errors.state = '';
		errors.country = '';
		errors.postalCode = '';
		mapError = null;
	}

	function handleLocationError(event: CustomEvent<string>) {
		mapError = event.detail;
		errors.location = event.detail;
	}

	function handleSubmit() {
		goto('/upload-images'); // Redirect to image upload page
	}
</script>

<div class="min-h-screen bg-gray-50 px-4 py-12">
	<div class="mx-auto max-w-3xl">
		<div class="mb-10 text-center">
			<h1 class="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">Create your business</h1>
			<p class="text-base text-gray-600">Set up your business profile in a few simple steps</p>
		</div>

		<div class="mb-10 flex items-center justify-center">
			<div class="flex items-center space-x-6">
				{#each [1, 2, 3] as step}
					<div class="flex flex-col items-center">
						<div
							class="flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold text-white transition-all duration-300 {currentStep >=
							step
								? 'bg-coral-500 shadow-md'
								: 'bg-gray-300'} {currentStep === step ? 'scale-110' : ''}"
						>
							{step}
						</div>
						<span
							class="mt-2 text-xs font-medium {currentStep >= step
								? 'text-gray-900'
								: 'text-gray-500'}"
						>
							{step === 1 ? 'Basic Info' : step === 2 ? 'Location' : 'Review'}
						</span>
					</div>
					{#if step < 3}
						<div
							class="h-1 w-12 rounded-full {currentStep > step ? 'bg-coral-500' : 'bg-gray-200'}"
						></div>
					{/if}
				{/each}
			</div>
		</div>

		<div class="rounded-2xl bg-white p-8 shadow-lg">
			<form
				method="POST"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ formData, update }) => {
						isSubmitting = false;
						if (form?.success) {
							handleSubmit();
						}
						await update();
					};
				}}
				class="space-y-6"
			>
				{#if currentStep === 1}
					<div
						in:fly={{ x: 200, duration: 400, easing: quintOut }}
						out:fly={{ x: -200, duration: 300 }}
					>
						<h2 class="mb-6 text-xl font-semibold text-gray-900">Basic Information</h2>

						<div class="space-y-6">
							<div>
								<label class="mb-2 block text-sm font-medium text-gray-700" for="business-name"
									>Business Name</label
								>
								<input
									id="business-name"
									type="text"
									bind:value={formData.name}
									name="name"
									placeholder="Enter your business name"
									class="focus:border-coral-500 focus:ring-coral-200 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2"
									class:border-red-500={!!errors.name}
									required
								/>
								{#if errors.name}
									<p class="mt-1 text-xs text-red-500">{errors.name}</p>
								{/if}
							</div>

							<div>
								<label class="mb-2 block text-sm font-medium text-gray-700" for="category-select"
									>Category</label
								>
								<select
									id="category-select"
									bind:value={formData.category}
									name="category"
									class="focus:border-coral-500 focus:ring-coral-200 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2"
									class:border-red-500={!!errors.category}
									required
								>
									<option value="">Select a category</option>
									{#each categories as category}
										<option value={category}>{category}</option>
									{/each}
								</select>
								{#if errors.category}
									<p class="mt-1 text-xs text-red-500">{errors.category}</p>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				{#if currentStep === 2}
					<div
						in:fly={{ x: 200, duration: 400, easing: quintOut }}
						out:fly={{ x: -200, duration: 300 }}
					>
						<h2 class="mb-6 text-xl font-semibold text-gray-900">Set Your Location</h2>

						<MapPicker
							initialLat={parseFloat(formData.latitude) || undefined}
							initialLng={parseFloat(formData.longitude) || undefined}
							error={errors.location || mapError}
							on:locationSelected={handleLocationSelected}
							on:locationError={handleLocationError}
						/>

						{#if errors.location}
							<p class="mt-2 text-center text-xs text-red-500">{errors.location}</p>
						{/if}
					</div>
				{/if}

				{#if currentStep === 3}
					<!-- Hidden inputs to preserve step 1 & 2 values -->
					<input type="hidden" name="name" value={formData.name} />
					<input type="hidden" name="category" value={formData.category} />
					<input type="hidden" name="latitude" value={formData.latitude} />
					<input type="hidden" name="longitude" value={formData.longitude} />
					<input type="hidden" name="address" value={formData.address} />
					<input type="hidden" name="road" value={formData.road} />
					<input type="hidden" name="house_number" value={formData.house_number} />
					<input type="hidden" name="city" value={formData.city} />
					<input type="hidden" name="state" value={formData.state} />
					<input type="hidden" name="country" value={formData.country} />
					<input type="hidden" name="postalCode" value={formData.postalCode} />
				{/if}

				{#if currentStep === 3}
					<div
						in:fly={{ x: 200, duration: 400, easing: quintOut }}
						out:fly={{ x: -200, duration: 300 }}
					>
						<h2 class="mb-6 text-xl font-semibold text-gray-900">Review Your Information</h2>

						{#if errors.city || errors.state || errors.country || errors.postalCode}
							<div class="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-700">
								<p class="font-medium">Please complete the following required fields:</p>
								<ul class="mt-2 list-disc pl-5 text-sm">
									{#if errors.city}
										<li>{errors.city}</li>
									{/if}
									{#if errors.state}
										<li>{errors.state}</li>
									{/if}
									{#if errors.country}
										<li>{errors.country}</li>
									{/if}
									{#if errors.postalCode}
										<li>{errors.postalCode}</li>
									{/if}
								</ul>
							</div>
						{/if}

						<div class="space-y-6">
							<div class="rounded-lg bg-gray-50 p-6">
								<h3 class="mb-4 text-base font-semibold text-gray-900">Basic Information</h3>
								<div class="grid grid-cols-1 gap-4 text-sm">
									<div>
										<span class="font-medium">Business Name:</span>
										{formData.name || 'N/A'}
									</div>
									<div><span class="font-medium">Category:</span> {formData.category || 'N/A'}</div>
								</div>
							</div>

							<div class="rounded-lg bg-gray-50 p-6">
								<h3 class="mb-4 text-base font-semibold text-gray-900">Location Details</h3>
								<div class="space-y-4">
									<div>
										<span class="font-medium">Location Set:</span>
										{formData.latitude && formData.longitude ? 'Yes' : 'No'}
									</div>
									<div>
										<label class="mb-2 block text-sm font-medium text-gray-700" for="address"
											>Full Address</label
										>
										<input
											id="address"
											type="text"
											bind:value={formData.address}
											name="address"
											placeholder="Enter full address"
											class="focus:border-coral-500 focus:ring-coral-200 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2"
											class:border-red-500={!!errors.address}
										/>
										{#if errors.address}
											<p class="mt-1 text-xs text-red-500">{errors.address}</p>
										{/if}
									</div>
									<div>
										<label class="mb-2 block text-sm font-medium text-gray-700" for="road"
											>Road</label
										>
										<input
											id="road"
											type="text"
											bind:value={formData.road}
											name="road"
											placeholder="Enter road name"
											class="focus:border-coral-500 focus:ring-coral-200 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2"
										/>
									</div>
									<div>
										<label class="mb-2 block text-sm font-medium text-gray-700" for="city"
											>City</label
										>
										<input
											id="city"
											type="text"
											bind:value={formData.city}
											name="city"
											placeholder="Enter city"
											class="focus:border-coral-500 focus:ring-coral-200 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2"
											class:border-red-500={!!errors.city}
										/>
										{#if errors.city}
											<p class="mt-1 text-xs text-red-500">{errors.city}</p>
										{/if}
									</div>
									<div>
										<label class="mb-2 block text-sm font-medium text-gray-700" for="state"
											>State</label
										>
										<input
											id="state"
											type="text"
											bind:value={formData.state}
											name="state"
											placeholder="Enter state"
											class="focus:border-coral-500 focus:ring-coral-200 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2"
											class:border-red-500={!!errors.state}
										/>
										{#if errors.state}
											<p class="mt-1 text-xs text-red-500">{errors.state}</p>
										{/if}
									</div>
									<div>
										<label class="mb-2 block text-sm font-medium text-gray-700" for="country"
											>Country</label
										>
										<input
											id="country"
											type="text"
											bind:value={formData.country}
											name="country"
											placeholder="Enter country"
											class="focus:border-coral-500 focus:ring-coral-200 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2"
											class:border-red-500={!!errors.country}
										/>
										{#if errors.country}
											<p class="mt-1 text-xs text-red-500">{errors.country}</p>
										{/if}
									</div>
									<div>
										<label class="mb-2 block text-sm font-medium text-gray-700" for="postalCode"
											>Postal Code</label
										>
										<input
											id="postalCode"
											type="text"
											bind:value={formData.postalCode}
											name="postalCode"
											placeholder="Enter postal code"
											class="focus:border-coral-500 focus:ring-coral-200 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all duration-300 focus:ring-2"
											class:border-red-500={!!errors.postalCode}
										/>
										{#if errors.postalCode}
											<p class="mt-1 text-xs text-red-500">{errors.postalCode}</p>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<div class="flex justify-between pt-6">
					<button
						type="button"
						on:click={prevStep}
						class="cursor-pointer rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-100 {currentStep ===
						1
							? 'invisible'
							: ''}"
					>
						Previous
					</button>

					{#if currentStep < 3}
						<button
							type="button"
							on:click={nextStep}
							class="bg-coral-500 hover:bg-coral-600 focus:ring-coral-200 cursor-pointer rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 focus:ring-2"
						>
							Next
						</button>
					{:else}
						<button
							type="submit"
							disabled={isSubmitting ||
								!!errors.name ||
								!!errors.category ||
								!!errors.location ||
								!!errors.city ||
								!!errors.state ||
								!!errors.country ||
								!!errors.postalCode ||
								!!errors.address}
							class="bg-coral-500 hover:bg-coral-600 focus:ring-coral-200 flex cursor-pointer items-center justify-center rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all duration-300 focus:ring-2 disabled:opacity-50"
						>
							{#if isSubmitting}
								<svg
									class="mr-2 h-5 w-5 animate-spin text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										class="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										stroke-width="4"
									></circle>
									<path
										class="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Submitting...
							{:else}
								Next
							{/if}
						</button>
					{/if}
				</div>
			</form>

			{#if form?.success}
				<div
					transition:fade={{ duration: 300 }}
					class="mt-4 flex items-center rounded-lg bg-green-50 p-4 text-green-700"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{form.message || 'Account created successfully!'}
				</div>
			{:else if form?.error}
				<div
					transition:fade={{ duration: 300 }}
					class="mt-4 flex items-center rounded-lg bg-red-50 p-4 text-red-700"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-5 w-5"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						stroke-width="2"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					{form.error}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.bg-coral-500 {
		background-color: #ff5a5f;
	}

	.rounded-lg {
		border-radius: 0.5rem;
	}

	.shadow-lg {
		box-shadow:
			0 10px 15px -3px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
	}

	.transition-all {
		transition-property: all;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
		transition-duration: 300ms;
	}
</style>
