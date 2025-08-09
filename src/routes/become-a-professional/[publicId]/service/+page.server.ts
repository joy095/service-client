

// src/routes/become-a-professional/[publicId]/service/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// --- Load Function ---
export const load: PageServerLoad = async ({ params, fetch }) => {
    const { publicId } = params;


    try {
        const apiUrl = `${env.API_URL}/services/${publicId}`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
            console.error(`Failed to load services list from Go backend: ${response.status} ${response.statusText}`);

            return {
                publicId,
                services: [],
                userAuthenticated: true // Still authenticated, just failed to load data
            };
        }

        const services = await response.json();

        return {
            publicId,
            services,
            userAuthenticated: true
        };
    } catch (error) {
        console.error('Exception occurred while loading services from Go backend:', error);

        return {
            publicId,
            services: [],
            userAuthenticated: true, // Authenticated, but error occurred
            loadError: 'Failed to load services from backend.'
        };
    }
};

// --- Actions ---
export const actions: Actions = {
    // Single default action handling create/update based on form data
    default: async ({ request, params, fetch, cookies }) => {

        const { publicId: businessPublicId } = params;

        if (!env.API_URL) {
            console.error("CRITICAL: env.API_URL is undefined or empty!");
            return fail(500, { error: 'Server configuration error' });
        }
        // Optional: Add check for business ownership here if needed



        const formData = await request.formData();

        const serviceIdRaw = formData.get('serviceId');
        const serviceId = serviceIdRaw?.toString()?.trim() || null;
        const isUpdate = !!serviceId;

        // Validate required fields
        const serviceName = formData.get('name')?.toString()?.trim();
        if (!serviceName) {
            return fail(400, { error: 'Service name is required' });
        }

        const accessToken = cookies.get('access_token'); // Make sure cookie name matches

        if (!accessToken) {
            return fail(401, { error: 'Authentication required. Token missing.' });
        }


        try {
            let backendUrl: string;
            let backendMethod: string;
            let successMessage: string;

            const backendHeaders: HeadersInit = {
                'Cookie': `access_token=${accessToken}` // Send token as a cookie header
                // Let fetch handle 'Content-Type': 'multipart/form-data' boundary automatically
            };

            if (formData.get('_action') === 'delete') {
                backendMethod = 'DELETE';
                backendUrl = `${env.API_URL}/delete-service/${serviceId}`;
                successMessage = 'Service deleted successfully!';
            } else if (isUpdate) {
                backendMethod = 'PATCH';
                backendUrl = `${env.API_URL}/update-service/${serviceId}`;
                successMessage = 'Service updated successfully!';
            } else {
                // --- Create new service ---
                backendMethod = 'POST';
                backendUrl = `${env.API_URL}/create-service/${businessPublicId}`;
                successMessage = 'Service created successfully!';
                console.log(formData)
            }
            const backendResponse = await fetch(backendUrl, {
                method: backendMethod,
                headers: backendHeaders,
                // credentials: 'include', // Usually not needed when manually setting Cookie header
                body: formData, // Sends as multipart/form-data
            });

            if (backendResponse.ok) {
                // Success from Go backend
                const raw = await backendResponse.text();
                let resultData;
                try {
                    resultData = JSON.parse(raw);
                } catch (parseErr) {
                    console.error(parseErr)
                    const responseText = await backendResponse.text();
                    console.log("Go backend response text:", responseText);
                }

                console.log(successMessage);
                // Return success to the Svelte component's `enhance` function
                const returnedServiceId = resultData?.id || serviceId;

                return { success: true, serviceId: returnedServiceId, message: successMessage };

            } else {
                let errorText = await backendResponse.text();
                console.error(`Go Backend Error (${backendResponse.status}):`, errorText);
                let errorMessage = 'An error occurred while processing your request on the backend.';

                // Attempt to parse JSON error response from Go
                if (errorText) {
                    try {
                        const errorData = JSON.parse(errorText); // Parse the text as JSON
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (e) {
                        errorMessage = errorText; // Use raw text if not JSON
                    }
                } else {
                    errorMessage = backendResponse.statusText || `Backend Error (${backendResponse.status})`;
                }


                // Map common backend status codes to user-friendly messages
                console.log(`Mapping backend status ${backendResponse.status} to user message...`);
                let failStatus = 500; // Default fail status
                switch (backendResponse.status) {
                    case 400:
                        failStatus = 400;
                        errorMessage = errorMessage || 'Bad request. Please check your input.';
                        break;
                    case 401:
                        failStatus = 401;
                        errorMessage = 'Authentication failed (Backend). Please log in again.';
                        break;
                    case 403:
                        failStatus = 403;
                        errorMessage = 'Access denied (Backend). You are not authorized for this action.';
                        break;
                    case 404:
                        failStatus = 404;
                        errorMessage = 'Service or resource not found.';
                        break;
                    case 409:
                        failStatus = 409;
                        errorMessage = errorMessage || 'Conflict. The data might already exist.';
                        break;
                    case 429:
                        failStatus = 429;
                        errorMessage = 'Too many requests. Please try again later.';
                        break;
                    default:
                        failStatus = 500;
                        errorMessage = errorMessage || `Backend Error (${backendResponse.status}). Please try again later.`;
                }

                console.log(`Mapped to fail(${failStatus}) with message: ${errorMessage}`);
                return fail(failStatus, { error: errorMessage });
            }

        } catch (err: any) {
            console.error('CRITICAL: Network error or unexpected issue occurred while calling Go backend:', err);
            return fail(500, { error: 'Failed to connect to the server or an unexpected error occurred. Please check your connection and try again.' });
        }
    }
};
