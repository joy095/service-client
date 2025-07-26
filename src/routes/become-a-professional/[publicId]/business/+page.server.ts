// src/routes/become-a-professional/[publicId]/business/+page.server.ts

import { fail, redirect, type Actions } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad, RequestEvent } from './$types';


/**
 * Loads the business data for the page based on the publicId in the URL.
 * @param params - Contains the URL parameters, including `publicId`.
 * @param cookies - Provides access to HTTP cookies for authentication.
 * @returns The business data or an error object.
 */
export const load: PageServerLoad = async ({ params, cookies }) => {
    const { publicId } = params; // Extract publicId from URL parameters

    if (!publicId) {
        // If publicId is missing from the URL, return an error
        return { error: 'Business ID not provided in URL.' };
    }

    const accessToken = cookies.get('access_token');
    if (!accessToken) {
        // Redirect to login if not authenticated
        throw redirect(303, '/login');
        // Or return an error if you prefer not to redirect
        // return { error: 'Not authenticated' };
    }

    try {
        // Make GET request to fetch business data
        const response = await fetch(`${env.API_URL}/business/${publicId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include the access token, often via Authorization header or Cookie
                // Option 1: Bearer Token (common if using Authorization header)
                // 'Authorization': `Bearer ${accessToken}`
                // Option 2: Cookie (as in your action example)
                Cookie: `access_token=${accessToken}`
            },
            credentials: 'include' // Include cookies if needed by the API
        });

        if (!response.ok) {
            // Handle non-2xx responses (e.g., 404, 500)
            if (response.status === 404) {
                return { error: 'Business not found.' };
            }
            const errorBody = await response.json().catch(() => ({})); // Safely parse error body
            console.error('API GET Error:', response.status, errorBody);
            return { error: errorBody.error || `Failed to load business: ${response.statusText}` };
        }

        const businessData = await response.json();
        // Optionally, update the store with the fetched data if needed on the client
        // userPendingBusiness.set(businessData);

        // Return the fetched business data to the page component
        return { business: businessData };

    } catch (err) {
        // Handle network errors or unexpected issues
        console.error('Fetch error during load:', err);
        return { error: 'Could not connect to server to load business data.' };
    }
};

/**
 * Handles the form submission (PUT request) to update the business.
 */
export const actions: Actions = {
    default: async ({ request, cookies, params }: RequestEvent) => {
        const { publicId } = params; // Extract publicId from URL parameters

        if (!publicId) {
            return fail(400, { error: 'Missing business ID in URL', success: false });
        }

        const data = await request.formData();

        // Get form data (no fallback to store needed here as data comes from form)
        const name = data.get('name')?.toString()?.trim();
        const category = data.get('category')?.toString()?.trim();
        const latitude = data.get('latitude')?.toString()?.trim();
        const longitude = data.get('longitude')?.toString()?.trim();
        const address = data.get('address')?.toString()?.trim();
        const city = data.get('city')?.toString()?.trim();
        const state = data.get('state')?.toString()?.trim();
        const country = data.get('country')?.toString()?.trim();
        const postalCode = data.get('postalCode')?.toString()?.trim();
        const road = data.get('road')?.toString()?.trim(); // Include road if needed
        const house_number = data.get('house_number')?.toString()?.trim(); // Include house_number if needed
        const about = data.get('about')?.toString()?.trim(); // Include about if used

        // Basic validation - ensure required fields are present
        if (
            !name ||
            !category ||
            !latitude ||
            !longitude ||
            !address ||
            !city ||
            !state ||
            !country ||
            !postalCode
        ) {
            return fail(400, {
                error: 'Missing required fields: name, category, location, address, city, state, country, postalCode.',
                success: false,
                // Optionally return form data and errors to repopulate form on failure
                formData: {
                    name,
                    category,
                    latitude,
                    longitude,
                    address,
                    city,
                    state,
                    country,
                    postalCode,
                    road,
                    house_number,
                    about
                }
            });
        }

        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            return fail(401, { error: 'Not authenticated', success: false });
        }

        try {
            // Prepare data object for PUT request
            const updateData = {
                name,
                category,
                latitude: parseFloat(latitude), // Ensure numeric types if required by API
                longitude: parseFloat(longitude),
                address,
                city,
                state,
                country,
                postalCode,
                ...(road && { road }), // Include optional fields only if they have values
                ...(house_number && { house_number }),
                ...(about && { about })
            };

            // Make PUT request to update business data
            const response = await fetch(`${env.API_URL}/business/${publicId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    // Include the access token
                    // Option 1: Bearer Token
                    // 'Authorization': `Bearer ${accessToken}`
                    // Option 2: Cookie (matching your action example)
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include', // Include cookies if needed by the API
                body: JSON.stringify(updateData) // Send JSON data
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({})); // Safely parse error body
                console.error('API PUT Error:', response.status, errorBody);
                return fail(response.status, {
                    error: errorBody.error || `Failed to update business: ${response.statusText}`,
                    success: false
                });
            }

            // Business updated successfully
            const updatedBusiness = await response.json(); // Get the updated data if needed
            // Optionally, update the store if necessary after successful update
            // userPendingBusiness.set(updatedBusiness);

            return {
                success: true,
                message: 'Business updated successfully',
                // Optionally return the updated data
                updatedBusiness: updatedBusiness
            };
        } catch (err) {
            console.error('Fetch error during update:', err);
            return fail(500, {
                error: 'Could not connect to server to update business.',
                success: false
            });
        }
    }
};