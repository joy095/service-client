import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, RequestEvent } from './edit/$types';

export const actions: Actions = {
    default: async ({ request, cookies }: RequestEvent) => {
        const data = await request.formData();

        const name = data.get('name')?.toString();
        const category = data.get('category')?.toString();
        const latitude = data.get('latitude')?.toString();
        const longitude = data.get('longitude')?.toString();
        const address = data.get('address')?.toString();
        const city = data.get('city')?.toString();
        const state = data.get('state')?.toString();
        const country = data.get('country')?.toString();
        const postalCode = data.get('postalCode')?.toString();
        const about = data.get('about')?.toString() || '';

        if (!name || !category || !latitude || !longitude || !address || !city || !state || !country || !postalCode) {
            return fail(400, { error: 'Missing required fields', success: false });
        }

        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            return fail(401, { error: 'Not authenticated', success: false });
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('category', category);
            formData.append('latitude', latitude);
            formData.append('longitude', longitude);
            formData.append('address', address);
            formData.append('city', city);
            formData.append('state', state);
            formData.append('country', country);
            formData.append('postalCode', postalCode);
            formData.append('about', about);

            const response = await fetch(`${env.API_URL}/business`, {
                method: 'POST',
                headers: {
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include',
                body: formData
            });

            if (!response.ok) {
                const errorBody = await response.json();
                console.error('API Error:', errorBody);
                return fail(response.status, {
                    error: errorBody.error || 'Unknown error',
                    success: false
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
                success: false
            });
        }
    }
};
