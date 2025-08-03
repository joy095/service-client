// import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
		alias: {
			components: '$lib/components',
			utils: '$lib/utils',
			ui: '$lib/components/ui',
			hooks: '$lib/hooks',
			lib: '$lib'
		}
	}
};

export default config;
