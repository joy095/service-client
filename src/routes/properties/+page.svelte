<script>
	import { page } from '$app/stores';
	import { currentProperty, loadProperty, isLoading, error } from '$lib/stores/properties';

	$: propertyId = $page.params.id;

	import { onMount } from 'svelte';
	onMount(() => loadProperty(propertyId));
</script>

{#if $isLoading}
	<div class="loading">Loading property details...</div>
{:else if $error}
	<div class="error">Error: {$error}</div>
{:else if $currentProperty}
	<div class="property-detail">
		<h1>{$currentProperty.title}</h1>
		<p class="location">{$currentProperty.location}</p>

		<div class="image-gallery">
			<img src={$currentProperty.image} alt={$currentProperty.title} class="main-image" />
			{#if $currentProperty.images && $currentProperty.images.length > 0}
				<div class="thumbnail-grid">
					{#each $currentProperty.images.slice(0, 4) as image}
						<img src={image} alt="Property image" class="thumbnail" />
					{/each}
				</div>
			{/if}
		</div>

		<div class="details-grid">
			<div class="main-details">
				<h2>About this property</h2>
				<p>{$currentProperty.description}</p>

				<h2>Amenities</h2>
				<div class="amenities">
					{#each $currentProperty.amenities as amenity}
						<div class="amenity">{amenity}</div>
					{/each}
				</div>
			</div>

			<div class="booking-card">
				<div class="price-rating">
					<span class="price">${$currentProperty.price}/night</span>
					<span class="rating">
						{'★'.repeat(Math.floor($currentProperty.rating))}
						{$currentProperty.rating}
					</span>
				</div>

				<div class="meta">
					<span>{$currentProperty.bedrooms} bedrooms</span>
					<span>{$currentProperty.bathrooms} bathrooms</span>
					<span>{$currentProperty.type}</span>
				</div>

				<button class="book-button">Book Now</button>
			</div>
		</div>

		{#if $currentProperty.reviews && $currentProperty.reviews.length > 0}
			<div class="reviews">
				<h2>Reviews</h2>
				{#each $currentProperty.reviews as review}
					<div class="review">
						<div class="review-header">
							<span class="reviewer">{review.reviewerName}</span>
							<span class="review-rating">{'★'.repeat(review.rating)}</span>
						</div>
						<p class="review-comment">{review.comment}</p>
						<p class="review-date">{new Date(review.date).toLocaleDateString()}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{:else}
	<div class="not-found">Property not found</div>
{/if}

<style>
	.property-detail {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;

		h1 {
			font-size: 2rem;
			margin-bottom: 0.5rem;
		}

		.location {
			font-size: 1.1rem;
			color: #666;
			margin-bottom: 1.5rem;
		}

		.image-gallery {
			margin-bottom: 2rem;

			.main-image {
				width: 100%;
				max-height: 500px;
				object-fit: cover;
				border-radius: 12px;
				margin-bottom: 1rem;
			}

			.thumbnail-grid {
				display: grid;
				grid-template-columns: repeat(4, 1fr);
				gap: 1rem;

				.thumbnail {
					width: 100%;
					height: 100px;
					object-fit: cover;
					border-radius: 8px;
					cursor: pointer;
					transition: transform 0.2s;

					&:hover {
						transform: scale(1.03);
					}
				}
			}
		}

		.details-grid {
			display: grid;
			grid-template-columns: 2fr 1fr;
			gap: 2rem;

			.main-details {
				h2 {
					font-size: 1.5rem;
					margin: 1.5rem 0 1rem;
				}

				.amenities {
					display: flex;
					flex-wrap: wrap;
					gap: 0.75rem;

					.amenity {
						background: #f7f7f7;
						padding: 0.5rem 1rem;
						border-radius: 20px;
						font-size: 0.9rem;
					}
				}
			}

			.booking-card {
				border: 1px solid #ddd;
				border-radius: 12px;
				padding: 1.5rem;
				position: sticky;
				top: 1rem;
				height: fit-content;

				.price-rating {
					display: flex;
					justify-content: space-between;
					align-items: center;
					margin-bottom: 1rem;

					.price {
						font-size: 1.5rem;
						font-weight: bold;
						color: #ff5a5f;
					}

					.rating {
						color: #ff5a5f;
						font-weight: bold;
					}
				}

				.meta {
					display: flex;
					justify-content: space-between;
					margin-bottom: 1.5rem;
					color: #666;
				}

				.book-button {
					width: 100%;
					padding: 1rem;
					background: #ff5a5f;
					color: white;
					border: none;
					border-radius: 8px;
					font-size: 1rem;
					font-weight: bold;
					cursor: pointer;
					transition: background 0.2s;

					&:hover {
						background: #e04a50;
					}
				}
			}
		}

		.reviews {
			margin-top: 3rem;

			h2 {
				font-size: 1.5rem;
				margin-bottom: 1.5rem;
			}

			.review {
				border-bottom: 1px solid #eee;
				padding: 1.5rem 0;

				.review-header {
					display: flex;
					justify-content: space-between;
					margin-bottom: 0.5rem;

					.reviewer {
						font-weight: bold;
					}

					.review-rating {
						color: #ff5a5f;
					}
				}

				.review-comment {
					margin-bottom: 0.5rem;
				}

				.review-date {
					color: #666;
					font-size: 0.85rem;
				}
			}
		}
	}

	.loading,
	.error,
	.not-found {
		text-align: center;
		padding: 2rem;
		font-size: 1.2rem;
	}

	.error {
		color: red;
	}
</style>
