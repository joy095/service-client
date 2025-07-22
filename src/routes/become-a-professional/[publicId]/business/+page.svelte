<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import MapPicker from '$lib/components/MapPicker.svelte';
	import { userPendingBusiness } from '$lib/store';
	import { onMount } from 'svelte';

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
	let dynamicFields: Record<string, string> = {};
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

	// Set initial form data from the store if available
	onMount(() => {
		const unsubscribe = userPendingBusiness.subscribe((value) => {
			if (value) {
				formData = { ...formData, ...value };
			}
		});
		// Unsubscribe when the component is unmounted to prevent memory leaks
		return unsubscribe;
	});
</script>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<div class="mb-12 text-center">
			<h1
				class="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
			>
				Create Your Service
			</h1>
			<p class="text-lg text-gray-600">Set up your business profile in just a few steps</p>
		</div>

		<div class="z-10 mb-12 flex items-center justify-center">
			<div class="flex items-center space-x-8">
				{#each [1, 2, 3] as step}
					<div class="flex flex-col items-center">
						<div
							class="flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold text-white transition-all duration-300 {currentStep >=
							step
								? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg'
								: 'bg-gray-300'} {currentStep === step ? 'scale-110 shadow-xl' : ''}"
						>
							{step}
						</div>
						<span
							class="mt-2 text-sm font-medium {currentStep >= step
								? 'text-blue-600'
								: 'text-gray-400'}"
						>
							{step === 1 ? 'Basic Info' : step === 2 ? 'Location' : 'Review'}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<div class="glass-effect rounded-2xl p-8 shadow-2xl md:p-12">
			<form
				method="POST"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ formData, update }) => {
						isSubmitting = false;
						await update();
					};
				}}
				class="space-y-6"
			>
				{#if currentStep === 1}
					<div
						in:fly={{ x: 300, duration: 500, easing: quintOut }}
						out:fly={{ x: -300, duration: 300 }}
					>
						<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Basic Information</h2>

						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div class="md:col-span-2">
								<label class="mb-2 block text-sm font-semibold text-gray-700" for="business-name"
									>Business Name</label
								>
								<input
									id="business-name"
									type="text"
									bind:value={formData.name}
									name="name"
									placeholder="Enter your business name"
									class="input-focus w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
									class:border-red-500={errors.name}
									required
								/>
								{#if errors.name}
									<p class="mt-1 text-sm text-red-500">{errors.name}</p>
								{/if}
							</div>

							<div class="md:col-span-2">
								<label class="mb-2 block text-sm font-semibold text-gray-700" for="category-select"
									>Category</label
								>
								<select
									id="category-select"
									bind:value={formData.category}
									name="category"
									class="input-focus w-full appearance-none rounded-xl border-2 border-gray-200 bg-white px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
									class:border-red-500={errors.category}
									required
								>
									<option value="">Select a category</option>
									{#each categories as category}
										<option value={category}>{category}</option>
									{/each}
								</select>
								{#if errors.category}
									<p class="mt-1 text-sm text-red-500">{errors.category}</p>
								{/if}
							</div>
						</div>
					</div>
				{/if}

				{#if currentStep === 2}
					<div
						in:fly={{ x: 300, duration: 500, easing: quintOut }}
						out:fly={{ x: -300, duration: 300 }}
					>
						<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">
							Set Your Location on Map
						</h2>

						<MapPicker
							initialLat={parseFloat(formData.latitude) || undefined}
							initialLng={parseFloat(formData.longitude) || undefined}
							error={errors.location || mapError}
							on:locationSelected={handleLocationSelected}
							on:locationError={handleLocationError}
						/>

						{#if errors.location}
							<p class="mt-2 text-center text-sm text-red-500">{errors.location}</p>
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

					<!-- Hidden inputs for dynamic fields -->
					{#each Object.entries(dynamicFields) as [key, value]}
						<input type="hidden" name={key} {value} />
					{/each}
				{/if}

				{#if currentStep === 3}
					<div
						in:fly={{ x: 300, duration: 500, easing: quintOut }}
						out:fly={{ x: -300, duration: 300 }}
					>
						<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">
							Review Your Information
						</h2>

						{#if errors.city || errors.state || errors.country || errors.postalCode}
							<div class="mb-6 rounded-lg bg-yellow-100 p-4 text-yellow-700">
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
							<div class="rounded-xl bg-gray-50 p-6">
								<h3 class="mb-4 font-semibold text-gray-800">Basic Information</h3>
								<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
									<div>
										<span class="font-medium">Business Name:</span>
										{formData.name || 'N/A'}
									</div>
									<div><span class="font-medium">Category:</span> {formData.category || 'N/A'}</div>
								</div>
							</div>

							{#if Object.keys(dynamicFields).length > 0}
								<div class="rounded-xl bg-blue-50 p-6">
									<h3 class="mb-4 font-semibold text-gray-800">Additional Information</h3>
									<div class="space-y-2 text-sm">
										{#each Object.entries(dynamicFields) as [key, value]}
											{#if value}
												<div>
													<span class="font-medium capitalize"
														>{key.replace(/([A-Z])/g, ' $1').trim()}:</span
													>
													{value}
												</div>
											{/if}
										{/each}
									</div>
								</div>
							{/if}

							<div class="rounded-xl bg-green-50 p-6">
								<h3 class="mb-4 font-semibold text-gray-800">Location Details</h3>
								<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
									<div>
										<span class="font-medium">Location Set:</span>
										{formData.latitude && formData.longitude ? 'Yes' : 'No'}
									</div>
									<div class="md:col-span-2">
										<label class="mb-2 block text-sm font-semibold text-gray-700" for="address"
											>Full Address</label
										>
										<input
											id="address"
											type="text"
											bind:value={formData.address}
											name="address"
											placeholder="Enter full address"
											class="input-focus w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
											class:border-red-500={errors.address}
										/>
										{#if errors.address}
											<p class="mt-1 text-sm text-red-500">{errors.address}</p>
										{/if}
									</div>
									<div>
										<label class="mb-2 block text-sm font-semibold text-gray-700" for="road"
											>Road</label
										>
										<input
											id="road"
											type="text"
											bind:value={formData.road}
											name="road"
											placeholder="Enter road name"
											class="input-focus w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
										/>
									</div>
									{#if formData.road}
										<div><span class="font-medium">Road:</span> {formData.road}</div>
									{/if}
									{#if formData.house_number}
										<div>
											<span class="font-medium">House Number:</span>
											{formData.house_number}
										</div>
									{/if}
									<div>
										<label class="mb-2 block text-sm font-semibold text-gray-700" for="city"
											>City</label
										>
										<input
											id="city"
											type="text"
											bind:value={formData.city}
											name="city"
											placeholder="Enter city"
											class="input-focus w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
											class:border-red-500={errors.city}
										/>
										{#if errors.city}
											<p class="mt-1 text-sm text-red-500">{errors.city}</p>
										{/if}
									</div>
									<div>
										<label class="mb-2 block text-sm font-semibold text-gray-700" for="state"
											>State</label
										>
										<input
											id="state"
											type="text"
											bind:value={formData.state}
											name="state"
											placeholder="Enter state"
											class="input-focus w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
											class:border-red-500={errors.state}
										/>
										{#if errors.state}
											<p class="mt-1 text-sm text-red-500">{errors.state}</p>
										{/if}
									</div>
									<div>
										<label class="mb-2 block text-sm font-semibold text-gray-700" for="country"
											>Country</label
										>
										<input
											id="country"
											type="text"
											bind:value={formData.country}
											name="country"
											placeholder="Enter country"
											class="input-focus w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
											class:border-red-500={errors.country}
										/>
										{#if errors.country}
											<p class="mt-1 text-sm text-red-500">{errors.country}</p>
										{/if}
									</div>
									<div>
										<label class="mb-2 block text-sm font-semibold text-gray-700" for="postalCode"
											>Postal Code</label
										>
										<input
											id="postalCode"
											type="text"
											bind:value={formData.postalCode}
											name="postalCode"
											placeholder="Enter postal code"
											class="input-focus w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
											class:border-red-500={errors.postalCode}
										/>
										{#if errors.postalCode}
											<p class="mt-1 text-sm text-red-500">{errors.postalCode}</p>
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<div class="flex justify-between pt-8">
					<button
						type="button"
						on:click={prevStep}
						class="rounded-xl bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-300 {currentStep ===
						1
							? 'invisible'
							: ''}"
					>
						← Previous
					</button>

					{#if currentStep < 3}
						<button
							type="button"
							on:click={nextStep}
							class="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-600"
						>
							Next →
						</button>
					{:else}
						<button
							type="submit"
							disabled={isSubmitting ||
								errors.name ||
								errors.category ||
								errors.location ||
								errors.city ||
								errors.state ||
								errors.country ||
								errors.postalCode ||
								errors.address}
							class="flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-green-500 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:from-teal-600 hover:to-green-600 disabled:opacity-50"
						>
							{#if isSubmitting}
								<svg
									class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
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
								Submit Form
							{/if}
						</button>
					{/if}
				</div>
			</form>

			{#if form?.success}
				<div
					transition:fade={{ duration: 300 }}
					class="mt-4 flex items-center justify-center rounded-lg bg-green-500/20 p-4 text-green-300"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-6 w-6"
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
					class="mt-4 flex items-center justify-center rounded-lg bg-red-500/20 p-4 text-red-300"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-6 w-6"
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
	.glass-effect {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	.input-focus {
		transition: all 0.3s ease;
	}

	.input-focus:focus {
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
	}
</style>
