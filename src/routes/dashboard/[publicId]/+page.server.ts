// src/routes/dashboard/[publicId]/+page.server.ts
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const { publicId } = params;

    if (!publicId) {
        return {
            status: 400,
            error: new Error('Missing publicId')
        };
    }

    try {
        const res = await fetch(`${env.API_URL}/services/${publicId}`, {
            method: 'GET'
        });

        if (!res.ok) {
            console.warn(`Backend returned ${res.status} for /services/${publicId}`);
            return { publicId, services: [] };
        }

        const data = await res.json();

        // console.log('data', data)

        return {
            publicId,
            services: Array.isArray(data.service) ? data.service : []
        };
    } catch (err) {
        console.error('Error loading services:', err);
        return { publicId, services: [] };
    }
};