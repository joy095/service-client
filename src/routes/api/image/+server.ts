export const GET = async ({ url, platform }) => {
    try {
        console.log('Function triggered');

        const key = url.searchParams.get('key');
        if (!key) return new Response('Missing key', { status: 400 });

        const object = await platform.env.R2_BUCKET_NAME.get(key);
        if (!object) return new Response('Not found in R2', { status: 404 });

        console.log(`Successfully retrieved object: ${key}`);

        return new Response(object.body, {
            headers: {
                'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (err) {
        console.error('💥 Error in /api/image GET:', err);
        return new Response('Internal Server Error', { status: 500 });
    }
};
