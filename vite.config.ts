import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { svelteInspector } from '@sveltejs/vite-plugin-svelte-inspector';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		visualizer({
			emitFile: true,
			filename: 'stats.html'
		}),
		svelteInspector({
			// optional configuration
			toggleKeyCombo: 'meta-shift', // default
			holdMode: true,
			showToggleButton: 'always', // or 'active' | 'never'
			toggleButtonPos: 'bottom-right'
		})
	]
});
