import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
    if (event.url.pathname.startsWith('/.well-known/')) {
        // Optionally log it or just return a 204
        return new Response(null, { status: 204 });
    }

    return resolve(event);
};
