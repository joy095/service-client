import { PUBLIC_API_URL } from '$env/static/public';
import type { Business, Service } from '$lib/types';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

const API_BASE = PUBLIC_API_URL;

export const load: PageServerLoad = async ({ params, fetch }) => {
    // Fetch business data by publicId
    const businessRes = await fetch(`${API_BASE}/business/${params.publicId}`);
    if (!businessRes.ok) throw error(404, 'Failed to load business');
    const businessData = await businessRes.json();
    const businessRaw = businessData.business;

    if (!businessRaw || typeof businessRaw.publicId !== 'string') {
        throw error(502, 'Invalid business payload from upstream API');
    }

    // Fetch services
    const serviceRes = await fetch(`${API_BASE}/services/${params.publicId}`);
    if (!serviceRes.ok) throw error(404, 'Failed to load services');
    const serviceData = await serviceRes.json();

    // Fetch working hours
    const workingHoursRes = await fetch(`${API_BASE}/public-working-hour/${businessRaw.publicId}`);
    if (!workingHoursRes.ok) throw error(404, 'Failed to load working hours');
    const workingHoursData = await workingHoursRes.json();

    // Normalize business
    const business: Business = {
        ...businessRaw,
        objectName: businessRaw.objectName || null
    };

    // Normalize services
    const services: Service[] = (serviceData.services ?? []).map((srv: Service) => ({
        ...srv,
        objectName: srv.objectName || null
    }));

    return {
        business,
        workingHours: workingHoursData.workingHours,
        services
    };
};
