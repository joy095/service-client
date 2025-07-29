<!-- src/routes/become-a-professional/[publicId]/service/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import deepEqual from 'fast-deep-equal';
	import { onDestroy } from 'svelte';

	export let data: {
		publicId: string;
		service: {
			id: string;
			name: string;
			description: string;
			price: number;
			duration: number;
			imageUrl?: string;
		} | null;
	};

	// Form state
	let currentStep = 0;
	let success = false;
	let error: string | null = null;
	let loading = false;
	let isEditing = !!data.service;

	// Form data with all required fields
	let formData = {
		name: data.service?.name || '',
		description: data.service?.description || '',
		price: data.service?.price || 0,
		duration: data.service?.duration || 30,
		image: null as File | null,
		imageUrl: data.service?.imageUrl || ''
	};

	// Original data for comparison
	let originalData = { ...formData };

	// Steps configuration
	const steps = [
		{ title: 'Service Details', description: 'Basic information' },
		{ title: 'Pricing', description: 'Set your price and duration' },
		{ title: 'Preview', description: 'Review before submitting' }
	];

	// Navigation functions
	function nextStep() {
		if (currentStep < steps.length - 1) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 0) {
			currentStep--;
		}
	}

	// Check if form has changes
	function hasChanges(): boolean {
		return !deepEqual(formData, originalData);
	}

	// Handle file input change
	function handleImageChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			formData.image = target.files[0];
			// Create preview URL
			const reader = new FileReader();
			reader.onload = (e) => {
				formData.imageUrl = e.target?.result as string;
			};
			reader.readAsDataURL(target.files[0]);
		}
	}

	// Form enhancement for loading states
	const enhanceOptions = () => {
		loading = true;
		error = null;
		return async ({ result }: { result: any }) => {
			loading = false;
			if (result?.type === 'success') {
				success = true;
				// Update original data to match current form data
				originalData = { ...formData };
				// Show success message for 3 seconds then reload
				setTimeout(() => {
					window.location.reload();
				}, 3000);
			} else if (result?.data?.error) {
				error = result.data.error;
			}
		};
	};

	// Format currency
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}

	// Validate current step
	function isStepValid(): boolean {
		switch (currentStep) {
			case 0: // Service Details
				return (
					!!formData.name.trim() &&
					!!formData.description.trim() &&
					(!isEditing || !!formData.imageUrl || !!formData.image)
				);
			case 1: // Pricing
				return formData.price > 0 && formData.duration > 0;
			default:
				return true;
		}
	}

	// Check if all required fields are filled
	function isFormComplete(): boolean {
		return (
			!!formData.name.trim() &&
			!!formData.description.trim() &&
			formData.price > 0 &&
			formData.duration > 0 &&
			(!!formData.imageUrl || !!formData.image)
		);
	}

	let previewUrl: string | null = null;

	$: if (formData.image) {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
		previewUrl = URL.createObjectURL(formData.image);
	}

	onDestroy(() => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
	});
</script>

<div class="mx-auto max-w-4xl p-4 sm:p-6">
	<!-- Header -->
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-3xl font-bold text-gray-900">
			{isEditing ? 'Update Your Service' : 'Create New Service'}
		</h1>
		<p class="text-gray-600">
			{isEditing ? 'Update your existing service details' : 'Tell us about your service offering'}
		</p>
	</div>

	<!-- Multi-Step Form -->
	<div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
		<!-- Progress Bar -->
		<div class="px-6 pt-6">
			<div class="relative flex justify-between">
				<div
					class="absolute top-1/2 right-0 left-0 -z-10 h-0.5 -translate-y-1/2 transform bg-gray-200"
				></div>
				<div
					class="absolute top-1/2 left-0 -z-10 h-0.5 -translate-y-1/2 transform bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
					style={`width: ${(currentStep / (steps.length - 1)) * 100}%`}
				></div>
				{#each steps as step, i}
					<div class="relative z-10 flex flex-col items-center">
						<div
							class={`mb-2 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
								i <= currentStep
									? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
									: 'bg-gray-100 text-gray-400'
							}`}
						>
							<span class="text-white">
								{i < currentStep || (i === currentStep && isStepValid()) ? '✓' : i + 1}
							</span>
						</div>
						<span
							class={`text-xs font-medium transition-colors duration-300 ${
								i <= currentStep ? 'text-blue-600' : 'text-gray-500'
							}`}
						>
							{step.title}
						</span>
					</div>
				{/each}
			</div>
		</div>

		<!-- Form Content -->
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={enhanceOptions}
			class="p-6 sm:p-8"
		>
			<!-- Hidden fields -->
			<input type="hidden" name="publicId" value={data.publicId} />
			{#if data.service?.id}
				<input type="hidden" name="serviceId" value={data.service.id} />
			{/if}

			<!-- Step 1: Service Details -->
			{#if currentStep === 0}
				<div class="space-y-8">
					<div>
						<h2 class="text-2xl font-bold text-gray-900">Service Details</h2>
						<p class="mt-1 text-gray-600">Tell us about your service</p>
					</div>

					<div class="grid grid-cols-1 gap-6">
						<div>
							<label class="mb-2 block text-sm font-semibold text-gray-700">Service Name *</label>
							<input
								type="text"
								name="name"
								bind:value={formData.name}
								required
								class="w-full rounded-xl border border-gray-300 px-4 py-3.5 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								placeholder="e.g., Professional Haircut"
							/>
						</div>

						<div>
							<label class="mb-2 block text-sm font-semibold text-gray-700">Description *</label>
							<textarea
								name="description"
								bind:value={formData.description}
								required
								rows="4"
								class="w-full rounded-xl border border-gray-300 px-4 py-3.5 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								placeholder="Describe what you offer and what customers can expect..."
							></textarea>
						</div>

						<div>
							<label class="mb-2 block text-sm font-semibold text-gray-700">
								Service Image *
								{#if isEditing && formData.imageUrl}
									<span class="ml-2 text-xs font-normal text-gray-500"
										>(Current image will be kept if no new image is uploaded)</span
									>
								{/if}
							</label>
							<div class="mt-1 flex flex-col gap-6 sm:flex-row">
								{#if formData.imageUrl && !formData.image}
									<div class="flex-shrink-0">
										<img
											src={formData.imageUrl}
											alt="Current service image"
											class="h-32 w-32 rounded-xl border-2 border-gray-200 object-cover"
											on:error={() => (formData.imageUrl = '')}
										/>
										<p class="mt-2 text-center text-xs text-gray-500">Current Image</p>
									</div>
								{/if}

								<div class="flex-grow">
									<div
										class="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 transition-colors hover:border-blue-400"
									>
										<div class="space-y-1 text-center">
											<svg
												class="mx-auto h-12 w-12 text-gray-400"
												stroke="currentColor"
												fill="none"
												viewBox="0 0 48 48"
												aria-hidden="true"
											>
												<path
													d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
													stroke-width="2"
													stroke-linecap="round"
													stroke-linejoin="round"
												/>
											</svg>
											<div class="flex text-sm text-gray-600">
												<label
													class="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500"
												>
													<span>{formData.image ? 'Change Image' : 'Upload a file'}</span>
													<input
														type="file"
														name="image"
														accept="image/*"
														class="sr-only"
														on:change={handleImageChange}
														required={!isEditing || !formData.imageUrl}
													/>
												</label>
												<p class="pl-1">or drag and drop</p>
											</div>
											<p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
										</div>
									</div>
									{#if formData.image}
										<p class="mt-2 text-sm text-gray-600">
											Selected: <span class="font-medium">{formData.image.name}</span>
										</p>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Step 2: Pricing -->
			{#if currentStep === 1}
				<div class="space-y-8">
					<div>
						<h2 class="text-2xl font-bold text-gray-900">Pricing & Duration</h2>
						<p class="mt-1 text-gray-600">Set your service price and time</p>
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<label class="mb-2 block text-sm font-semibold text-gray-700">Price (USD) *</label>
							<div class="relative">
								<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
									<span class="font-medium text-gray-500">$</span>
								</div>
								<input
									type="number"
									name="price"
									bind:value={formData.price}
									min="0"
									step="0.01"
									required
									class="block w-full rounded-xl border border-gray-300 py-3.5 pr-12 pl-10 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
									placeholder="0.00"
								/>
							</div>
							<div class="mt-3 grid grid-cols-3 gap-2">
								{#each [25, 50, 75, 100, 150, 200] as price}
									<button
										type="button"
										on:click={() => (formData.price = price)}
										class={`rounded-lg border px-3 py-2 text-sm transition-colors ${
											formData.price === price
												? 'border-blue-500 bg-blue-100 font-medium text-blue-700'
												: 'border-gray-300 text-gray-700 hover:bg-gray-50'
										}`}
									>
										${price}
									</button>
								{/each}
							</div>
						</div>

						<div>
							<label class="mb-2 block text-sm font-semibold text-gray-700"
								>Duration (minutes) *</label
							>
							<input
								type="number"
								name="duration"
								bind:value={formData.duration}
								min="1"
								required
								class="w-full rounded-xl border border-gray-300 px-4 py-3.5 shadow-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
								placeholder="30"
							/>
							<div class="mt-3 grid grid-cols-4 gap-2">
								{#each [15, 30, 45, 60, 90, 120] as duration}
									<button
										type="button"
										on:click={() => (formData.duration = duration)}
										class={`rounded-lg border px-3 py-2 text-sm transition-colors ${
											formData.duration === duration
												? 'border-blue-500 bg-blue-100 font-medium text-blue-700'
												: 'border-gray-300 text-gray-700 hover:bg-gray-50'
										}`}
									>
										{duration} min
									</button>
								{/each}
							</div>
						</div>
					</div>

					<!-- Preview Card -->
					<div
						class="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5"
					>
						<h3 class="mb-3 font-semibold text-blue-900">Pricing Preview</h3>
						<div class="flex items-center justify-between">
							<div>
								<p class="text-sm text-blue-700">Service Price</p>
								<p class="text-xl font-bold text-blue-900">{formatCurrency(formData.price)}</p>
							</div>
							<div class="text-right">
								<p class="text-sm text-blue-700">Duration</p>
								<p class="text-xl font-bold text-blue-900">{formData.duration} minutes</p>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Step 3: Preview -->
			{#if currentStep === 2}
				<div class="space-y-8">
					<div>
						<h2 class="text-2xl font-bold text-gray-900">Review Your Service</h2>
						<p class="mt-1 text-gray-600">
							{isEditing
								? 'Review changes before updating'
								: 'Make sure everything looks good before creating'}
						</p>
					</div>

					<div
						class="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6"
					>
						<div class="flex flex-col gap-6 sm:flex-row">
							<div class="flex-shrink-0">
								{#if formData.imageUrl || formData.image}
									{@const imageUrl = formData.image
										? URL.createObjectURL(formData.image)
										: formData.imageUrl}
									<img
										src={imageUrl}
										alt="Service preview"
										class="h-40 w-40 rounded-xl border-2 border-white object-cover shadow-md"
										on:error={() => (formData.imageUrl = '')}
									/>
								{:else}
									<div
										class="flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-200"
									>
										<span class="text-sm text-gray-500">No image</span>
									</div>
								{/if}
							</div>

							<div class="flex-grow">
								<h3 class="text-2xl font-bold text-gray-900">{formData.name || 'Service Name'}</h3>
								<p class="mt-3 leading-relaxed text-gray-600">
									{formData.description || 'Service description will appear here...'}
								</p>

								<div class="mt-6 flex flex-wrap items-center gap-4">
									<div class="rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm">
										<p class="text-xs text-gray-500">PRICE</p>
										<p class="text-lg font-bold text-blue-600">{formatCurrency(formData.price)}</p>
									</div>
									<div class="rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm">
										<p class="text-xs text-gray-500">DURATION</p>
										<p class="text-lg font-bold text-gray-900">{formData.duration} min</p>
									</div>
								</div>
							</div>
						</div>
					</div>

					{#if isEditing && !hasChanges()}
						<div class="rounded-xl border border-amber-200 bg-amber-50 p-4">
							<div class="flex">
								<svg
									class="h-5 w-5 text-amber-400"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fill-rule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
								<div class="ml-3">
									<h3 class="text-sm font-medium text-amber-800">No changes detected</h3>
									<div class="mt-1 text-sm text-amber-700">
										<p>You haven't made any changes to this service.</p>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Navigation Buttons -->
			<div class="mt-10 flex flex-col justify-between gap-4 sm:flex-row">
				<button
					type="button"
					on:click={prevStep}
					disabled={currentStep === 0}
					class={`rounded-xl px-6 py-3 font-medium transition-all ${
						currentStep === 0
							? 'cursor-not-allowed text-gray-400'
							: 'border border-gray-300 text-gray-700 hover:bg-gray-100'
					}`}
				>
					← Back
				</button>

				<div class="flex gap-3">
					{#if currentStep < steps.length - 1}
						<button
							type="button"
							on:click={nextStep}
							disabled={!isStepValid()}
							class={`rounded-xl px-6 py-3 font-medium transition-all ${
								isStepValid()
									? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md hover:from-blue-700 hover:to-indigo-800'
									: 'cursor-not-allowed bg-gray-200 text-gray-500'
							}`}
						>
							Continue →
						</button>
					{:else}
						<button
							type="submit"
							name="action"
							value={isEditing ? 'update' : 'create'}
							disabled={loading || (isEditing && !hasChanges()) || !isFormComplete()}
							class={`flex items-center gap-2 rounded-xl px-8 py-3 font-medium transition-all ${
								loading || (isEditing && !hasChanges()) || !isFormComplete()
									? 'cursor-not-allowed bg-gray-300 text-gray-500'
									: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl'
							}`}
						>
							{#if loading}
								<span class="flex items-center">
									<svg
										class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
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
									<span>Processing...</span>
								</span>
							{:else}
								{isEditing ? 'Update Service' : 'Create Service'}
							{/if}
						</button>
					{/if}
				</div>
			</div>

			<!-- Feedback Messages -->
			{#if success}
				<div
					class="mt-8 rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-5"
				>
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<svg
								class="h-6 w-6 text-green-500"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div class="ml-4">
							<h3 class="text-lg font-medium text-green-800">
								{isEditing ? 'Service Updated Successfully!' : 'Service Created Successfully!'}
							</h3>
							<div class="mt-1 text-sm text-green-700">
								<p>Your service has been {isEditing ? 'updated' : 'created'} and is now live.</p>
							</div>
						</div>
					</div>
				</div>
			{/if}

			{#if error}
				<div
					class="mt-8 rounded-xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-5"
				>
					<div class="flex">
						<div class="flex-shrink-0">
							<svg
								class="h-6 w-6 text-red-500"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div class="ml-4">
							<h3 class="text-lg font-medium text-red-800">Error Occurred</h3>
							<div class="mt-1 text-sm text-red-700">
								<p>{error}</p>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</form>
	</div>
</div>

<style>
	:global(input:focus, textarea:focus) {
		outline: none;
	}

	/* Custom spinner animation */
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>
