<script lang="ts">
	export let business: {
		name: string;
		category: string;
		city: string;
		state: string;
		country: string;
		publicId: string;
		images: {
			position: number;
			objectName: string;
		}[];
	};

	// console.log(business.images);
</script>

<a href={`/business/${business.publicId}`} class="property-card">
	{#if business.images?.length > 0 && business.images[0].objectName}
		<img
			src={business.images[0].objectName}
			alt={business.name}
			class="h-48 w-full rounded-t object-cover"
			on:error={(e) =>
				((e.currentTarget as HTMLImageElement).src =
					'https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D')}
		/>
	{:else}
		<img
			src="https://images.unsplash.com/photo-1575936123452-b67c3203c357?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"
			alt="No image available"
			class="h-48 w-full rounded-t object-cover"
		/>
	{/if}
	<div class="details">
		<div class="price-type">
			<h3>{business.name}</h3>
			<span class="price">{business.category}</span>
		</div>
		<p class="location">{business.city}, {business.state}, {business.country}</p>
	</div>
</a>

<style>
	.property-card {
		display: block;
		text-decoration: none;
		color: inherit;
		border-radius: 12px;
		overflow: hidden;
		transition: transform 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		background: white;

		&:hover {
			transform: translateY(-4px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		}

		img {
			width: 100%;
			height: 200px;
			object-fit: cover;
		}

		.details {
			padding: 1rem;

			.price-type {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 0.5rem;

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
