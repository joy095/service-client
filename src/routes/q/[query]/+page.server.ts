// src/routes/q/[query]/+page.server.ts
import { PUBLIC_API_URL } from '$env/static/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const { query } = params;

    try {
        const url = `${PUBLIC_API_URL}/business/search/${encodeURIComponent(query)}`;
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Failed to fetch results: ${res.status} ${res.statusText}`);
        }

        const { businesses = [] } = await res.json();

        return {
            query,
            businesses,
            count: businesses.length,
        };
    } catch (err) {
        console.error('Error fetching search results:', err);
        return {
            query,
            businesses: [],
            count: 0,
        };
    }
};