<script>
	import { getServices, bookAppointment } from '$lib/api';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	let services = [];
	let selectedService = '';
	let appointmentTime = '';
	let error = '';
	let loading = false;

	onMount(async () => {
		const { data } = await getServices();
		services = data;
	});

	async function handleBooking() {
		loading = true;
		try {
			await bookAppointment({
				service_id: selectedService,
				appointment_time: appointmentTime
			});
			goto('/profile');
		} catch (err) {
			error = err.response?.data?.message || 'Failed to book appointment';
		} finally {
			loading = false;
		}
	}
</script>

<section class="bg-secondary mx-auto max-w-lg px-4 py-16">
	<h2 class="font-family-custom text-neutral mb-8 text-center text-3xl">Book Your Appointment</h2>
	{#if error}
		<p class="font-body mb-6 text-center text-red-500">{error}</p>
	{/if}
	<form on:submit|preventDefault={handleBooking} class="card space-y-6">
		<div>
			<label for="service" class="text-neutral font-family-custom block text-sm font-medium"
				>Service</label
			>
			<select
				bind:value={selectedService}
				id="service"
				class="focus:ring-accent focus:border-accent font-body mt-1 w-full rounded-xl border border-gray-300 p-3"
				required
			>
				<option value="">Select a service</option>
				{#each services as service}
					<option value={service.id}>{service.name} (${service.price})</option>
				{/each}
			</select>
		</div>
		<div>
			<label for="datetime" class="text-neutral font-family-custom block text-sm font-medium"
				>Date & Time</label
			>
			<input
				type="datetime-local"
				id="datetime"
				bind:value={appointmentTime}
				class="focus:ring-accent focus:border-accent font-body mt-1 w-full rounded-xl border border-gray-300 p-3"
				required
			/>
		</div>
		<button
			type="submit"
			class="btn-primary flex w-full items-center justify-center"
			disabled={loading}
		>
			{#if loading}
				<svg class="text-primary mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0l-3 3 3 3V4a8 8 0 108 8z"
					></path>
				</svg>
			{/if}
			Book Appointment
		</button>
	</form>
</section>
