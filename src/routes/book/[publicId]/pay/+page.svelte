<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import formatDate from '$lib/dateFormat';
	import { initializeFromServer } from '$lib/stores/authStore';
	import formatTime from '$lib/timeFormat';
	import type { Business, Service, User } from '$lib/types';
	import { tryRefreshToken } from '$lib/utils/refreshToken';
	import { onMount } from 'svelte';
	import { invalidate } from '$app/navigation';
	import {
		getLocalTimeZone,
		parseDate,
		parseTime,
		toCalendarDateTime
	} from '@internationalized/date';

	// Lazy load components
	let SecureImage;
	let LoadingSpinner;

	onMount(async () => {
		// Load components
		const [SecureImageModule, LoadingSpinnerModule] = await Promise.all([
			import('$lib/components/SecureImage.svelte'),
			import('$lib/components/LoadingSpinner.svelte')
		]);
		SecureImage = SecureImageModule.default;
		LoadingSpinner = LoadingSpinnerModule.default;

		// Initialize auth
		if (data.user) {
			initializeFromServer(data.user);
		} else {
			tryRefreshToken();
		}
	});

	let phone = '';
	let loading = false;
	let phoneErrorMessage = '';
	let successMessage = '';

	const phoneRegex = /^\+?[1-9]\d{1,14}$/;

	async function savePhone() {
		phoneErrorMessage = '';
		successMessage = '';

		if (!phoneRegex.test(phone)) {
			phoneErrorMessage = 'Please enter a valid phone number (e.g., +91 9876543210)';
			return;
		}

		loading = true;

		try {
			const res = await fetch('/api/profile', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ phone }),
				credentials: 'include'
			});

			if (!res.ok) {
				const err = await res.json().catch(() => ({}));
				phoneErrorMessage = err.error || 'Failed to update phone';
			} else {
				successMessage = 'Phone added successfully 🎉';
				phone = '';
				await invalidate('user');
			}
		} catch (err) {
			phoneErrorMessage = 'Something went wrong';
			console.error('Phone update error:', err);
		} finally {
			loading = false;
		}
	}

	const selectedDate = $page.url.searchParams.get('date');
	const selectedServiceId = $page.url.searchParams.get('service');
	const timeUrl = $page.url.searchParams.get('time');
	const publicId = $page.params.publicId;

	function goBack() {
		const searchParams = new URLSearchParams({
			date: selectedDate || '',
			timeUrl: timeUrl || '',
			service: selectedServiceId || ''
		});
		goto(`/book/${publicId}?${searchParams.toString()}`);
	}

	export let data: {
		service: Service;
		businessRaw: Business;
		user: User | null;
	};

	let user = data.user;
	$: user = data.user;

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
	let errorMessage = '';
	let orderAmount = service?.price || 0;
	let orderCurrency = 'INR';
	let isProcessing = false;

	const paymentOptions = [
		{ value: 'upi_id', label: 'Pay using UPI ID', image: '/img/upi.svg' },
		{ value: 'card', label: 'Credit or debit card', image: '/img/visa.svg' },
		{ value: 'upi_qr', label: 'Pay using UPI QR code', image: '/img/qr-code.svg' }
	];

	let isDropdownOpen = false;

	function toggleDropdown() {
		isDropdownOpen = !isDropdownOpen;
	}

	function selectPayment(option: { value: 'upi_id' | 'card' | 'upi_qr' }) {
		selectedPaymentMethod = option.value;
		isDropdownOpen = false;
		upiId = '';
		cardNumber = '';
		cardExpiry = '';
		cardCvv = '';
		cardName = '';
		qrCode = '';
		upiLink = '';
		showQR = false;
		showLink = false;
		errorMessage = '';
		upiError = '';
	}

	let upiError = '';
	const upiRegex = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;

	function validateUPI() {
		if (!upiId.trim()) {
			upiError = 'UPI ID is required';
			return false;
		}
		if (!upiRegex.test(upiId)) {
			upiError = 'Invalid UPI ID';
			return false;
		}
		upiError = '';
		return true;
	}

	function validateCard() {
		errorMessage = '';

		if (!cardNumber.trim()) {
			errorMessage = 'Card number is required';
			return false;
		}
		if (!cardExpiry.trim()) {
			errorMessage = 'Expiry date is required';
			return false;
		}
		if (!cardCvv.trim()) {
			errorMessage = 'CVV is required';
			return false;
		}
		if (!cardName.trim()) {
			errorMessage = 'Cardholder name is required';
			return false;
		}

		const cleanCardNumber = cardNumber.replace(/\s/g, '');
		const cardNumberRegex = /^\d{13,19}$/;
		if (!cardNumberRegex.test(cleanCardNumber)) {
			errorMessage = 'Invalid card number';
			return false;
		}

		const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
		if (!expiryRegex.test(cardExpiry)) {
			errorMessage = 'Invalid expiry date (MM/YY)';
			return false;
		}

		const [month, year] = cardExpiry.split('/');
		const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		if (expiry < now) {
			errorMessage = 'Card has expired';
			return false;
		}

		const cvvRegex = /^\d{3,4}$/;
		if (!cvvRegex.test(cardCvv)) {
			errorMessage = 'Invalid CVV';
			return false;
		}

		return true;
	}

	async function handlePayment() {
		if (isProcessing) return;

		errorMessage = '';
		isProcessing = true;

		try {
			if (selectedPaymentMethod === 'upi_id' && !validateUPI()) {
				isProcessing = false;
				return;
			}
			if (selectedPaymentMethod === 'card' && !validateCard()) {
				isProcessing = false;
				return;
			}

			function formatDateForAPI(dateStr: string | null, timeStr: string | null) {
				if (!dateStr || !timeStr) return null;

				const date = parseDate(dateStr);
				const time = parseTime(timeStr);
				const dateTime = toCalendarDateTime(date, time);
				const tz = getLocalTimeZone();
				const jsDate = dateTime.toDate(tz);

				const tzOffsetMinutes = jsDate.getTimezoneOffset();
				const offsetSign = tzOffsetMinutes > 0 ? '-' : '+';
				const offsetHours = String(Math.floor(Math.abs(tzOffsetMinutes) / 60)).padStart(2, '0');
				const offsetMins = String(Math.abs(tzOffsetMinutes) % 60).padStart(2, '0');

				return `${jsDate.getFullYear()}-${String(jsDate.getMonth() + 1).padStart(2, '0')}-${String(
					jsDate.getDate()
				).padStart(2, '0')}T${String(jsDate.getHours()).padStart(2, '0')}:${String(
					jsDate.getMinutes()
				).padStart(2, '0')}:00${offsetSign}${offsetHours}:${offsetMins}`;
			}

			const startTime = formatDateForAPI(selectedDate, timeUrl);

			const paymentPayload: Record<string, any> = {
				currency: orderCurrency,
				service_id: selectedServiceId,
				start_time: startTime,
				payment_method: selectedPaymentMethod
			};

			if (selectedPaymentMethod === 'upi_id' && upiId) {
				paymentPayload.upi_id = upiId;
			}

			console.log('Sending payment request:', paymentPayload);

			const paymentRes = await fetch('/api/payment', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(paymentPayload)
			});

			const paymentData = await paymentRes.json();
			console.log('Payment response:', paymentData);

			if (!paymentRes.ok) {
				errorMessage = paymentData.message || paymentData.error || 'Payment failed';
				isProcessing = false;
				return;
			}

			if (paymentData.status === 'paid') {
				goto(`/book/success?order_id=${paymentData.order_id}`);
				return;
			}

			if (paymentData.status === 'pending') {
				if (paymentData.qr_code) {
					qrCode = paymentData.qr_code;
					showQR = true;
					return;
				}
				if (paymentData.upi_link) {
					upiLink = paymentData.upi_link;
					showLink = true;
					return;
				}

				setTimeout(() => {
					goto(`/book/success?order_id=${paymentData.order_id}`);
				}, 10000);
				return;
			}

			errorMessage = 'Unexpected payment response';
		} catch (err) {
			console.error('Payment error:', err);
			errorMessage = 'An unexpected error occurred. Please try again.';
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	{#if !SecureImage}
		<div class="flex h-64 items-center justify-center">
			{#if LoadingSpinner}
				<svelte:component this={LoadingSpinner} />
			{:else}
				<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500"></div>
			{/if}
		</div>
	{:else}
		<main class="container mx-auto grid grid-cols-1 gap-8 px-4 py-8 md:grid-cols-2">
			<!-- Left Column: Trip Details -->
			<div class="space-y-6">
				<!-- Rare Find Banner -->
				<div
					class="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4"
				>
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

				<!-- Your booking -->
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-lg font-semibold">Your booking</h2>
					<div class="flex flex-col gap-3">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-gray-700">Dates</span>
							<button on:click={goBack} class="cursor-pointer text-sm text-blue-600 hover:underline"
								>Edit</button
							>
						</div>
						<p class="text-gray-900">{formatDate(selectedDate, -2)}</p>
						<span class="text-sm font-medium text-gray-700">Time</span>
						<p class="text-gray-900">{formatTime(timeUrl)}</p>
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
								<img src="/img/bank.svg" alt="bank" class="h-6 w-6" />
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
									<span>{paymentOptions.find((o) => o.value === selectedPaymentMethod)?.label}</span
									>
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
												<span
													class="absolute inset-y-0 right-0 flex items-center pr-4 text-pink-600"
												>
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
										class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500"
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
											class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500"
											placeholder="MM/YY"
										/>
									</div>
									<div>
										<label for="card_cvv" class="block text-sm font-medium text-gray-700">CVV</label
										>
										<input
											id="card_cvv"
											type="text"
											bind:value={cardCvv}
											class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500"
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
										class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500"
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

						{#if errorMessage}
							<p class="mt-1 text-sm text-red-500">{errorMessage}</p>
						{/if}
					</div>
				</div>

				<!-- User Phone -->
				{#if user?.phone == null}
					<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
						<h2 class="mb-4 text-lg font-semibold">Add phone</h2>

						<input
							bind:value={phone}
							class="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-pink-500 focus:ring-pink-500"
							type="text"
							placeholder="+91 1234567890"
						/>

						<button
							class="mt-3 w-full rounded-md bg-pink-600 px-4 py-2 text-white shadow hover:bg-pink-700 disabled:opacity-50"
							on:click={savePhone}
							disabled={loading || !phone}
						>
							{loading ? 'Saving...' : 'Save'}
						</button>

						{#if phoneErrorMessage}
							<p class="mt-2 text-sm text-red-500">{phoneErrorMessage}</p>
						{/if}

						{#if successMessage}
							<p class="mt-2 text-sm text-green-600">{successMessage}</p>
						{/if}
					</div>
				{/if}

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
					disabled={isProcessing || (selectedPaymentMethod === 'upi_id' && upiError)}
					class="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors duration-200
		{isProcessing ? 'cursor-not-allowed bg-gray-400' : 'cursor-pointer bg-pink-500 hover:bg-pink-600'}"
				>
					{#if isProcessing}
						<!-- Spinner -->
						<svg
							class="h-5 w-5 animate-spin text-white"
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
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
							></path>
						</svg>
						<span>Processing...</span>
					{:else}
						<span>Confirm and pay</span>
					{/if}
				</button>
			</div>

			<!-- Right Column: Property & Total -->
			<div class="sticky top-3/12 h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<div class="mb-6 flex items-start space-x-4">
					{#if service?.objectName}
						<svelte:component
							this={SecureImage}
							src={service.objectName}
							alt={service?.name}
							height={120}
							className="h-20 w-20 rounded object-cover"
						/>
					{/if}
					<div>
						<h3 class="font-semibold text-gray-900">{businessRaw.name}</h3>
						<p class="text-sm text-gray-600">{businessRaw.category}</p>
					</div>
				</div>

				<h2 class="mb-4 text-lg font-semibold">Your total</h2>
				<div class="space-y-2 text-sm">
					<div class="mt-2 border-t pt-2">
						<div class="flex justify-between">
							<span class="font-semibold">Total ({orderCurrency})</span>
							<span class="font-semibold">₹{orderAmount.toFixed(2)}</span>
						</div>
					</div>
				</div>
			</div>
		</main>
	{/if}
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
