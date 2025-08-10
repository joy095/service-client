// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    const pathname = event.url.pathname;
    // Allow known well-known routes to pass through
    if (
        pathname.startsWith('/.well-known/acme-challenge/') ||
        pathname === '/.well-known/apple-app-site-association' ||
        pathname === '/.well-known/assetlinks.json'
    ) {
        return resolve(event);
    }
    // Short-circuit unknown well-known paths
    if (pathname === '/.well-known' || pathname.startsWith('/.well-known/')) {
        return new Response(null, { status: 204 });
    }


    return resolve(event);
};
