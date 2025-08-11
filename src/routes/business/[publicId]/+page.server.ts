import type { PageServerLoad } from './$types';
import type { Business, Service } from '$lib/types';
import { env } from '$env/dynamic/private';

const API_BASE = PUBLIC_API_URL;

export const load: PageServerLoad = async ({ fetch, params }) => {
    // Fetch business data by publicId (e.g. premium-barber-HTmV9hlV)
    const businessRes = await fetch(`${API_BASE}/business/${params.publicId}`);
    if (!businessRes.ok) throw new Error('Failed to load business');
    const businessData = await businessRes.json();
    const businessRaw = businessData.business;

    // Use the internal UUID to fetch services
    const serviceRes = await fetch(`${API_BASE}/services/${params.publicId}`);
    if (!serviceRes.ok) throw new Error('Failed to load services');
    const serviceData = await serviceRes.json();

    // Normalize business - use objectName exactly as provided by backend
    const business: Business = {
        ...businessRaw,
        objectName: businessRaw.objectName || null
    };

    // Normalize services - use objectName exactly as provided by backend
    const services: Service[] = (serviceData.service ?? []).map((srv: Service) => ({
        ...srv,
        objectName: srv.objectName || null
    }));

    return { business, services };
};