<script lang="ts">
	import { browser } from '$app/environment';

	export let src: string = '';
	export let alt = '';
	export let width = 800;
	export let height = 600;
	export let format: 'webp' | 'avif' = 'avif';
	export let crop: boolean = false;
	export let gravity: string | null = null;
	export let quality: number | null = null;
	export let className = '';
	export let fallback = '/image-placeholder.svg';

	let isLoading = true;
	let lastKey = '';
	let signedUrl = fallback;

	function getScreenSize() {
		if (!browser) return { w: width, h: height };
		const vw = window.innerWidth;
		if (vw <= 600) return { w: Math.floor(width * 0.4), h: Math.floor(height * 0.4) };
		if (vw <= 1024) return { w: Math.floor(width * 0.75), h: Math.floor(height * 0.75) };
		return { w: width, h: height };
	}

	async function getSignedUrl(
		imageSrc: string,
		w: number,
		h: number,
		fmt: 'avif' | 'webp',
		grav: string | null,
		qual: number | null
	): Promise<string> {
		try {
			const params = new URLSearchParams({
				src: imageSrc,
				width: String(w),
				height: String(h),
				format: fmt,
				...(grav ? { gravity: grav } : { crop: String(crop) }),
				...(qual !== null ? { quality: String(qual) } : {})
			});
			const res = await fetch(`/api/signed-imgproxy?${params}`);
			if (res.ok) {
				const data = await res.json();
				return data.url;
			}
		} catch (err) {
			console.error('Failed to get signed URL', err);
		}
		return fallback;
	}

	$: if (browser && src) {
		const key = `${src}-${width}-${height}-${format}-${crop}-${gravity}-${quality}`;
		if (key !== lastKey) {
			lastKey = key;
			isLoading = true;

			(async () => {
				try {
					const { w, h } = getScreenSize();
					const effectiveGravity = gravity || (crop ? 'ce' : null);
					signedUrl = await getSignedUrl(src, w, h, format, effectiveGravity, quality);
				} finally {
					isLoading = false;
				}
			})();
		}
	}
</script>

{#if isLoading}
	<div class="{className} animate-pulse bg-gray-200"></div>
{:else}
	<img
		src={signedUrl}
		{alt}
		{width}
		{height}
		class={className}
		loading="lazy"
		on:error={() => (signedUrl = fallback)}
	/>
{/if}
