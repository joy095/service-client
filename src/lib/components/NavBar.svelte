<script>
	import { goto } from '$app/navigation';
	let isLoggedIn = !!localStorage.getItem('authToken');
	let isMenuOpen = false;

	function logout() {
		localStorage.removeItem('authToken');
		isLoggedIn = false;
		goto('/');
	}
</script>

<nav class="shadow-airbnb sticky top-0 z-50 bg-white py-4">
	<div class="mx-auto flex max-w-7xl items-center justify-between px-4">
		<a href="/" class="font-family-custom text-accent text-2xl">Elite Salon</a>
		<button class="md:hidden" on:click={() => (isMenuOpen = !isMenuOpen)} aria-label="Toggle menu">
			<svg class="text-neutral h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-width="2"
					d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
				/>
			</svg>
		</button>
		<div class="hidden space-x-6 md:flex unless:unsubscribe={logout} items-center space-x-6">
			<a href="/" class="text-neutral font-body hover:text-accent">Home</a>
			<a href="/book" class="text-neutral font-body hover:text-accent">Book Now</a>
			{#if isLoggedIn}
				<a href="/profile" class="text-neutral font-body hover:text-accent">Profile</a>
				<button on:click={logout} class="text-neutral font-body hover:text-accent">Logout</button>
			{:else}
				<a href="/login" class="text-neutral font-body hover:text-accent">Login</a>
			{/if}
		</div>
	</div>
	{#if isMenuOpen}
		<div class="mt-4 space-y-4 px-4 md:hidden">
			<a href="/" class="text-neutral font-body hover:text-accent block">Home</a>
			<a href="/book" class="text-neutral font-body hover:text-accent block">Book Now</a>
			{#if isLoggedIn}
				<a href="/profile" class="text-neutral font-body hover:text-accent block">Profile</a>
				<button on:click={logout} class="text-neutral font-body hover:text-accent block"
					>Logout</button
				>
			{:else}
				<a href="/login" class="text-neutral font-body hover:text-accent block">Login</a>
			{/if}
		</div>
	{/if}
</nav>
