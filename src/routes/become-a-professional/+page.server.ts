// src/routes/your-form-page/+page.server.ts
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

        if (!name) {
            return fail(400, { missing: 'name', success: false });
        }
        if (!category) {
            return fail(400, { missing: 'category', success: false });
        }
        if (!latitude || isNaN(parseFloat(latitude))) {
            return fail(400, { missing: 'latitude', success: false, error: 'Latitude must be a valid number' });
        }
        if (!longitude || isNaN(parseFloat(longitude))) {
            return fail(400, { missing: 'longitude', success: false, error: 'Longitude must be a valid number' });
        }
        if (!address) {
            return fail(400, { missing: 'address', success: false });
        }
        if (!city) {
            return fail(400, { missing: 'city', success: false });
        }
        if (!state) {
            return fail(400, { missing: 'state', success: false });
        }
        if (!country) {
            return fail(400, { missing: 'country', success: false });
        }
        if (!postalCode) {
            return fail(400, { missing: 'postalCode', success: false });
        }

        // Get the access_token from cookies
        const accessToken = cookies.get('access_token');

        console.log('Access Token:', accessToken);

        // Validate access_token presence (if required by your API)
        if (!accessToken) {
            return fail(401, {
                error: 'Authentication required. Please log in.',
                success: false
            });
        }

        try {
            // Construct the payload, explicitly defining fields to avoid including string latitude/longitude
            const payload = {
                Name: name,
                Category: category,
                About: data.get('about')?.toString(),
                Latitude: parseFloat(latitude), // Convert to number
                Longitude: parseFloat(longitude), // Convert to number
                Address: address,
                City: city,
                State: state,
                Country: country,
                PostalCode: postalCode,
                Road: data.get('road')?.toString(),
                HouseNumber: data.get('house_number')?.toString(),
                isActive: false, // Enforce isActive as false
                // Include dynamic fields (e.g., specialties, services, etc.)
                ...Object.fromEntries(
                    Array.from(data.entries()).filter(
                        ([key]) => ![
                            'name', 'category', 'about', 'latitude', 'longitude',
                            'address', 'city', 'state', 'country', 'postalCode',
                            'road', 'house_number'
                        ].includes(key)
                    ).map(([key, value]) => [key, value.toString()])
                )
            };

            // Log the payload for debugging
            console.log('Payload:', JSON.stringify(payload, null, 2));

            // Send the form data to your external API, including cookies
            const response = await fetch(`${env.API_URL}/business`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include', // Include cookies in the request
                body: JSON.stringify(payload)
            });

            // Handle non-successful API responses
            if (!response.ok) {
                const errorBody = await response.json();
                console.error('API Error:', errorBody);
                return fail(response.status, {
                    error: errorBody.error || `API returned an error: ${response.statusText}`,
                    success: false
                });
            }

            // Return a success message
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