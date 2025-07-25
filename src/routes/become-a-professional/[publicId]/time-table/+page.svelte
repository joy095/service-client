<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Select,
		SelectContent,
		SelectGroup,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import Icon from '@iconify/svelte';
	import { enhance } from '$app/forms';

	const daysOfWeek = [
		{ id: 'sun', label: 'S', dayName: 'Sunday' },
		{ id: 'mon', label: 'M', dayName: 'Monday' },
		{ id: 'tue', label: 'T', dayName: 'Tuesday' },
		{ id: 'wed', label: 'W', dayName: 'Wednesday' },
		{ id: 'thu', label: 'T', dayName: 'Thursday' },
		{ id: 'fri', label: 'F', dayName: 'Friday' },
		{ id: 'sat', label: 'S', dayName: 'Saturday' }
	];

	const timeOptions = [
		'12:00am',
		'12:30am',
		'1:00am',
		'1:30am',
		'2:00am',
		'2:30am',
		'3:00am',
		'3:30am',
		'4:00am',
		'4:30am',
		'5:00am',
		'5:30am',
		'6:00am',
		'6:30am',
		'7:00am',
		'7:30am',
		'8:00am',
		'8:30am',
		'9:00am',
		'9:30am',
		'10:00am',
		'10:30am',
		'11:00am',
		'11:30am',
		'12:00pm',
		'12:30pm',
		'1:00pm',
		'1:30pm',
		'2:00pm',
		'2:30pm',
		'3:00pm',
		'3:30pm',
		'4:00pm',
		'4:30pm',
		'5:00pm',
		'5:30pm',
		'6:00pm',
		'6:30pm',
		'7:00pm',
		'7:30pm',
		'8:00pm',
		'8:30pm',
		'9:00pm',
		'9:30pm',
		'10:00pm',
		'10:30pm',
		'11:00pm',
		'11:30pm'
	];

	// State for each day with default times
	let dayStates = $state(
		daysOfWeek.map((day) => ({
			id: day.id,
			startTime: '9:00am',
			endTime: '5:00pm',
			isAvailable: true
		}))
	);

	let selectedTimezone = $state('Asia/Kolkata');

	function handleStartTimeChange(dayId: string, value: string[]) {
		const dayState = dayStates.find((d) => d.id === dayId);
		if (dayState && value.length > 0) {
			dayState.startTime = value[0];
		}
	}

	function handleEndTimeChange(dayId: string, value: string[]) {
		const dayState = dayStates.find((d) => d.id === dayId);
		if (dayState && value.length > 0) {
			dayState.endTime = value[0];
		}
	}

	function toggleDayAvailability(dayId: string) {
		const dayState = dayStates.find((d) => d.id === dayId);
		if (dayState) {
			dayState.isAvailable = !dayState.isAvailable;
		}
	}

	function formatTimeForBackend(time: string): string {
		if (!time) return '00:00:00';

		// Convert 12-hour format to 24-hour format
		const [timePart, modifier] = time.split(/(am|pm)/i);
		let [hours, minutes] = timePart.split(':').map(Number);

		if (modifier.toLowerCase() === 'pm' && hours !== 12) {
			hours += 12;
		} else if (modifier.toLowerCase() === 'am' && hours === 12) {
			hours = 0;
		}

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
	}

	function getDayNameFromId(id: string): string {
		const day = daysOfWeek.find((d) => d.id === id);
		return day ? day.dayName : '';
	}

	function isValidTimeRange(startTime: string, endTime: string): boolean {
		if (!startTime || !endTime) return true;

		const startIndex = timeOptions.indexOf(startTime);
		const endIndex = timeOptions.indexOf(endTime);

		return startIndex < endIndex;
	}

	// Check if form is valid for submission
	const isFormValid = $derived(
		!dayStates.some((day) => day.isAvailable && !isValidTimeRange(day.startTime, day.endTime))
	);
</script>

<section class="container mx-auto max-w-4xl py-10">
	<form method="POST" use:enhance>
		{#each dayStates as dayState, i}
			<input type="hidden" name="days[{i}].dayOfWeek" value={getDayNameFromId(dayState.id)} />
			<input
				type="hidden"
				name="days[{i}].openTime"
				value={dayState.isAvailable ? formatTimeForBackend(dayState.startTime) : '00:00:00'}
			/>
			<input
				type="hidden"
				name="days[{i}].closeTime"
				value={dayState.isAvailable ? formatTimeForBackend(dayState.endTime) : '00:00:00'}
			/>
			<input type="hidden" name="days[{i}].isClosed" value={!dayState.isAvailable} />
		{/each}
		<input type="hidden" name="timezone" value={selectedTimezone} />

		<div
			class="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl md:p-8 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Working Hours</h1>
				<p class="text-gray-600 dark:text-gray-300">Set your availability for client meetings</p>
			</div>

			<div class="mb-8 space-y-4">
				{#each daysOfWeek as day, i}
					<div
						class="flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50 p-5 transition-all duration-200 hover:bg-gray-100 sm:flex-row sm:items-center dark:border-gray-600 dark:bg-gray-700/50 dark:hover:bg-gray-700"
					>
						<div class="mb-3 flex items-center space-x-4 sm:mb-0">
							<div
								class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white shadow-md"
							>
								{day.label}
							</div>
							<span class="text-lg font-semibold text-gray-900 dark:text-white">{day.dayName}</span>
						</div>

						{#if dayStates[i].isAvailable}
							<div
								class="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4"
							>
								<div class="flex items-center space-x-3">
									<div class="relative">
										<Select
											type="single"
											value={dayStates[i].startTime}
											onValueChange={(value) => handleStartTimeChange(day.id, [value])}
										>
											<SelectTrigger
												class="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600"
											>
												<span class="text-gray-900 dark:text-white">{dayStates[i].startTime}</span>
											</SelectTrigger>
											<SelectContent class="max-h-60 overflow-y-auto">
												<SelectGroup>
													{#each timeOptions as time}
														<SelectItem value={time} class="py-2">{time}</SelectItem>
													{/each}
												</SelectGroup>
											</SelectContent>
										</Select>
									</div>

									<span class="text-gray-500 dark:text-gray-400">to</span>

									<div class="relative">
										<Select
											type="single"
											value={dayStates[i].endTime}
											onValueChange={(value) => handleEndTimeChange(day.id, [value])}
										>
											<SelectTrigger
												class="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600"
											>
												<span class="text-gray-900 dark:text-white">{dayStates[i].endTime}</span>
											</SelectTrigger>
											<SelectContent class="max-h-60 overflow-y-auto">
												<SelectGroup>
													{#each timeOptions as time}
														<SelectItem value={time} class="py-2">{time}</SelectItem>
													{/each}
												</SelectGroup>
											</SelectContent>
										</Select>
									</div>
								</div>

								{#if !isValidTimeRange(dayStates[i].startTime, dayStates[i].endTime)}
									<div class="flex items-center text-sm text-red-500">
										<Icon icon="mdi:alert-circle" class="mr-1" />
										End time must be after start time
									</div>
								{/if}

								<Button
									variant="ghost"
									size="sm"
									type="button"
									onclick={() => toggleDayAvailability(day.id)}
									class="h-10 w-10 self-start p-0 text-red-500 hover:bg-red-50 hover:text-red-700 sm:self-center dark:hover:bg-red-900/20"
									title="Remove availability"
								>
									<Icon icon="mdi:close" class="h-5 w-5" />
								</Button>
							</div>
						{:else}
							<div class="flex items-center space-x-3">
								<span class="text-gray-500 italic dark:text-gray-400">Unavailable</span>
								<Button
									variant="outline"
									size="sm"
									type="button"
									onclick={() => toggleDayAvailability(day.id)}
									class="h-10 border-blue-200 px-4 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/30"
									title="Add availability"
								>
									<Icon icon="mdi:plus" class="mr-1 h-4 w-4" />
									Add Hours
								</Button>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<div class="mb-8">
				<label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
					Time Zone
				</label>
				<div class="relative">
					<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
						<Icon icon="mdi:clock-outline" class="h-5 w-5 text-gray-400" />
					</div>
					<select
						bind:value={selectedTimezone}
						class="w-full appearance-none rounded-lg border border-gray-300 bg-white py-3 pr-3 pl-10 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
					>
						<option value="Asia/Kolkata">India Standard Time (IST)</option>
						<option value="UTC">Coordinated Universal Time (UTC)</option>
						<option value="America/Los_Angeles">Pacific Time (PT)</option>
						<option value="America/New_York">Eastern Time (ET)</option>
						<option value="Europe/London">Greenwich Mean Time (GMT)</option>
						<option value="America/Chicago">Central Time (CT)</option>
						<option value="Asia/Tokyo">Japan Standard Time (JST)</option>
						<option value="Australia/Sydney">Australian Eastern Time (AET)</option>
					</select>
				</div>
			</div>

			<div class="flex justify-end">
				<Button
					type="submit"
					class="transform rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
					disabled={!isFormValid}
				>
					Save Working Hours
				</Button>
			</div>
		</div>
	</form>
</section>

<style>
	:global(.dark) {
		color-scheme: dark;
	}

	/* Custom scrollbar for time dropdowns */
	:global(.max-h-60::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.max-h-60::-webkit-scrollbar-track) {
		background: #f1f1f1;
		border-radius: 10px;
	}

	:global(.max-h-60::-webkit-scrollbar-thumb) {
		background: #c5c5c5;
		border-radius: 10px;
	}

	:global(.dark .max-h-60::-webkit-scrollbar-track) {
		background: #2d3748;
	}

	:global(.dark .max-h-60::-webkit-scrollbar-thumb) {
		background: #4a5568;
	}
</style>
