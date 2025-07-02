<script lang="ts">
	import Icon from '@iconify/svelte';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { Calendar } from '$lib/components/ui/calendar/index.js';

	let value = today(getLocalTimeZone());
</script>

<section class="container mx-auto">
	<div class="mx-auto mt-20 flex max-w-fit gap-10 rounded-md p-10 shadow-2xl">
		<div class="max-w-[19rem]">
			<div class="flex flex-col gap-10">
				<div class="flex items-center gap-4">
					<img class="h-8 object-cover" src="/test.jpg" alt="Logo of business" loading="lazy" />
					<h3 class="text-2xl font-medium">Name of business</h3>
				</div>

				<span class="h-[2px] w-full rounded-lg bg-gray-300"></span>

				<div>
					<h3 class="text-2xl font-medium">30 minutes design session with Jeremy Philips</h3>

					<div class="mt-8 flex flex-col gap-5">
						<div class="flex flex-col gap-4">
							<div class="flex items-center gap-3">
								<img class="h-6 w-6 rounded-full object-cover" src="/test.jpg" alt="logo" />
								<span class="text-sm font-medium">Jeremy Philips</span>
							</div>

							<div class="flex gap-3">
								<Icon icon="icon-park-outline:time" class="h-6 w-6" />
								<span class="text-sm font-medium"> 30 min </span>
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
			/>
		</div>

		<div class="time-wrap relative flex flex-col justify-end">
			<span class="font-medium"> Thursday, July 8 </span>

			<div class="mt-5 flex flex-col gap-3">
				<div class="rounded-md border-2 border-blue-700 px-8 py-1.5 font-medium text-blue-700">
					11:00 AM
				</div>
				<div class="rounded-md border-2 border-blue-700 px-8 py-1.5 font-medium text-blue-700">
					11:00 AM
				</div>
				<div class="rounded-md border-2 border-blue-700 px-8 py-1.5 font-medium text-blue-700">
					11:00 AM
				</div>
				<div class="rounded-md border-2 border-blue-700 px-8 py-1.5 font-medium text-blue-700">
					11:00 AM
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.time-wrap::before {
		content: '';
		position: absolute;
		height: 100%;
		width: 1px;
		background-color: gray;
	}
</style>
