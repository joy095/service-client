<script lang="ts">
	import SecureImage from '$lib/components/SecureImage.svelte';

	export let data;

	interface Booking {
		id: string;
		customerId: string;
		serviceId: string;
		amount: number;
		status: string;
		objectName: string | null;
		serviceName: string | null;
		businessName: string | null;
	}

	const { booking }: { booking: Booking } = data;

	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'INR'
		}).format(amount);
	}

	function getStatusColor(status: string): string {
		switch (status.toLowerCase()) {
			case 'completed':
				return 'bg-green-100 text-green-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}
</script>

<div class="mx-auto mt-10 max-w-2xl rounded-lg bg-white p-6 shadow-md">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-2xl font-bold text-gray-800">Booking Details</h1>
			<p class="text-sm text-gray-600">ID: {booking.id}</p>
		</div>
		<span class={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(booking.status)}`}>
			{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
		</span>
	</div>

	{#if booking.businessName}
		<div class="mb-4 rounded-lg bg-blue-50 p-3">
			<p class="text-sm text-gray-600">Business</p>
			<p class="font-medium">{booking.businessName}</p>
		</div>
	{/if}

	<!-- Service Details -->
	<div class="space-y-4">
		<div class="flex items-center justify-between border-b pb-4">
			<div class="flex items-center space-x-4">
				{#if booking.objectName}
					<SecureImage
						src={booking.objectName}
						alt={booking.serviceName || 'Service'}
						className="h-20 w-20 rounded object-cover"
						height={150}
						width={150}
						on:error={(e) => {
							(e.currentTarget as HTMLImageElement).src = '/image-placeholder.svg';
						}}
					/>
				{:else}
					<div class="flex h-20 w-20 items-center justify-center rounded bg-gray-200">
						<span class="text-xs text-gray-500">No image</span>
					</div>
				{/if}
				<div>
					<h2 class="text-lg font-semibold text-gray-700">
						{booking.serviceName || 'Unnamed Service'}
					</h2>
					<p class="text-sm text-gray-500">Service Booking</p>
				</div>
			</div>
			<p class="text-lg font-medium text-gray-800">
				{formatCurrency(booking.amount)}
			</p>
		</div>
	</div>

	<!-- Booking Total -->
	<div class="mt-6 space-y-2">
		<div class="mt-4 flex justify-between border-t pt-4 text-lg font-bold text-gray-800">
			<span>Total</span>
			<span>{formatCurrency(booking.amount)}</span>
		</div>
	</div>
</div>
