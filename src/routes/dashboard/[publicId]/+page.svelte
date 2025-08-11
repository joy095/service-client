<!-- src/routes/dashboard/[publicId]/+page.svelte -->
<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import SecureImage from '$lib/components/SecureImage.svelte';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import { fade, scale } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	// Receive data from +page.server.ts
	export let data: PageData;

	// Modal and form state
	let showModal = false;
	let modalMode: 'create' | 'update' = 'create';
	let currentStep = 1;
	let formData = {
		id: '',
		name: '',
		description: '',
		price: '',
		duration: '',
		image: null as File | null,
		existingImage: ''
	};
	let errors = {
		name: '',
		price: '',
		duration: ''
	};
	let imagePreview: string | null = null;
	let isSubmitting = false;
	let submitMessage: string | null = null;
	let isStepValid = false;

	// Validate current step
	function validateStep() {
		let isValid = true;
		errors = { name: '', price: '', duration: '' };

		if (currentStep === 1) {
			if (!formData.name.trim()) {
				errors.name = 'Service name is required';
				isValid = false;
			}
		} else if (currentStep === 2) {
			if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
				errors.price = 'Valid price is required';
				isValid = false;
			}
			if (
				!formData.duration ||
				isNaN(Number(formData.duration)) ||
				Number(formData.duration) <= 0
			) {
				errors.duration = 'Valid duration is required';
				isValid = false;
			}
		}

		isStepValid = isValid;
		return isValid;
	}

	// Handle input changes and validate
	function handleInput() {
		validateStep();
	}

	// Handle image selection and preview
	function handleImageChange(event: Event) {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			const file = input.files[0];
			if (file.size > 5 * 1024 * 1024) {
				// 5MB limit
				submitMessage = 'Image size must be less than 5MB';
				return;
			}
			if (!['image/jpeg', 'image/png'].includes(file.type)) {
				submitMessage = 'Only JPEG or PNG images are allowed';
				return;
			}
			formData.image = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreview = e.target?.result as string;
			};
			reader.readAsDataURL(file);
			submitMessage = null;
		} else {
			if (modalMode === 'create') {
				imagePreview = null;
				formData.image = null;
			}
		}
	}

	// Reset form
	function resetForm() {
		formData = {
			id: '',
			name: '',
			description: '',
			price: '',
			duration: '',
			image: null,
			existingImage: ''
		};
		imagePreview = null;
		submitMessage = null;
		errors = { name: '', price: '', duration: '' };
		currentStep = 1;
		isStepValid = false;
		modalMode = 'create';
	}

	// Navigate to next step
	function nextStep() {
		if (isStepValid && currentStep < 3) {
			currentStep += 1;
			validateStep(); // Validate next step
		}
	}

	// Navigate to previous step
	function prevStep() {
		if (currentStep > 1) {
			currentStep -= 1;
			validateStep(); // Validate previous step
		}
	}

	// Open create modal
	function openCreateModal() {
		showModal = true;
		resetForm();
		modalMode = 'create';
	}

	// Open update modal with service data
	function openUpdateModal(service: any) {
		showModal = true;
		modalMode = 'update';
		formData = {
			id: service.id,
			name: service.name,
			description: service.description || '',
			price: service.price.toString(),
			duration: service.duration.toString(),
			image: null,
			existingImage: service.objectName || ''
		};

		// Set image preview if service has existing image
		if (service.objectName) {
			imagePreview = `${PUBLIC_IMAGE_URL}/${service.objectName}`;
		} else {
			imagePreview = null;
		}

		currentStep = 1;
		validateStep();
		submitMessage = null;
		errors = { name: '', price: '', duration: '' };
	}

	// Delete service
	async function deleteService(serviceId: string, serviceName: string) {
		if (
			!confirm(`Are you sure you want to delete "${serviceName}"? This action cannot be undone.`)
		) {
			return;
		}

		try {
			const response = await fetch(`?/delete`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					serviceId: serviceId
				})
			});

			if (response.ok) {
				// Reload the page to refresh the services list
				window.location.reload();
			} else {
				const result = await response.json();
				alert(result.error || 'Failed to delete service');
			}
		} catch (error) {
			console.error('Error deleting service:', error);
			alert('Failed to delete service. Please try again.');
		}
	}
</script>

<div class="container mx-auto p-6">
	<!-- Add New Service Button -->
	<div class="mb-6 flex justify-end">
		<button
			on:click={openCreateModal}
			class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:from-indigo-700 hover:to-purple-700 active:scale-95"
		>
			<svg class="mr-2 inline-block h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
			Add New Service
		</button>
	</div>

	<!-- Modal -->
	{#if showModal}
		<div
			class="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm"
			transition:fade={{ duration: 300, easing: cubicInOut }}
		>
			<div
				class="w-full max-w-lg rounded-2xl border border-gray-200 bg-white bg-gradient-to-br from-white to-indigo-50 p-8 shadow-2xl"
				transition:scale={{ duration: 300, easing: cubicInOut, start: 0.95 }}
			>
				<h2 class="mb-6 text-3xl font-bold tracking-tight text-gray-900">
					{modalMode === 'create' ? 'Create New Service' : 'Update Service'}
				</h2>

				<!-- Step Indicator -->
				<div class="mb-8 flex justify-between">
					{#each [1, 2, 3] as step}
						<div class="group relative flex flex-col items-center">
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white transition-all duration-300 {currentStep >=
								step
									? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg'
									: 'bg-gray-300'}"
							>
								{step}
							</div>
							<span class="mt-2 text-sm text-gray-700">
								{step === 1 ? 'Details' : step === 2 ? 'Pricing' : 'Image'}
							</span>
							<!-- Tooltip -->
							<div
								class="absolute -top-10 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block"
							>
								Step {step}: {step === 1
									? 'Basic Details'
									: step === 2
										? 'Pricing & Duration'
										: 'Image Upload'}
							</div>
							{#if step < 3}
								<div
									class="absolute top-5 left-1/2 h-1 w-full max-w-[calc(50%+1rem)] flex-1 bg-gray-200 {currentStep >
									step
										? 'bg-gradient-to-r from-indigo-600 to-purple-600'
										: ''}"
								></div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Form -->
				<form
					use:enhance={({ formData }) => {
						for (let [key, value] of formData.entries()) {
							console.log(`  ${key}:`, value);
						}

						isSubmitting = true;
						return async ({ result, update }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								submitMessage =
									modalMode === 'create'
										? 'Service created successfully!'
										: 'Service updated successfully!';
								setTimeout(() => {
									showModal = false;
									resetForm();
									update();
								}, 2000);
							} else if (result.type === 'failure') {
								submitMessage = result.data?.error || `Failed to ${modalMode} service.`;
							}
						};
					}}
					action={modalMode === 'create' ? '?/create' : '?/update'}
					method="POST"
					enctype="multipart/form-data"
					class="space-y-6"
				>
					<!-- Hidden fields for service ID when updating -->
					{#if modalMode === 'update'}
						<input type="hidden" name="serviceId" value={formData.id} />
						<input type="hidden" name="existingImage" value={formData.existingImage} />
					{/if}

					<!-- Always include all form fields as hidden inputs when not on their respective steps -->
					{#if currentStep !== 1}
						<input type="hidden" name="name" value={formData.name} />
						<input type="hidden" name="description" value={formData.description} />
					{/if}

					{#if currentStep !== 2}
						<input type="hidden" name="price" value={formData.price} />
						<input type="hidden" name="duration" value={formData.duration} />
					{/if}

					{#if currentStep === 1}
						<!-- Step 1: Basic Details -->
						<div class="relative">
							<input
								id="name"
								name="name"
								type="text"
								bind:value={formData.name}
								on:input={handleInput}
								class="peer w-full rounded-lg border border-gray-300 bg-white p-3 pt-6 transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
								placeholder=" "
							/>
							<label
								for="name"
								class="absolute top-1 left-3 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-600"
							>
								Service Name
							</label>
							{#if errors.name}
								<p class="mt-1 text-sm text-red-500">{errors.name}</p>
							{/if}
						</div>

						<div class="relative">
							<textarea
								id="description"
								name="description"
								bind:value={formData.description}
								rows="4"
								on:input={handleInput}
								class="peer w-full rounded-lg border border-gray-300 bg-white p-3 pt-6 transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
								placeholder=" "
							></textarea>
							<label
								for="description"
								class="absolute top-1 left-3 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-600"
							>
								Description
							</label>
						</div>
					{:else if currentStep === 2}
						<!-- Step 2: Pricing & Duration -->
						<div class="relative">
							<input
								id="price"
								name="price"
								type="number"
								bind:value={formData.price}
								on:input={handleInput}
								class="peer w-full rounded-lg border border-gray-300 bg-white p-3 pt-6 transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
								placeholder=" "
								min="0"
								step="0.01"
							/>
							<label
								for="price"
								class="absolute top-1 left-3 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-600"
							>
								Price (₹)
							</label>
							{#if errors.price}
								<p class="mt-1 text-sm text-red-500">{errors.price}</p>
							{/if}
						</div>

						<div class="relative">
							<input
								id="duration"
								name="duration"
								type="number"
								bind:value={formData.duration}
								on:input={handleInput}
								class="peer w-full rounded-lg border border-gray-300 bg-white p-3 pt-6 transition-all duration-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
								placeholder=" "
								min="0"
							/>
							<label
								for="duration"
								class="absolute top-1 left-3 text-sm text-gray-500 transition-all duration-300 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-sm peer-focus:text-indigo-600"
							>
								Duration (minutes)
							</label>
							{#if errors.duration}
								<p class="mt-1 text-sm text-red-500">{errors.duration}</p>
							{/if}
						</div>
					{:else if currentStep === 3}
						<!-- Step 3: Image Upload -->
						<div>
							<label for="image" class="mb-2 block text-sm font-medium text-gray-700">
								Service Image {modalMode === 'update' ? '(Leave empty to keep current image)' : ''}
							</label>
							<input
								id="image"
								name="image"
								type="file"
								accept="image/jpeg,image/png"
								on:change={handleImageChange}
								class="w-full rounded-lg border border-gray-300 p-2 transition-all duration-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-indigo-600 hover:file:bg-indigo-100"
							/>
						</div>

						<!-- Image Preview -->
						{#if imagePreview}
							<div class="mt-4" transition:fade={{ duration: 200 }}>
								<p class="mb-2 text-sm font-medium text-gray-700">
									{modalMode === 'update' && !formData.image ? 'Current Image' : 'Image Preview'}
								</p>
								<img
									src={imagePreview}
									alt="Service preview"
									class="h-48 w-full rounded-lg border border-gray-200 object-cover shadow-sm"
								/>
							</div>
						{/if}

						<!-- Submission Feedback -->
						{#if submitMessage}
							<div
								class="mt-4 rounded-lg p-3 {submitMessage.includes('success')
									? 'bg-green-100 text-green-700'
									: 'bg-red-100 text-red-700'}"
								transition:fade={{ duration: 200 }}
							>
								{submitMessage}
							</div>
						{/if}
					{/if}

					<!-- Navigation Buttons -->
					<div class="mt-8 flex justify-between space-x-3">
						{#if currentStep === 1}
							<button
								type="button"
								on:click={() => {
									showModal = false;
									resetForm();
								}}
								class="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-95"
								disabled={isSubmitting}
							>
								Cancel
							</button>
							<button
								type="button"
								on:click={nextStep}
								class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-semibold text-white transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!isStepValid}
							>
								Next
							</button>
						{:else if currentStep === 2}
							<button
								type="button"
								on:click={prevStep}
								class="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-95"
								disabled={isSubmitting}
							>
								Back
							</button>
							<button
								type="button"
								on:click={nextStep}
								class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-semibold text-white transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={!isStepValid}
							>
								Next
							</button>
						{:else}
							<button
								type="button"
								on:click={prevStep}
								class="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 transition-all duration-200 hover:bg-gray-100 active:scale-95"
								disabled={isSubmitting}
							>
								Back
							</button>
							<button
								type="submit"
								class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 font-semibold text-white transition-all duration-200 hover:from-indigo-700 hover:to-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
								disabled={isSubmitting}
							>
								{#if isSubmitting}
									<svg
										class="mr-2 inline-block h-5 w-5 animate-spin"
										viewBox="0 0 24 24"
										fill="none"
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
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
										></path>
									</svg>
									{modalMode === 'create' ? 'Creating...' : 'Updating...'}
								{:else}
									{modalMode === 'create' ? 'Create Service' : 'Update Service'}
								{/if}
							</button>
						{/if}
					</div>
				</form>
			</div>
		</div>
	{/if}

	<!-- Existing Services Display -->
	{#if data.services?.length === 0}
		<div class="mt-8 rounded-lg border border-dashed p-10 text-center text-gray-500">
			<svg
				class="mx-auto mb-4 h-16 w-16 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
				></path>
			</svg>
			<p class="text-lg font-medium text-gray-900">No services found</p>
			<p class="text-gray-500">Get started by creating your first service</p>
		</div>
	{:else}
		<div class="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
			{#each data.services as service (service.id)}
				<div
					class="group rounded-xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
				>
					{#if service.objectName}
						<SecureImage
							src="{PUBLIC_IMAGE_URL}/{service.objectName}"
							alt={service.name}
							on:error={(e) => {
								const target = e.currentTarget as HTMLImageElement;
								console.warn(`Failed to load image for ${service.name}, using placeholder.`);
								target.src = '/image-placeholder.svg';
							}}
							className="h-48 w-full rounded-t-xl object-cover"
						/>
					{:else}
						<div
							class="flex h-48 w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-gray-200 to-indigo-100"
						>
							<svg
								class="h-16 w-16 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								></path>
							</svg>
						</div>
					{/if}

					<div class="p-5">
						<div class="mb-3 flex items-start justify-between">
							<h3 class="line-clamp-1 text-xl font-semibold tracking-tight text-gray-900">
								{service.name}
							</h3>
							<!-- Action buttons - shown on hover -->
							<div
								class="flex space-x-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
							>
								<button
									on:click={() => openUpdateModal(service)}
									class="rounded-lg bg-blue-50 p-2 text-blue-600 transition-colors duration-200 hover:bg-blue-100"
									title="Edit service"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										></path>
									</svg>
								</button>
								<button
									on:click={() => deleteService(service.id, service.name)}
									class="rounded-lg bg-red-50 p-2 text-red-600 transition-colors duration-200 hover:bg-red-100"
									title="Delete service"
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
										></path>
									</svg>
								</button>
							</div>
						</div>

						{#if service.description}
							<p class="mt-2 line-clamp-2 text-gray-600">{service.description}</p>
						{/if}

						<div class="mt-4 flex items-center justify-between">
							<span class="text-lg font-bold text-indigo-600">₹{service.price}</span>
							<span class="flex items-center text-sm text-gray-500">
								<svg class="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								{service.duration} min
							</span>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Floating label styles */
	.peer:focus ~ label,
	.peer:not(:placeholder-shown) ~ label {
		top: 0.25rem;
		font-size: 0.75rem;
		color: #4f46e5;
	}
</style>
