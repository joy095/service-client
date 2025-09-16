<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let orders = [];
	let loading = true;
	let error = null;
	let currentPage = 1;
	let totalPages = 1;
	let totalOrders = 0;
	let statusFilter = 'all';
	let dateFilter = 'week';

	// Status badge styling
	const statusStyles = {
		pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
		paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
		refund: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
	};

	// Status icons
	const statusIcons = {
		pending: `<svg class="me-1 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"/>
                  </svg>`,
		paid: `<svg class="me-1 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                 <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
               </svg>`,
		refund: `<svg class="me-1 h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                   <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                 </svg>`
	};

	// Format currency
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount / 100); // Assuming amount is in cents
	}

	// Handle filter changes
	function handleFilterChange() {
		currentPage = 1; // Reset to first page when filters change
		updateURL();
	}

	// Handle pagination
	function goToPage(pageNum) {
		if (pageNum >= 1 && pageNum <= totalPages) {
			currentPage = pageNum;
			updateURL();
		}
	}

	// Update URL with current filters and page
	function updateURL() {
		const params = new URLSearchParams();
		if (statusFilter !== 'all') params.set('status', statusFilter);
		if (dateFilter !== 'week') params.set('date', dateFilter);
		if (currentPage > 1) params.set('page', currentPage.toString());

		goto(`?${params.toString()}`, { replaceState: false });
	}

	// Load data when component mounts and when URL changes
	$: page.subscribe(($page) => {
		// Get query parameters
		const url = new URL($page.url);
		const newStatusFilter = url.searchParams.get('status') || 'all';
		const newDateFilter = url.searchParams.get('date') || 'week';
		const newCurrentPage = parseInt(url.searchParams.get('page')) || 1;

		// Check if filters or page changed
		const filtersChanged =
			statusFilter !== newStatusFilter ||
			dateFilter !== newDateFilter ||
			currentPage !== newCurrentPage;

		// Update state
		statusFilter = newStatusFilter;
		dateFilter = newDateFilter;
		currentPage = newCurrentPage;

		// Update select values in DOM
		if (typeof document !== 'undefined') {
			const statusSelect = document.getElementById('order-type');
			const dateSelect = document.getElementById('duration');
			if (statusSelect) statusSelect.value = statusFilter;
			if (dateSelect) dateSelect.value = dateFilter;
		}

		// Use data from server load
		if ($page.data) {
			orders = $page.data.orders || [];
			totalPages = $page.data.totalPages || 1;
			totalOrders = $page.data.totalOrders || 0;
			loading = false;
		}
	});
</script>

<section class="bg-white py-8 antialiased md:py-16 dark:bg-gray-900">
	<div class="mx-auto max-w-screen-xl px-4 2xl:px-0">
		<div class="mx-auto max-w-5xl">
			<div class="gap-4 sm:flex sm:items-center sm:justify-between">
				<h2 class="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">Orders</h2>

				<div
					class="mt-6 gap-4 space-y-4 sm:mt-0 sm:flex sm:items-center sm:justify-end sm:space-y-0"
				>
					<div>
						<label
							for="order-type"
							class="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white"
							>Select order type</label
						>
						<select
							id="order-type"
							class="focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 block w-full min-w-[8rem] rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
							on:change={(e) => {
								statusFilter = e.target.value;
								handleFilterChange();
							}}
						>
							<option value="all">All orders</option>
							<option value="pending">Pending</option>
							<option value="paid">Paid</option>
							<option value="refund">Refund</option>
						</select>
					</div>

					<span class="inline-block text-gray-500 dark:text-gray-400"> from </span>

					<div>
						<label
							for="duration"
							class="sr-only mb-2 block text-sm font-medium text-gray-900 dark:text-white"
							>Select duration</label
						>
						<!-- select dropdown -->
						<select
							id="duration"
							class="focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400"
							on:change={(e) => {
								dateFilter = e.target.value;
								handleFilterChange();
							}}
						>
							<option value="week">this week</option>
							<option value="month">this month</option>
							<option value="3months">the last 3 months</option>
							<option value="6months">the last 6 months</option>
							<option value="year">this year</option>
						</select>
					</div>
				</div>
			</div>

			{#if loading}
				<div class="mt-8 text-center">
					<p>Loading orders...</p>
				</div>
			{:else if error}
				<div class="mt-8 text-center">
					<p class="text-red-500">{error}</p>
				</div>
			{:else if orders.length === 0}
				<div class="mt-8 text-center">
					<p>No orders found</p>
				</div>
			{:else}
				<div class="mt-6 flow-root sm:mt-8">
					<div class="divide-y divide-gray-200 dark:divide-gray-700">
						{#each orders as order}
							<div class="flex flex-wrap items-center gap-y-4 py-6">
								<dl class="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
									<dt class="text-base font-medium text-gray-500 dark:text-gray-400">Order ID:</dt>
									<dd class="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
										<a href="#" class="hover:underline">#{order.id.slice(0, 8)}</a>
									</dd>
								</dl>

								<dl class="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
									<dt class="text-base font-medium text-gray-500 dark:text-gray-400">Service:</dt>
									<dd class="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
										{order.serviceName}
									</dd>
								</dl>

								<dl class="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
									<dt class="text-base font-medium text-gray-500 dark:text-gray-400">Price:</dt>
									<dd class="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
										{formatCurrency(order.amount)}
									</dd>
								</dl>

								<dl class="w-1/2 sm:w-1/4 lg:w-auto lg:flex-1">
									<dt class="text-base font-medium text-gray-500 dark:text-gray-400">Status:</dt>
									<dd
										class="{statusStyles[
											order.status
										]} me-2 mt-1.5 inline-flex items-center rounded px-2.5 py-0.5 text-xs font-medium"
									>
										{@html statusIcons[order.status]}
										{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
									</dd>
								</dl>

								<div
									class="grid w-full gap-4 sm:grid-cols-2 lg:flex lg:w-64 lg:items-center lg:justify-end"
								>
									{#if order.status === 'pending'}
										<button
											type="button"
											class="w-full rounded-lg border border-red-700 px-3 py-2 text-center text-sm font-medium text-red-700 hover:bg-red-700 hover:text-white focus:ring-4 focus:ring-red-300 focus:outline-none lg:w-auto dark:border-red-500 dark:text-red-500 dark:hover:bg-red-600 dark:hover:text-white dark:focus:ring-red-900"
										>
											Cancel order
										</button>
									{:else if order.status === 'paid'}
										<button
											type="button"
											class="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 w-full rounded-lg px-3 py-2 text-sm font-medium text-white focus:ring-4 focus:outline-none lg:w-auto"
										>
											Order again
										</button>
									{:else}
										<button
											type="button"
											class="bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 w-full rounded-lg px-3 py-2 text-sm font-medium text-white focus:ring-4 focus:outline-none lg:w-auto"
										>
											Contact support
										</button>
									{/if}
									<a
										href="#"
										class="hover:text-primary-700 inline-flex w-full justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:z-10 focus:ring-4 focus:ring-gray-100 focus:outline-none lg:w-auto dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
									>
										View details
									</a>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Pagination -->
			{#if orders.length > 0 && totalPages > 1}
				<nav
					class="mt-6 flex items-center justify-center sm:mt-8"
					aria-label="Page navigation example"
				>
					<ul class="flex h-8 items-center -space-x-px text-sm">
						<li>
							<button
								class="dark:hover:text-white:disabled:opacity-50 ms-0 flex h-8 items-center justify-center rounded-s-lg border border-e-0 border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
								disabled={currentPage === 1}
								on:click={() => goToPage(currentPage - 1)}
							>
								<span class="sr-only">Previous</span>
								<svg
									class="h-4 w-4 rtl:rotate-180"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										stroke="currentColor"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="m15 19-7-7 7-7"
									/>
								</svg>
							</button>
						</li>

						{#each Array(totalPages) as _, i}
							{#if totalPages <= 5 || i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage + 1)}
								<li>
									<button
										class="flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white {i +
											1 ===
										currentPage
											? 'border-primary-300 bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 z-10 dark:border-gray-700 dark:bg-gray-700 dark:text-white'
											: ''}"
										class:z-10={i + 1 === currentPage}
										on:click={() => goToPage(i + 1)}
									>
										{i + 1}
									</button>
								</li>
							{:else if i === currentPage - 3 || i === currentPage + 2}
								<li>
									<span
										class="flex h-8 items-center justify-center border border-gray-300 bg-white px-3 leading-tight text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
										>...</span
									>
								</li>
							{/if}
						{/each}

						<li>
							<button
								class="dark:hover:text-white:disabled:opacity-50 flex h-8 items-center justify-center rounded-e-lg border border-gray-300 bg-white px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
								disabled={currentPage === totalPages}
								on:click={() => goToPage(currentPage + 1)}
							>
								<span class="sr-only">Next</span>
								<svg
									class="h-4 w-4 rtl:rotate-180"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										stroke="currentColor"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="m9 5 7 7-7 7"
									/>
								</svg>
							</button>
						</li>
					</ul>
				</nav>
			{/if}
		</div>
	</div>
</section>
