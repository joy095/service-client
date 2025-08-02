import { ApiBusiness, ApiService, PageProps } from './types';

export async function fetchBusinessData({ params }: PageProps): Promise<{
    business?: ApiBusiness;
    services: ApiService[];
}>  {
    const API_BASE = process.env.API_URL || 'http://localhost:3001';

    // Await params to access its properties
    const { publicId } = await params;

    try {
        // Fetch business data
        const businessRes = await fetch(`${API_BASE}/business/${publicId}`);
        if (!businessRes.ok) {
            console.error('Failed to load business:', businessRes.status);
            return { services: [] };
        }

        const businessData: { business?: ApiBusiness } = await businessRes.json();
        const business = businessData.business;

        // Fetch services
        const serviceRes = await fetch(`${API_BASE}/services/${publicId}`);
        let services: ApiService[] = [];

        if (serviceRes.ok) {
            const serviceData: { service?: ApiService[] } = await serviceRes.json();
            services = serviceData.service ?? [];
        }

        return { business, services };
    } catch (error) {
        console.error('Error loading business data:', error);
        return { services: [] };
    }
}