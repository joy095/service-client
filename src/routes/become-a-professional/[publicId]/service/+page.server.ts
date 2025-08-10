// src/routes/become-a-professional/[publicId]/service/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

// --- Load Function ---
export const load: PageServerLoad = async ({ params, fetch }) => {
    console.log("--- STARTING LOAD FUNCTION ---");
    console.log("Received params:", params);
    // console.log("Received locals (auth check):", locals); // Be careful logging full locals object

    const { publicId } = params;
    console.log(`Fetching services list for business publicId: ${publicId}`);

    try {
        const apiUrl = `${env.API_URL}/services/${publicId}`;
        console.log(`Constructed API URL for fetching services: ${apiUrl}`);

        // Fetch list of services for the business
        console.log("Making request to Go backend to fetch services list...");
        const response = await fetch(apiUrl);
        console.log(`Go backend services list response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
            console.error(`Failed to load services list from Go backend: ${response.status} ${response.statusText}`);
            console.log("--- ENDING LOAD FUNCTION (Backend Error) ---");
            return {
                publicId,
                services: [],
                userAuthenticated: true // Still authenticated, just failed to load data
            };
        }

        console.log("Go backend response OK, parsing JSON...");
        const services = await response.json();
        console.log(`Successfully loaded ${services?.length || 0} services from backend.`, services);

        console.log("--- ENDING LOAD FUNCTION (Success) ---");
        return {
            publicId,
            services,
            userAuthenticated: true
        };
    } catch (error) {
        console.error('Exception occurred while loading services from Go backend:', error);
        console.log("--- ENDING LOAD FUNCTION (Exception) ---");
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
        console.log("--- STARTING DEFAULT ACTION ---");
        console.log("Received params in action:", params);
        // console.log("Received locals in action (auth check):", locals); // Be careful logging full locals object
        // console.log("Received cookies in action:", cookies.getAll()); // Be careful logging all cookies

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


        // --- 4. Authentication Token ---
        console.log("Retrieving access_token from cookies...");
        const accessToken = cookies.get('access_token'); // Make sure cookie name matches
        console.log(`Retrieved access_token (first 10 chars for privacy): ${accessToken ? accessToken.substring(0, 10) + '...' : 'NOT FOUND'}`);
        if (!accessToken) {
            console.error('CRITICAL: Authentication token (access_token) not found in cookies.');
            console.log("--- ENDING DEFAULT ACTION (401 - No Token) ---");
            return fail(401, { error: 'Authentication required. Token missing.' });
        }

        // --- 5. Prepare & Call Go Backend API ---
        console.log("Preparing to call Go backend API...");
        try {
            let backendUrl: string;
            let backendMethod: string;
            let successMessage: string;

            const backendHeaders: HeadersInit = {
                'Cookie': `access_token=${accessToken}` // Send token as a cookie header
                // Let fetch handle 'Content-Type': 'multipart/form-data' boundary automatically
            };
            console.log("Prepared backend headers:", backendHeaders);

            if (isUpdate) {
                // --- Update existing service ---
                console.log(`Preparing to UPDATE service with ID: ${serviceId}`);
                backendMethod = 'PATCH';
                backendUrl = `${env.API_URL}/update-service/${serviceId}`;
                successMessage = 'Service updated successfully!';
            }
            else if (formData.get('_action') === 'delete') {
                // --- Delete existing service ---
                backendMethod = 'DELETE';
                backendUrl = `${env.API_URL}/delete-service/${serviceId}`;
                successMessage = 'Service deleted successfully!';
            } else {
                // --- Create new service ---
                console.log(`Preparing to CREATE service for businessPublicId: ${businessPublicId}`);
                backendMethod = 'POST';
                backendUrl = `${env.API_URL}/create-service/${businessPublicId}`;
                successMessage = 'Service created successfully!';
                console.log(formData)
            }

            console.log(`Constructed Go backend URL: ${backendUrl}`);
            console.log(`Using HTTP method: ${backendMethod}`);
            console.log(`Calling Go backend: ${backendMethod} ${backendUrl}`);

            // --- Make the request to the Go backend ---
            console.log("Sending request to Go backend with FormData...");
            const backendResponse = await fetch(backendUrl, {
                method: backendMethod,
                headers: backendHeaders,
                // credentials: 'include', // Usually not needed when manually setting Cookie header
                body: formData, // Sends as multipart/form-data
            });
            console.log(`Received response from Go backend. Status: ${backendResponse.status} ${backendResponse.statusText}`);

            if (backendResponse.ok) {
                console.log("Go backend response OK.");
                // Success from Go backend
                let resultData: any = null;
                try {
                    resultData = await backendResponse.json();
                    console.log("Parsed JSON response from Go backend:", resultData);
                } catch (parseErr) {
                    console.log("Go backend response body was not JSON or failed to parse. Reading as text...");
                    const responseText = await backendResponse.text();
                    console.log("Go backend response text:", responseText);
                }

                console.log(successMessage);
                // Return success to the Svelte component's `enhance` function
                const returnedServiceId = resultData?.id || serviceId;
                console.log(`Returning success. Returned/Original Service ID: ${returnedServiceId}`);
                console.log("--- ENDING DEFAULT ACTION (Success) ---");
                return { success: true, serviceId: returnedServiceId, message: successMessage };

            } else {
                console.log("Go backend response NOT OK.");
                // Handle errors from the Go backend
                console.log("Reading error response body as text...");
                let errorText = await backendResponse.text();
                console.error(`Go Backend Error (${backendResponse.status}):`, errorText);
                let errorMessage = 'An error occurred while processing your request on the backend.';

                // Attempt to parse JSON error response from Go
                if (errorText) {
                    console.log("Attempting to parse error response as JSON...");
                    try {
                        const errorData = JSON.parse(errorText); // Parse the text as JSON
                        errorMessage = errorData.message || errorData.error || errorMessage;
                        console.log('Parsed backend JSON error object:', errorData);
                    } catch (e) {
                        console.log('Could not parse backend error response as JSON. Using raw text.');
                        errorMessage = errorText; // Use raw text if not JSON
                    }
                } else {
                    console.log("Error response body was empty.");
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
                console.log("--- ENDING DEFAULT ACTION (Backend Error) ---");
                return fail(failStatus, { error: errorMessage });
            }

        } catch (err: any) {
            console.error('CRITICAL: Network error or unexpected issue occurred while calling Go backend:', err);
            // Handle network errors or unexpected issues
            console.log("--- ENDING DEFAULT ACTION (500 - Exception) ---");
            return fail(500, { error: 'Failed to connect to the server or an unexpected error occurred. Please check your connection and try again.' });
        }
    }
};