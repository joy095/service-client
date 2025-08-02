// src/app/business/[publicId]/page.tsx (Server Component version)
import BusinessPageClient from './client';

// Define the API response types
interface ApiBusinessImage {
    imageId?: string;
    objectName?: string;
    position?: number;
}

interface ApiBusiness {
    id?: string;
    publicId?: string;
    name?: string;
    description?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    Latitude?: number;
    Longitude?: number;
    isActive?: boolean;
    images?: ApiBusinessImage[];
    [key: string]: any;
}

interface ApiBusinessResponse {
    business?: ApiBusiness;
}

interface ApiService {
    id: string;
    name: string;
    description: string;
    price: number;
    durationMinutes: number;
    objectName?: string;
    [key: string]: any;
}

interface ApiServiceResponse {
    service?: ApiService[];
}

// Server-side data fetching
async function fetchBusinessData(publicId: string): Promise<{ business?: any; services: any[] } | null> {
    const API_BASE = process.env.API_URL || 'http://localhost:3001';

    try {
        // Fetch business data
        const businessRes = await fetch(`${API_BASE}/business/${publicId}`);
        if (!businessRes.ok) {
            console.error('Failed to load business:', businessRes.status);
            return { services: [] };
        }

        const businessData: ApiBusinessResponse = await businessRes.json();
        const businessRaw = businessData.business;

        // Fetch services
        const serviceRes = await fetch(`${API_BASE}/services/${publicId}`);
        let services: any[] = [];

        if (serviceRes.ok) {
            const serviceData: ApiServiceResponse = await serviceRes.json();
            services = (serviceData.service ?? []).map((srv) => ({
                ...srv,
                objectName: srv.objectName || undefined
            }));
        }

        // Normalize business
        const business = businessRaw ? {
            ...businessRaw,
            objectName: businessRaw.objectName || undefined
        } : undefined;

        return { business, services };
    } catch (error) {
        console.error('Error loading business data:', error);
        return { services: [] };
    }
}

// Server Component
export default async function BusinessPage({ params }: { params: { publicId: string } }) {
    const data = await fetchBusinessData(params.publicId);

    if (!data) {
        return <BusinessPageClient />;
    }

    const { business, services = [] } = data;

    return <BusinessPageClient business={business} services={services} />;
}