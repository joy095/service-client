<script lang="ts">
	import SecureImage from '$lib/components/SecureImage.svelte';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import type { WorkingHour, Service, Business } from '$lib/types/index.js';
	import { PUBLIC_IMAGE_URL, PUBLIC_API_URL } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	// Route params
	let publicId = $page.params.publicId;
	let serviceId = $page.url.searchParams.get('service');

	interface TimeSlot {
		time: string;
		formatted: string;
		datetime: Date; // Add full datetime for better comparison
	}

	// Data from parent (e.g., +page.server.js)
	export let data: {
		workingHours: WorkingHour[] | null;
		business: Business;
		services: Service[];
	};

	const { workingHours, business, services } = data;
	const service = serviceId ? services.find((s) => s.id === serviceId) || services[0] : services[0];

	// Calendar & booking state
	let value: DateValue | undefined = undefined;
	let minValue = today(getLocalTimeZone()).add({ days: 1 });
	let selectedTime: string | null = null;
	let showCalendar = false;

	// Safe working hours fallback
	let safeWorkingHours: WorkingHour[] = [];
	$: safeWorkingHours = workingHours ?? [];

	// Map closed days
	$: closedDays = new Set(
		safeWorkingHours.filter((d) => d.isClosed).map((d) => d.dayOfWeek.toLowerCase())
	);

	// Day name mapping (0 = Sunday)
	const dayNameMap: Record<number, string> = {
		0: 'sunday',
		1: 'monday',
		2: 'tuesday',
		3: 'wednesday',
		4: 'thursday',
		5: 'friday',
		6: 'saturday'
	};

	// API state
	let unavailableTimes: { open_time: string; close_time: string }[] = [];
	let loadingUnavailable = false;

	// Fetch unavailable times (bookings, breaks, etc.)
	async function fetchUnavailableTimes(date: DateValue) {
		const dateString = date.toString();
		const businessId = business.id;

		unavailableTimes = [];
		loadingUnavailable = true;

		try {
			const response = await fetch(
				`${PUBLIC_API_URL}/public/business/${businessId}/unavailable-times?date=${dateString}`
			);

			if (response.ok) {
				const result = await response.json();
				unavailableTimes = Array.isArray(result.times) ? result.times : [];
			} else {
				unavailableTimes = [];
			}
		} catch (err) {
			console.error(' Error fetching unavailable times:', err);
			unavailableTimes = [];
		} finally {
			loadingUnavailable = false;
		}
	}

	// Parse "HH:mm" string to Date (on specific date) - KEEP TIMES IN LOCAL
	function parseTimeToDate(timeStr: string, baseDate: Date): Date {
		const [hours, minutes] = timeStr.split(':').map(Number);
		const date = new Date(baseDate);
		date.setUTCHours(hours, minutes, 0, 0);
		return date;
	}

	// Parse full ISO datetime (e.g., "2025-09-10T14:30:00+05:30")
	function parseTimeFromISO(dateTimeStr: string): Date {
		return new Date(dateTimeStr);
	}

	// Get day name from DateValue
	function getDayOfWeek(dateValue: DateValue): string {
		const dayIndex = dateValue.toDate(getLocalTimeZone()).getDay();
		return dayNameMap[dayIndex];
	}

	// Check if a time slot overlaps with any unavailable period
	function isSlotUnavailable(slotStart: Date, slotEnd: Date): boolean {
		for (const ut of unavailableTimes) {
			const utStart = parseTimeFromISO(ut.open_time);
			const utEnd = parseTimeFromISO(ut.close_time);

			// Only compare if it's the same date
			if (slotStart.toDateString() === utStart.toDateString()) {
				// Check if there's any overlap between slot and unavailable time
				if (slotStart < utEnd && slotEnd > utStart) {
					return true;
				}
			}
		}
		return false;
	}

	// Generate available time slots
	let selectedSlots: TimeSlot[] = [];

	$: if (value && service?.duration && !loadingUnavailable) {
		selectedSlots = [];
		const day = getDayOfWeek(value);
		const dayHours = safeWorkingHours.find((d) => d.dayOfWeek.toLowerCase() === day && !d.isClosed);

		if (dayHours) {
			const interval = 15; // 15-minute intervals
			const serviceDuration = service.duration;

			const selectedDate = value.toDate(getLocalTimeZone());

			const openTime = parseTimeToDate(dayHours.openTime, selectedDate);
			const closeTime = parseTimeToDate(dayHours.closeTime, selectedDate);

			// Service must end before closing time
			const latestValidStart = new Date(closeTime.getTime() - serviceDuration * 60000);

			let current = new Date(openTime);

			// Ensure we don't book in the past
			const now = new Date();
			if (selectedDate.toDateString() === now.toDateString()) {
				// If it's today, start from current time + buffer (e.g., 30 minutes)
				const earliestToday = new Date(now.getTime() + 30 * 60000);
				if (current < earliestToday) {
					// Round up to next interval
					const nextInterval =
						Math.ceil(earliestToday.getTime() / (interval * 60000)) * (interval * 60000);
					current = new Date(nextInterval);
				}
			}

			while (current <= latestValidStart) {
				const slotEnd = new Date(current.getTime() + serviceDuration * 60000);

				// Check if this slot is available (not overlapping with unavailable times)
				if (!isSlotUnavailable(current, slotEnd)) {
					selectedSlots.push({
						time: `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`,
						formatted: current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
						datetime: new Date(current)
					});
				}

				current = new Date(current.getTime() + interval * 60000);
			}
		}
	}

	// Fetch unavailable times when date changes
	$: if (value && !isDateDisabled(value)) {
		fetchUnavailableTimes(value);
		selectedTime = null; // Reset time selection
	}

	// Disable past and closed days in calendar
	function isDateDisabled(date: DateValue): boolean {
		const dayIndex = date.toDate(getLocalTimeZone()).getDay();
		const dayName = dayNameMap[dayIndex];
		return date.compare(minValue) < 0 || closedDays.has(dayName);
	}

	// Format service duration
	function formatDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}

	// Format date for URL
	function formatDateForURL(dateValue: DateValue): string {
		return dateValue.toString(); // Returns YYYY-MM-DD format
	}

	// Confirm booking and navigate with URL parameters
	function confirmBooking() {
		if (!value || !selectedTime) {
			return;
		}

		const selectedDate = formatDateForURL(value);
		const selectedSlot = selectedSlots.find((slot) => slot.formatted === selectedTime);

		if (!serviceId) {
			return;
		}

		// Create URL with date and time parameters
		const bookingParams = new URLSearchParams({
			date: selectedDate,
			time: selectedSlot.time, // HH:mm format
			service: serviceId
		});

		goto(`/book/${publicId}/pay?${bookingParams.toString()}`);
	}

	// Handle time selection
	function selectTime(slot: TimeSlot) {
		selectedTime = slot.formatted;
	}
</script>

<!-- PAGE LAYOUT -->
<div class="container mx-auto mt-10 px-4">
	<div class="page-wrapper grid grid-cols-1 gap-8 md:grid-cols-3">
		<!-- Service Details -->
		<div class="service-card col-span-2 overflow-hidden rounded-2xl bg-white shadow-xl">
			{#if service?.objectName}
				<SecureImage
					src="{PUBLIC_IMAGE_URL}/{service.objectName}"
					alt={service?.name}
					height={400}
					className="w-full h-72 object-cover"
				/>
			{/if}
			<div class="service-content p-6">
				<div class="service-title mb-4 text-3xl font-bold">{service?.name}</div>
				<div class="service-meta mb-4 flex gap-6 text-sm text-gray-600">
					<span class="flex items-center gap-1">⏱ {formatDuration(service?.duration || 0)}</span>
					<span class="flex items-center gap-1">💰 ₹{service?.price || 'N/A'}</span>
				</div>
				<div class="price text-primary mb-4 text-2xl font-bold">₹{service?.price || 'N/A'}</div>
				<p class="text-gray-700">
					{service?.description || 'No description available.'}
				</p>
			</div>
		</div>

		<!-- Sidebar -->
		<div class="sidebar flex flex-col gap-6 md:sticky md:top-10 md:self-start">
			<div
				class="barber-card flex flex-col items-center rounded-2xl bg-white p-6 text-center shadow-xl"
			>
				<SecureImage
					src="{PUBLIC_IMAGE_URL}/{business.images[0].objectName}"
					alt="Provider"
					height={180}
					width={220}
					className="border-accent mb-4 h-24 w-24 rounded-full border-4 object-cover"
				/>
				<div class="barber-name mb-1 text-xl font-bold">{business.name}</div>
				<div class="rating text-accent mb-2 text-lg">★★★★★</div>
				<p class="text-sm text-gray-600">
					Service provided by {business.name}.
				</p>
			</div>

			<div class="booking-widget rounded-2xl bg-white p-6 shadow-xl">
				{#if selectedTime && value}
					<div
						class="selected-info mb-4 flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100"
						on:keydown={(e) => e.key === 'Enter' && (showCalendar = true)}
						role="button"
						tabindex="0"
						aria-label="Edit selected date and time"
					>
						<div class="flex flex-col">
							<span class="font-medium">
								{value.toDate(getLocalTimeZone()).toLocaleDateString()}
							</span>
							<span class="text-sm text-gray-600">at {selectedTime}</span>
						</div>
						<span class="edit text-primary font-medium">Edit</span>
					</div>
				{/if}

				<button
					on:click={() => {
						if (selectedTime && value) {
							confirmBooking();
						} else {
							showCalendar = true;
						}
					}}
					class="bg-primary hover:bg-accent hover:text-primary w-full cursor-pointer rounded-lg py-3 font-medium text-white transition duration-300"
					disabled={loadingUnavailable}
				>
					{loadingUnavailable ? 'Loading...' : selectedTime ? 'Reserve' : 'Check Availability'}
				</button>
			</div>
		</div>
	</div>
</div>

<!-- CALENDAR MODAL -->
{#if showCalendar}
	<div
		class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/20"
		on:keydown={(e) => e.key === 'Escape' && (showCalendar = false)}
		role="dialog"
		aria-modal="true"
		aria-label="Date and time selection"
	>
		<div
			class="modal-calendar relative mx-4 flex w-full max-w-fit flex-col gap-8 rounded-2xl bg-white p-8 shadow-2xl md:mx-0 md:flex-row"
			on:click|stopPropagation
		>
			<!-- Close Button -->
			<button
				class="close-btn absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-2xl text-gray-500 hover:bg-gray-200"
				on:click={() => (showCalendar = false)}
			>
				<Icon icon="material-symbols:close-rounded" width="24" height="24" />
			</button>

			<!-- Calendar -->
			<div class="dates">
				<h3 class="mb-4 text-2xl font-bold">Select Date</h3>
				<Calendar type="single" bind:value {minValue} {isDateDisabled} />
			</div>

			<!-- Time Slots -->
			<div class="time-slots flex min-w-40 flex-col gap-2">
				<h3 class="mb-4 text-2xl font-bold">Select Time</h3>
				<div class="flex max-h-[19.3rem] flex-col gap-2 overflow-auto">
					{#if loadingUnavailable}
						<div class="flex items-center justify-center py-8">
							<span class="text-sm text-gray-500">Checking availability...</span>
						</div>
					{:else if selectedSlots.length > 0}
						{#each selectedSlots as slot (slot.time)}
							{#if isSlotUnavailable(slot.datetime, new Date(slot.datetime.getTime() + service.duration * 60000))}
								<button
									disabled
									class="cursor-not-allowed rounded-lg border border-gray-300 bg-gray-200 px-4 py-2 text-sm opacity-60"
									aria-disabled="true"
								>
									{slot.formatted}
								</button>
							{:else}
								<button
									on:click={() => selectTime(slot)}
									class="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm transition duration-300 hover:bg-gray-100 {selectedTime ===
									slot.formatted
										? 'bg-primary border-primary hover:bg-primary text-white'
										: ''}"
								>
									{slot.formatted}
								</button>
							{/if}
						{/each}
					{:else if value}
						<div class="flex items-center justify-center py-8">
							<span class="text-sm text-gray-500">No available slots for this date</span>
						</div>
					{:else}
						<div class="flex items-center justify-center py-8">
							<span class="text-sm text-gray-500">Please select a date first</span>
						</div>
					{/if}
				</div>

				{#if selectedTime}
					<button
						on:click={() => {
							showCalendar = false;
							// Optional: Auto-proceed to booking
							// confirmBooking();
						}}
						class="bg-primary hover:bg-accent hover:text-primary mt-4 w-full rounded-lg py-2 text-sm font-medium text-white transition duration-300"
					>
						Confirm Selection
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- STYLES -->
<style>
	.container {
		max-width: 1200px;
	}

	.bg-primary {
		background-color: #000000;
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
