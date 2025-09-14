<script lang="ts">
	import SecureImage from '$lib/components/SecureImage.svelte';
	import Calendar from '$lib/components/ui/calendar/calendar.svelte';
	import {
		getLocalTimeZone,
		today,
		parseAbsoluteToLocal,
		type DateValue
	} from '@internationalized/date';
	import type { WorkingHour, Service, Business } from '$lib/types/index.js';
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
	const publicId = $page.params.publicId;
	const serviceId = $page.url.searchParams.get('service');
	const dateFromUrl = $page.url.searchParams.get('date');
	const timeFromUrl = $page.url.searchParams.get('time');
	const service = serviceId ? services.find((s) => s.id === serviceId) || services[0] : services[0];

	const tz = getLocalTimeZone();
	let value: DateValue | undefined = dateFromUrl ? parseDateFromString(dateFromUrl) : undefined;
	let minValue = today(tz).add({ days: 1 });
	let maxValue = today(tz).add({ months: 3 });
	let selectedTime: string | null = null;
	let showCalendar = false;
	let unavailableTimes: { open_time: string; close_time: string }[] = [];
	let loadingUnavailable = false;
	let errorMessage: string | null = null;
	let isBooking = false;

	// --- DERIVED DATA ---
	let safeWorkingHours: WorkingHour[] = [];
	$: safeWorkingHours = workingHours ?? [];
	$: closedDays = new Set(
		safeWorkingHours.filter((d) => d.isClosed).map((d) => d.dayOfWeek.toLowerCase())
	);

	// Initialize and validate time slot from URL
	$: if (timeFromUrl && value && selectedSlots.length > 0 && !selectedTime) {
		const decodedTime = decodeURIComponent(timeFromUrl); // e.g., "09:30" or "9:30 AM"
		console.log('Decoded time from URL:', decodedTime);
		const matchingSlot = selectedSlots.find(
			(slot) => slot.time === decodedTime || slot.formatted === decodedTime
		);
		console.log('Matching slot from URL:', matchingSlot);
		if (
			matchingSlot &&
			!isSlotUnavailable(
				matchingSlot.datetime,
				new Date(matchingSlot.datetime.getTime() + (service?.duration || 30) * 60000)
			)
		) {
			selectedTime = matchingSlot.formatted; // Set to formatted time (e.g., "9:30 AM")
			console.log('Time slot set from URL:', selectedTime);
			showCalendar = false; // Close calendar if valid slot is set
		} else {
			selectedTime = null;
			errorMessage =
				'The time slot from the URL is invalid or unavailable. Please select a new time.';
			showCalendar = true; // Show calendar to allow user to pick a new time
		}
	} else if (!timeFromUrl && !selectedTime) {
		selectedTime = null;
		showCalendar = true; // Show calendar if no time is provided
	}

	const dayNameMap: Record<number, string> = {
		0: 'sunday',
		1: 'monday',
		2: 'tuesday',
		3: 'wednesday',
		4: 'thursday',
		5: 'friday',
		6: 'saturday'
	};

	// --- HELPER FUNCTIONS ---
	function parseDateFromString(dateStr: string): DateValue {
		try {
			return parseAbsoluteToLocal(`${dateStr}T00:00:00Z`);
		} catch (e) {
			console.error('Failed to parse date from URL:', dateStr, e);
			return today(tz).add({ days: 1 });
		}
	}

	function parseBusinessTimeStringToDate(timeStr: string, baseDate: Date): Date {
		console.log('Parsing time string:', timeStr, 'Base date:', baseDate);
		if (timeStr.includes('T')) {
			const isoDate = new Date(timeStr);
			console.log('Parsed ISO date:', isoDate);
			if (isNaN(isoDate.getTime())) {
				console.error(`Invalid ISO datetime: ${timeStr}`);
				return new Date(NaN);
			}
			const result = new Date(baseDate);
			result.setHours(isoDate.getHours(), isoDate.getMinutes(), isoDate.getSeconds(), 0);
			console.log('Resulting date:', result);
			return result;
		}

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

	function parseTimeFromISO(dateTimeStr: string): Date {
		const date = new Date(dateTimeStr);
		if (isNaN(date.getTime())) {
			console.error(`Failed to parse ISO datetime string: ${dateTimeStr}`);
		}
		return date;
	}

	function getDayOfWeek(dateValue: DateValue): string {
		const dayIndex = dateValue.toDate(getLocalTimeZone()).getDay();
		return dayNameMap[dayIndex];
	}

	function isSlotUnavailable(slotStart: Date, slotEnd: Date): boolean {
		if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime())) {
			console.warn('isSlotUnavailable received invalid date(s).');
			return true;
		}
		for (const ut of unavailableTimes) {
			try {
				const utStart = parseTimeFromISO(ut.open_time);
				const utEnd = parseTimeFromISO(ut.close_time);
				const slotDateStr = slotStart.toDateString();
				const utDateStr = utStart.toDateString();

				if (slotDateStr === utDateStr) {
					if (slotStart < utEnd && utStart < slotEnd) {
						console.log(`Slot ${slotStart} - ${slotEnd} overlaps with ${utStart} - ${utEnd}`);
						return true;
					}
				}
			} catch (e) {
				console.error('Error parsing unavailable time:', ut, e);
			}
		}
		return false;
	}

	// --- SLOT GENERATION ---
	interface TimeSlot {
		time: string;
		formatted: string;
		datetime: Date;
		unavailable: boolean;
	}

	let selectedSlots: TimeSlot[] = [];
	const timeZone = getLocalTimeZone();

	$: if (value && service?.duration && !loadingUnavailable) {
		console.log(
			'Generating slots for date:',
			value.toString(),
			'Service duration:',
			service.duration
		);
		selectedSlots = [];
		const day = getDayOfWeek(value);
		console.log('Day of week:', day);
		const dayHours = safeWorkingHours.find((d) => d.dayOfWeek.toLowerCase() === day && !d.isClosed);
		console.log('Day hours:', dayHours);

		if (dayHours) {
			const interval = 15;
			const serviceDuration = service.duration;
			const selectedDate = value.toDate(timeZone);
			const openTime = parseBusinessTimeStringToDate(dayHours.openTime, selectedDate);
			const closeTime = parseBusinessTimeStringToDate(dayHours.closeTime, selectedDate);

			if (isNaN(openTime.getTime()) || isNaN(closeTime.getTime())) {
				console.error(
					`Failed to parse times for ${day}. Open: ${dayHours.openTime}, Close: ${dayHours.closeTime}`
				);
			} else {
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
					}
				}

				while (current <= latestValidStart) {
					const slotEnd = new Date(current.getTime() + serviceDuration * 60000);
					const isUnavailable = isSlotUnavailable(current, slotEnd);

					selectedSlots.push({
						time: `${String(current.getHours()).padStart(2, '0')}:${String(
							current.getMinutes()
						).padStart(2, '0')}`,
						formatted: current.toLocaleTimeString([], {
							hour: '2-digit',
							minute: '2-digit',
							timeZone: timeZone
						}),
						datetime: new Date(current),
						unavailable: isUnavailable
					});

					current = new Date(current.getTime() + interval * 60000);
				}
			}
		}
	} else if (!value) {
		selectedSlots = [];
	}

	// --- FETCH UNAVAILABLE TIMES ---
	// --- FETCH UNAVAILABLE TIMES ---
	$: {
		console.log('🔄 Reactive block triggered', {
			value: value?.toString(),
			hasValue: !!value,
			serviceId,
			hasServiceId: !!serviceId
		});

		if (value && serviceId) {
			const isDisabled = isDateDisabled(value);
			console.log('📅 Date disabled check:', {
				date: value.toString(),
				isDisabled,
				minValue: minValue.toString(),
				maxValue: maxValue.toString()
			});

			if (!isDisabled) {
				console.log('🚀 Calling fetchUnavailableTimes');
				fetchUnavailableTimes(value);
			} else {
				console.log('🚫 Date is disabled, skipping fetch');
			}
		} else {
			console.log('⚠️ Skipping fetch - missing value or serviceId');
		}
	}

	async function fetchUnavailableTimes(date: DateValue) {
		console.log('🔍 fetchUnavailableTimes called with:', {
			date: date.toString(),
			serviceId,
			hasServiceId: !!serviceId
		});

		if (!serviceId) {
			console.warn('❌ fetchUnavailableTimes: serviceId is missing');
			unavailableTimes = [];
			loadingUnavailable = false;
			errorMessage = 'No service selected. Please select a service to check availability.';
			return;
		}

		const dateString = date.toString();
		loadingUnavailable = true;
		console.log('📡 Fetching unavailable times for:', {
			serviceId,
			dateString
		});

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => {
				controller.abort();
				console.error('⏰ Request timeout for unavailable times');
			}, 10000);

			const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
			const apiUrl = `${baseUrl}/api/unavailable-times?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(dateString)}`;

			console.log('🌐 Making request to:', apiUrl);

			const response = await fetch(apiUrl, {
				signal: controller.signal,
				credentials: 'include',
				headers: {
					Accept: 'application/json'
				}
			});
			clearTimeout(timeoutId);

			console.log('📥 Response received:', {
				status: response.status,
				statusText: response.statusText,
				ok: response.ok
			});

			if (!response.ok) {
				const errorText = await response.text();
				console.error(`❌ HTTP Error (${response.status}):`, errorText);
				errorMessage = `Failed to fetch availability (${response.status})`;
				unavailableTimes = [];
				return;
			}

			const contentType = response.headers.get('content-type');
			console.log('📄 Content-Type:', contentType);

			if (contentType && contentType.includes('application/json')) {
				const result = await response.json();
				console.log('📋 Full response:', result);

				// ✅ Access the times array correctly
				unavailableTimes = Array.isArray(result.times) ? result.times : [];
				console.log('✅ Unavailable times set:', unavailableTimes);
			} else {
				console.error('❌ Invalid content type:', contentType);
				errorMessage = 'Invalid response format';
				unavailableTimes = [];
			}
		} catch (err: any) {
			console.error('💥 Error in fetchUnavailableTimes:', err);
			if (err.name === 'AbortError') {
				console.error('⏰ Request aborted: Timeout fetching unavailable times');
				errorMessage = 'Request timeout. Please try again.';
			} else {
				console.error('🚨 Error fetching unavailable times:', err);
				errorMessage = 'Failed to fetch availability. Please try again.';
			}
			unavailableTimes = [];
		} finally {
			loadingUnavailable = false;
			console.log('🏁 Finished fetching unavailable times');
		}
	}

	// --- CALENDAR LOGIC ---
	function isDateDisabled(date: DateValue): boolean {
		const dayIndex = date.toDate(timeZone).getDay();
		const dayName = dayNameMap[dayIndex];
		return date.compare(minValue) < 0 || closedDays.has(dayName);
	}

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
	async function confirmBooking() {
		if (!value || !selectedTime || !service?.id) {
			const missing = [];
			if (!value) missing.push('date');
			if (!selectedTime) missing.push('time');
			if (!service?.id) missing.push('service');
			errorMessage = `Please select a ${missing.join(', ')}.`;
			return;
		}

		const selectedDate = formatDateForURL(value);
		const selectedSlot = selectedSlots.find((slot) => slot.formatted === selectedTime);

		if (!selectedSlot) {
			errorMessage = 'Selected time slot is invalid or unavailable.';
			return;
		}

		if (isBooking) return;
		isBooking = true;

		try {
			errorMessage = null;
			showCalendar = false; // Close the modal after successful update/booking
			const bookingParams = new URLSearchParams({
				date: selectedDate,
				time: selectedSlot.time, // Use HH:MM for consistency with URL
				service: serviceId || ''
			});
			console.log('Redirecting to payment with params:', bookingParams.toString());
			goto(`/book/${publicId}/pay?${bookingParams.toString()}`);
		} catch (err) {
			console.error('Error processing request:', err);
			errorMessage = 'An error occurred. Please try again.';
		} finally {
			isBooking = false;
		}
	}

	function selectTime(slot: TimeSlot) {
		selectedTime = slot.formatted;
		console.log('New time selected:', selectedTime);
		// Optionally close the modal after selecting a time to streamline the flow
		// showCalendar = false;
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
				{#if business?.images?.[0]?.objectName}
					<SecureImage
						src="{business.images[0].objectName}"
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
						on:click={() => (showCalendar = true)}
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
					disabled={loadingUnavailable || isBooking}
				>
					{loadingUnavailable
						? 'Loading...'
						: isBooking
							? 'Booking...'
							: selectedTime
								? 'Book Now'
								: 'Check Availability'}
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
				<Calendar type="single" bind:value {minValue} {maxValue} {isDateDisabled} />
			</div>

			<!-- Time Slots -->
			<div class="time-slots flex min-w-40 flex-col gap-2">
				<h3 class="mb-4 text-2xl font-bold">Select Time</h3>
				<div class="flex max-h-[19.3rem] flex-col gap-2 overflow-auto">
					{#if loadingUnavailable}
						<div class="flex items-center justify-center py-8">
							<div class="flex items-center gap-2">
								<div
									class="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"
								></div>
								<span class="text-sm text-gray-500">Checking availability...</span>
							</div>
						</div>
					{:else if value && selectedSlots.length > 0}
						{#each selectedSlots as slot (slot.time)}
							<button
								on:click={() => selectTime(slot)}
								disabled={slot.unavailable}
								class="relative rounded-lg border px-4 py-2 text-sm transition-all duration-200
			{slot.unavailable
									? 'cursor-not-allowed border-red-200 bg-red-50 text-red-400 line-through opacity-70'
									: selectedTime === slot.formatted
										? 'border-primary bg-primary text-white shadow-md'
										: 'cursor-pointer border-gray-300 bg-white hover:bg-gray-50 hover:shadow-sm'}"
							>
								{slot.formatted}
								{#if slot.unavailable}
									<span class="absolute top-1/2 right-2 -translate-y-1/2 text-xs"> 🔒 </span>
								{/if}
							</button>
						{/each}
					{:else if value}
						<div class="flex flex-col items-center justify-center py-8 text-center">
							<div class="mb-2 text-2xl">📅</div>
							<span class="text-sm font-medium text-red-500">No available slots for this date</span>
							<span class="mt-1 text-xs text-gray-500">Try selecting another date</span>
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center py-8 text-center">
							<div class="mb-2 text-2xl">👈</div>
							<span class="text-sm text-gray-500">Please select a date first</span>
						</div>
					{/if}
				</div>
				{#if selectedTime}
					<button
						on:click={() => {
							confirmBooking();
							showCalendar = false;
						}}
						class="bg-primary hover:bg-accent hover:text-primary focus:ring-primary focus:ring-opacity-50 mt-4 w-full cursor-pointer rounded-lg py-2 text-sm font-medium text-white shadow-md transition
							duration-300 hover:shadow-lg focus:ring-2 focus:outline-none"
						disabled={loadingUnavailable || isBooking}
					>
						{isBooking ? 'Booking...' : 'Confirm and Book'}
					</button>
				{/if}
				{#if errorMessage}
					<div class="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
						<div class="flex items-start gap-2">
							<span class="text-lg">⚠️</span>
							<span>{errorMessage}</span>
						</div>
					</div>
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

	/* Enhanced unavailable slot styling */
	.line-through {
		text-decoration: line-through;
	}

	/* Loading spinner */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.animate-spin {
		animation: spin 1s linear infinite;
	}

	/* Focus styles */
	.focus\:outline-none:focus {
		outline: none;
	}

	.focus\:ring-2:focus {
		--tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width)
			var(--tw-ring-offset-color);
		--tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width))
			var(--tw-ring-color);
		box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
	}

	.focus\:ring-primary:focus {
		--tw-ring-opacity: 1;
		--tw-ring-color: rgba(0, 0, 0, var(--tw-ring-opacity));
	}

	@media (max-width: 768px) {
		.modal-calendar {
			flex-direction: column;
		}
	}
</style>
