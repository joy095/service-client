import type { PagesFunction } from '@cloudflare/workers-types';

export const onRequest: PagesFunction = async ({ request, env }) => {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");

    if (!key) {
        return new Response("Missing key", { status: 400 });
    }

    const object = await env.MY_BUCKET.get(key);
    if (!object || !object.body) {
        return new Response("Not found in R2", { status: 404 });
    }

    return new Response(object.body, {
        headers: {
            "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
        },
    });
};
