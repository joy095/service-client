// src/routes/businesses/+page.server.ts
import type { PageServerLoad } from './$types';

type Business = {
    id: string;
    name: string;
    category: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    imageId: string | null;
    location: {
        latitude: number;
        longitude: number;
    };
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    ownerId: string;
    ObjectName: string | null;
};

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/business`);
        if (!res.ok) {
            throw new Error('Failed to fetch properties');
        }
        const data = await res.json();
        const businesses: Business[] = data.businesses.map((b: Business) => ({
            ...b,
            ObjectName: b.ObjectName || `https://picsum.photos/536/354?random=${b.id}`
        }));
        console.log(businesses)
        return { businesses };
    } catch (error) {
        console.error(error);
        return {
            businesses: []
        };
    }
};

