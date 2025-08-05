<!-- src/routes/become-a-professional/[publicId]/business/+page.svelte -->
<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types'; // Import PageData
	import MapPicker from '$lib/components/MapPicker.svelte';

	// --- Props (using Svelte 5 Runes) ---
	// Receive data from the load function and form action result
	// $props() replaces export let in Runes mode
	const { form, data } = $props<{ form: ActionData | null; data: PageData }>();

	// --- State (using Svelte 5 Runes) ---
	// Extract business data or error from the loaded data
	// Use $state for reactive variables
	let businessData = $state(data.business?.business); // Extract the inner business object
	let loadError = $state(data.error); // Error from server load

	// Define the structure for location details received from MapPicker
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

	// Initialize formData with data from the loaded business or empty defaults
	// Using $state for reactivity (Svelte 5 syntax)
	let formData = $state({
		name: businessData?.name ?? '',
		category: businessData?.category ?? '',
		latitude: businessData?.latitude?.toString() ?? '',
		longitude: businessData?.latitude?.toString() ?? '',
		address: businessData?.address ?? '',
		city: businessData?.city ?? '',
		state: businessData?.state ?? '',
		country: businessData?.country ?? '',
		postalCode: businessData?.postalCode ?? '',
		road: businessData?.road ?? '',
		house_number: businessData?.house_number ?? ''
		// about: businessData?.about ?? ''
	});

	// Initialize errors object using $state
	let errors = $state({
		name: '',
		category: '',
		location: '',
		city: '',
		state: '',
		country: '',
		postalCode: '',
		address: ''
	});

	let currentStep = $state(1);
	let dynamicFields: Record<string, string> = $state({}); // Assuming not used for update, or populate if needed
	let mapError: string | null = $state(null);
	let isSubmitting = $state(false);

	// List of business categories (could be dynamic too)
	const categories = [
		'Barbershops',
		'Hair Salons',
		'Spa Salons',
		'Nail Salons',
		'Salons',
		'Make up artist'
	];

	// --- Functions ---

	/**
	 * Validates the form data for the current step.
	 * @param step The step number to validate.
	 * @returns True if the step is valid, false otherwise.
	 */
	const validateStep = (step: number) => {
		let isValid = true;
		// Reset errors for the current step
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
			// Review step validation often mirrors step 1 & 2 but can be stricter
			if (!formData.name?.trim()) {
				errors.name = 'Business name is required.';
				isValid = false;
			}
			if (!formData.category) {
				errors.category = 'Category is required.';
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

	/**
	 * Advances to the next step if the current step is valid.
	 */
	const nextStep = () => {
		if (validateStep(currentStep)) {
			currentStep++;
			mapError = null;
		}
	};

	/**
	 * Goes back to the previous step.
	 */
	const prevStep = () => {
		if (currentStep > 1) {
			currentStep--;
			// Clear errors when navigating back
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
		}
	};

	/**
	 * Handles the location selected event from the MapPicker component.
	 * Updates formData with the new location details.
	 * @param event The custom event containing location details.
	 */
	function handleLocationSelected(event: CustomEvent<ReceivedLocationDetails>) {
		const { latitude, longitude, address, road, house_number, city, state, country, postalCode } =
			event.detail;

		// Update formData with the selected location details
		// Prioritize new data from the map, but keep existing formData if map data is missing
		formData.latitude = latitude.toString();
		formData.longitude = longitude.toString();
		formData.address = address || formData.address || ''; // Prefer map address, fallback to existing
		formData.road = road || formData.road || '';
		formData.house_number = house_number || formData.house_number || '';
		formData.city = city || formData.city || ''; // Prefer map city, fallback to existing
		formData.state = state || formData.state || ''; // Prefer map state, fallback to existing
		formData.country = country || formData.country || ''; // Prefer map country, fallback to existing
		formData.postalCode = postalCode || formData.postalCode || ''; // Prefer map postalCode, fallback to existing

		// Clear relevant errors
		errors.location = '';
		errors.city = '';
		errors.state = '';
		errors.country = '';
		errors.postalCode = '';
		mapError = null;
	}

	/**
	 * Handles the location error event from the MapPicker component.
	 * @param event The custom event containing the error message.
	 */
	function handleLocationError(event: CustomEvent<string>) {
		mapError = event.detail;
		errors.location = event.detail;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4 py-12">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-12 text-center">
			<h1
				class="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
			>
				{#if businessData}
					Edit Your Business
				{:else}
					Create Your Service
				{/if}
			</h1>
			<p class="text-lg text-gray-600">
				{#if businessData}
					Update your business profile details
				{:else}
					Set up your business profile in just a few steps
				{/if}
			</p>
		</div>

		<!-- Error Display (Load Error) -->
		{#if loadError}
			<div class="mb-6 flex items-center justify-center rounded-lg bg-red-500/20 p-4 text-red-300">
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
				{loadError}
			</div>
		{/if}

		<!-- Main Content - Only show if there's no load error and business data exists -->
		{#if !loadError && businessData}
			<!-- Stepper -->
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

			<!-- Main Content Area -->
			<div class="glass-effect rounded-2xl p-8 shadow-2xl md:p-12">
				<form
					method="POST"
					use:enhance={() => {
						// Set submitting state immediately
						isSubmitting = true;

						// Return the callback to handle the result
						return async ({ update, result }) => {
							try {
								// Await the update process
								await update();
							} catch (updateError) {
								isSubmitting = false;
							}
						};
					}}
					class="space-y-6"
				>
					<!-- Step 1: Basic Info -->
					{#if currentStep === 1}
						<div
							in:fly={{ x: 300, duration: 500, easing: quintOut }}
							out:fly={{ x: -300, duration: 300 }}
						>
							<h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Basic Information</h2>
							<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div class="md:col-span-2">
									<label class="mb-2 block text-sm font-semibold text-gray-700" for="business-name"
										>Business Name *</label
									>
									<input
										id="business-name"
										type="text"
										bind:value={formData.name}
										name="name"
										placeholder="Enter your business name"
										class="input-focus w-full rounded-xl
									border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500
									focus:outline-none"
										class:border-red-500={!!errors.name}
									/>
									{#if errors.name}
										<p class="mt-1 text-sm text-red-500">{errors.name}</p>
									{/if}
								</div>
								<div class="md:col-span-2">
									<label
										class="mb-2 block text-sm font-semibold text-gray-700"
										for="category-select">Category *</label
									>
									<select
										id="category-select"
										bind:value={formData.category}
										name="category"
										class="input-focus w-full appearance-none rounded-xl border-2
										border-gray-200 bg-white px-4 py-3 transition-all duration-300
										focus:border-blue-500 focus:outline-none"
										class:border-red-500={!!errors.category}
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
								<!-- Optional 'About' field -->
								<!-- Uncomment and adjust if you have an 'about' field -->
								<!--
                                <div class="md:col-span-2">
                                    <label class="mb-2 block text-sm font-semibold text-gray-700" for="about"
                                        >About (Optional)</label
                                    >
                                    <textarea
                                        id="about"
                                        bind:value={formData.about}
                                        name="about"
                                        placeholder="Describe your business..."
                                        rows="4"
                                        class="input-focus w-full rounded-xl border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
                                    ></textarea>
                                </div>
                                -->
							</div>
						</div>
					{/if}

					<!-- Step 2: Location -->
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

					<!-- Step 3: Review -->
					<!-- Hidden inputs to preserve all form values for submission -->
					{#if currentStep === 3}
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
						<!-- Add hidden input for 'about' if used -->
						<!-- <input type="hidden" name="about" value={formData.about} /> -->
						<!-- Hidden inputs for dynamic fields (if used) -->
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
							<!-- Display missing required field errors from Step 3 validation -->
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
								<!-- Basic Info Review -->
								<div class="rounded-xl bg-gray-50 p-6">
									<h3 class="mb-4 font-semibold text-gray-800">Basic Information</h3>
									<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
										<div>
											<span class="font-medium">Business Name:</span>
											{formData.name || 'N/A'}
										</div>
										<div>
											<span class="font-medium">Category:</span>
											{formData.category || 'N/A'}
										</div>
										<!-- Display 'about' if used -->
										<!-- {#if formData.about}
                                            <div class="md:col-span-2">
                                                <span class="font-medium">About:</span>
                                                <p class="mt-1 whitespace-pre-wrap">{formData.about}</p>
                                            </div>
                                        {/if} -->
									</div>
								</div>

								<!-- Dynamic Fields Review (if applicable) -->
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

								<!-- Location Review -->
								<div class="rounded-xl bg-green-50 p-6">
									<h3 class="mb-4 font-semibold text-gray-800">Location Details</h3>
									<div class="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
										<div>
											<span class="font-medium">Coordinates:</span>
											Lat: {formData.latitude || 'N/A'}, Lng: {formData.longitude || 'N/A'}
										</div>
										<div class="md:col-span-2">
											<label
												class="mb-2 block text-sm font-semibold text-gray-700"
												for="address-review">Full Address *</label
											>
											<input
												id="address-review"
												type="text"
												bind:value={formData.address}
												name="address"
												placeholder="Enter full address"
												class="input-focus w-full rounded-xl
											border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500
											focus:outline-none"
												class:border-red-500={!!errors.address}
											/>
											{#if errors.address}
												<p class="mt-1 text-sm text-red-500">{errors.address}</p>
											{/if}
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
											<label
												class="mb-2 block text-sm font-semibold text-gray-700"
												for="city-review">City *</label
											>
											<input
												id="city-review"
												type="text"
												bind:value={formData.city}
												name="city"
												placeholder="Enter city"
												class="input-focus w-full rounded-xl border-2
											border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
												class:border-red-500={!!errors.city}
											/>
											{#if errors.city}
												<p class="mt-1 text-sm text-red-500">{errors.city}</p>
											{/if}
										</div>
										<div>
											<label
												class="mb-2 block text-sm font-semibold text-gray-700"
												for="state-review">State *</label
											>
											<input
												id="state-review"
												type="text"
												bind:value={formData.state}
												name="state"
												placeholder="Enter state"
												class="input-focus w-full rounded-xl border-2
											border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500 focus:outline-none"
												class:border-red-500={!!errors.state}
											/>
											{#if errors.state}
												<p class="mt-1 text-sm text-red-500">{errors.state}</p>
											{/if}
										</div>
										<div>
											<label
												class="mb-2 block text-sm font-semibold text-gray-700"
												for="country-review">Country *</label
											>
											<input
												id="country-review"
												type="text"
												bind:value={formData.country}
												name="country"
												placeholder="Enter country"
												class="input-focus w-full rounded-xl
											border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500
											focus:outline-none"
												class:border-red-500={!!errors.country}
											/>
											{#if errors.country}
												<p class="mt-1 text-sm text-red-500">{errors.country}</p>
											{/if}
										</div>
										<div>
											<label
												class="mb-2 block text-sm font-semibold text-gray-700"
												for="postalCode-review">Postal Code *</label
											>
											<input
												id="postalCode-review"
												type="text"
												bind:value={formData.postalCode}
												name="postalCode"
												placeholder="Enter postal code"
												class="input-focus w-full rounded-xl
											border-2 border-gray-200 px-4 py-3 transition-all duration-300 focus:border-blue-500
											focus:outline-none"
												class:border-red-500={!!errors.postalCode}
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

					<!-- Navigation Buttons -->
					<div class="flex justify-between pt-8">
						<button
							type="button"
							on:click={prevStep}
							class="cursor-pointer rounded-xl bg-gray-200 px-6 py-3 font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-300 {currentStep ===
							1
								? 'invisible'
								: ''}"
							disabled={currentStep === 1}
						>
							← Previous
						</button>
						{#if currentStep < 3}
							<button
								type="button"
								on:click={nextStep}
								class="cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:from-blue-600 hover:to-purple-600"
							>
								Next →
							</button>
						{:else}
							<button
								type="submit"
								disabled={isSubmitting}
								class="flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-green-500 px-8 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:from-teal-600 hover:to-green-600 disabled:opacity-50"
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
									Saving...
								{:else if businessData}
									Next
								{:else}
									Submit Form
								{/if}
							</button>
						{/if}
					</div>
				</form>

				<!-- Action Result Messages (Success/Error from form submission) -->
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
						{form.message || 'Business updated successfully!'}
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
		{:else if !loadError && !businessData}
			<!-- Optional: Handle case where load succeeded but businessData is null/undefined (e.g., new business flow not supported here) -->
			<div class="text-center text-gray-500">No business data found.</div>
		{/if}
	</div>
</div>

<style>
	.glass-effect {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}
	.input-focus {
		transition: all 0.3s ease;
	}
	.input-focus:focus {
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(102, 126, 234, 0.15);
	}
</style>
