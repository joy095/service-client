<script lang="ts">
	import { enhance } from '$app/forms';
	import { fade, slide } from 'svelte/transition';
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	let formData = {
		name: '',
		category: '',
		address: '',
		city: '',
		state: '',
		country: '',
		postalCode: '',
		taxId: '',
		about: '',
		latitude: '',
		longitude: '',
		isActive: true
	};

	let errors = {
		name: '',
		category: '',
		address: '',
		city: '',
		state: '',
		country: '',
		postalCode: '',
		taxId: '',
		latitude: '',
		longitude: ''
	};

	let isSubmitting = false;
	let formProgress = 0;
	let showSuccessMessage = false;

	const categories = ['Technology', 'Retail', 'Finance', 'Healthcare', 'Education', 'Other'];

	// Client-side validation
	function validateField(field: keyof typeof formData) {
		switch (field) {
			case 'name':
				errors.name = formData.name.trim() ? '' : 'Name is required';
				break;
			case 'category':
				errors.category = formData.category ? '' : 'Please select a category';
				break;
			case 'address':
				errors.address = formData.address.trim() ? '' : 'Address is required';
				break;
			case 'city':
				errors.city = formData.city.trim() ? '' : 'City is required';
				break;
			case 'state':
				errors.state = formData.state.trim() ? '' : 'State is required';
				break;
			case 'country':
				errors.country = formData.country.trim() ? '' : 'Country is required';
				break;
			case 'postalCode':
				errors.postalCode = formData.postalCode.trim() ? '' : 'Postal code is required';
				break;
			case 'latitude':
				errors.latitude =
					formData.latitude && !isNaN(Number(formData.latitude)) ? '' : 'Valid latitude required';
				break;
			case 'longitude':
				errors.longitude =
					formData.longitude && !isNaN(Number(formData.longitude))
						? ''
						: 'Valid longitude required';
				break;
		}
		updateProgress();
	}

	// Calculate form completion progress
	function updateProgress() {
		const totalFields = Object.keys(formData).length - 1; // Exclude isActive
		const filledFields = Object.entries(formData).filter(
			([key, value]) => key !== 'isActive' && value !== '' && value !== false
		).length;
		formProgress = Math.round((filledFields / totalFields) * 100);
	}

	// Handle form submission
	async function handleSubmit() {
		// Validate all fields
		Object.keys(formData).forEach((key) => {
			if (key !== 'about' && key !== 'taxId' && key !== 'isActive') {
				validateField(key as keyof typeof formData);
			}
		});

		if (Object.values(errors).every((error) => !error)) {
			isSubmitting = true;
			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 2000));
			dispatch('submit', formData);
			isSubmitting = false;
			showSuccessMessage = true;
			setTimeout(() => (showSuccessMessage = false), 3000); // Hide message after 3 seconds
		}
	}

	// Initial progress update on mount
	onMount(() => {
		updateProgress();
	});
</script>

<svelte:head>
	<!-- Load Inter font -->
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
	<!-- Tailwind CSS -->
	<script src="https://cdn.tailwindcss.com"></script>
	<style>
		body {
			font-family: 'Inter', sans-serif;
		}
		.animate-blob {
			animation: blob 10s infinite;
		}
		.animation-delay-2000 {
			animation-delay: 2s;
		}
		.animation-delay-4000 {
			animation-delay: 4s;
		}
		.animation-delay-6000 {
			animation-delay: 6s;
		}
		.animation-delay-8000 {
			animation-delay: 8s;
		}

		@keyframes blob {
			0% {
				transform: translate(0px, 0px) scale(1);
			}
			33% {
				transform: translate(30px, -50px) scale(1.2);
			}
			66% {
				transform: translate(-20px, 20px) scale(0.8);
			}
			100% {
				transform: translate(0px, 0px) scale(1);
			}
		}

		/* Custom focus glow for inputs */
		input:focus,
		select:focus,
		textarea:focus {
			outline: none;
			box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3); /* indigo-500 with opacity */
			border-color: transparent; /* Remove default border on focus */
		}

		/* Custom styling for select dropdown arrow */
		select {
			-webkit-appearance: none;
			-moz-appearance: none;
			appearance: none;
			background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd'%3E%3C/path%3E%3C/svg%3E");
			background-repeat: no-repeat;
			background-position: right 0.75rem center;
			background-size: 1.5em 1.5em;
			padding-right: 2.5rem; /* Make space for the custom arrow */
		}
	</style>
</svelte:head>

<div
	class="font-inter relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4"
>
	<!-- Animated background particles -->
	<div class="pointer-events-none absolute inset-0">
		<div
			class="animate-blob absolute -top-20 -left-20 h-96 w-96 rounded-full bg-indigo-500 opacity-10 mix-blend-screen blur-3xl filter"
		></div>
		<div
			class="animate-blob animation-delay-2000 absolute top-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-500 opacity-10 mix-blend-screen blur-3xl filter"
		></div>
		<div
			class="animate-blob animation-delay-4000 absolute bottom-1/3 left-1/3 h-72 w-72 rounded-full bg-pink-500 opacity-10 mix-blend-screen blur-3xl filter"
		></div>
		<div
			class="animate-blob animation-delay-6000 absolute -right-10 -bottom-10 h-100 w-100 rounded-full bg-blue-500 opacity-10 mix-blend-screen blur-3xl filter"
		></div>
		<div
			class="animate-blob animation-delay-8000 absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 opacity-10 mix-blend-screen blur-3xl filter"
		></div>
	</div>

	<div
		in:fade={{ duration: 600 }}
		out:slide
		class="relative z-10 w-full max-w-3xl rounded-3xl border border-white/20 bg-white/5 p-10 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-purple-500/30"
	>
		<!-- Progress Bar -->
		<div class="mb-8">
			<div class="relative pt-1">
				<div class="mb-2 flex items-center justify-between">
					<div>
						<span
							class="inline-block rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 px-3 py-1 text-xs font-semibold text-white uppercase shadow-md"
						>
							Progress: {formProgress}%
						</span>
					</div>
				</div>
				<div class="mb-4 flex h-2 overflow-hidden rounded-full bg-gray-700 text-xs shadow-inner">
					<div
						style="width: {formProgress}%"
						class="flex flex-col justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-center text-white shadow-lg transition-all duration-500 ease-out"
					></div>
				</div>
			</div>
		</div>

		<h1
			class="mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-center text-4xl font-extrabold text-transparent md:text-5xl"
		>
			Create Your Premium Account
		</h1>

		<form use:enhance class="space-y-6" on:submit|preventDefault={handleSubmit}>
			<!-- Name -->
			<div class="group relative">
				<label
					for="name"
					class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
					>Name</label
				>
				<div class="relative mt-1">
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						on:blur={() => validateField('name')}
						class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
						placeholder="Enter your name"
						required
					/>
					<label
						for="name"
						class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                               peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
					>
						Enter your name
					</label>
				</div>
				{#if errors.name}
					<p transition:slide class="mt-1 flex items-center text-xs text-red-400">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						{errors.name}
					</p>
				{/if}
			</div>

			<!-- Category -->
			<div class="group relative">
				<label
					for="category"
					class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
					>Category</label
				>
				<div class="relative mt-1">
					<select
						id="category"
						bind:value={formData.category}
						on:blur={() => validateField('category')}
						class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
						required
					>
						<option value="" disabled selected class="bg-gray-800 text-gray-400"
							>Select a category</option
						>
						{#each categories as category}
							<option value={category} class="bg-gray-800 text-white">{category}</option>
						{/each}
					</select>
					<label
						for="category"
						class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                               peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
					>
						Select a category
					</label>
				</div>
				{#if errors.category}
					<p transition:slide class="mt-1 flex items-center text-xs text-red-400">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						{errors.category}
					</p>
				{/if}
			</div>

			<!-- Address -->
			<div class="group relative">
				<label
					for="address"
					class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
					>Address</label
				>
				<div class="relative mt-1">
					<input
						type="text"
						id="address"
						bind:value={formData.address}
						on:blur={() => validateField('address')}
						class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
						placeholder="Enter your address"
						required
					/>
					<label
						for="address"
						class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                               peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
					>
						Enter your address
					</label>
				</div>
				{#if errors.address}
					<p transition:slide class="mt-1 flex items-center text-xs text-red-400">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="mr-1 h-4 w-4"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clip-rule="evenodd"
							/>
						</svg>
						{errors.address}
					</p>
				{/if}
			</div>

			<!-- City, State, Country Grid -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div class="group relative">
					<label
						for="city"
						class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
						>City</label
					>
					<div class="relative mt-1">
						<input
							type="text"
							id="city"
							bind:value={formData.city}
							on:blur={() => validateField('city')}
							class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
							placeholder="City"
							required
						/>
						<label
							for="city"
							class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                                   peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
						>
							City
						</label>
					</div>
					{#if errors.city}
						<p transition:slide class="mt-1 flex items-center text-xs text-red-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
							{errors.city}
						</p>
					{/if}
				</div>
				<div class="group relative">
					<label
						for="state"
						class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
						>State</label
					>
					<div class="relative mt-1">
						<input
							type="text"
							id="state"
							bind:value={formData.state}
							on:blur={() => validateField('state')}
							class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
							placeholder="State"
							required
						/>
						<label
							for="state"
							class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                                   peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
						>
							State
						</label>
					</div>
					{#if errors.state}
						<p transition:slide class="mt-1 flex items-center text-xs text-red-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
							{errors.state}
						</p>
					{/if}
				</div>
				<div class="group relative">
					<label
						for="country"
						class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
						>Country</label
					>
					<div class="relative mt-1">
						<input
							type="text"
							id="country"
							bind:value={formData.country}
							on:blur={() => validateField('country')}
							class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
							placeholder="Country"
							required
						/>
						<label
							for="country"
							class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                                   peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
						>
							Country
						</label>
					</div>
					{#if errors.country}
						<p transition:slide class="mt-1 flex items-center text-xs text-red-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
							{errors.country}
						</p>
					{/if}
				</div>
			</div>

			<!-- Postal Code and Tax ID -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="group relative">
					<label
						for="postalCode"
						class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
						>Postal Code</label
					>
					<div class="relative mt-1">
						<input
							type="text"
							id="postalCode"
							bind:value={formData.postalCode}
							on:blur={() => validateField('postalCode')}
							class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
							placeholder="Postal Code"
							required
						/>
						<label
							for="postalCode"
							class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                                   peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
						>
							Postal Code
						</label>
					</div>
					{#if errors.postalCode}
						<p transition:slide class="mt-1 flex items-center text-xs text-red-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
							{errors.postalCode}
						</p>
					{/if}
				</div>
				<div class="group relative">
					<label
						for="taxId"
						class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
						>Tax ID (Optional)</label
					>
					<div class="relative mt-1">
						<input
							type="text"
							id="taxId"
							bind:value={formData.taxId}
							class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
							placeholder="Tax ID (optional)"
						/>
						<label
							for="taxId"
							class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                                   peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
						>
							Tax ID (optional)
						</label>
					</div>
				</div>
			</div>

			<!-- About -->
			<div class="group relative">
				<label
					for="about"
					class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
					>About</label
				>
				<div class="relative mt-1">
					<textarea
						id="about"
						bind:value={formData.about}
						rows="4"
						class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
						placeholder="Tell us about yourself or your organization"
					></textarea>
					<label
						for="about"
						class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                               peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                               peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
					>
						Tell us about yourself or your organization
					</label>
				</div>
			</div>

			<!-- Latitude and Longitude -->
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div class="group relative">
					<label
						for="latitude"
						class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
						>Latitude</label
					>
					<div class="relative mt-1">
						<input
							type="number"
							id="latitude"
							bind:value={formData.latitude}
							on:blur={() => validateField('latitude')}
							step="any"
							class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
							placeholder="Latitude"
						/>
						<label
							for="latitude"
							class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                                   peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
						>
							Latitude
						</label>
					</div>
					{#if errors.latitude}
						<p transition:slide class="mt-1 flex items-center text-xs text-red-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
							{errors.latitude}
						</p>
					{/if}
				</div>
				<div class="group relative">
					<label
						for="longitude"
						class="block text-sm font-medium text-gray-300 transition-all duration-200 group-focus-within:text-indigo-400"
						>Longitude</label
					>
					<div class="relative mt-1">
						<input
							type="number"
							id="longitude"
							bind:value={formData.longitude}
							on:blur={() => validateField('longitude')}
							step="any"
							class="peer block w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-3 text-white placeholder-transparent transition-all duration-300 focus:border-transparent focus:ring-2 focus:ring-indigo-400"
							placeholder="Longitude"
						/>
						<label
							for="longitude"
							class="absolute -top-2.5 left-4 text-xs text-gray-400 transition-all duration-200
                                   peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                                   peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-indigo-400"
						>
							Longitude
						</label>
					</div>
					{#if errors.longitude}
						<p transition:slide class="mt-1 flex items-center text-xs text-red-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mr-1 h-4 w-4"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
									clip-rule="evenodd"
								/>
							</svg>
							{errors.longitude}
						</p>
					{/if}
				</div>
			</div>

			<!-- Is Active Toggle -->
			<div class="flex items-center justify-between py-2">
				<span class="text-sm font-medium text-gray-300">Account Active</span>
				<label class="relative inline-flex cursor-pointer items-center">
					<input
						type="checkbox"
						id="isActive"
						bind:checked={formData.isActive}
						class="peer sr-only"
					/>
					<div
						class="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-400 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-500 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"
					></div>
				</label>
			</div>

			<!-- Submit Button -->
			<div class="flex justify-end pt-4">
				<button
					type="submit"
					disabled={isSubmitting}
					class="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 font-medium text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-indigo-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
				>
					{#if isSubmitting}
						<span class="flex items-center">
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
							Creating...
						</span>
					{:else}
						Create Account
					{/if}
				</button>
			</div>

			<!-- Success Message -->
			{#if showSuccessMessage}
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
					Account created successfully!
				</div>
			{/if}
		</form>
	</div>
</div>
