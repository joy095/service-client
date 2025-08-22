import { PUBLIC_API_URL } from "$env/static/public";
import type { Service } from "$lib/types";
import type { PageServerLoad } from "../$types";

const API_BASE = PUBLIC_API_URL;

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
    // Fetch services
    const serviceRes = await fetch(`${API_BASE}/services/${params.publicId}`);
    if (!serviceRes.ok) throw new Error('Failed to load services');
    const serviceData = await serviceRes.json();
    const services: Service[] = (serviceData.service ?? []).map((srv: Service) => ({
        ...srv,
        objectName: srv.objectName || null
    }));

    // Fetch business
    const businessRes = await fetch(`${API_BASE}/business/${params.publicId}`);
    if (!businessRes.ok) throw new Error('Failed to load business');
    const businessRaw = (await businessRes.json()).business;

    // Fetch schedule if authenticated
    const accessToken = cookies.get('access_token');
    let schedule = null;

    if (accessToken) {
        try {
            const response = await fetch(`${API_BASE}/schedule-slots`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify({})
            });

            if (response.ok) {
                schedule = await response.json();
            }
        } catch (err) {
            console.error('[Schedule Slots] Fetch error:', err);
        }
    }

    return { services, schedule, businessRaw };
};
