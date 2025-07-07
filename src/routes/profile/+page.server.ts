// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';
import type { User } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const res = await fetch(`${env.API_URL}/profile`);
        if (!res.ok) {
            throw new Error('Failed to fetch properties');
        }
        const data = await res.json();
        const profile: User = data;

        return { profile };
    } catch (error) {
        console.error(error);
        return {
            profile: null
        };
    }
};
