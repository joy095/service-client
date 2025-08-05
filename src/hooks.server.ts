// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    if (event.url.pathname.startsWith('/.well-known/')) {
        return new Response(null, { status: 204 });
    }

    return resolve(event);
};
