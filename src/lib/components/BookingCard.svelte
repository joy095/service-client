<script lang="ts">
	import { PUBLIC_IMAGE_URL } from '$env/static/public';
	import SecureImage from './SecureImage.svelte';

	export let booking: {
		id?: string;
		objectName: string;
		serviceName: string;
		provider?: string;
		size?: string;
		amount: number;
		status: string;
		dateOfBook: string;
	};

	// Helper function for status styling
	function getStatusClass(status: string) {
		switch (status.toLowerCase()) {
			case 'dispatched':
				return 'bg-indigo-50 text-indigo-600';
			case 'paid':
				return 'bg-emerald-50 text-emerald-600';
			case 'pending':
				return 'bg-yellow-50 text-yellow-600';
			default:
				return 'bg-gray-50 text-gray-600';
		}
	}
</script>

<a
	href="/orders/{booking.id}"
	class="mb-5 flex w-full flex-col items-center gap-6 rounded-md border border-gray-200 px-5 py-6 lg:flex-row"
>
	<div class="img-box max-lg:w-full">
		<SecureImage
			src={booking.objectName}
			alt={booking.serviceName}
			width={600}
			height={400}
			className="aspect-square w-full rounded-xl object-cover lg:max-w-[140px]"
			on:error={(e) => {
				(e.currentTarget as HTMLImageElement).src = '/image-placeholder.svg';
			}}
		/>
	</div>

	<div class="flex w-full flex-row items-center">
		<div class="grid w-full grid-cols-1 lg:grid-cols-2">
			<!-- Service Info -->
			<div class="flex items-center">
				<div>
					<h2 class="mb-3 text-xl leading-8 font-semibold text-black">
						{booking.serviceName}
					</h2>
					{#if booking.provider}
						<p class="mb-3 text-lg leading-8 font-normal text-gray-500">
							By: {booking.provider}
						</p>
					{/if}
					<div class="flex flex-wrap items-center gap-4">
						{#if booking.size}
							<p class="text-base leading-7 font-medium text-black">
								Size: <span class="text-gray-500">{booking.size}</span>
							</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Price / Status -->
			<div class="grid grid-cols-5 gap-4">
				<div class="col-span-5 flex items-center sm:col-span-1">
					<div class="flex gap-3 sm:block">
						<p class="text-sm leading-7 font-medium text-black">Price</p>
						<p class="text-sm leading-7 font-medium text-indigo-600 sm:mt-4">
							₹{booking.amount.toFixed(2)}
						</p>
					</div>
				</div>

				<div class="col-span-5 flex items-center sm:col-span-2">
					<div class="flex gap-3 sm:block">
						<p class="text-sm leading-7 font-medium text-black">Status</p>
						<p
							class={`rounded-full px-3 py-0.5 text-sm leading-6 font-medium whitespace-nowrap sm:mt-3 ${getStatusClass(
								booking.status
							)}`}
						>
							{booking.status}
						</p>
					</div>
				</div>

				<div class="col-span-5 flex items-center sm:col-span-2">
					<div class="flex gap-3 sm:block">
						<p class="text-sm leading-6 font-medium whitespace-nowrap text-black">Booking date</p>
						<p class="text-base leading-7 font-medium whitespace-nowrap text-emerald-500 sm:mt-3">
							{booking.dateOfBook}
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</a>
