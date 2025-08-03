export const onRequestGet = async ({ env, request }: any) => {
    const url = new URL(request.url);
    const key = url.searchParams.get("key"); // ?key=filename.jpg

    if (!key) {
        return new Response("Missing key param", { status: 400 });
    }

    const object = await env.R2_BUCKET_NAME.get(key);
    if (!object || !object.body) {
        return new Response("File not found", { status: 404 });
    }

    return new Response(object.body, {
        headers: {
            "Content-Type": object.httpMetadata?.contentType || "application/octet-stream"
        }
    });
};
