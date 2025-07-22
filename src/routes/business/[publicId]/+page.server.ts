import type { PageServerLoad } from './$types';
import type { Business, Service } from '$lib/types';
import { env } from '$env/dynamic/private';

const BASE_URL = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev';
const API_BASE = env.API_URL;

export const load: PageServerLoad = async ({ fetch, params }) => {
    // Fetch business data by publicId (e.g. premium-barber-HTmV9hlV)
    const businessRes = await fetch(`${API_BASE}/business/${params.publicId}`);
    if (!businessRes.ok) throw new Error('Failed to load business');
    const businessData = await businessRes.json();
    const businessRaw = businessData.business;

    // Use the internal UUID to fetch services
    const serviceRes = await fetch(`${API_BASE}/services/${businessRaw.id}`);
    if (!serviceRes.ok) throw new Error('Failed to load services');
    const serviceData = await serviceRes.json();

    // Normalize business image URL
    const business: Business = {
        ...businessRaw,
        PrimaryImageObject: businessRaw.PrimaryImageObject?.startsWith('http')
            ? businessRaw.PrimaryImageObject
            : businessRaw.PrimaryImageObject
                ? BASE_URL + businessRaw.PrimaryImageObject
                : `https://picsum.photos/536/354?random=${businessRaw.id}`
    };

    // Normalize service image URLs
    const services: Service[] = (serviceData.service ?? []).map((srv: Service) => ({
        ...srv,
        PrimaryImageObject: srv.PrimaryImageObject?.startsWith('http')
            ? srv.PrimaryImageObject
            : srv.PrimaryImageObject
                ? BASE_URL + srv.PrimaryImageObject
                : `https://picsum.photos/400/250?random=${srv.id}`
    }));

    return { business, services };
};
