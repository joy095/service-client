import { env } from '$env/dynamic/private';
import type { Business, Service } from '$lib/types';
import type { PageServerLoad } from './$types';

const BASE_URL = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev';
const API_BASE = env.API_URL;

export const load: PageServerLoad = async ({ params, fetch, url }) => {

    // Fetch business data by publicId (e.g. premium-barber-HTmV9hlV)
    const businessRes = await fetch(`${API_BASE}/business/${params.id}`);
    if (!businessRes.ok) throw new Error('Failed to load business');
    const businessData = await businessRes.json();
    const businessRaw = businessData.business;

    // Get serviceId from query parameters
    const serviceId = url.searchParams.get('service'); // Service ID from query parameters

    // Use the internal UUID to fetch services
    const serviceRes = await fetch(`${API_BASE}/service/${serviceId}`);
    if (!serviceRes.ok) throw new Error('Failed to load services');
    const serviceData = await serviceRes.json();


    // Normalize business image URL
    const business: Business = {
        ...businessRaw,
        ObjectName: businessRaw.ObjectName?.startsWith('http')
            ? businessRaw.ObjectName
            : businessRaw.ObjectName
                ? BASE_URL + businessRaw.ObjectName
                : `https://picsum.photos/536/354?random=${businessRaw.id}`
    };

    // Normalize service image URLs
    const services: Service = {
        ...serviceData.service,
        objectName: serviceData.service.objectName?.startsWith('http')
            ? serviceData.service.objectName
            : serviceData.service.objectName
                ? BASE_URL + serviceData.service.objectName
                : `https://picsum.photos/400/250?random=${serviceData.service.id}`
    };

    const res = await fetch(`${env.API_URL}/working-hour-business/${business.publicId}/working-hours`);
    if (!res.ok) {
        throw new Error('Failed to load working hours');
    }
    const data = await res.json();

    return {
        business,
        workingHours: data.workingHours,
        services
    };
};
