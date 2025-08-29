import { PUBLIC_API_URL } from "$env/static/public";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "../$types";

const API_BASE = PUBLIC_API_URL;

// service = bed02412-023e - 4289 - be30 - abe48e711ef4

export const load: PageServerLoad = async ({ params, fetch, cookies, url }) => {
    const serviceIdRaw = url.searchParams.get('service')?.trim();
    if (!serviceIdRaw) {
        throw error(400, 'Missing "service" query parameter');
    }
    const serviceId = serviceIdRaw.replace(/\s+/g, '');

    // Fetch services
    const serviceRes = await fetch(`${API_BASE}/service/${encodeURIComponent(serviceId)}`);
    const payload = await serviceRes.json().catch(() => null);
    if (!serviceRes.ok) {
        const message = payload?.error || `Failed to load service (${serviceRes.status})`;
        throw error(serviceRes.status, message);
    }
    const { service } = payload ?? {};
    if (!service) {
        throw error(502, 'Service payload missing');
    }


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

    return { service, schedule, businessRaw };
};
