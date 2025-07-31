import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL!;
const domain = new URL(API_URL).hostname;

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: API_URL,
				changeOrigin: true,
				cookieDomainRewrite: domain,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	}
});
