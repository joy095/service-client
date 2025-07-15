// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';
import type { User } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            console.warn('No access token found in cookies.');
            return { user: null };
        }

        const res = await fetch(`${env.API_URL}/profile`, {
            headers: {
                cookie: `access_token=${accessToken}`
            },
            credentials: 'include' // Optional, safe to include
        });

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
