// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';
const BASE_URL = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev';
import type { Business } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }: { fetch: typeof globalThis.fetch }) => {
    try {
        const res = await fetch(`${env.API_URL}/business/by-user`);
        if (!res.ok) {
            // It's better to return an empty array or throw a specific error
            // if the API call fails, rather than throwing a generic error that might crash the page.
            console.error('Failed to fetch businesses:', res.status, res.statusText);
            return { businesses: [] };
        }
        const data = await res.json();
        // The backend now returns an array under 'businesses' key
        const businesses: Business[] = data.businesses;

        // Map over the array of businesses to format ObjectName for each
        const formattedBusinesses = businesses.map(business => {
            const isFullUrl = business.ObjectName?.startsWith('http');
            return {
                ...business,
                ObjectName: business.ObjectName
                    ? isFullUrl
                        ? business.ObjectName
                        : BASE_URL + business.ObjectName
                    : `https://picsum.photos/536/354?random=${business.id}` // Fallback image
            };
        });

        return { businesses: formattedBusinesses };

    } catch (error) {
        console.error('Error in +page.server.ts load function:', error);
        return {
            businesses: []
        };
    }
};
