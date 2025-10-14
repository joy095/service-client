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

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		if (isMenuOpen && menuRef && !menuRef.contains(target)) {
			isMenuOpen = false;
		}
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('click', handleClickOutside);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('click', handleClickOutside);
		}
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
			<a href="/dashboard/orders" class="text-base font-medium underline-offset-4 hover:underline"
				>Orders</a
			>
		{/if}

		<div class="flex items-center gap-2">
			{#if data.businessData?.businesses?.length > 0}
				{#if showSwitchLink}
					{#if isOnDashboard}
						<a
							href="/"
							class="rounded-full px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100"
						>
							Switch to App
						</a>
					{:else}
						<a
							href="/dashboard"
							class="rounded-full px-3 py-2 text-sm font-medium transition-all hover:bg-gray-100"
						>
							Switch to Dashboard
						</a>
					{/if}
				{/if}
			{/if}

			{#if $isAuthenticated}
				{#if data.user}
					<a
						href="/profile"
						class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-700"
					>
						{data.user.firstName?.charAt(0).toUpperCase()}
					</a>
				{/if}
			{/if}

			<div class="relative" bind:this={menuRef}>
				<button
					class="hand-burger flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#EBEBEB] hover:bg-[#e7e7e7]"
					on:click={() => (isMenuOpen = !isMenuOpen)}
					aria-haspopup="menu"
					aria-expanded={isMenuOpen}
					aria-controls="main-menu"
					aria-label="Open menu"
				>
					<Icon className="h-4 w-4 text-black" src={AiOutlineMenu} />
				</button>

				<div class:toggled={isMenuOpen} id="menu-container">
					<a class="divide flex items-center gap-2" href="/">
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
								Account settings</a
							>
							<a href="/orders" class="flex items-center gap-2">
								<Icon className="h-5 w-5 text-black" src={HiOutlineShoppingBag} />
								Booking</a
							>
						</div>
						<button on:click={logout}>Logout</button>
					{:else}
						<button on:click={() => isFormOpen.set(!get(isFormOpen))}> Log in or sign up </button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if isOnDashboard}
		<div></div>
	{:else}
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
		background: linear-gradient(90deg, #ffffff 0%, #ffffff 100%);
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
		opacity: 0;
		position: absolute;
		top: 3rem;
		right: 0;
		height: 0;
		width: 0;
		overflow: hidden;
		padding: 0.5rem 0;
		background: #ffffff;
		box-shadow: 0 3px 5px rgb(231, 231, 231);
		border-radius: 10px;
		z-index: 1;

		display: flex;
		flex-direction: column;
		gap: 0.8rem;
	}

	.divide {
		position: relative;
		&::after {
			position: absolute;
			content: '';
			left: 0;
			right: 0;
			bottom: -8px;
			width: 85%;
			margin: 0 auto;
			height: 1px;
			background: hsl(0 0% 90%);
		}
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
		align-self: self-start;
		text-align: left;
		position: relative;
		font-size: 0.9rem;

		&:hover {
			background-color: #f0f0f0;
		}
	}

	#menu-container.toggled {
		opacity: 1;
		height: auto;
		width: 12rem;
	}
</style>
