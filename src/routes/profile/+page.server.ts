// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';
const BASE_URL = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev';
import type { Business } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }: { fetch: typeof globalThis.fetch }) => {

    try {
        const res = await fetch(`${env.API_URL}/business/by-user`);
        if (!res.ok) {
            throw new Error('Failed to fetch properties');
        }
        const data = await res.json();
        const business: Business = data.business;

        const isFullUrl = business.ObjectName?.startsWith('http');
        const formattedBusiness = {
            ...business,
            ObjectName: business.ObjectName
                ? isFullUrl
                    ? business.ObjectName
                    : BASE_URL + business.ObjectName
                : `https://picsum.photos/536/354?random=${business.id}`
        };

        return { businesses: [formattedBusiness] };

    } catch (error) {
        console.error(error);
        return {
            businesses: []
        };
    }
};
