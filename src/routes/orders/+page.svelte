<script lang="ts">
	import BookingCard from '$lib/components/BookingCard.svelte';
	export let data: { bookings: any[] };

	// Safely extract the bookings array
	const bookings = data?.bookings || [];

	const normalizedBookings = bookings.map(mapBooking);

	function mapBooking(apiBooking: any) {
		return {
			id: apiBooking.id,
			objectName: apiBooking.objectName ?? null,
			serviceName: apiBooking.serviceName ?? 'Unknown Service',
			amount: apiBooking.amount,
			status: apiBooking.status === 'pending' ? 'Pending' : 'Paid',
			dateOfBook: apiBooking.dateOfBook ?? '23rd March 2025',
		};
	}
</script>

<section class="relative py-24">
	<div class="container">
		<div class="w-full px-3 min-[400px]:px-6">
			{#if normalizedBookings.length > 0}
				{#each normalizedBookings as booking}
					<BookingCard {booking} />
				{/each}
			{:else}
				<p class="text-center text-gray-500">No bookings found.</p>
			{/if}
		</div>
	</div>
</section>
