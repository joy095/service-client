<script>
	import { login, signup } from '$lib/api';
	import { goto } from '$app/navigation';
	let email = '';
	let password = '';
	let error = '';
	let isSignup = false;

	async function handleSubmit() {
		try {
			const { data } = await (isSignup ? signup : login)({ email, password });
			localStorage.setItem('authToken', data.token);
			goto('/profile');
		} catch (err) {
			error = err.response?.data?.message || 'Authentication failed';
		}
	}
</script>

<section class="mx-auto max-w-md px-4 py-16">
	<h2 class="font-display mb-8 text-center text-4xl">{isSignup ? 'Sign Up' : 'Login'}</h2>
	{#if error}
		<p class="mb-4 text-center text-red-500">{error}</p>
	{/if}
	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<div>
			<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
			<input
				type="email"
				id="email"
				bind:value={email}
				class="focus:ring-accent focus:border-accent mt-1 w-full rounded-lg border p-3"
				required
			/>
		</div>
		<div>
			<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
			<input
				type="password"
				id="password"
				bind:value={password}
				class="focus:ring-accent focus:border-accent mt-1 w-full rounded-lg border p-3"
				required
			/>
		</div>
		<button
			type="submit"
			class="bg-accent text-primary w-full rounded-lg py-3 font-semibold transition-colors hover:bg-yellow-600"
		>
			{isSignup ? 'Sign Up' : 'Login'}
		</button>
		<p class="text-center text-sm text-gray-600">
			{isSignup ? 'Already have an account?' : 'Need an account?'}
			<button
				type="button"
				on:click={() => (isSignup = !isSignup)}
				class="text-accent ml-1 hover:underline"
			>
				{isSignup ? 'Login' : 'Sign Up'}
			</button>
		</p>
	</form>
</section>
