// src/routes/properties/[id]/+page.ts
import type { PageServerLoad } from './$types';

const BASE_URL = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev/';

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

export const load: PageServerLoad = async ({ fetch, params }) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/business/${params.id}`);
    if (!res.ok) {
        throw new Error(`Failed to load business with ID ${params.id}`);
    }

    const data = await res.json();
    const b: Business = data.business;

    const isFullUrl = b.ObjectName?.startsWith('http');
    const business: Business = {
        ...b,
        ObjectName: b.ObjectName
            ? isFullUrl
                ? b.ObjectName
                : BASE_URL + b.ObjectName
            : `https://picsum.photos/536/354?random=${b.id}`
    };

    return { business };
};
