<script lang="ts">
	import Icon from '@iconify/svelte';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar/index.js';
	import type { WorkingHour } from '$lib/types/index.js';

	export let data;
	const { workingHours, business, services } = data;

	let value: DateValue | undefined = undefined;
	let minValue = today(getLocalTimeZone());

	function formatDateValue(dateValue: DateValue): string {
		const date = new Date(dateValue.toString());
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric'
		}).format(date);
	}

	function getDayOfWeek(dateValue: DateValue): string {
		const date = new Date(dateValue.toString());
		return date.toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
	}

	function parseTime(timeStr: string): Date {
		const [hours, minutes] = timeStr.split(':').map(Number);
		const date = new Date();
		date.setHours(hours, minutes, 0, 0);
		return date;
	}

	function generateTimeSlots(openTime: string, closeTime: string, intervalMinutes = 30): string[] {
		const slots: string[] = [];
		let current = parseTime(openTime);
		const end = parseTime(closeTime);

		while (current < end) {
			slots.push(current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
			current = new Date(current.getTime() + intervalMinutes * 60000);
		}

		return slots;
	}

	// reactive slot generation when value is selected
	let selectedSlots: string[] = [];

	$: if (value) {
		const day = getDayOfWeek(value);
		const dayHours = workingHours.find((d: WorkingHour) => d.dayOfWeek === day);
		if (dayHours && !dayHours.isClosed) {
			selectedSlots = generateTimeSlots(dayHours.openTime, dayHours.closeTime);
		} else {
			selectedSlots = [];
		}
	}
</script>

<section class="container mx-auto">
	<div class="mx-auto mt-20 flex max-w-fit gap-8 overflow-hidden rounded-md p-8 shadow-2xl">
		<div class="max-w-[19rem]">
			<div class="flex flex-col gap-8">
				<div class="flex items-center gap-4">
					<img
						class="h-8 object-cover"
						src={business.ObjectName}
						alt="Logo of {business.name}"
						loading="lazy"
					/>
					<h3 class="text-2xl font-medium">{business.name}</h3>
				</div>

				<span class="h-[2px] w-full rounded-lg bg-gray-300"></span>

				<div>
					<h3 class="text-2xl font-medium">{services.name}</h3>

					<div class="mt-8 flex flex-col gap-5">
						<div class="flex flex-col gap-4">
							<div class="flex items-center gap-3">
								<img class="h-6 w-6 rounded-full object-cover" src="/test.jpg" alt="logo" />
								<span class="text-sm font-medium">Jeremy Philips</span>
							</div>

							<div class="flex gap-3">
								<Icon icon="icon-park-outline:time" class="h-6 w-6" />
								<span class="text-sm font-medium">{services.durationMinutes} min</span>
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

		<div class="">
			<Calendar
				bind:value
				type="single"
				isDateDisabled={(date: DateValue) => date.compare(today(getLocalTimeZone())) < 0}
				{minValue}
			/>
		</div>

		{#if value}
			<div class="box-wrap relative"></div>
			<div class="time-slot relative mt-16 flex flex-col" class:hidden={!value}>
				<span class="text-lg font-semibold text-zinc-800 dark:text-white">
					{formatDateValue(value)}
				</span>

				<div class="mt-8 flex flex-col gap-3">
					{#if selectedSlots.length > 0}
						{#each selectedSlots as slot}
							<div
								class="timeslot cursor-pointer rounded-md border border-blue-600 px-10 py-1.5 text-center font-medium text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-900"
							>
								{slot}
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
