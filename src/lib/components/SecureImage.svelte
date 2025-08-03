<script lang="ts">
	import { browser } from '$app/environment';

	export const GRAVITY_OPTIONS = [
		{ value: null, label: 'Default (Resize Fit)' },
		{ value: 'ce', label: 'Center Crop' },
		{ value: 'north', label: 'Top' },
		{ value: 'south', label: 'Bottom' },
		{ value: 'east', label: 'Right' },
		{ value: 'west', label: 'Left' },
		{ value: 'north_east', label: 'Top Right Corner' },
		{ value: 'north_west', label: 'Top Left Corner' },
		{ value: 'south_east', label: 'Bottom Right Corner' },
		{ value: 'south_west', label: 'Bottom Left Corner' },
		{ value: 'sm', label: 'Smart Crop (if supported)' },
		{ value: 'et', label: 'Entropy Crop (if supported)' },
		{ value: 'object:face', label: 'Face Detection Crop (if supported)' },
		{ value: 'fp:0.5:0.5', label: 'Focal Point Center (Example)' }
	] as const;

	type GravityValue = (typeof GRAVITY_OPTIONS)[number]['value'];

	// Props
	export let src: string = '';
	export let alt = '';
	export let width = 800;
	export let height = 600;
	export let format: 'webp' | 'avif' = 'avif';
	export let crop: boolean = false;
	export let gravity: GravityValue = null;
	// New prop for image quality (1-100 for lossy formats)
	// null means use imgproxy's default
	export let quality: number | null = null;
	export let className = '';
	export let fallback = '/image-placeholder.svg';

	let isLoading = true;
	let lastKey = '';

	const breakpoints = [
		{
			media: '(max-width: 600px)',
			width: Math.max(300, Math.floor(width * 0.4)),
			height: Math.max(200, Math.floor(height * 0.4))
		},
		{
			media: '(max-width: 1024px)',
			width: Math.max(600, Math.floor(width * 0.75)),
			height: Math.max(400, Math.floor(height * 0.75))
		},
		{ media: '(min-width: 1025px)', width: width, height: height }
	];

	let avifSources: { media: string; srcset: string }[] = [];
	let webpSources: { media: string; srcset: string }[] = [];
	let fallbackSrc = fallback;

	// --- Updated getSignedUrl to accept gravity and quality ---
	async function getSignedUrl(
		imageSrc: string,
		w: number,
		h: number,
		fmt: 'avif' | 'webp', // Keep this specific union for format
		grav: string | null, // <--- This MUST be string | null
		qual: number | null
	): Promise<string | null> {
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
			} else {
				const errorText = await res.text();
				console.warn(`API returned ${res.status} for ${fmt} (${w}x${h}):`, errorText);
			}
		} catch (err) {
			console.error(`Failed to sign ${fmt} URL (${w}x${h})`, err);
		}
		return null;
	}

	$: if (browser && src) {
		const key = `${src}-${width}-${height}-${format}-${crop}-${gravity}-${quality}`;
		if (key !== lastKey) {
			lastKey = key;
			isLoading = true;

			(async () => {
				try {
					// Type is string | null, compatible with getSignedUrl's grav param
					const effectiveGravity = gravity || (crop ? 'ce' : null);

					const avifPromises = breakpoints.map(async (bp) => ({
						media: bp.media,
						srcset:
							(await getSignedUrl(src, bp.width, bp.height, 'avif', effectiveGravity, quality)) ||
							''
					}));

					const webpPromises = breakpoints.map(async (bp) => ({
						media: bp.media,
						srcset:
							(await getSignedUrl(src, bp.width, bp.height, 'webp', effectiveGravity, quality)) ||
							''
					}));

					const results = await Promise.all([...avifPromises, ...webpPromises]);

					avifSources = results.slice(0, breakpoints.length);
					webpSources = results.slice(breakpoints.length);

					fallbackSrc = src;
				} catch (error) {
					console.error('Error generating signed URLs:', error);
					fallbackSrc = fallback;
				} finally {
					isLoading = false;
				}
			})();
		}
	}
</script>

<!-- Loading placeholder -->
{#if isLoading}
	<div class="{className} animate-pulse bg-gray-200"></div>
{/if}

<!-- Responsive <picture> with AVIF → WebP → Original fallback -->
{#if !isLoading}
	<picture class={className}>
		{#each avifSources as { media, srcset } (media)}
			{#if srcset}
				<source {srcset} type="image/avif" {media} />
			{/if}
		{/each}

		{#each webpSources as { media, srcset } (media)}
			{#if srcset}
				<source {srcset} type="image/webp" {media} />
			{/if}
		{/each}

		<img
			src={fallbackSrc}
			{alt}
			{width}
			{height}
			loading="lazy"
			class={className}
			on:error={() => {
				if (fallbackSrc !== fallback) {
					console.warn('Original image failed to load, falling back to placeholder');
					fallbackSrc = fallback;
				}
			}}
		/>
	</picture>
{/if}

<style>
	picture,
	picture img {
		display: block;
	}
</style>
