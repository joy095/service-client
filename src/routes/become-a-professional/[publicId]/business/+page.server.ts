// src/routes/become-a-professional/[publicId]/business/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad, RequestEvent } from './$types';
import deepEqual from 'fast-deep-equal';

/**
 * Loads the business data for the page based on the publicId in the URL.
 * @param params - Contains the URL parameters, including `publicId`.
 * @param cookies - Provides access to HTTP cookies for authentication.
 * @returns The business data or an error object.
 */
export const load: PageServerLoad = async ({ params, cookies }) => {
    const { publicId } = params;
    if (!publicId) {
        return { error: 'Business ID not provided in URL.' };
    }
    const accessToken = cookies.get('access_token');
    if (!accessToken) {
        throw redirect(303, '/login');
    }
    try {
        const response = await fetch(`${env.API_URL}/business/${publicId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `access_token=${accessToken}`
            },
            credentials: 'include'
        });
        if (!response.ok) {
            if (response.status === 404) {
                return { error: 'Business not found.' };
            }
            const errorBody = await response.json().catch(() => ({}));
            return { error: errorBody.error || `Failed to load business: ${response.statusText}` };
        }
        const businessData = await response.json();
        return { business: businessData };
    } catch (err) {
        return { error: 'Could not connect to server to load business data.' };
    }
};

/**
 * Handles the form submission (PUT request) to update the business.
 */
export const actions: Actions = {
    default: async ({ request, cookies, params }: RequestEvent) => {
        const { publicId } = params;
        if (!publicId) {
            return fail(400, { error: 'Missing business ID in URL', success: false });
        }
        const data = await request.formData();

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
                    house_number
                }
            });
        }
        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            return fail(401, { error: 'Not authenticated', success: false });
        }

        try {
            const originalResponse = await fetch(`${env.API_URL}/business/${publicId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include'
            });

            if (originalResponse.ok) {
                const originalBusinessDataWrapper = await originalResponse.json();
                const originalBusinessData = originalBusinessDataWrapper?.business;

                if (originalBusinessData) {
                    const submittedData = {
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
                    };

                    const normalizedOriginalData = {
                        name: originalBusinessData.name ?? '',
                        category: originalBusinessData.category ?? '',
                        latitude: parseFloat(originalBusinessData.latitude) || 0,
                        longitude: parseFloat(originalBusinessData.longitude) || 0,
                        address: originalBusinessData.address ?? '',
                        city: originalBusinessData.city ?? '',
                        state: originalBusinessData.state ?? '',
                        country: originalBusinessData.country ?? '',
                        postalCode: originalBusinessData.postalCode ?? '',
                        ...(originalBusinessData.road && { road: originalBusinessData.road }),
                        ...(originalBusinessData.house_number && { house_number: originalBusinessData.house_number })
                    };

                    if (deepEqual(submittedData, normalizedOriginalData)) {
                        throw redirect(303, `/become-a-professional/${publicId}/upload-images`);
                    }
                }
            }

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
            };

            const response = await fetch(`${env.API_URL}/business/${publicId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include',
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                let errorBody = {};
                try {
                    errorBody = await response.json();
                } catch (parseError) {
                    // Silent fail on JSON parse error for error body
                }
                return fail(response.status, {
                    error: errorBody?.error || `Failed to update business: ${response.statusText} (Status: ${response.status})`,
                    success: false
                });
            }

            throw redirect(303, `/become-a-professional/${publicId}/upload-images`);
        } catch (err) {
            // Robust check for SvelteKit redirect
            if (err instanceof redirect || (err && typeof err === 'object' && err.constructor && err.constructor.name === 'Redirect')) {
                throw err;
            }
            // Handle other unexpected errors
            return fail(500, {
                error: 'An unexpected error occurred while updating the business. Please try again.',
                success: false
            });
        }
    }
};