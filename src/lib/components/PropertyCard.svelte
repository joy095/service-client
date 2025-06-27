<script>
	export let property;
</script>

<a href={`/properties/${property.id}`} class="property-card">
	<img src={property.image} alt={property.title} />
	<div class="details">
		<div class="price-type">
			<h3>{property.title}</h3>
			<span class="price">${property.price}/night</span>
		</div>
		<p class="location">{property.location}</p>
		<div class="meta">
			<span>{property.bedrooms} beds</span>
			<span>{property.bathrooms} baths</span>
			<span>{property.type}</span>
		</div>
		<div class="rating">
			<span class="stars">{'★'.repeat(Math.floor(property.rating))}</span>
			<span>{property.rating}</span>
		</div>
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

			.meta {
				display: flex;
				gap: 0.75rem;
				color: #666;
				font-size: 0.85rem;
				margin-bottom: 0.75rem;
			}

			.rating {
				display: flex;
				align-items: center;
				gap: 0.25rem;

				.stars {
					color: #ff5a5f;
				}
			}
		}
	}
</style>
