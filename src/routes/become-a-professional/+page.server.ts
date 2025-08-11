import { fail, redirect } from '@sveltejs/kit';
import type { Actions, RequestEvent } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const actions: Actions = {
    default: async ({ request, cookies }: RequestEvent) => {
        const data = await request.formData();

        const name = data.get('name')?.toString();
        const category = data.get('category')?.toString();
        const latitude = parseFloat(data.get('latitude')?.toString() || '');
        const longitude = parseFloat(data.get('longitude')?.toString() || '');
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

        const response = await fetch(`${PUBLIC_API_URL}/business`, {
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

        const publicId = responseData.publicId || responseData.business?.publicId;

        if (!publicId) {
            return fail(500, {
                error: 'Missing public ID in response',
                success: false,
                message: 'Could not retrieve business identifier'
            });
        }

        // IMPORTANT: Don't wrap this in try/catch
        throw redirect(303, `/become-a-professional/${publicId}/upload-images`);
    }
};
