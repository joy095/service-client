// src/routes/profile/+page.server.ts
import type { PageServerLoad } from './$types';
import type { Business } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        // Fetch user's businesses
        const res = await fetch(`${env.API_URL}/business/by-user`);
        if (!res.ok) {
            console.error('Failed to fetch businesses:', res.status, res.statusText);
            return { businesses: [] };
        }

        const data = await res.json();

        if (!isBusinessApiResponse(data)) {
            console.error('Invalid API response structure:', data);
            return { businesses: [] };
        }

        const businesses: Business[] = data.businesses;

        // Base URL for images
        const BASE_URL = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev';

        // Fetch isServiceBusiness status for each business
        const enhancedBusinesses = await Promise.all(
            businesses.map(async (business) => {
                try {
                    const serviceRes = await fetch(
                        `${env.API_URL}/is-service-business/${business.publicId}`
                    );
                    const isServiceBusiness = await serviceRes.json();

                    return {
                        ...business,
                        PrimaryImageObject:
                            business.imageId && business.imageId.trim()
                                ? BASE_URL + business.imageId
                                : business.images?.length > 0
                                    ? BASE_URL + business.images[0].objectName
                                    : null,
                        isServiceBusiness // Add flag to business object
                    };

                } catch (err) {
                    console.error(`Failed to fetch service status for ${business.publicId}`, err);
                    return {
                        ...business,
                        PrimaryImageObject:
                            business.imageId && business.imageId.trim()
                                ? BASE_URL + business.imageId
                                : business.images?.length > 0
                                    ? BASE_URL + business.images[0].objectName
                                    : null,
                    };
                }
            })
        );

        return { businesses: enhancedBusinesses };

    } catch (error) {
        console.error('Error in +page.server.ts load function:', error);
        return { businesses: [] };
    }
};

function isBusinessApiResponse(data: unknown): data is { businesses: Business[] } {
    if (typeof data !== 'object' || data === null) return false;
    const obj = data as Record<string, unknown>;
    return Array.isArray(obj.businesses);
}