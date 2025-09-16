import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

type Order = {
    id: string;
    objectName: string | null;
    serviceName: string;
    serviceId: string;
    amount: number;
    status: 'pending' | 'paid' | 'refund';
    customerId: string;
};

export const load: PageServerLoad = async ({ cookies, url }) => {
    try {
        const accessToken = cookies.get('access_token');

        // If no access token, return empty orders (unauthenticated)
        if (!accessToken) {
            return {
                orders: [] as Order[],
                totalPages: 0,
                currentPage: 1,
                totalOrders: 0
            };
        }

        // Get query parameters
        const status = url.searchParams.get('status') || 'all';
        const date = url.searchParams.get('date') || 'week';
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = 10; // Items per page

        // Build query string
        const queryParams = new URLSearchParams();
        if (status !== 'all') queryParams.set('status', status);
        queryParams.set('date', date);
        queryParams.set('page', page.toString());
        queryParams.set('limit', limit.toString());

        // Fetch orders with filters and pagination
        const response = await fetch(`${PUBLIC_API_URL}/seller/orders?${queryParams.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cookie': `access_token=${accessToken}`
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
            return {
                orders: [] as Order[],
                totalPages: 0,
                currentPage: page,
                totalOrders: 0
            };
        }

        // Extract the orders array from the response object
        const orders = data.orders || [];
        const totalPages = data.totalPages || 0;
        const totalOrders = data.totalOrders || 0;

        // Ensure we always return an array
        if (!Array.isArray(orders)) {
            return {
                orders: [] as Order[],
                totalPages: 0,
                currentPage: page,
                totalOrders: 0
            };
        }

        return {
            orders,
            totalPages,
            currentPage: page,
            totalOrders
        };
    } catch (err) {
        // Log detailed error information
        if (err instanceof Error) {
            console.error('Error fetching orders:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
        } else {
            console.error('Unknown error fetching orders:', err);
        }

        // Always return empty orders array to prevent page crash
        return {
            orders: [] as Order[],
            totalPages: 0,
            currentPage: 1,
            totalOrders: 0
        };
    }
};