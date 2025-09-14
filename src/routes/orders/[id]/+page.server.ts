import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

interface Booking {
    id: string;
    customerId: string;
    serviceId: string;
    amount: number;
    status: string;
    objectName: string | null;
    serviceName: string | null;
    businessName: string | null;
}

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
    try {
        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            throw error(401, 'Authentication required');
        }

        const response = await fetch(`${PUBLIC_API_URL}/booking/${params.id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw error(response.status, 'Failed to fetch booking');
        }

        const data = await response.json();

        // Extract the first booking from the array
        const booking: Booking = Array.isArray(data.order) ? data.order[0] : data.order;

        return {
            booking
        };
    } catch (err) {
        console.error('Error fetching booking:', err);
        throw error(500, 'Error loading booking details');
    }
};