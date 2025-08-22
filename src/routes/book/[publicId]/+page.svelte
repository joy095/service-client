<script lang="ts">
	import SecureImage from '$lib/components/SecureImage.svelte';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import type { WorkingHour, Service, Business } from '$lib/types/index.js'; // Ensure these types are correct
	import { PUBLIC_IMAGE_URL, PUBLIC_API_URL } from '$env/static/public';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '@iconify/svelte';

	// --- DATA FROM SERVER ---
	export let data: {
		workingHours: WorkingHour[] | null;
		business: Business;
		services: Service[];
	};

	const { workingHours, business, services } = data;
	const publicId = $page.params.publicId; // Get publicId from page params
	const serviceId = $page.url.searchParams.get('service'); // Get serviceId from URL query

	// Determine the service to use
	const service = serviceId ? services.find((s) => s.id === serviceId) || services[0] : services[0];

	// --- STATE MANAGEMENT ---
	let value: DateValue | undefined = undefined;
	let minValue = today(getLocalTimeZone());
	let selectedTime: string | null = null;
	let showCalendar = false;

	// --- DERIVED DATA ---
	// Safe working hours fallback
	let safeWorkingHours: WorkingHour[] = [];
	$: safeWorkingHours = workingHours ?? [];

	// Map closed days (lowercase for comparison)
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

	// --- UNAVAILABLE TIMES FETCHING ---
	let unavailableTimes: { open_time: string; close_time: string }[] = [];
	let loadingUnavailable = false;

	async function fetchUnavailableTimes(date: DateValue) {
		if (!serviceId) {
			console.warn('fetchUnavailableTimes: serviceId is missing');
			unavailableTimes = [];
			loadingUnavailable = false;
			return;
		}

		const dateString = date.toString(); // YYYY-MM-DD
		unavailableTimes = [];
		loadingUnavailable = true;

		try {
			// --- CORRECTED URL ---
			// The Go backend route is: public.GET("/:service_id/unavailable-times", ...)
			// So the URL should be /public/business/:service_id/unavailable-times
			const response = await fetch(
				`${PUBLIC_API_URL}/public/business/${serviceId}/unavailable-times?date=${dateString}`
			);

			if (response.ok) {
				const result = await response.json();
				// Ensure result.times is an array
				unavailableTimes = Array.isArray(result.times) ? result.times : [];
				console.log('Unavailable times fetched:', unavailableTimes);
			} else {
				const errorText = await response.text();
				console.error(`Failed to fetch unavailable times (${response.status}):`, errorText);
				unavailableTimes = [];
			}
		} catch (err) {
			console.error('Error fetching unavailable times:', err);
			unavailableTimes = [];
		} finally {
			loadingUnavailable = false;
		}
	}

	// --- TIME PARSING LOGIC ---
	// Parses a "HH:mm:ss" or "HH:mm" string (representing business local time)
	// to a Date object for the specific selected date.
	function parseBusinessTimeStringToDate(timeStr: string, baseDate: Date): Date {
		console.log(`parseBusinessTimeStringToDate called with: '${timeStr}'`);

		// If full ISO string → just return parsed Date
		if (timeStr.includes('T')) {
			const isoDate = new Date(timeStr);
			if (isNaN(isoDate.getTime())) {
				console.error(`Invalid ISO datetime: ${timeStr}`);
				return new Date(NaN);
			}
			// Adjust to selected date but keep hours/minutes from ISO
			const result = new Date(baseDate);
			result.setHours(isoDate.getHours(), isoDate.getMinutes(), isoDate.getSeconds(), 0);
			return result;
		}

		// Fallback: parse as HH:mm or HH:mm:ss
		const parts = timeStr.split(':');
		if (parts.length < 2 || parts.length > 3) {
			console.error(`Invalid timeStr format '${timeStr}'. Expected HH:MM or HH:MM:SS.`);
			return new Date(NaN);
		}

		const hours = parseInt(parts[0], 10);
		const minutes = parseInt(parts[1], 10);
		const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

		const date = new Date(baseDate);
		date.setHours(hours, minutes, seconds, 0);
		return date;
	}

	// Parse full ISO datetime string (e.g., from API) to a JavaScript Date object.
	function parseTimeFromISO(dateTimeStr: string): Date {
		const date = new Date(dateTimeStr);
		if (isNaN(date.getTime())) {
			console.error(`Failed to parse ISO datetime string: ${dateTimeStr}`);
		}
		return date;
	}

	// Get day name from DateValue
	function getDayOfWeek(dateValue: DateValue): string {
		const dayIndex = dateValue.toDate(getLocalTimeZone()).getDay();
		return dayNameMap[dayIndex];
	}

	// --- AVAILABILITY CHECK ---
	function isSlotUnavailable(slotStart: Date, slotEnd: Date): boolean {
		// Check if slotStart/End are valid Dates
		if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime())) {
			console.warn('isSlotUnavailable received invalid date(s).');
			return true; // Treat invalid slots as unavailable
		}
		for (const ut of unavailableTimes) {
			try {
				const utStart = parseTimeFromISO(ut.open_time);
				const utEnd = parseTimeFromISO(ut.close_time);

				// Check if slot and unavailable time potentially overlap on the same day.
				const slotDateStr = slotStart.toDateString();
				const utDateStr = utStart.toDateString();

				if (slotDateStr === utDateStr) {
					// Check for overlap: (StartA < EndB) and (StartB < EndA)
					if (slotStart < utEnd && utStart < slotEnd) {
						console.log(`Slot ${slotStart} - ${slotEnd} overlaps with ${utStart} - ${utEnd}`);
						return true; // Overlap found
					}
				}
			} catch (e) {
				console.error('Error parsing unavailable time:', ut, e);
			}
		}
		return false; // No overlap found
	}

	// --- SLOT GENERATION ---
	interface TimeSlot {
		time: string;
		formatted: string;
		datetime: Date;
	}

	let selectedSlots: TimeSlot[] = [];
	const timeZone = getLocalTimeZone();

	// --- MAIN SLOT GENERATION LOGIC ---
	$: if (value && service?.duration && !loadingUnavailable) {
		console.log('Re-running slot generation logic...'); // Debug log
		selectedSlots = [];
		const day = getDayOfWeek(value);
		console.log(`Checking day: ${day}`); // Debug log
		const dayHours = safeWorkingHours.find((d) => d.dayOfWeek.toLowerCase() === day && !d.isClosed);
		console.log(`Found dayHours for ${day}:`, dayHours); // Debug log

		if (dayHours) {
			const interval = 15; // 15-minute intervals
			const serviceDuration = service.duration; // in minutes

			const selectedDate = value.toDate(timeZone);
			console.log(`Selected date for ${day}:`, selectedDate); // Debug log

			// --- ADD DEBUG LOGS BEFORE PARSING ---
			console.log(`Raw openTime string for ${day}:`, dayHours.openTime);
			console.log(`Raw closeTime string for ${day}:`, dayHours.closeTime);

			const openTime = parseBusinessTimeStringToDate(dayHours.openTime, selectedDate);
			const closeTime = parseBusinessTimeStringToDate(dayHours.closeTime, selectedDate);

			// --- CHECK IF PARSING SUCCEEDED ---
			if (isNaN(openTime.getTime()) || isNaN(closeTime.getTime())) {
				console.error(
					`Failed to parse times for ${day}. Open: ${dayHours.openTime} (${openTime}), Close: ${dayHours.closeTime} (${closeTime})`
				);
				// selectedSlots remains empty
			} else {
				console.log(`Generating slots for ${day}: Open ${openTime}, Close ${closeTime}`);

				const latestValidStart = new Date(closeTime.getTime() - serviceDuration * 60000);
				let current = new Date(openTime);

				const now = new Date();
				if (selectedDate.toDateString() === now.toDateString()) {
					const earliestToday = new Date(now.getTime() + 30 * 60000);
					if (current < earliestToday) {
						const intervalMs = interval * 60000;
						const nextIntervalStart = new Date(
							Math.ceil(earliestToday.getTime() / intervalMs) * intervalMs
						);
						current = nextIntervalStart;
						console.log('Adjusted start time for today:', current);
					}
				}

				while (current <= latestValidStart) {
					const slotEnd = new Date(current.getTime() + serviceDuration * 60000);

					if (!isSlotUnavailable(current, slotEnd)) {
						selectedSlots.push({
							time: `${String(current.getHours()).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`,
							formatted: current.toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit',
								timeZone: timeZone
							}),
							datetime: new Date(current)
						});
					} else {
						console.log('Skipping unavailable slot:', current);
					}
					current = new Date(current.getTime() + interval * 60000);
				}
				console.log('Generated slots:', selectedSlots);
			}
		} else {
			console.log(`No working hours found for ${day} or day is closed.`);
		}
	} else if (!value) {
		selectedSlots = [];
	}

	// --- FETCH UNAVAILABLE TIMES ON DATE CHANGE ---
	$: if (value && !isDateDisabled(value)) {
		fetchUnavailableTimes(value);
		selectedTime = null;
	}

	// --- CALENDAR LOGIC ---
	function isDateDisabled(date: DateValue): boolean {
		const dayIndex = date.toDate(timeZone).getDay();
		const dayName = dayNameMap[dayIndex];
		return date.compare(minValue) < 0 || closedDays.has(dayName);
	}

	// --- FORMATTING HELPERS ---
	function formatDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		if (hours > 0 && mins > 0) {
			return `${hours}h ${mins}m`;
		} else if (hours > 0) {
			return `${hours}h`;
		} else {
			return `${mins}m`;
		}
	}

	function formatDateForURL(dateValue: DateValue): string {
		return dateValue.toString();
	}

	// --- BOOKING LOGIC ---
	function confirmBooking() {
		if (!value || !selectedTime || !serviceId) {
			console.warn('Cannot confirm booking: Missing date, time, or service.');
			return;
		}

		const selectedDate = formatDateForURL(value);
		const selectedSlot = selectedSlots.find((slot) => slot.formatted === selectedTime);

		if (!selectedSlot) {
			console.error('Selected time slot not found in generated slots.');
			return;
		}

		const bookingParams = new URLSearchParams({
			date: selectedDate,
			time: selectedSlot.time,
			service: serviceId
		});

		goto(`/book/${publicId}/pay?${bookingParams.toString()}`);
	}

	function selectTime(slot: TimeSlot) {
		selectedTime = slot.formatted;
		console.log('Selected time:', selectedTime);
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
				<!-- Ensure business.images exists and has at least one element -->
				{#if business?.images?.[0]?.objectName}
					<SecureImage
						src="{PUBLIC_IMAGE_URL}/{business.images[0].objectName}"
						alt="Provider"
						height={180}
						width={220}
						className="border-accent mb-4 h-24 w-24 rounded-full border-4 object-cover"
					/>
				{/if}
				<div class="barber-name mb-1 text-xl font-bold">{business?.name || 'Business Name'}</div>
				<div class="rating text-accent mb-2 text-lg">★★★★★</div>
				<p class="text-sm text-gray-600">
					Service provided by {business?.name || 'Business Name'}.
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
					{:else if value && selectedSlots.length > 0}
						<!-- Display slots only if a date is selected and slots were generated -->
						{#each selectedSlots as slot (slot.time)}
							<!-- Check availability again, just in case -->
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
									aria-pressed={selectedTime === slot.formatted}
								>
									{slot.formatted}
								</button>
							{/if}
						{/each}
					{:else if value && !loadingUnavailable}
						<!-- Date selected, but no slots generated (e.g., closed, no valid times) -->
						<div class="flex items-center justify-center py-8">
							<span class="text-sm text-gray-500">No available slots for this date.</span>
						</div>
					{:else}
						<!-- No date selected -->
						<div class="flex items-center justify-center py-8">
							<span class="text-sm text-gray-500">Please select a date first.</span>
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
