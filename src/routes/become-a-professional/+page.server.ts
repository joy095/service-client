import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, RequestEvent } from './$types';

export const actions: Actions = {
    default: async ({ request, cookies }: RequestEvent) => {
        const data = await request.formData();

        const name = data.get('name')?.toString();
        const category = data.get('category')?.toString();
        const latitude = parseFloat(data.get('latitude')?.toString() || '');
        const longitude = parseFloat(data.get('longitude')?.toString() || '');
        // Assuming only the first element of these arrays is needed based on your FormData example
        const city = data.getAll('city')[0]?.toString();
        const state = data.getAll('state')[0]?.toString();
        const country = data.getAll('country')[0]?.toString();
        const postalCode = data.getAll('postalCode')[0]?.toString();
        const address = data.getAll('address')[0]?.toString();
        const about = data.get('about')?.toString() || '';

        if (!name || !category || isNaN(latitude) || isNaN(longitude) ||
            !address || !city || !state || !country || !postalCode) {
            return fail(400, {
                error: 'Missing required fields',
                success: false,
                message: 'Please fill all required fields'
            });
        }

        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            return fail(401, {
                error: 'Not authenticated',
                success: false,
                message: 'Please login to continue'
            });
        }

        try {
            const response = await fetch(`${env.API_URL}/business`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    name,
                    category,
                    latitude,
                    longitude,
                    address,
                    city,
                    state,
                    country,
                    postalCode,
                    about
                })
            });

            const responseData = await response.json();

            if (!response.ok) {
                return fail(response.status, {
                    error: responseData.error || 'Unknown error',
                    success: false,
                    message: responseData.message || 'Failed to create business'
                });
            }

            return {
                success: true,
                message: 'Business created successfully'
            };
        } catch (err) {
            console.error('Fetch error:', err);
            return fail(500, {
                error: 'Could not connect to server',
                success: false,
                message: 'Server connection failed'
            });
        }
    }
};
