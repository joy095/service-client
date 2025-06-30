<script>
	import { fade } from 'svelte/transition';

	let email = '';
	let password = '';
	let error = '';
</script>

<div
	class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
	transition:fade={{ duration: 200 }}
>
	<div
		class="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8"
		transition:fade={{ duration: 200 }}
	>
		<!-- Close Button -->
		<button class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
			<svg
				class="h-6 w-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>

		<!-- Modal Content -->
		<div class="mb-6 text-center">
			<h2 class="text-2xl font-bold text-gray-800">Log in to Airbnb</h2>
		</div>

		<form>
			<div class="mb-4">
				<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
				<input
					type="email"
					id="email"
					bind:value={email}
					class="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
					placeholder="Enter your email"
				/>
			</div>

			<div class="mb-6">
				<label for="password" class="mb-1 block text-sm font-medium text-gray-700">Password</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					class="w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-pink-500 focus:outline-none"
					placeholder="Enter your password"
				/>
			</div>

			{#if error}
				<p class="mb-4 text-sm text-red-500">{error}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-lg bg-pink-600 py-2 text-white transition duration-200 hover:bg-pink-700"
			>
				Log In
			</button>
		</form>

		<div class="mt-4 text-center">
			<p class="text-sm text-gray-600">
				Don't have an account?
				<a href="/signup" class="text-pink-600 hover:underline">Sign up</a>
			</p>
		</div>
	</div>
</div>
