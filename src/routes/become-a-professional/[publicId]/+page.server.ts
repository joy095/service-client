// src/routes/business/[publicId]/+page.server.ts
import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const publicId = params.publicId;

    // Call your backend or database here
    const res = await fetch(`${PUBLIC_API_URL}/business/${publicId}`);
    if (!res.ok) {
        throw new Response('Business not found', { status: 404 });
    }

    const business = await res.json();

    return { business };
};
