<script lang="ts">
	let productName = 'Premium SvelteKit Course';
	let productPrice = 999; // Price in INR
	let productAmount = productPrice * 100; // Razorpay expects amount in paisa (smallest currency unit)
	let paymentSuccess = false;
	let paymentError = null;

	// Load Razorpay Checkout script dynamically
	function loadRazorpayScript(src) {
		return new Promise((resolve) => {
			const script = document.createElement('script');
			script.src = src;
			script.onload = () => resolve(true);
			script.onerror = () => resolve(false);
			document.body.appendChild(script);
		});
	}

	async function handlePayment() {
		paymentSuccess = false;
		paymentError = null;

		// 1. Create Order on Server
		try {
			const response = await fetch('/payment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					amount: productAmount,
					currency: 'INR',
					receipt: `receipt_order_${Date.now()}` // Unique receipt ID
				})
			});

			const order = await response.json();

			if (order.error) {
				paymentError = order.error;
				console.error('Failed to create Razorpay order:', order.error);
				return;
			}

			// 2. Load Razorpay Script if not already loaded
			const res = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
			if (!res) {
				paymentError = 'Razorpay SDK failed to load. Are you online?';
				return;
			}

			// 3. Initialize Razorpay Checkout
			const options = {
				key: import.meta.env.VITE_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay Key ID
				amount: order.amount,
				currency: order.currency,
				name: 'Your Company Name',
				description: productName,
				image: 'https://example.com/your_logo.png', // Replace with your logo
				order_id: order.id, // Order ID obtained from your server
				handler: function (response) {
					// This function is called on successful payment
					console.log('Payment successful:', response);
					paymentSuccess = true;
					// You would typically verify this payment on your server here
					// e.g., fetch('/verify-payment', { method: 'POST', body: JSON.stringify(response) })
				},
				prefill: {
					name: 'John Doe', // Customer Name (optional)
					email: 'john.doe@example.com', // Customer Email (optional)
					contact: '9999999999' // Customer Phone (optional)
				},
				notes: {
					address: 'Razorpay Corporate Office'
				},
				theme: {
					color: '#3399CC'
				}
			};

			const rzp = new Razorpay(options);
			rzp.on('payment.failed', function (response) {
				// This function is called on payment failure
				paymentError = `Payment failed: ${response.error.description} - ${response.error.reason}`;
				console.error('Payment failed:', response.error);
			});

			rzp.open(); // Open the Razorpay payment modal
		} catch (error) {
			paymentError = `An unexpected error occurred: ${error.message}`;
			console.error('Payment initiation error:', error);
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
	<div class="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
		<h1 class="mb-6 text-3xl font-bold text-gray-800">Test Razorpay Payment</h1>

		<div class="mb-6">
			<h2 class="text-2xl font-semibold text-indigo-700">{productName}</h2>
			<p class="text-lg text-gray-600">Price: INR {productPrice.toFixed(2)}</p>
		</div>

		<button
			on:click={handlePayment}
			class="focus:ring-opacity-50 w-full rounded-lg bg-indigo-600 px-4 py-3 font-bold text-white transition duration-300 ease-in-out hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
		>
			Pay Now
		</button>

		{#if paymentSuccess}
			<div class="mt-6 rounded-md border border-green-300 bg-green-100 p-4 text-green-700">
				Payment Successful! Thank you for your purchase.
			</div>
		{/if}

		{#if paymentError}
			<div class="mt-6 rounded-md border border-red-300 bg-red-100 p-4 text-red-700">
				Error: {paymentError}
			</div>
		{/if}

		<div class="mt-8 text-sm text-gray-500">
			<h3 class="mb-2 font-semibold text-gray-700">Policies and Information:</h3>
			<ul class="space-y-1">
				<li><a href="/terms" class="text-indigo-600 hover:underline">Terms and Conditions</a></li>
				<li><a href="/privacy" class="text-indigo-600 hover:underline">Privacy Policy</a></li>
				<li><a href="/shipping" class="text-indigo-600 hover:underline">Shipping Policy</a></li>
				<li><a href="/contact" class="text-indigo-600 hover:underline">Contact Us</a></li>
				<li>
					<a href="/cancellation" class="text-indigo-600 hover:underline"
						>Cancellation and Refunds</a
					>
				</li>
			</ul>
		</div>
	</div>
</div>

<style>
	/* No additional styles needed, Tailwind handles it! */
</style>
