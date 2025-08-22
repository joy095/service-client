<script lang="ts">
	import { page } from '$app/stores';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import SecureImage from '$lib/components/SecureImage.svelte';
	import formatDate from '$lib/dateFormat';
	import type { Business, Service } from '$lib/types';
	import { onMount } from 'svelte';

	export let data: {
		services: Service[];
		businessRaw: Business;
	};

	const { services, businessRaw } = data;

	const selectedDate = $page.url.searchParams.get('date');

	const selectedServiceId = $page.url.searchParams.get('service');
	const service = selectedServiceId
		? services.find((s) => s.id === selectedServiceId) || services[0]
		: services[0];

	// Mock data - in real app, this would come from API or session
	const bookingData: BookingDetails = {
		paymentMethods: ['VISA', 'Mastercard', 'AMEX', 'RuPay', 'UPI']
	};

	let selectedPaymentMethod = 'upi_qr'; // 'upi_qr' | 'upi_id'

	function handlePayment() {
		console.log('Processing payment...', selectedPaymentMethod);
		// In real app: call Stripe, Razorpay, or backend API
	}

	onMount(() => {
		// Optional: Load user data, booking info, etc.
	});

	type BookingDetails = {
		paymentMethods: string[];
	};
</script>

<!-- Page Content -->
<div class="min-h-screen bg-gray-50">
	<main class="relative container grid grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2">
		<!-- Left Column: Trip Details -->
		<div class="space-y-6">
			<!-- Rare Find Banner -->
			<div class="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4">
				<div>
					<p class="font-medium text-gray-900">This is a rare find.</p>
					<p class="text-sm text-gray-600">Shreyash's place is usually booked.</p>
				</div>
				<div class="text-pink-500">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
				</div>
			</div>

			<!-- Your Trip -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold">Your trip</h2>
				<div class="space-y-4">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-gray-700">Dates</span>
						<a href="#" class="text-sm text-blue-600 hover:underline">Edit</a>
					</div>
					<p class="text-gray-900">
						{selectedDate}
					</p>
				</div>
			</div>

			<!-- Payment Method -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold">Pay with</h2>
				<div class="mb-4 flex items-center justify-between">
					{#each bookingData.paymentMethods as method}
						<img
							src={`https://picsum.photos/seed/${method}/20/12`}
							alt={method}
							class="h-5 w-auto"
						/>
					{/each}
				</div>

				<div class="space-y-3">
					<div class="flex items-center">
						<input
							type="radio"
							id="upi_qr"
							name="payment-method"
							class="h-4 w-4 text-pink-600 focus:ring-pink-500"
						/>
						<label for="upi_qr" class="ml-2 text-sm text-gray-700">Pay using UPI QR code</label>
					</div>
					<div class="flex items-center">
						<input
							type="radio"
							id="upi_id"
							name="payment-method"
							class="h-4 w-4 text-pink-600 focus:ring-pink-500"
						/>
						<label for="upi_id" class="ml-2 text-sm text-gray-700">UPI ID</label>
					</div>
				</div>
			</div>

			<!-- Cancellation Policy -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold">Cancellation policy</h2>
				<p class="text-sm text-gray-800">
					Free cancellation before 1:00pm on {formatDate(selectedDate, -2)}. After that, the
					reservation is non-refundable
				</p>
				<a href="/cancellationPolicy" class="text-sm text-blue-600 hover:underline">Learn more</a>
			</div>

			<!-- Terms Agreement -->
			<div class="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<p class="text-xs leading-relaxed text-gray-600">
					By selecting the button below, I agree to the
					<a href="/refund-policy" class="text-blue-600 hover:underline"
						>our's booking and Refund Policy</a
					>
				</p>
			</div>

			<!-- Confirm and Pay Button -->
			<button
				on:click={handlePayment}
				class="w-full cursor-pointer rounded-lg bg-pink-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-pink-600"
			>
				Confirm and pay
			</button>
		</div>

		<!-- Right Column: Property & Total -->
		<div
			class="sticky right-0 max-h-fit rounded-lg border border-gray-200 bg-white to-35% p-6 shadow-sm"
		>
			<div class="mb-6 flex items-start space-x-4">
				{#if service?.objectName}
					<SecureImage
						src="{PUBLIC_IMAGE_URL}/{service.objectName}"
						alt={service?.name}
						height={120}
						className="h-20 w-20 rounded object-cover"
					/>
				{/if}
				<div>
					<h3 class="font-semibold text-gray-900">
						{businessRaw.name}
					</h3>
					<p class="text-sm text-gray-600">{businessRaw.category}</p>
				</div>
			</div>

			<h2 class="mb-4 text-lg font-semibold">Your total</h2>
			<div class="space-y-2 text-sm">
				<div class="mt-2 border-t pt-2">
					<div class="flex justify-between">
						<span class="font-semibold">Total (INR)</span>
						<span class="font-semibold">₹{service?.price.toFixed(2) || 'N/A'}</span>
					</div>
				</div>
			</div>
		</div>
	</main>
</div>
