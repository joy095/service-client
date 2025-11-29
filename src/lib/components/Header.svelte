<script lang="ts">
	import { isFormOpen } from '$lib/store';
	import { get } from 'svelte/store';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Icon } from 'svelte-icons-pack';
	import Search from './Search.svelte';
	import Form from './Form.svelte';
	import { logout } from '$lib/auth/logout';
	import { isAuthenticated } from '$lib/stores/authStore';
	import { hasBusiness } from '$lib/stores/businessStore';
	import type { Business, User } from '$lib/types';

	import { CgProfile } from 'svelte-icons-pack/cg';
	import { IoSettingsOutline, IoHelpCircleOutline } from 'svelte-icons-pack/io';
	import { AiOutlineMenu } from 'svelte-icons-pack/ai';
	import { HiOutlineShoppingBag } from 'svelte-icons-pack/hi';

	export let data: {
		user: User | null;
		businessData: Business | null;
	};

	let isMenuOpen = false;
	let menuRef: HTMLDivElement | null = null;
	let menuButtonRef: HTMLButtonElement | null = null;

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		if (
			isMenuOpen &&
			menuRef &&
			!menuRef.contains(target) &&
			menuButtonRef &&
			!menuButtonRef.contains(target)
		) {
			isMenuOpen = false;
		}
	}

	onMount(() => {
		if (browser) document.addEventListener('click', handleClickOutside);
	});

	onDestroy(() => {
		if (browser) document.removeEventListener('click', handleClickOutside);
	});

	$: pathname = $page.url.pathname;
	$: isOnDashboard = pathname.startsWith('/dashboard');
	$: showSwitchLink = $isAuthenticated && $hasBusiness;
</script>

<nav class="navbar">
	<div class="nav-container container mx-auto">
		{#if showSwitchLink}
			{#if isOnDashboard}
				<a href="/dashboard" class="logo text-xl font-bold">PremiumApp</a>
			{:else}
				<a href="/" class="logo text-xl font-bold">PremiumApp</a>
			{/if}
		{:else}
			<a href="/" class="logo text-xl font-bold">PremiumApp</a>
		{/if}

		{#if isOnDashboard}
			<a href="/dashboard/orders" class="text-base font-medium underline-offset-4 hover:underline">
				Orders
			</a>
		{/if}

		<div class="flex items-center gap-2">
			{#if data.businessData?.businesses?.length > 0 && showSwitchLink}
				<a
					href={isOnDashboard ? '/' : '/dashboard'}
					class="rounded-full px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100"
				>
					{isOnDashboard ? 'Switch to App' : 'Switch to Dashboard'}
				</a>
			{/if}

			{#if $isAuthenticated && data.user}
				<a
					href="/profile"
					class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700"
				>
					{data.user.firstName?.charAt(0).toUpperCase()}
				</a>
			{/if}

			<div class="relative" bind:this={menuRef}>
				<button
					bind:this={menuButtonRef}
					class="hand-burger flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-[#e7e7e7]"
					on:click={() => (isMenuOpen = !isMenuOpen)}
					aria-haspopup="menu"
					aria-expanded={isMenuOpen}
					aria-controls="main-menu"
					aria-label="Open menu"
				>
					<Icon className="h-4 w-4 text-black" src={AiOutlineMenu} />
				</button>

				<div id="menu-container" class:is-open={isMenuOpen}>
					<a class="divide flex items-center gap-2" href="/help">
						<Icon className="h-6 w-6 text-black" src={IoHelpCircleOutline} />
						Help center
					</a>

					<a href="/become-a-professional" class="divide">Become a professional</a>

					{#if $isAuthenticated}
						<div class="divide flex flex-col">
							<a href="/profile" class="flex items-center gap-2">
								<Icon className="h-5 w-5 text-black" src={CgProfile} />
								Profile
							</a>
							<a href="/settings" class="flex items-center gap-2">
								<Icon className="h-5 w-5 text-black" src={IoSettingsOutline} />
								Account settings
							</a>
							<a href="/orders" class="flex items-center gap-2">
								<Icon className="h-5 w-5 text-black" src={HiOutlineShoppingBag} />
								Booking
							</a>
						</div>
						<button on:click={logout}>Logout</button>
					{:else}
						<button on:click={() => isFormOpen.set(!get(isFormOpen))}>Log in or sign up</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if !isOnDashboard}
		<div class="flex justify-center">
			<Search />
		</div>
	{/if}
</nav>

{#if $isFormOpen}
	<Form />
{/if}

<style>
	.navbar {
		background: white;
		padding: 1rem 2rem;
		box-shadow: 0 2px 5px rgba(207, 207, 207, 0.2);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.nav-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: bold;
		color: #00ff88;
		text-decoration: none;
		transition: transform 0.3s ease;
	}

	.logo:hover {
		transform: scale(1.05);
	}

	.hand-burger:active {
		scale: 0.95;
	}

	#menu-container {
		position: absolute;
		top: 3rem;
		right: 0;
		width: 0;
		opacity: 0;
		height: 0;
		overflow: hidden;
		background: white;
		box-shadow: 0 3px 5px rgb(231, 231, 231);
		border-radius: 10px;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		padding: 0;
	}

	#menu-container.is-open {
		width: 12rem;
		height: auto;
		opacity: 1;
		padding: 0.5rem 0;
	}

	.divide {
		position: relative;
	}

	.divide::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -8px;
		width: 85%;
		margin: 0 auto;
		height: 1px;
		background: hsl(0 0% 90%);
	}

	#menu-container button,
	#menu-container a {
		padding: 0.5rem 1rem;
		border: none;
		background: none;
		color: #333;
		cursor: pointer;
		transition: background-color 0.3s ease;
		width: 100%;
		text-align: left;
		font-size: 0.9rem;
	}

	#menu-container button:hover,
	#menu-container a:hover {
		background-color: #f0f0f0;
	}
</style>
