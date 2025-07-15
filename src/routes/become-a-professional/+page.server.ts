import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions, RequestEvent } from './$types';

export const actions: Actions = {
    default: async ({ request, cookies }: RequestEvent) => {

        const data = await request.formData();


        // Basic validation for required fields
        const name = data.get('name')?.toString();
        const category = data.get('category')?.toString();
        const latitude = data.get('latitude')?.toString();
        const longitude = data.get('longitude')?.toString();
        const address = data.get('address')?.toString();
        const city = data.get('city')?.toString();
        const state = data.get('state')?.toString();
        const country = data.get('country')?.toString();
        const postalCode = data.get('postalCode')?.toString();

        // Validate required fields
        if (!name) {
            return fail(400, { missing: 'name', success: false, error: 'Business name is required.' });
        }
        if (!category) {
            return fail(400, { missing: 'category', success: false, error: 'Category is required.' });
        }
        if (!latitude || isNaN(parseFloat(latitude))) {
            return fail(400, { missing: 'latitude', success: false, error: 'Latitude must be a valid number.' });
        }
        if (!longitude || isNaN(parseFloat(longitude))) {
            return fail(400, { missing: 'longitude', success: false, error: 'Longitude must be a valid number.' });
        }
        if (!address) {
            return fail(400, { missing: 'address', success: false, error: 'Address is required.' });
        }
        if (!city) {
            return fail(400, { missing: 'city', success: false, error: 'City is required.' });
        }
        if (!state) {
            return fail(400, { missing: 'state', success: false, error: 'State is required.' });
        }
        if (!country) {
            return fail(400, { missing: 'country', success: false, error: 'Country is required.' });
        }
        if (!postalCode) {
            return fail(400, { missing: 'postalCode', success: false, error: 'Postal code is required.' });
        }

        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            return fail(401, { error: 'Authentication required. Please log in.', success: false });
        }

        try {
            // Construct the payload for non-file fields
            const payload = {
                Name: name,
                Category: category,
                About: data.get('about')?.toString() || '',
                Latitude: parseFloat(latitude),
                Longitude: parseFloat(longitude),
                Address: address,
                City: city,
                State: state,
                Country: country,
                PostalCode: postalCode,
                isActive: false,
                ...Object.fromEntries(
                    Array.from(data.entries()).filter(
                        ([key]) => !['name', 'category', 'latitude', 'longitude', 'address', 'city', 'state', 'country', 'postalCode'].includes(key)
                    ).map(([key, value]) => [key, value.toString()])
                )
            };

            const formData = new FormData();
            formData.append('payload', JSON.stringify(payload));

            // Send the form data with images to the API
            const response = await fetch(`${env.API_URL}/business`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                },
                body: formData
            });

            if (!response.ok) {
                const errorBody = await response.json();
                console.error('API Error:', errorBody);
                return fail(response.status, {
                    error: errorBody.error || `API returned an error: ${response.statusText}`,
                    success: false
                });
            }

            return { success: true, message: 'Business submitted successfully!' };
        } catch (error) {
            console.error('Fetch Error:', error);
            return fail(500, {
                error: 'Could not connect to the server. Please try again later.',
                success: false
            });
        }
    }
};