<script lang="ts">
	import { onMount } from 'svelte';

	// Mock data - in real app, this would come from API or session
	const bookingData: BookingDetails = {
		property: {
			name: 'kashi stays',
			type: 'Entire rental unit',
			rating: 4.81,
			reviews: 149,
			superhost: true,
			imageUrl: 'https://via.placeholder.com/150'
		},
		dates: '17–18 Aug',
		guests: '1 guest',
		totalPrice: 2458.03,
		nightPrice: 2224.15,
		taxes: 233.88,
		cancellationPolicy: {
			text: 'Free cancellation before 1:00pm on 16 Aug. After that, the reservation is non-refundable.',
			link: 'https://www.airbnb.com/help/cancellations'
		},
		groundRules: ['Follow the house rules', 'Treat your Host’s home like your own'],
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
		property: {
			name: string;
			type: string;
			rating: number;
			reviews: number;
			superhost: boolean;
			imageUrl: string;
		};
		dates: string;
		guests: string;
		totalPrice: number;
		nightPrice: number;
		taxes: number;
		cancellationPolicy: {
			text: string;
			link: string;
		};
		groundRules: string[];
		paymentMethods: string[];
	};
</script>

<!-- Page Content -->
<div class="min-h-screen bg-gray-50">
	<main class="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2">
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
					<p class="text-gray-900">{bookingData.dates}</p>

					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-gray-700">Guests</span>
						<a href="#" class="text-sm text-blue-600 hover:underline">Edit</a>
					</div>
					<p class="text-gray-900">{bookingData.guests}</p>
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
				<p class="text-sm text-gray-800">{bookingData.cancellationPolicy.text}</p>
				<a href={bookingData.cancellationPolicy.link} class="text-sm text-blue-600 hover:underline"
					>Learn more</a
				>
			</div>

			<!-- Ground Rules -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold">Ground rules</h2>
				<p class="mb-3 text-sm text-gray-700">
					We ask every guest to remember a few simple things about what makes a great guest.
				</p>
				<ul class="list-inside list-disc space-y-1 text-sm text-gray-700">
					{#each bookingData.groundRules as rule}
						<li>{rule}</li>
					{/each}
				</ul>
			</div>

			<!-- Terms Agreement -->
			<div class="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<p class="text-xs leading-relaxed text-gray-600">
					By selecting the button below, I agree to the
					<a href="#" class="text-blue-600 hover:underline">Host's House Rules</a>,
					<a href="#" class="text-blue-600 hover:underline">Ground rules for guests</a>,
					<a href="#" class="text-blue-600 hover:underline">Airbnb's Rebooking and Refund Policy</a>
					and that Airbnb can
					<a href="#" class="text-blue-600 hover:underline">charge my payment method</a> if I'm responsible
					for damage.
				</p>
			</div>

			<!-- Confirm and Pay Button -->
			<button
				on:click={handlePayment}
				class="w-full rounded-lg bg-pink-500 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-pink-600"
			>
				Confirm and pay
			</button>
		</div>

		<!-- Right Column: Property & Total -->
		<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
			<div class="mb-6 flex items-start space-x-4">
				<img
					src={bookingData.property.imageUrl}
					alt="Property"
					class="h-20 w-20 rounded object-cover"
				/>
				<div>
					<h3 class="font-semibold text-gray-900">{bookingData.property.name}</h3>
					<p class="text-sm text-gray-600">{bookingData.property.type}</p>
					<div class="flex items-center text-sm text-gray-600">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4 text-yellow-400"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.122a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.122a1 1 0 00-1.175 0l-3.976 2.122c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.122c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
							/>
						</svg>
						<span class="ml-1"
							>{bookingData.property.rating} ({bookingData.property.reviews} reviews)</span
						>
						<!-- {bookingData.property.superhost && (
							<span class="ml-2 flex items-center">
								<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
								</svg>
								<span class="ml-1 text-xs">Superhost</span>
							</span>
						)} -->
					</div>
				</div>
			</div>

			<h2 class="mb-4 text-lg font-semibold">Your total</h2>
			<div class="space-y-2 text-sm">
				<div class="flex justify-between">
					<span>Price details</span>
				</div>
				<div class="flex justify-between">
					<span>1 night × ₹{bookingData.nightPrice.toFixed(2)}</span>
					<span>₹{bookingData.nightPrice.toFixed(2)}</span>
				</div>
				<div class="flex justify-between">
					<span>Taxes</span>
					<span>₹{bookingData.taxes.toFixed(2)}</span>
				</div>
				<div class="mt-2 border-t pt-2">
					<div class="flex justify-between">
						<span class="font-semibold">Total (INR)</span>
						<span class="font-semibold">₹{bookingData.totalPrice.toFixed(2)}</span>
					</div>
					<a href="#" class="text-xs text-blue-600 hover:underline">Price breakdown</a>
				</div>
			</div>
		</div>
	</main>
</div>
