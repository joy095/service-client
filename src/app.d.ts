// src/app.d.ts
/// <reference types="@sveltejs/kit" />

import type { R2Bucket } from '@cloudflare/workers-types'; // Ensure import

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			env: {
				R2_BUCKET: R2Bucket;
			};
		}
		interface Locals {
			tokenData: {
				user: User | null;
				businessData: Business | null;
				isAuthenticated: boolean;
			};
		}

		// interface PageData {}
		// interface PageState {}
		interface Platform {
			// Try to type the platform env if possible, though often not strictly necessary
			env?: { R2_BUCKET: R2Bucket };
		}
	}
}

export { };