// src/routes/businesses/+page.server.ts
import type { PageServerLoad } from './$types';
import type { Business } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }: { fetch: typeof globalThis.fetch }) => {

    try {
        const res = await fetch(`${env.API_URL}/business`);
        if (!res.ok) {
            throw new Error('Failed to fetch properties');
        }
        const data = await res.json();
        const businesses: Business[] = data.businesses.map((business: Business) => {
            return {
                id: business.id,
                name: business.name,
                category: business.category,
                address: business.address,
                city: business.city,
                state: business.state,
                country: business.country,
                postalCode: business.postalCode,
                imageId: business.imageId,
                Latitude: business.Latitude,
                Longitude: business.Longitude,
                createdAt: business.createdAt,
                updatedAt: business.updatedAt,
                isActive: business.isActive,
                ownerId: business.ownerId,
                PrimaryImageObject: `${env.IMAGE_URL}${'/' + business.PrimaryImageObject}` || '',
                publicId: business.publicId,
            };
        });
        console.log(businesses)
        return { businesses };
    } catch (error) {
        console.error(error);
        return {
            businesses: []
        };
    }

};
