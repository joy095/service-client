<script lang="ts">
	import Icon from '@iconify/svelte';
	import { fade } from 'svelte/transition';
	import { isFormOpen } from '$lib/store';
	import { login as authLogin } from '$lib/store/authStore';
	import { goto, invalidateAll } from '$app/navigation';

	let email = '';
	let password = '';
	let otp = '';
	let deviceName = 'Web Browser';
	let error = '';
	let isLoading = false;

	let showPassword: boolean = false;

	const togglePasswordVisibility = () => {
		showPassword = !showPassword;
	};

	let firstName = '';
	let lastName = '';
	let step:
		| 'email'
		| 'register'
		| 'otp'
		| 'password'
		| 'forgot-email'
		| 'forgot-otp'
		| 'reset-password' = 'email';

	let userStatus = '';

	async function handleStepSubmit(event: Event) {
		event.preventDefault();
		error = '';
		isLoading = true;

		try {
			if (step === 'email') {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/user-is-registered`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email })
				});

				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.message || 'Something went wrong.');
				}

				const { status } = await res.json();
				userStatus = status;

				if (status === 'Pending') {
					step = 'otp';
				} else if (status === 'Not Verified') {
					const resendRes = await fetch(`${import.meta.env.VITE_API_URL}/resend-otp`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ email })
					});

					if (!resendRes.ok) {
						const data = await resendRes.json();
						throw new Error(data.message || 'Failed to resend OTP.');
					}

					step = 'otp';
				} else if (status === 'Verified') {
					step = 'password';
				} else if (status === 'Not found') {
					step = 'register';
				}
			} else if (step === 'register') {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						firstName,
						lastName,
						email,
						password,
						device: deviceName
					})
				});

				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.message || 'Registration failed.');
				}

				// Backend should set access/refresh token in HttpOnly cookie
				step = 'otp';
			} else if (step === 'otp') {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/verify-email`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, otp, device: deviceName })
				});

				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.message || 'Invalid OTP.');
				}

				step = 'password';
			} else if (step === 'password') {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, password }),
					credentials: 'include'
				});

				const raw = await res.text();
				if (!res.ok) throw new Error('Login failed.');

				let data;
				try {
					data = JSON.parse(raw);
				} catch {
					throw new Error('Invalid response format');
				}

				authLogin(data.user);
				isFormOpen.set(false);
				await invalidateAll();
				await goto('/');
			} else if (step === 'forgot-email') {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email })
				});
				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.message || 'Failed to send OTP.');
				}
				step = 'forgot-otp';
			} else if (step === 'forgot-otp') {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password-otp`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						email,
						otp,
						newPassword: password
					})
				});

				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.message || 'Failed to reset password.');
				}

				step = 'password'; // User can now log in
			} else if (step === 'reset-password') {
				const res = await fetch(`${import.meta.env.VITE_API_URL}/reset-password`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email, password })
				});
				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.message || 'Failed to reset password.');
				}
				step = 'password';
			}
		} catch (err: any) {
			error = err.message || 'Something went wrong.';
		} finally {
			isLoading = false;
		}
	}

	function goBack() {
		if (step === 'register') {
			step = 'email';
			firstName = '';
			lastName = '';
			password = '';
		} else if (step === 'otp') {
			step = userStatus === 'Not found' ? 'register' : 'email';
			otp = '';
		} else if (step === 'password') {
			step = userStatus === 'Pending' || userStatus === 'Not Verified' ? 'otp' : 'email';
			password = '';
		} else if (step === 'forgot-otp') {
			step = 'forgot-email';
			otp = '';
		} else if (step === 'reset-password') {
			step = 'forgot-otp';
			password = '';
		}
		error = '';
	}
</script>

<div class="inset-0 mt-16 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
	<div
		class="relative mx-4 w-full max-w-md rounded-2xl border border-gray-500 bg-white p-8"
		on:click|stopPropagation
	>
		<div class="mb-6 text-center">
			<h2 class="text-2xl font-bold text-gray-800">Welcome</h2>
		</div>

		<form method="POST" on:submit={handleStepSubmit}>
			{#if step === 'email'}
				<div class="mb-6">
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						placeholder="Enter your email"
						required
					/>
				</div>
			{:else if step === 'otp'}
				<div class="mb-6">
					<label for="otp" class="mb-1 block text-sm font-medium text-gray-700">OTP</label>
					<input
						type="text"
						id="otp"
						bind:value={otp}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						placeholder="Enter the OTP"
						required
					/>
				</div>
				<div class="mb-6">
					<label for="deviceName" class="mb-1 block text-sm font-medium text-gray-700"
						>Device Name (Optional)</label
					>
					<input
						type="text"
						id="deviceName"
						bind:value={deviceName}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						placeholder="e.g., My Laptop"
					/>
				</div>
			{:else if step === 'password'}
				<div class="mb-6">
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700">Password</label
					>
					<div class="relative">
						<input
							type={showPassword ? 'text' : 'password'}
							id="password"
							bind:value={password}
							class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
							placeholder="Enter your password"
						/>

						<button
							type="button"
							on:click={togglePasswordVisibility}
							class="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
						>
							{#if showPassword}
								<Icon icon="mdi-light:eye" class="h-6 w-6" />
							{:else}
								<Icon icon="mdi-light:eye-off" class="h-6 w-6" />
							{/if}
						</button>
					</div>

					<button
						type="button"
						on:click={() => {
							step = 'forgot-email';
							error = '';
						}}
						class="mt-2 cursor-pointer text-sm font-medium underline"
					>
						Forgot password?
					</button>
				</div>
			{:else if step === 'forgot-email'}
				<div class="mb-6">
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						placeholder="Enter your email"
						required
					/>
				</div>
			{:else if step === 'forgot-otp'}
				<div class="mb-6">
					<label for="otp" class="mb-1 block text-sm font-medium text-gray-700">OTP</label>
					<input
						type="text"
						id="otp"
						bind:value={otp}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						placeholder="Enter OTP"
						required
					/>
				</div>

				<div class="mb-6">
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700"
						>New Password</label
					>
					<div class="relative">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
							placeholder="Enter new password"
							required
						/>
						<button
							type="button"
							on:click={togglePasswordVisibility}
							class="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
						>
							{#if showPassword}
								<Icon icon="mdi-light:eye" class="h-6 w-6" />
							{:else}
								<Icon icon="mdi-light:eye-off" class="h-6 w-6" />
							{/if}
						</button>
					</div>
				</div>
			{:else if step === 'reset-password'}
				<div class="mb-6">
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700"
						>New Password</label
					>
					<div class="relative">
						<input
							type={showPassword ? 'text' : 'password'}
							id="password"
							bind:value={password}
							class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
							placeholder="Enter new password"
							required
						/>
						<button
							type="button"
							on:click={togglePasswordVisibility}
							class="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
						>
							{#if showPassword}
								<Icon icon="mdi-light:eye" class="h-6 w-6" />
							{:else}
								<Icon icon="mdi-light:eye-off" class="h-6 w-6" />
							{/if}
						</button>
					</div>
				</div>
			{:else if step === 'register'}
				<div class="mb-6">
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						placeholder="Enter your email"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
					<input
						id="firstName"
						type="text"
						bind:value={firstName}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
					<input
						id="lastName"
						type="text"
						bind:value={lastName}
						class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
						required
					/>
				</div>
				<div class="mb-4">
					<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
					<div class="relative">
						<input
							id="password"
							type={showPassword ? 'text' : 'password'}
							bind:value={password}
							class="w-full rounded-lg border px-4 py-2 focus:ring-1 focus:outline-none"
							required
						/>

						<button
							type="button"
							on:click={togglePasswordVisibility}
							class="absolute top-2 right-2 cursor-pointer text-gray-500 hover:text-gray-700 focus:outline-none"
						>
							{#if showPassword}
								<Icon icon="mdi-light:eye" class="h-6 w-6" />
							{:else}
								<Icon icon="mdi-light:eye-off" class="h-6 w-6" />
							{/if}
						</button>
					</div>
				</div>
			{/if}

			{#if error}
				<p class="mb-4 text-sm text-red-500">{error}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-lg bg-pink-600 py-2 text-white transition duration-200 hover:bg-pink-700 {isLoading
					? 'cursor-not-allowed opacity-50'
					: ''}"
				disabled={isLoading}
			>
				{#if isLoading}
					<Icon icon="mdi:loading" class="mr-2 inline-block h-5 w-5 animate-spin" />
					Loading...
				{:else}
					{step === 'forgot-email'
						? 'Request OTP'
						: step === 'forgot-otp'
							? 'Verify OTP'
							: step === 'reset-password'
								? 'Reset Password'
								: 'Sign In'}
				{/if}
			</button>

			{#if step !== 'email'}
				<button
					type="button"
					on:click={goBack}
					class="mt-3 flex w-full w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm hover:border-gray-900 focus:ring-1 focus:outline-none"
					disabled={isLoading}
				>
					<Icon icon="weui:back-outlined" class="h-4 w-4" /> Back
				</button>
			{/if}
		</form>
	</div>
</div>
