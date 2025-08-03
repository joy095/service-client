// File: src/routes/api/image/+server.ts
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals }) => {
    const key = url.searchParams.get('key');

    if (!key) {
        return new Response('Missing key', { status: 400 });
    }

    const object = await locals.env.R2_BUCKET.get(key); // assumes env bound in hook
    if (!object || !object.body) {
        return new Response('Not found in R2', { status: 404 });
    }

    return new Response(object.body, {
        headers: {
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream'
        }
    });
};
