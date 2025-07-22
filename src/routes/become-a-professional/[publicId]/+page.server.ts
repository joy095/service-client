// src/routes/business/[publicId]/+page.server.ts
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const publicId = params.publicId;

    // Call your backend or database here
    const res = await fetch(`${env.API_URL}/business/${publicId}`);
    if (!res.ok) {
        throw new Response('Business not found', { status: 404 });
    }

    const business = await res.json();

    return { business };
};
