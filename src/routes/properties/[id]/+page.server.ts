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

type Service = {
    id: string;
    businessId: string;
    name: string;
    description: string;
    durationMinutes: number;
    price: number;
    imageId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    object_name: string | null;
};

export const load: PageServerLoad = async ({ fetch, params }) => {
    console.log('Business ID:', params.id);

    const businessRes = await fetch(`${import.meta.env.VITE_API_URL}/business/${params.id}`);
    if (!businessRes.ok) throw new Error('Failed to load business');

    const serviceRes = await fetch(`${import.meta.env.VITE_API_URL}/service/${params.id}`);
    if (!serviceRes.ok) throw new Error('Failed to load services');

    const b = (await businessRes.json()).business;
    const serviceJson = await serviceRes.json();

    console.log(serviceRes)

    const s = serviceJson.service ?? [];

    const business: Business = {
        ...b,
        ObjectName: b.ObjectName?.startsWith('http')
            ? b.ObjectName
            : b.ObjectName
                ? BASE_URL + b.ObjectName
                : `https://picsum.photos/536/354?random=${b.id}`
    };

    const services: Service[] = s.map((srv: Service) => ({
        ...srv,
        object_name: srv.object_name?.startsWith('http')
            ? srv.object_name
            : srv.object_name
                ? BASE_URL + srv.object_name
                : `https://picsum.photos/400/250?random=${srv.id}`
    }));

    console.log('Services:', services);

    return { business, services };
};
