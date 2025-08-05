// src/routes/businesses/+page.server.ts
import type { PageServerLoad } from './$types';
import type { Business, BusinessImage } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const res = await fetch(`${env.API_URL}/business`);

        if (!res.ok) {
            throw new Error(`Failed to fetch businesses: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Transform the API response into the expected Business type
        const businesses: Business[] = data.businesses.map((business: Business) => ({
            id: business.id,
            name: business.name,
            category: business.category,
            address: business.address,
            city: business.city,
            state: business.state,
            country: business.country,
            postalCode: business.postalCode,
            latitude: business.latitude,
            longitude: business.latitude,
            createdAt: business.createdAt,
            updatedAt: business.updatedAt,
            isActive: business.isActive,
            ownerId: business.ownerId,
            publicId: business.publicId,
            images: (business.images ?? []).map((img: BusinessImage) => ({
                businessId: img.businessId,
                imageId: img.imageId,
                position: img.position,
                objectName: img.objectName,
                createdAt: img.createdAt,
            })) ?? []
        }));

        return {
            businesses
        };
    } catch (error) {
        console.error('Error loading businesses:', error);
        return {
            businesses: [] as Business[]
        };
    }
};