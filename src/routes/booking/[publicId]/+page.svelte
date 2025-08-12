<script lang="ts">
	import Icon from '@iconify/svelte';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import type { WorkingHour, Service, Business } from '$lib/types/index.js';
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import SecureImage from '$lib/components/SecureImage.svelte';

	interface TimeSlot {
		time: string;
		formatted: string;
	}

	export let data: {
		workingHours: WorkingHour[] | null;
		business: Business;
		services: Service[];
	};

	const { workingHours, business, services } = data;
	const service = services[0]; // Assuming first service is selected

	let value: DateValue | undefined = undefined;
	let minValue = today(getLocalTimeZone());

	let safeWorkingHours: WorkingHour[] = [];
	$: safeWorkingHours = workingHours ?? [];

	$: closedDays = new Set(
		safeWorkingHours.filter((d) => d.isClosed).map((d) => d.dayOfWeek.toLowerCase())
	);

	const dayNameMap: Record<number, string> = {
		0: 'sunday',
		1: 'monday',
		2: 'tuesday',
		3: 'wednesday',
		4: 'thursday',
		5: 'friday',
		6: 'saturday'
	};

	function formatDateValue(dateValue: DateValue): string {
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		}).format(dateValue.toDate(getLocalTimeZone()));
	}

	function getDayOfWeek(dateValue: DateValue): string {
		const dayIndex = dateValue.toDate(getLocalTimeZone()).getDay();
		return dayNameMap[dayIndex];
	}

	function parseTime(timeStr: string): Date {
		const [hours, minutes] = timeStr.split(':').map(Number);
		const date = new Date();
		date.setHours(hours, minutes, 0, 0);
		return date;
	}

	function generateTimeSlots(
		openTime: string,
		closeTime: string,
		intervalMinutes: number
	): TimeSlot[] {
		const slots: TimeSlot[] = [];
		let current = parseTime(openTime);
		const end = parseTime(closeTime);

		while (current < end) {
			slots.push({
				time: `${current.getHours()}:${current.getMinutes().toString().padStart(2, '0')}`,
				formatted: current.toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit'
				})
			});
			current = new Date(current.getTime() + intervalMinutes * 60000);
		}
		return slots;
	}

	// Reactive slot generation
	let selectedSlots: TimeSlot[] = [];

	$: if (value && service?.duration) {
		const day = getDayOfWeek(value);
		const dayHours = safeWorkingHours.find((d) => d.dayOfWeek.toLowerCase() === day && !d.isClosed);

		if (dayHours) {
			selectedSlots = generateTimeSlots(dayHours.openTime, dayHours.closeTime, service.duration);
		} else {
			selectedSlots = [];
		}
	}

	function isDateDisabled(date: DateValue): boolean {
		const dayIndex = date.toDate(getLocalTimeZone()).getDay();
		const dayName = dayNameMap[dayIndex];
		return date.compare(minValue) <= 0 || closedDays.has(dayName);
	}

	function formatDuration(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
	}
</script>

<section class="container min-h-screen">
	<div class="mx-auto mt-20 flex max-w-fit gap-8 overflow-hidden rounded-md p-8 shadow-2xl">
		<div class="max-w-[19rem]">
			<div class="flex flex-col gap-8">
				<div class="flex items-center gap-4">
					{#if business.images?.[0]?.objectName}
						<SecureImage
							className="h-8 w-8 rounded-full object-cover"
							src="{PUBLIC_IMAGE_URL}/{business.images[0].objectName}"
							alt={`Logo of ${business.name}`}
							width={120}
							height={80}
						/>
					{/if}
					<h3 class="text-2xl font-medium">{business.name}</h3>
				</div>

				<hr class="w-full rounded-lg border-t-2 border-gray-300" />

				<div>
					<h3 class="text-2xl font-medium">{service?.name}</h3>

					<div class="mt-8 flex flex-col gap-5">
						<div class="flex flex-col gap-4">
							<div class="flex items-center gap-3">
								<img
									class="h-6 w-6 rounded-full object-cover"
									src="/image-placeholder.svg"
									alt="Provider avatar"
								/>
								<span class="text-sm font-medium">Jeremy Philips</span>
							</div>

							<div class="flex gap-3">
								<Icon icon="icon-park-outline:time" class="h-6 w-6" />
								<span class="text-sm font-medium">
									{service?.duration ? formatDuration(service.duration) : 'N/A'}
								</span>
							</div>
						</div>

						<div class="flex gap-3">
							<Icon icon="lucide:video" class="h-8 w-8" />
							<span class="text-sm font-medium">
								Web conferencing details provided upon confirmation
							</span>
						</div>

						<div class="flex gap-3">
							<Icon icon="material-symbols:info-outline-rounded" class="h-10 w-10" />
							<span class="text-sm font-medium">
								Online design session with my personal UX review and recommendation
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div>
			<Calendar bind:value type="single" {minValue} {isDateDisabled} />
		</div>

		{#if value && service}
			<div class="box-wrap relative"></div>
			<div
				class="time-slot relative mt-16 flex flex-col overflow-y-auto transition-all duration-150"
				class:hidden={!value}
			>
				<span class="text-lg font-semibold text-zinc-800 dark:text-white">
					{formatDateValue(value)}
				</span>

				<div class="mt-8 flex flex-col gap-3">
					{#if selectedSlots.length > 0}
						{#each selectedSlots as slot (slot.time)}
							<div
								class="timeslot cursor-pointer rounded-md border border-blue-600 px-10 py-1.5 text-center font-medium text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-900"
							>
								{slot.formatted}
							</div>
						{/each}
					{:else}
						<span class="text-sm text-gray-500">No slots available</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.box-wrap::after {
		position: absolute;
		content: '';
		height: 130%;
		width: 2px;
		background-color: #d1d5dc;
		top: -15%;
		bottom: -15%;
		right: 0;
		left: 0;
		margin: 0 auto;
	}

	.timeslot {
		border: 1px solid;
		box-sizing: border-box;

		&:hover {
			box-shadow: inset 0 0 0 1px;
		}
	}
</style>
