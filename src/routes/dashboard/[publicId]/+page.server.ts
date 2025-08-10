// src/routes/dashboard/[publicId]/+page.server.ts
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const { publicId } = params;

    if (!publicId) {
        throw error(400, 'Missing publicId');
    }

    try {
        const res = await fetch(`${env.API_URL}/services/${publicId}`, {
            method: 'GET'
        });

        if (!res.ok) {
            console.warn(`Backend returned ${res.status} for /services/${publicId}`);
            if (res.status === 404) {
                return { publicId, services: [] };
            }
            throw error(res.status, `Failed to load services for ${publicId}`);
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