<!-- <script lang="ts">
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
{/if} -->

<script lang="ts">
	import { browser } from '$app/environment';

	// --- Removed format prop as it's now hardcoded to 'auto' for best support ---
	// export let format: 'webp' | 'avif' = 'avif'; // Removed
	// --- Added format prop to indicate the *original* image format ---
	export let originalFormat: 'webp' | 'avif' | 'jpg' | 'png' = 'jpg'; // Prop for original file format

	// --- Other Props ---
	export let src: string = ''; // e.g. "0392ce7712b345d6a27232f5cd893a60" (without extension if using path-based)
	export let alt = '';
	export let width = 800;
	export let height = 600;
	// export let format: 'webp' | 'avif' = 'avif'; // Removed, using 'auto' now
	export let crop: boolean = false;
	export let gravity: string | null = null;
	export let quality: number | null = null;
	export let className = '';
	export let fallback = '/image-placeholder.svg';

	const IMAGEKIT_URL_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
	// e.g. https://ik.imagekit.io/eagkqm3v2

	let isLoading = true;
	let lastKey = '';
	// Initialize with fallback URL
	let transformedUrl = `${IMAGEKIT_URL_ENDPOINT}/${fallback}`; // Use full fallback URL initially

	// Determine screen size for responsive dimensions
	function getScreenSize() {
		if (!browser) return { w: width, h: height }; // Server-side, use default props
		const vw = window.innerWidth;
		if (vw <= 600) return { w: Math.floor(width * 0.4), h: Math.floor(height * 0.4) };
		if (vw <= 1024) return { w: Math.floor(width * 0.75), h: Math.floor(height * 0.75) };
		return { w: width, h: height };
	}

	// Build ImageKit URL (path-based transformation)
	function buildImageKitUrl(
		filePath: string, // e.g., "da17aabdc82d4e5981dea5090db2e08b.webp"
		w: number,
		h: number,
		// fmt: 'webp' | 'avif', // Removed parameter, using 'auto'
		cropMode: boolean,
		grav: string | null,
		qual: number | null
	): string {
		const transformations: string[] = [];

		if (w) transformations.push(`w-${w}`);
		if (h) transformations.push(`h-${h}`);

		if (cropMode) {
			// Use 'maintain_ratio' crop strategy if cropping is desired
			// Note: The correct parameter for crop mode is 'cm-<mode>', not 'c-<mode>' in path-based URLs
			// Using 'cm-maintain_ratio' explicitly sets the crop mode. The 'c-maintain_ratio' part was incorrect.
			// The default is 'cm-maintain_ratio', so this line might be optional depending on your logic.
			// If you intend to use 'maintain_ratio', add 'cm-maintain_ratio'.
			// If you intend 'extract', use 'cm-extract'.
			// If you want default (maintain_ratio), you can omit the crop mode entirely.
			// Let's assume you want the default or maintain_ratio, so we add it explicitly here if crop is true.
			// The documentation shows 'cm-maintain_ratio' as the strategy name.
			// The example 'c-maintain_ratio' in the docs seems to be for a different format or a typo in the explanation text near 'c-force'.
			// Stick with 'cm-<strategy>' for path-based.
			transformations.push('cm-maintain_ratio'); // Add this if you want explicit maintain_ratio when crop is true
			// If you want the default (which is maintain_ratio), you can remove the 'transformations.push' for crop mode
			// and just let the default handle it IF you don't set any other crop mode.
			// For explicit control, adding 'cm-maintain_ratio' is clearer if crop=true means maintain ratio.
		}
		if (grav) transformations.push(`fo-${grav}`);
		if (qual) transformations.push(`q-${qual}`);
		// Use 'auto' for format to get the best supported format
		transformations.push('f-auto');

		// Construct the transformation segment
		const trSegment = transformations.length > 0 ? `/tr:${transformations.join(',')}` : '';

		// Ensure IMAGEKIT_URL_ENDPOINT ends with a trailing slash.
		// This is crucial: if it ends with a slash, concatenating trSegment directly works.
		// If it doesn't, you need to add a slash before trSegment.
		const endpoint = IMAGEKIT_URL_ENDPOINT.endsWith('/')
			? IMAGEKIT_URL_ENDPOINT
			: `${IMAGEKIT_URL_ENDPOINT}/`;

		// Combine the endpoint, transformation segment, and the file path
		// The structure should be: endpoint + trSegment + / + filePath
		// Example: https://ik.imagekit.io/eagkqm3v2/ + /tr:w-600,h-400,f-auto + / + da17aabdc82d4e5981dea5090db2e08b.webp
		// Result: https://ik.imagekit.io/eagkqm3v2/tr:w-600,h-400,f-auto/da17aabdc82d4e5981dea5090db2e08b.webp
		// Make sure filePath starts with the filename directly, no leading slash.
		const finalFilePath = filePath.startsWith('/') ? filePath.substring(1) : filePath;

		return `${endpoint}${trSegment}/${finalFilePath}`;
	}

	// Reactive statement to rebuild URL when props change
	$: if (src && IMAGEKIT_URL_ENDPOINT) {
		// Include originalFormat in the key if it can change dynamically (though usually static per image)
		const key = `${src}-${width}-${height}-${crop}-${gravity}-${quality}-${originalFormat}`;
		if (key !== lastKey) {
			lastKey = key;
			isLoading = true; // Show loading state

			const { w, h } = getScreenSize();
			// Determine gravity: use provided one, default to 'ce' (center) if cropping, or null
			const effectiveGravity = gravity || (crop ? 'ce' : null);

			// Build the URL with 'auto' format
			transformedUrl = buildImageKitUrl(src, w, h, crop, effectiveGravity, quality);

			isLoading = false; // Hide loading state after URL is set
		}
	}

	// Handle image load errors
	function handleImageError() {
		transformedUrl = `${IMAGEKIT_URL_ENDPOINT}/${fallback}`; // Switch to fallback
		isLoading = false; // Ensure loading state is off if error occurs after load attempt
	}
</script>

{#if isLoading}
	<!-- Loading placeholder -->
	<div
		class="{className} animate-pulse bg-gray-200"
		style="width: {width}px; height: {height}px;"
	></div>
{:else}
	<img
		src={transformedUrl}
		{alt}
		class={className}
		loading="lazy"
		on:error={handleImageError}
		on:load={() => (isLoading = false)}
	/>
{/if}
