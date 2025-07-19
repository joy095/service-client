import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, RequestEvent } from './$types';
import { userPendingBusiness } from '$lib/store';
import { get } from 'svelte/store';

export const actions: Actions = {
    default: async ({ request, cookies }: RequestEvent) => {
        const data = await request.formData();

        // Get current business data from store
        const pendingBusiness = get(userPendingBusiness);
        const public_id = pendingBusiness?.public_id;

        if (!public_id) {
            return fail(400, { error: 'Missing business ID', success: false });
        }

        // Get form data or fall back to store values
        const name = data.get('name')?.toString() || pendingBusiness?.name || '';
        const category = data.get('category')?.toString() || pendingBusiness?.category || '';
        const latitude = data.get('latitude')?.toString() || pendingBusiness?.latitude?.toString() || '';
        const longitude = data.get('longitude')?.toString() || pendingBusiness?.longitude?.toString() || '';
        const address = data.get('address')?.toString() || pendingBusiness?.address || '';
        const city = data.get('city')?.toString() || pendingBusiness?.city || '';
        const state = data.get('state')?.toString() || pendingBusiness?.state || '';
        const country = data.get('country')?.toString() || pendingBusiness?.country || '';
        const postalCode = data.get('postalCode')?.toString() || pendingBusiness?.postalCode || '';
        const about = data.get('about')?.toString() || pendingBusiness?.about || '';

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

            // Using PUT method for update
            const response = await fetch(`${env.API_URL}/business/${public_id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify(Object.fromEntries(formData))
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
                message: 'Business updated successfully'
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
