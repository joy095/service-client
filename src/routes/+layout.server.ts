// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';
import type { User } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }: { fetch: typeof globalThis.fetch }) => {
    try {
        const res = await fetch(`${env.API_URL}/profile`);
        if (!res.ok) {

            const errorText = await res.text();
            console.error(`Failed to fetch profile: ${res.status} - ${errorText}`);
            throw new Error('Failed to fetch profile');
        }
        const data = await res.json();

        const user: User | null = data?.user || null;

        if (!user) {
            console.warn('Fetched profile data is missing the expected user object.');

            throw new Error('User data not found in profile response');
        }

        return { user };
    } catch (error) {
        console.error('Error in profile page load:', error);
        return {
            user: null
        };
    }
};