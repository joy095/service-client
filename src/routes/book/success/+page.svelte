<script lang="ts">
	import { onMount } from 'svelte';

	let status: string = 'checking...';
	let isSuccess = false;
	let isError = false;
	let pollInterval: number | null = null;
	let requestCount = 0;

	const MAX_REQUESTS = 24;
	const MAX_DURATION_MS = 2 * 60 * 1000; // 2 minutes

	function prettyStatus(status: string): string {
		switch (status.toLowerCase()) {
			case 'paid':
			case 'success':
			case 'completed':
				return 'Payment Successful';
			case 'pending':
				return 'Payment Pending';
			case 'failed':
				return 'Payment Failed';
			default:
				return status.charAt(0).toUpperCase() + status.slice(1);
		}
	}

	async function checkStatus(orderId: string) {
		requestCount++;

		if (requestCount > MAX_REQUESTS) {
			status = 'failed';
			isError = true;
			stopPolling();
			redirectHome();
			return;
		}

		try {
			const res = await fetch(`/api/payment-status?order_id=${encodeURIComponent(orderId)}`);
			if (!res.ok) {
				status = `failed to fetch status (${res.status})`;
				isError = true;
				stopPolling();
				redirectHome();
				return;
			}

			const data: { status?: string } = await res.json();
			status = data.status ?? 'unknown';

			if (['success', 'paid', 'completed'].includes(status.toLowerCase())) {
				isSuccess = true;
				isError = false;
				stopPolling();
				setTimeout(redirectHome, 5000);
			} else if (status.toLowerCase() === 'pending') {
				isSuccess = false;
				isError = false;
			} else {
				isError = true;
				stopPolling();
				setTimeout(redirectHome, 5000);
			}
		} catch {
			status = 'network error';
			isError = true;
			stopPolling();
			setTimeout(redirectHome, 5000);
		}
	}

	function stopPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
	}

	function redirectHome() {
		window.location.href = '/';
	}

	onMount(() => {
		const url = new URL(window.location.href);
		const orderId = url.searchParams.get('order_id');

		if (!orderId || orderId.trim().length === 0) {
			status = 'missing order_id';
			isError = true;
			return;
		}

		checkStatus(orderId);

		// Stop after 2 minutes regardless of result
		const timeout = setTimeout(() => {
			if (!isSuccess) {
				status = 'failed';
				isError = true;
				stopPolling();
				redirectHome();
			}
		}, MAX_DURATION_MS);

		// Poll every 5s
		pollInterval = setInterval(() => {
			if (!isSuccess && !isError) {
				checkStatus(orderId);
			}
		}, 5000);

		// Cleanup on unmount
		return () => {
			stopPolling();
			clearTimeout(timeout);
		};
	});
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300 px-4"
>
	<div
		class="w-full max-w-md scale-100 transform rounded-xl bg-white p-8 text-center shadow-2xl transition-all duration-500 hover:scale-105"
	>
		<div class="mb-6">
			{#if isSuccess}
				<!-- ✅ Success -->
				<svg
					class="mx-auto h-20 w-20 text-green-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			{:else if isError}
				<!-- ❌ Error -->
				<svg
					class="mx-auto h-20 w-20 text-red-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			{:else}
				<!-- ⏳ Loading -->
				<svg
					class="mx-auto h-20 w-20 animate-spin text-yellow-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25" />
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="4"
						d="M4 12a8 8 0 018-8"
					/>
				</svg>
			{/if}
		</div>

		<h1
			class="mb-4 text-3xl font-bold {isSuccess
				? 'text-green-700'
				: isError
					? 'text-red-700'
					: 'text-yellow-700'}"
		>
			Payment status: {prettyStatus(status)}
		</h1>

		<p class="mb-6 text-gray-600">
			{#if isSuccess}
				🎉 Thank you! Your transaction was completed successfully.
				<br />
				<span class="text-sm text-gray-500">(Redirecting to home in 5 seconds...)</span>
			{:else if isError}
				⚠️ Something went wrong with your payment. Redirecting shortly...
			{:else}
				⏳ Checking payment status, please wait...
			{/if}
		</p>

		<a
			href="/"
			class="rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-white transition duration-300 hover:bg-yellow-600"
		>
			Go to Home Now
		</a>
	</div>
</div>
