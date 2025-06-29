<script lang="ts">
	export let data;
	const { business } = data;
</script>

<div class="container">
	<div class="image-wrapper">
		<img src={business.ObjectName} alt="Business Image" class="main-image" loading="lazy" />
	</div>

	<div class="info-card">
		<h1>{business.name}</h1>
		<p class="category">{business.category} in {business.city}, {business.country}</p>

		<div class="details-grid">
			<div>
				<span class="label">Location:</span>
				<span>{business.location.latitude}, {business.location.longitude}</span>
			</div>
			<div>
				<span class="label">Postal Code:</span>
				<span>{business.postalCode}</span>
			</div>
			<div>
				<span class="label">Status:</span>
				<span class={business.isActive ? 'active' : 'inactive'}>
					{business.isActive ? 'Active' : 'Inactive'}
				</span>
			</div>
		</div>
	</div>
</div>

<style>
	.container {
		max-width: 960px;
		margin: 2rem auto;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.image-wrapper {
		overflow: hidden;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
	}

	.main-image {
		width: 100%;
		height: auto;
		border-radius: 16px;
		object-fit: cover;
		min-height: 80vh;
	}

	.info-card {
		background: white;
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
	}

	h1 {
		font-size: 2rem;
		color: #222;
		margin-bottom: 0.5rem;
	}

	.category {
		font-size: 1.125rem;
		color: #555;
		margin-bottom: 1.5rem;
	}

	.details-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		font-size: 1rem;
	}

	.label {
		display: block;
		font-weight: 600;
		color: #888;
		margin-bottom: 0.25rem;
	}

	.active {
		color: green;
		font-weight: 600;
	}

	.inactive {
		color: red;
		font-weight: 600;
	}
</style>
