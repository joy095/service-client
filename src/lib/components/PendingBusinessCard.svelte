<script lang="ts">
	import { userPendingBusiness } from '$lib/store';
	import type { Business } from '$lib/types';

	// Set profile data

	export let business: Business;

	// Set the store once
	userPendingBusiness.set(business);
</script>

<a href={`/become-a-professional/${business.publicId}`} class="property-card">
	<div class="relative">
		<img src={business.ObjectName} alt={business.name} />

		<span
			class="absolute top-5 left-5 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800"
		>
			<div class="h-2 w-2 rounded-full bg-amber-600"></div>
			In progress</span
		>
	</div>

	<div class="details">
		<div class="price-type">
			<h3>{business.name}</h3>
		</div>
		<p class="location">{business.city}, {business.state}, {business.country}</p>
	</div>
</a>

<style>
	.property-card {
		display: block;
		text-decoration: none;
		color: inherit;
		overflow: hidden;

		img {
			width: 100%;
			height: 25rem;
			object-fit: cover;
			border-radius: 0.8rem;
		}

		.details {
			padding: 1rem;

			.price-type {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 0.2rem;

				.price {
					font-weight: bold;
					color: #ff5a5f;
				}
			}

			.location {
				color: #666;
				margin-bottom: 0.5rem;
				font-size: 0.9rem;
			}
		}
	}
</style>
