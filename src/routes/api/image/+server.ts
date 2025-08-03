export const GET = async ({ url, platform }) => {
    console.log('Function triggered');

    const key = url.searchParams.get('key');
    if (!key) return new Response('Missing key', { status: 400 });

    const object = await platform.env.R2_BUCKET_NAME.get(key);
    if (!object) return new Response('Not found in R2', { status: 404 });

    return new Response(object.body, {
        headers: {
            'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
            'Cache-Control': 'public, max-age=86400',
        },
    });
};
