// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';
const BASE_URL = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev';
import type { Business } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const res = await fetch(`${env.API_URL}/business/by-user`);
        if (!res.ok) {
            console.error('Failed to fetch businesses:', res.status, res.statusText);
            return { businesses: [] };
        }

        const data = await res.json();

        // Assert that data has the shape we expect
        if (!isBusinessApiResponse(data)) {
            console.error('Invalid API response structure:', data);
            return { businesses: [] };
        }

        const businesses: Business[] = data.businesses;

        const formattedBusinesses = businesses.map(business => {
            // Determine PrimaryImageObject based on imageId or images array
            let primaryImgUrl: string | null = null;

            if (business.imageId && business.imageId.trim() !== '') {
                primaryImgUrl = BASE_URL + business.imageId;
            } else if (business.images?.length > 0) {
                // Optionally use the first image from the images array
                primaryImgUrl = BASE_URL + business.images[0].objectName;
            }

            return {
                ...business,
                PrimaryImageObject: primaryImgUrl // Could be null if no image
            };
        });

        return { businesses: formattedBusinesses };

    } catch (error) {
        console.error('Error in +page.server.ts load function:', error);
        return { businesses: [] };
    }
};

// Helper type guard function
function isBusinessApiResponse(data: unknown): data is { businesses: Business[] } {
    return (
        typeof data === 'object' &&
        data !== null &&
        'businesses' in data &&
        Array.isArray(data.businesses)
    );
}