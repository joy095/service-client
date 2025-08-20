<script lang="ts">
	import SecureImage from '$lib/components/SecureImage.svelte';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { getLocalTimeZone, today } from '@internationalized/date';

	let value = today(getLocalTimeZone());
	let selectedTime: string | null = null;
	let showCalendar = false;

	function confirmBooking() {
		console.log('Booking confirmed for', value.toString(), selectedTime);
		// Add actual booking logic here
	}
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Barber Booking Checkout</title>
</svelte:head>

<div class="container mx-auto mt-10 px-4">
	<div class="page-wrapper grid grid-cols-1 gap-8 md:grid-cols-3">
		<!-- Service Details -->
		<div class="service-card col-span-2 overflow-hidden rounded-2xl bg-white shadow-xl">
			<SecureImage
				src="https://img.freepik.com/free-photo/young-man-barbershop-trimming-hair_1303-26254.jpg?t=st=1754919823~exp=1754923423~hmac=5fdbc2c5947a451f44b0f3acaa0542594d4d96e64437a142abc63d5827a82dee&w=1060"
				alt="Haircut Service"
				height={400}
				className="w-full h-72 object-cover"
			/>
			<div class="service-content p-6">
				<div class="service-title mb-4 text-3xl font-bold">Premium Men's Haircut</div>
				<div class="service-meta mb-4 flex gap-6 text-sm text-gray-600">
					<span class="flex items-center gap-1">⏱ 45 mins</span>
					<span class="flex items-center gap-1">💰 $30</span>
				</div>
				<div class="price text-primary mb-4 text-2xl font-bold">$30.00</div>
				<p class="text-gray-700">
					Experience a luxury grooming session with precision styling, shampoo, and a relaxing
					finish.
				</p>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="sidebar flex flex-col gap-6 md:sticky md:top-10 md:self-start">
			<div
				class="barber-card flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-xl"
			>
				<SecureImage
					src="https://images.unsplash.com/photo-1607746882042-944635dfe10e"
					alt="Barber"
					height={180}
					width={220}
					className="h-24 w-24 rounded-full object-cover mb-4 border-4 border-accent"
				/>
				<div class="barber-name mb-1 text-xl font-bold">Jeremy Philips</div>
				<div class="rating text-accent mb-2 text-lg">★★★★★</div>
				<p class="text-sm text-gray-600">
					Specialist in modern styles and classic cuts with 10+ years experience.
				</p>
			</div>
			<div class="booking-widget rounded-2xl bg-white p-6 shadow-xl">
				{#if selectedTime}
					<div
						class="selected-info mb-4 flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100"
						on:click={() => (showCalendar = true)}
					>
						<span
							>Selected: {value.toDate(getLocalTimeZone()).toLocaleDateString()} at {selectedTime}</span
						>
						<span class="edit text-primary font-medium">Edit</span>
					</div>
				{/if}

				<button
					on:click={() => {
						if (selectedTime) {
							confirmBooking();
						} else {
							showCalendar = true;
						}
					}}
					class="cursor-pointer bg-primary hover:bg-accent hover:text-primary w-full rounded-lg py-3 font-medium text-white transition duration-300"
				>
					{selectedTime ? 'Reserve' : 'Check Availability'}
				</button>
			</div>
		</div>
	</div>
</div>

{#if showCalendar}
	<div
		class="modal-overlay bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/20"
		on:click={() => (showCalendar = false)}
	>
		<div
			class="modal-calendar relative mx-4 flex w-full max-w-fit flex-col gap-8 rounded-2xl bg-white p-8 shadow-2xl md:mx-0 md:flex-row"
			on:click|stopPropagation
		>
			<button
				class="close-btn absolute top-4 right-4 text-2xl text-gray-500 hover:text-gray-700"
				on:click={() => (showCalendar = false)}>×</button
			>
			<div class="dates">
				<h3 class="mb-4 text-2xl font-bold">Select Date</h3>
				<Calendar
					type="single"
					bind:value
					captionLayout="dropdown"
					class="rounded-lg border border-gray-200 shadow-sm"
					on:change={() => {
						if (selectedTime) showCalendar = false;
					}}
				/>
			</div>

			<!-- Time Picker -->
			<div class="time-slots flex min-w-40 flex-col gap-2">
				<h3 class="mb-4 text-2xl font-bold">Select Time</h3>
				<button
					on:click={() => {
						selectedTime = '09:00 AM';
						if (value) showCalendar = false;
					}}
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 transition duration-300 hover:bg-gray-100 {selectedTime ===
					'09:00 AM'
						? 'bg-primary border-primary text-white'
						: ''}">09:00 AM</button
				>
				<button
					on:click={() => {
						selectedTime = '10:30 AM';
						if (value) showCalendar = false;
					}}
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 transition duration-300 hover:bg-gray-100 {selectedTime ===
					'10:30 AM'
						? 'bg-primary border-primary text-white'
						: ''}">10:30 AM</button
				>
				<button
					on:click={() => {
						selectedTime = '12:00 PM';
						if (value) showCalendar = false;
					}}
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 transition duration-300 hover:bg-gray-100 {selectedTime ===
					'12:00 PM'
						? 'bg-primary border-primary text-white'
						: ''}">12:00 PM</button
				>
				<button
					on:click={() => {
						selectedTime = '02:00 PM';
						if (value) showCalendar = false;
					}}
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 transition duration-300 hover:bg-gray-100 {selectedTime ===
					'02:00 PM'
						? 'bg-primary border-primary text-white'
						: ''}">02:00 PM</button
				>
				<button
					on:click={() => {
						selectedTime = '04:00 PM';
						if (value) showCalendar = false;
					}}
					class="rounded-lg border border-gray-300 bg-white px-4 py-2 transition duration-300 hover:bg-gray-100 {selectedTime ===
					'04:00 PM'
						? 'bg-primary border-primary text-white'
						: ''}">04:00 PM</button
				>
			</div>
		</div>
	</div>
{/if}

<style>
	.container {
		max-width: 1200px;
	}
	.primary {
		color: #000000;
	}
	.accent {
		color: #c9a96e;
	}
	.bg-primary {
		background-color: #000000;
	}
	.bg-accent {
		background-color: #c9a96e;
	}
	.border-accent {
		border-color: #c9a96e;
	}
	.text-primary {
		color: #000000;
	}
	.text-accent {
		color: #c9a96e;
	}
	.border-primary {
		border-color: #000000;
	}
	.hover\:bg-accent:hover {
		background-color: #c9a96e;
	}
	.hover\:text-primary:hover {
		color: #000000;
	}
	@media (max-width: 768px) {
		.modal-calendar {
			flex-direction: column;
		}
	}
</style>
