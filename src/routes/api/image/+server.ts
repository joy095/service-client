// src/routes/api/image/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import type { ReadableStream as CloudflareReadableStream } from '@cloudflare/workers-types'; // Import the specific Cloudflare type
import type { R2ObjectBody } from '@cloudflare/workers-types'; // Optional: for better typing of 'object'

export const GET: RequestHandler = async ({ url, locals }) => {
    const key = url.searchParams.get('key');
    if (!key) {
        return new Response('Missing key', { status: 400 });
    }

    // Type 'object' more specifically if desired (optional but good practice)
    const object: R2ObjectBody | null = await locals.env?.R2_BUCKET?.get(key);
    if (!object || !object.body) {
        return new Response('Not found in R2', { status: 404 });
    }

    // --- Specific Type Assertion ---
    // Assert that object.body is the Cloudflare ReadableStream
    const cloudflareBody = object.body as unknown as CloudflareReadableStream;
    const buffer = await cloudflareBody.arrayBuffer(); // Should now resolve correctly

    return new Response(buffer, {
        headers: {
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream'
            // Consider adding cache headers for images
            // 'Cache-Control': 'public, max-age=31536000, immutable', // Example: 1 year
        }
    });
};