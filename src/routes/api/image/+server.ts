// src/routes/api/image/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import type { R2ObjectBody } from '@cloudflare/workers-types';

export const GET: RequestHandler = async ({ url, locals }) => {
    console.log("Debug: locals.env:", locals.env); // Add this
    console.log("Debug: locals.env?.R2_BUCKET:", locals.env?.R2_BUCKET); // Add this

    const key = url.searchParams.get('key');
    if (!key) {
        return new Response('Missing key', { status: 400 });
    }

    // Check if the bucket itself is available
    if (!locals.env?.R2_BUCKET) {
        console.error("R2_BUCKET is not available in locals.env");
        return new Response('Internal Server Error: R2 Bucket not configured', { status: 500 });
    }

    const object: R2ObjectBody | null = await locals.env.R2_BUCKET.get(key); // Remove ?. if checked above
    console.log("Debug: R2 object found:", !!object); // Add this
    console.log("Debug: R2 object body exists:", !!object?.body); // Add this

    if (!object || !object.body) {
        return new Response('Not found in R2', { status: 404 });
    }

    try {
        const buffer = await (object.body as unknown as any).arrayBuffer();

        if (!(buffer instanceof ArrayBuffer)) {
            console.error("Expected ArrayBuffer, got:", typeof buffer);
            return new Response('Internal Server Error: Invalid data', { status: 500 });
        }

        return new Response(buffer, {
            headers: {
                'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream'
            }
        });
    } catch (err) {
        console.error("Error processing R2 object stream:", err);
        return new Response('Internal Server Error while reading object', { status: 500 });
    }
};