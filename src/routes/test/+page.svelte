<script>
	import SecureImage from '$lib/components/SecureImage.svelte';
	import { onMount } from 'svelte';

	let healthData = null;
	let error = null;
	let loading = true;

	onMount(async () => {
		try {
			const url = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev/health';

			const response = await fetch(url);

			if (!response.ok) {
				const errorText = await response.text();
				console.log('❌ Error response body:', errorText);
				throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
			}

			const data = await response.json();

			healthData = data;
		} catch (err) {
			console.error('💥 Fetch error details:', {
				message: err.message,
				name: err.name,
				stack: err.stack
			});

			// More detailed error analysis
			if (err.name === 'TypeError' && err.message.includes('fetch')) {
				console.error('🌐 This is likely a CORS error or network issue');
				console.error('💡 Solutions:');
				console.error('   1. Add your frontend domain to CORS allowed origins in your Worker');
				console.error('   2. Check if the Worker URL is correct');
				console.error('   3. Verify the Worker is deployed and running');
			}

			error = err.message;
		} finally {
			loading = false;
		}
	});
</script>

<div style="font-family: monospace; padding: 20px;">
	<h1>Cloudflare Worker Debug</h1>

	{#if loading}
		<p>🔄 Loading...</p>
	{/if}

	{#if error}
		<div style="background: #ffebee; padding: 15px; border-radius: 5px;">
			<h3 style="color: #c62828; margin-top: 0;">❌ Error:</h3>
			<p><strong>{error}</strong></p>
			<p>Check browser console for detailed logs (F12 → Console)</p>
		</div>
	{/if}

	{#if healthData}
		<div style="background: #e8f5e8; padding: 15px; border-radius: 5px;">
			<h3 style="color: #2e7d32; margin-top: 0;">✅ Success!</h3>
			<pre>{JSON.stringify(healthData, null, 2)}</pre>
		</div>
	{/if}

	<h3>Debug Steps:</h3>
	<ol>
		<li>Open browser DevTools (F12)</li>
		<li>Go to Console tab</li>
		<li>Refresh this page</li>
		<li>Check detailed error logs</li>
	</ol>

	<SecureImage
		src="https://images.pexels.com/photos/378570/pexels-photo-378570.jpeg"
		alt="No r2 image"
	/>
</div>
