<script>
	import { getUserBookings, cancelBooking } from '$lib/api';
	import { onMount } from 'svelte';
	let bookings = [];

	onMount(async () => {
		try {
			const { data } = await getUserBookings();
			bookings = data;
		} catch (err) {
			console.error(err);
		}
	});

	async function handleCancel(id) {
		try {
			await cancelBooking(id);
			bookings = bookings.filter((booking) => booking.id !== id);
		} catch (err) {
			console.error(err);
		}
	}
</script>

<section class="mx-auto max-w-4xl px-4 py-16">
	<h2 class="font-display mb-8 text-center text-4xl">Your Bookings</h2>
	{#if bookings.length === 0}
		<p class="text-center text-gray-600">No bookings found.</p>
	{:else}
		<div class="space-y-6">
			{#each bookings as booking}
				<div
					class="flex items-center justify-between rounded-xl bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
				>
					<div>
						<p class="text-lg font-semibold">{booking.service_name}</p>
						<p class="text-gray-600">
							{new Date(booking.appointment_time).toLocaleString()}
						</p>
						<p class="text-sm text-gray-500">Status: {booking.status}</p>
					</div>
					<button
						on:click={() => handleCancel(booking.id)}
						class="font-semibold text-red-500 hover:text-red-700"
					>
						Cancel
					</button>
				</div>
			{/each}
		</div>
	{/if}
</section>
