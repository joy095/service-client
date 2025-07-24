import { env } from '$env/dynamic/private';
import type { Business, Service } from '$lib/types';
import type { PageServerLoad } from './$types';

const API_BASE = env.API_URL;

export const load: PageServerLoad = async ({ params, fetch }) => {

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

    // Normalize service image URLs
    const services: Service[] = (serviceData.service ?? []).map((srv: Service) => ({
        ...srv,
        objectName: srv.objectName || null
    }));

    const res = await fetch(`${env.API_URL}/public-working-hour/${business.publicId}`);
    if (!res.ok) {
        throw new Error('Failed to load working hours');
    }
    const data = await res.json();

    console.log("data.workingHours", data.workingHours)
    console.log("business", business)
    console.log("services", services)

    return {
        business,
        workingHours: data.workingHours,
        services
    };
};
