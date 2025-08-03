<script lang="ts">
	import { browser } from '$app/environment';

	export let src: string = '';
	export let alt = '';
	export let width = 800;
	export let height = 600;
	export let format: 'webp' | 'avif' = 'webp';
	export let className = '';
	export let fallback = '/image-placeholder.svg';

	let secureSrc = fallback;
	let isLoading = true;

	let lastKey = '';

	$: if (browser && src) {
		const key = `${src}-${width}-${height}-${format}`;
		if (key !== lastKey) {
			lastKey = key;
			isLoading = true;

			fetch(
				`/api/signed-imgproxy?${new URLSearchParams({ src, width: String(width), height: String(height), format })}`
			)
				.then(async (res) => {
					if (res.ok) {
						const data = await res.json();
						secureSrc = data.url;
					} else {
						console.error('API error:', await res.text());
						secureSrc = fallback;
					}
				})
				.catch((err) => {
					console.error('Fetch error:', err);
					secureSrc = fallback;
				})
				.finally(() => {
					isLoading = false;
				});
		}
	}
</script>

<!-- Show loading placeholder -->
{#if isLoading}
	<div class="{className} animate-pulse bg-gray-200"></div>
{/if}

<!-- Show image -->
{#if !isLoading}
	<img
		src={secureSrc}
		{alt}
		{width}
		{height}
		loading="lazy"
		class={className}
		on:error={() => {
			if (secureSrc !== fallback) {
				console.warn('Image failed to load, falling back to placeholder');
				secureSrc = fallback;
			}
		}}
	/>
{/if}
