<script>
	import { goto } from '$app/navigation';
	let searchQuery = '';

	async function handleSearch() {
		await goto(`/properties?search=${encodeURIComponent(searchQuery)}`);
	}
</script>

<header>
	<div class="logo">Airbnb Clone</div>

	<div class="search-bar">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search destinations"
			on:keydown={(e) => e.key === 'Enter' && handleSearch()}
		/>
		<button on:click={handleSearch}>Search</button>
	</div>

	<nav>
		<a href="/host">Become a Host</a>
		<a href="/account">Account</a>
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border-bottom: 1px solid #eee;
		position: sticky;
		top: 0;
		background: white;
		z-index: 100;
	}

	.logo {
		font-weight: bold;
		font-size: 1.5rem;
		color: #ff5a5f;
	}

	.search-bar {
		display: flex;
		gap: 0.5rem;

		input {
			padding: 0.5rem 1rem;
			border: 1px solid #ddd;
			border-radius: 24px;
			min-width: 300px;
		}

		button {
			padding: 0.5rem 1rem;
			background: #ff5a5f;
			color: white;
			border: none;
			border-radius: 24px;
			cursor: pointer;
		}
	}

	nav {
		display: flex;
		gap: 1rem;

		a {
			text-decoration: none;
			color: inherit;
			padding: 0.5rem;

			&:hover {
				color: #ff5a5f;
			}
		}
	}
</style>
