// src/routes/businesses/+page.server.ts
import type { PageServerLoad } from './$types';
const BASE_URL = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev';
import type { Business } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }: { fetch: typeof globalThis.fetch }) => {

    try {
        const res = await fetch(`${env.API_URL}/business`);
        if (!res.ok) {
            throw new Error('Failed to fetch properties');
        }
        const data = await res.json();
        const businesses: Business[] = data.businesses.map((b: Business) => {
            const isFullUrl = b.ObjectName?.startsWith('http');
            return {
                ...b,
                ObjectName: b.ObjectName
                    ? isFullUrl
                        ? b.ObjectName
                        : BASE_URL + b.ObjectName
                    : `https://picsum.photos/536/354?random=${b.id}`
            };
        });
        return { businesses };
    } catch (error) {
        console.error(error);
        return {
            businesses: []
        };
    }

};
