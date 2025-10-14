<script lang="ts">
	import type { User } from '$lib/types';
	import { onMount } from 'svelte';

	export let data: { bookings: any[]; user: User | null };
	let user = data.user;

	const bookings = data?.bookings || [];

	const normalizedBookings = bookings.map(mapBooking);

	function mapBooking(apiBooking: any) {
		return {
			id: apiBooking.id,
			objectName: apiBooking.objectName ?? null,
			serviceName: apiBooking.serviceName ?? 'Unknown Service',
			amount: apiBooking.amount,
			status: apiBooking.status === 'pending' ? 'Pending' : 'Paid',
			createdAt: apiBooking.createdAt ?? '23rd March 2025'
		};
	}

	let visibleCount = 5;
	let observer: IntersectionObserver;
	let isLoading = false;

	// dynamically loaded components
	let BookingCard: typeof import('$lib/components/BookingCard.svelte').default | null = null;
	let LoadingSpinner: typeof import('$lib/components/LoadingSpinner.svelte').default | null = null;

	let bookingCardLoaded = false;
	let spinnerLoaded = false;

	async function loadBookingCard() {
		if (!bookingCardLoaded) {
			const module = await import('$lib/components/BookingCard.svelte');
			BookingCard = module.default;
			bookingCardLoaded = true;
		}
	}

	async function loadSpinner() {
		if (!spinnerLoaded) {
			const module = await import('$lib/components/LoadingSpinner.svelte');
			LoadingSpinner = module.default;
			spinnerLoaded = true;
		}
	}

	function observeLastCard(node: HTMLElement, p0: boolean) {
		if (!node) return;
		if (observer) observer.disconnect();

		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoading) {
					loadMore();
				}
			},
			{ rootMargin: '100px' }
		);

		observer.observe(node);
	}

	async function loadMore() {
		if (visibleCount >= normalizedBookings.length) return;

		isLoading = true;
		await loadSpinner();
		await new Promise((r) => setTimeout(r, 800));
		visibleCount = Math.min(visibleCount + 5, normalizedBookings.length);
		isLoading = false;
	}

	onMount(() => {
		(async () => {
			if (normalizedBookings.length > 0) await loadBookingCard(); // lazy load only when used
		})();
		return () => observer && observer.disconnect();
	});
</script>

<section class="relative py-24">
	<div class="container">
		<div class="w-full space-y-6 px-3 min-[400px]:px-6">
			{#if user}
				<h1 class="mb-12 text-4xl leading-tight font-semibold">{user.firstName} your bookings</h1>
			{/if}

			{#if normalizedBookings.length > 0}
				{#if BookingCard}
					{#each normalizedBookings.slice(0, visibleCount) as booking, i (booking.id)}
						<div
							use:observeLastCard={i === visibleCount - 1 &&
								visibleCount < normalizedBookings.length}
							class="animate-fadeIn transition-transform duration-500 ease-out"
						>
							<svelte:component this={BookingCard} {booking} />
						</div>
					{/each}
				{:else if LoadingSpinner}
					<div class="mt-10 flex justify-center">
						<svelte:component this={LoadingSpinner} variant="ring" size="lg" />
					</div>
				{:else}
					<p class="text-center text-gray-500">Loading bookings...</p>
				{/if}

				{#if isLoading && LoadingSpinner}
					<div class="mt-10 flex justify-center">
						<svelte:component
							this={LoadingSpinner}
							variant="ring"
							size="lg"
							className="text-yellow-600"
						/>
					</div>
				{/if}
			{:else}
				<p class="text-center text-gray-500">No bookings found.</p>
			{/if}
		</div>
	</div>
</section>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.animate-fadeIn {
		animation: fadeIn 0.5s ease-out;
	}
</style>
