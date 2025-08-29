<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import SecureImage from '$lib/components/SecureImage.svelte';
	import formatDate from '$lib/dateFormat';
	import type { Business, Service } from '$lib/types';

	const selectedDate = $page.url.searchParams.get('date');
	const selectedServiceId = $page.url.searchParams.get('service');
	const slotId = $page.url.searchParams.get('slotId');
	const time = $page.url.searchParams.get('time');

	const publicId = $page.params.publicId;

	function goBack() {
		const searchParams = new URLSearchParams({
			date: selectedDate || '',
			time: time || '',
			service: selectedServiceId || '',
			slotId: slotId || ''
		});

		goto(`/book/${publicId}?${searchParams.toString()}`);
	}

	export let data: {
		service: Service;
		businessRaw: Business;
	};

	const { service, businessRaw } = data;

	let selectedPaymentMethod: 'upi_id' | 'card' | 'upi_qr' = 'upi_id';
	let upiId = '';
	let cardNumber = '';
	let cardExpiry = '';
	let cardCvv = '';
	let cardName = '';
	let qrCode = '';
	let upiLink = '';
	let showQR = false;
	let showLink = false;

	const paymentOptions = [
		{ value: 'upi_id', label: 'Pay using UPI ID', image: '/img/upi.svg' },
		{ value: 'card', label: 'Credit or debit card', image: '/img/visa.svg' },
		{ value: 'upi_qr', label: 'Pay using UPI QR code', image: '/img/qr-code.svg' }
	];

	let isDropdownOpen = false;

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	function selectPayment(option) {
		selectedPaymentMethod = option.value;
		isDropdownOpen = false;
	}

	let upiError = '';

	const upiRegex = /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/;

	function validateUPI() {
		if (!upiRegex.test(upiId)) {
			upiError = 'Invalid UPI ID';
		} else {
			upiError = '';
		}
	}

	async function handlePayment() {
		// TODO: Add authorization header if needed, e.g., from session/store: headers: { Authorization: `Bearer ${token}` }

		// First, create the booking order
		const bookResponse = await fetch('/book', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				service_id: selectedServiceId,
				date: selectedDate
				// Add other required fields like user_id, amount, etc., based on API requirements
			})
		});

		if (!bookResponse.ok) {
			console.error('Failed to create order');
			// TODO: Show user error message
			return;
		}

		const { order_id } = await bookResponse.json(); // Assume API returns { order_id: string }

		// Then, process payment based on method
		if (selectedPaymentMethod === 'upi_qr') {
			const payResponse = await fetch('/pay/upi/qr', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order_id })
			});

			if (!payResponse.ok) {
				console.error('Failed to generate UPI QR');
				// TODO: Show user error message
				return;
			}

			const data = await payResponse.json(); // Assume { qr_code: 'base64_string' }
			qrCode = data.qr_code;
			showQR = true;
		} else if (selectedPaymentMethod === 'upi_id') {
			if (!upiId) {
				console.error('UPI ID is required');
				// TODO: Show user error message
				return;
			}

			const payResponse = await fetch('/pay/upi/collect', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ order_id, upi_id: upiId })
			});

			if (!payResponse.ok) {
				console.error('Failed to process UPI collect');
				// TODO: Show user error message
				return;
			}

			// Assume success - in real app, poll for status or handle webhook confirmation
			console.log('Payment request sent');
			// TODO: Show success message or redirect to confirmation page
		} else if (selectedPaymentMethod === 'card') {
			if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
				console.error('Card details are required');
				// TODO: Show user error message
				return;
			}

			const payResponse = await fetch('/pay', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					order_id,
					card_details: {
						number: cardNumber,
						expiry: cardExpiry,
						cvv: cardCvv,
						name: cardName
					}
				})
			});

			if (!payResponse.ok) {
				console.error('Failed to process card payment');
				// TODO: Show user error message
				return;
			}

			// Assume success - in real app, handle 3DS or confirmation
			console.log('Card payment processed');
			// TODO: Show success message or redirect to confirmation page
		}
	}
</script>

<!-- Page Content -->
<div class="min-h-screen bg-gray-50">
	<main class="container mx-auto grid grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2">
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
						<button on:click={goBack} class="cursor-pointer text-sm text-blue-600 hover:underline"
							>Edit</button
						>
					</div>
					<p class="text-gray-900">
						{selectedDate}
					</p>
				</div>
			</div>

			<!-- Payment Method -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold">Pay with</h2>
				<div class="flex justify-between">
					<div></div>
					<div class="mb-4 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<img src="/img/visa.svg" alt="Visa Card" class="h-6 w-6" />
							<img src="/img/master-card.svg" alt="Mastercard" class="h-6 w-6" />
							<img src="/img/rupay.svg" alt="RuPay" class="h-6 w-6" />
							<img src="/img/upi.svg" alt="upi" class="h-6 w-6" />
							<img src="/img/bank.svg" alt="upi" class="h-6 w-6" />
						</div>
					</div>
				</div>

				<div class="space-y-4">
					<div class="relative">
						<button
							type="button"
							on:click={toggleDropdown}
							class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pr-10 pl-3 text-left text-gray-900 shadow-sm focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none sm:text-sm"
							aria-haspopup="listbox"
							aria-expanded={isDropdownOpen}
							aria-labelledby="payment-method"
						>
							<span class="flex items-center">
								<img
									src={paymentOptions.find((o) => o.value === selectedPaymentMethod)?.image}
									alt=""
									class="mr-2 h-5 w-5"
								/>
								<span>{paymentOptions.find((o) => o.value === selectedPaymentMethod)?.label}</span>
							</span>
							<span
								class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2"
							>
								<svg
									class="h-5 w-5 text-gray-400"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										fill-rule="evenodd"
										d="M6.293 7.293a1 1 0 011.414 0L10 9.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</span>
						</button>

						{#if isDropdownOpen}
							<ul
								class="ring-opacity-5 absolute z-10 mt-1 w-full rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black focus:outline-none sm:text-sm"
								role="listbox"
								aria-activedescendant={selectedPaymentMethod}
							>
								{#each paymentOptions as option}
									<li
										class="relative cursor-default py-2 pr-9 pl-3 text-gray-900 select-none hover:bg-pink-100"
										role="option"
										on:click={() => selectPayment(option)}
									>
										<div class="flex items-center">
											<img src={option.image} alt="" class="mr-2 h-5 w-5" />
											<span class="font-normal">{option.label}</span>
										</div>
										{#if option.value === selectedPaymentMethod}
											<span class="absolute inset-y-0 right-0 flex items-center pr-4 text-pink-600">
												<svg
													class="h-5 w-5"
													xmlns="http://www.w3.org/2000/svg"
													viewBox="0 0 20 20"
													fill="currentColor"
													aria-hidden="true"
												>
													<path
														fill-rule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clip-rule="evenodd"
													/>
												</svg>
											</span>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					{#if selectedPaymentMethod === 'card'}
						<div class="mt-4 space-y-4">
							<div>
								<label for="card_number" class="block text-sm font-medium text-gray-700"
									>Card Number</label
								>
								<input
									id="card_number"
									type="text"
									bind:value={cardNumber}
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
									placeholder="1234 5678 9012 3456"
								/>
							</div>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label for="card_expiry" class="block text-sm font-medium text-gray-700"
										>Expiry Date</label
									>
									<input
										id="card_expiry"
										type="text"
										bind:value={cardExpiry}
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
										placeholder="MM/YY"
									/>
								</div>
								<div>
									<label for="card_cvv" class="block text-sm font-medium text-gray-700">CVV</label>
									<input
										id="card_cvv"
										type="text"
										bind:value={cardCvv}
										class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
										placeholder="123"
									/>
								</div>
							</div>
							<div>
								<label for="card_name" class="block text-sm font-medium text-gray-700"
									>Cardholder Name</label
								>
								<input
									id="card_name"
									type="text"
									bind:value={cardName}
									class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
									placeholder="John Doe"
								/>
							</div>
						</div>
					{/if}

					{#if selectedPaymentMethod === 'upi_id'}
						<div class="mt-4">
							<label for="upi_id_input" class="block text-sm font-medium text-gray-700"
								>Your UPI ID</label
							>
							<input
								id="upi_id_input"
								type="text"
								bind:value={upiId}
								on:blur={validateUPI}
								class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500"
								placeholder="john123@upi"
							/>

							{#if upiError}
								<p class="mt-1 text-sm text-red-500">{upiError}</p>
							{/if}
						</div>
					{/if}
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
						>our booking and Refund Policy</a
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
		<div class="sticky top-4 h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
						{#if service?.price}
							<span class="font-semibold">₹{service?.price.toFixed(2)}</span>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</main>
</div>

{#if showQR}
	<div class="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black">
		<div class="rounded-lg bg-white p-6 shadow-lg">
			<h3 class="mb-4 text-lg font-semibold">Scan to Pay</h3>
			<img src={`data:image/png;base64,${qrCode}`} alt="UPI QR Code" class="mx-auto" />
			<button
				on:click={() => (showQR = false)}
				class="mt-4 w-full rounded-lg bg-pink-500 px-6 py-3 font-medium text-white hover:bg-pink-600"
			>
				Close
			</button>
		</div>
	</div>
{/if}

{#if showLink}
	<div class="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black">
		<div class="rounded-lg bg-white p-6 shadow-lg">
			<h3 class="mb-4 text-lg font-semibold">Pay with UPI Link</h3>
			<p class="mb-4">Click the link below to complete payment:</p>
			<a href={upiLink} class="text-blue-600 hover:underline">{upiLink}</a>
			<button
				on:click={() => (showLink = false)}
				class="mt-4 w-full rounded-lg bg-pink-500 px-6 py-3 font-medium text-white hover:bg-pink-600"
			>
				Close
			</button>
		</div>
	</div>
{/if}
