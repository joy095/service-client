// src/routes/bookings/+page.server.ts
import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

type Booking = {
    id: string;
    objectName: string | null;
    serviceName: string;
    amount: number;
    status: 'pending' | 'paid';
    expectedDelivery: string | null;
};

export const load: PageServerLoad = async ({ cookies }) => {
    try {
        const accessToken = cookies.get('access_token');

        // If no access token, return empty bookings (unauthenticated)
        if (!accessToken) {
            return { bookings: [] as Booking[] };
        }

        // Direct fetch implementation without apiFetch wrapper
        const response = await fetch(`${PUBLIC_API_URL}/booking`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                Cookie: `access_token=${accessToken}`
            }
        });

        // Handle HTTP errors
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Parse JSON response
        const data = await response.json();

        // Handle case where response is null/undefined
        if (!data) {
            console.warn('API returned null/undefined response');
            return { bookings: [] as Booking[] };
        }

        // Extract the bookings array from the response object
        const bookings = data.bookings || [];

        // Ensure we always return an array
        if (!Array.isArray(bookings)) {
            return { bookings: [] as Booking[] };
        }

        return { bookings };
    } catch (err) {
        // Log detailed error information
        if (err instanceof Error) {
            console.error('Error fetching bookings:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
        } else {
            console.error('Unknown error fetching bookings:', err);
        }

        // Always return empty bookings array to prevent page crash
        return { bookings: [] as Booking[] };
    }
};