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
        const road = data.get('road')?.toString()?.trim();
        const house_number = data.get('house_number')?.toString()?.trim();
        // const about = data.get('about')?.toString()?.trim();

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
                formData: { // Return formData for repopulation
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
                    house_number
                    // about
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
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                address,
                city,
                state,
                country,
                postalCode,
                ...(road && { road }),
                ...(house_number && { house_number })
                // ...(about && { about })
            };

            console.log(`[Server Action] Sending PUT request to ${env.API_URL}/business/${publicId}`);
            console.log('[Server Action] Update Data:', JSON.stringify(updateData, null, 2)); // Log data being sent

            // Make PUT request to update business data
            const response = await fetch(`${env.API_URL}/business/${publicId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });

            console.log(`[Server Action] Received response: Status ${response.status}`); // Log response status

            if (!response.ok) {
                // Attempt to parse error body, but handle potential JSON errors
                let errorBody = {};
                try {
                    errorBody = await response.json();
                } catch (parseError) {
                    console.warn('[Server Action] Could not parse error response body as JSON:', parseError);
                    // errorBody remains an empty object
                }
                console.error('[Server Action] API PUT Error:', response.status, errorBody);
                return fail(response.status, {
                    error: errorBody?.error || `Failed to update business: ${response.statusText} (Status: ${response.status})`,
                    success: false
                });
            }

            // --- Critical Section: Handling the successful response body ---
            let updatedBusinessData = null;
            const contentType = response.headers.get('content-type');
            console.log(`[Server Action] Response Content-Type: ${contentType}`); // Log content type

            // Check if the response has content and is JSON before trying to parse
            if (contentType && contentType.includes('application/json')) {
                try {
                    updatedBusinessData = await response.json();
                    console.log('[Server Action] Parsed response body successfully:', updatedBusinessData);
                } catch (parseError) {
                    console.warn('[Server Action] Could not parse successful response body as JSON, even though Content-Type suggests JSON:', parseError);
                    // updatedBusinessData remains null
                    // This might be okay if the API just returns 200 OK with no body
                }
            } else {
                console.log('[Server Action] Response body is not application/json or is empty. Reading text...');
                const textBody = await response.text(); // Read as text to see what's there
                console.log('[Server Action] Raw response body text:', textBody);
                if (textBody.trim()) {
                    console.warn('[Server Action] Unexpected non-JSON response body content.');
                } else {
                    console.log('[Server Action] Response body is empty (as expected for some successful PUTs).');
                }
            }
            // --- End Critical Section ---

            // Business update request was successful (status 2xx)
            // Proceed to redirect regardless of whether we parsed the body
            console.log(`[Server Action] Update successful, redirecting to /become-a-professional/${publicId}/upload-images`);
            throw redirect(303, `/become-a-professional/${publicId}/upload-images`);


        } catch (err) {
            if (err?.constructor?.name === 'Redirect' || (err instanceof Response && err.status >= 300 && err.status < 400)) {
                // This is the intended redirect. Re-throw it so SvelteKit handles it.
                console.log('[Server Action] Caught redirect, re-throwing...'); // You already have this, good.
                throw err; // Crucially, this must happen BEFORE the general error handling.
            }

            // --- Check 2: Any other unexpected error ---
            // If it's not a redirect, log it and return a failure.
            console.error('[Server Action] Unexpected error during update:', err); // This should now only log *real* errors.
            return fail(500, {
                error: 'An unexpected error occurred while updating the business. Please try again.',
                success: false
            });
        }
    }
};