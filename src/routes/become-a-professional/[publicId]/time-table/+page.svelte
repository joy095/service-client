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
	import { enhance, applyAction } from '$app/forms'; // Add applyAction import
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { redirect } from '@sveltejs/kit';
	import { url } from 'inspector';

	// Get initial data from load function
	const data = get(page).data as PageData;

	const daysOfWeek = [
		{ id: 'sun', label: 'S', dayName: 'Sunday' },
		{ id: 'mon', label: 'M', dayName: 'Monday' },
		{ id: 'tue', label: 'T', dayName: 'Tuesday' },
		{ id: 'wed', label: 'W', dayName: 'Wednesday' },
		{ id: 'thu', label: 'T', dayName: 'Thursday' },
		{ id: 'fri', label: 'F', dayName: 'Friday' },
		{ id: 'sat', label: 'S', dayName: 'Saturday' }
	];

	const timeOptions: string[] = Array.from({ length: 24 * 4 }, (_, index) => {
		const totalMinutes = index * 15;
		const hour = Math.floor(totalMinutes / 60) % 24;
		const minute = totalMinutes % 60;

		const period = hour < 12 ? 'am' : 'pm';
		const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

		return `${displayHour}:${minute.toString().padStart(2, '0')}${period}`;
	});

	function formatBackendTimeToFrontend(time: string): string {
		if (!time || time === '00:00:00') return '12:00am';

		const [hoursStr, minutesStr] = time.split(':');
		const hours = parseInt(hoursStr, 10);
		const minutes = parseInt(minutesStr, 10);

		const period = hours < 12 ? 'am' : 'pm';
		const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

		return `${displayHour}:${minutes.toString().padStart(2, '0')}${period}`;
	}

	let dayStates = $state(
		daysOfWeek.map((day) => {
			const dayData = (Array.isArray(data?.workingHours) ? data.workingHours : []).find(
				(wh) => wh.dayOfWeek?.toLowerCase() === day.dayName.toLowerCase()
			);

			const isWeekend = day.id === 'sat' || day.id === 'sun';

			return {
				id: day.id,
				startTime: dayData
					? dayData.isClosed
						? '9:00am'
						: formatBackendTimeToFrontend(dayData.openTime)
					: '9:00am',
				endTime: dayData
					? dayData.isClosed
						? '5:00pm'
						: formatBackendTimeToFrontend(dayData.closeTime)
					: '5:00pm',
				isAvailable: dayData ? !dayData.isClosed : !isWeekend
			};
		})
	);

	let selectedTimezone = $state(data?.workingHours?.[0]?.timezone || 'Asia/Kolkata');

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

	const isFormValid = $derived(
		!dayStates.some((day) => day.isAvailable && !isValidTimeRange(day.startTime, day.endTime))
	);

	let submissionResult = $state<{ success?: boolean; error?: string; message?: string } | null>(
		null
	);

	function handleEnhance({ data, form }: { data: FormData; form: HTMLFormElement }) {
		console.log('Submitting form data:', Object.fromEntries(data)); // Fix: Use data instead of formData

		return async ({ result }) => {
			try {
				console.log('Form action result:', result); // Debug: Log result

				// Reset submission result
				submissionResult = null;

				// Handle result
				if (result.type === 'failure') {
					submissionResult = {
						error: 'Save failed',
						message: result.data?.message || 'Failed to save working hours'
					};
					console.error('Form submission failed:', result.data); // Debug: Log failure details
				} else if (result.type === 'error') {
					submissionResult = {
						error: 'Client error',
						message: result.message || 'An unexpected error occurred'
					};
				}
				// No handling needed for 'success' (unreachable) or 'redirect'—applyAction will navigate

				await applyAction(result);
			} catch (err) {
				console.error('Enhance error:', err); // Debug: Log error
				submissionResult = {
					error: 'Client error',
					message: 'An unexpected error occurred during submission'
				};
			}
		};
	}
</script>

<section class="container mx-auto max-w-4xl py-10">
	<form method="POST" use:enhance={handleEnhance}>
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

		<div
			class="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl md:p-8 dark:border-gray-700 dark:bg-gray-800"
		>
			<div class="mb-8 text-center">
				<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Working Hours</h1>
				<p class="text-gray-600 dark:text-gray-300">Set your availability for client meetings</p>
			</div>

			{#if submissionResult}
				<div
					class={`mb-6 rounded-lg p-4 ${
						submissionResult.success
							? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
							: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
					}`}
				>
					<div class="flex items-center">
						<Icon
							icon={submissionResult.success ? 'mdi:check-circle' : 'mdi:alert-circle'}
							class="mr-2 h-5 w-5"
						/>
						<span>{submissionResult.message}</span>
					</div>
				</div>
			{/if}

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
												class="w-36 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600"
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
												class="w-36 cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600"
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
									on:click={() => toggleDayAvailability(day.id)}
									class="h-10 w-10 cursor-pointer self-start p-0 text-red-500 hover:bg-red-50 hover:text-red-700 sm:self-center dark:hover:bg-red-900/20"
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
									on:click={() => toggleDayAvailability(day.id)}
									class="h-10 cursor-pointer border-blue-200 px-4 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-900/30"
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
						name="timezone"
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
					class="transform cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
					disabled={!isFormValid}
				>
					Save Working Hours
				</Button>
			</div>
		</div>
	</form>
</section>

<style>
</style>
