<script lang="ts">
	export let business: {
		id: string;
		name: string;
		category: string;
		city: string;
		state: string;
		country: string;
		PrimaryImageObject: string | null;
		publicId: string;
	};
</script>

<a href={`/business/${business.publicId}`} class="property-card">
	<img src={business.PrimaryImageObject} alt={business.name} />

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
