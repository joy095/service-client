import { PUBLIC_API_URL } from '$env/static/public';
import type { Service } from '$lib/types';
import type { PageServerLoad } from './$types';

const API_BASE = PUBLIC_API_URL;

export const load: PageServerLoad = async ({ params, fetch }) => {
    // Use the internal UUID to fetch services
    const serviceRes = await fetch(`${API_BASE}/services/${params.publicId}`);
    if (!serviceRes.ok) throw new Error('Failed to load services');
    const serviceData = await serviceRes.json()

    // Normalize service image URLs
    const services: Service[] = (serviceData.service ?? []).map((srv: Service) => ({
        ...srv,
        objectName: srv.objectName || null
    }));

    return {
        services
    };
};
