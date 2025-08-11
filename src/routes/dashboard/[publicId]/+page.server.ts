// src/routes/dashboard/[publicId]/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';
import { error, fail, redirect } from '@sveltejs/kit';

// Debug helper function
function debugLog(message: string, data?: any) {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
    if (data !== undefined) {
        console.log(`[DEBUG] Data:`, JSON.stringify(data, null, 2));
    }
}

// Error helper function
function errorLog(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    if (error) {
        console.error(`[ERROR] Details:`, error);
    }
}

export const load: PageServerLoad = async ({ params, fetch }) => {
    debugLog(`Loading services for publicId: ${params.publicId}`);

    const { publicId } = params;

    if (!publicId) {
        errorLog('Missing publicId parameter');
        throw error(400, 'Missing publicId');
    }

    try {
        const apiUrl = `${env.API_URL}/services/${publicId}`;
        debugLog(`Making API request to: ${apiUrl}`);

        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        debugLog(`API Response Status: ${res.status} ${res.statusText}`);

        if (!res.ok) {
            if (res.status === 404) {
                debugLog('No services found for this publicId');
                return { publicId, services: [] };
            }
            errorLog(`Backend returned error status: ${res.status}`);
            throw error(res.status, `Failed to load services for ${publicId}`);
        }

        const data = await res.json();
        debugLog('Successfully loaded services', { count: Array.isArray(data.service) ? data.service.length : 0 });

        return {
            publicId,
            services: Array.isArray(data.service) ? data.service : []
        };
    } catch (err) {
        errorLog('Error loading services', err);
        // Return empty array instead of throwing error to prevent page crash
        return { publicId, services: [] };
    }
};

// Helper function to validate authentication
function validateAuth(cookies: any): string | null {
    const accessToken = cookies.get('access_token');
    if (!accessToken) {
        errorLog('Authentication token not found in cookies');
        return null;
    }
    debugLog(`Access token found (first 10 chars): ${accessToken.substring(0, 10)}...`);
    return accessToken;
}

// Helper function to validate form data
function validateServiceData(formData: FormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const name = formData.get('name')?.toString()?.trim();
    const price = formData.get('price')?.toString()?.trim();
    const duration = formData.get('duration')?.toString()?.trim();

    if (!name) {
        errors.push('Service name is required');
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        errors.push('Valid price is required');
    }

    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
        errors.push('Valid duration is required');
    }

    // Validate image if provided
    const image = formData.get('image') as File;
    if (image && image.size > 0) {
        if (image.size > 5 * 1024 * 1024) { // 5MB limit
            errors.push('Image size must be less than 5MB');
        }
        if (!['image/jpeg', 'image/png'].includes(image.type)) {
            errors.push('Only JPEG or PNG images are allowed');
        }
    }

    return { isValid: errors.length === 0, errors };
}

// Helper function to make API requests
async function makeApiRequest(
    url: string,
    method: string,
    accessToken: string,
    body?: FormData | string,
    headers?: Record<string, string>
): Promise<Response> {
    debugLog(`Making ${method} request to: ${url}`);

    const requestHeaders: HeadersInit = {
        'Cookie': `access_token=${accessToken}`,
        ...headers
    };

    // Don't set Content-Type for FormData - let browser set it
    if (typeof body === 'string') {
        requestHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body
    });

    debugLog(`API Response: ${response.status} ${response.statusText}`);
    return response;
}

// Helper function to handle API response
async function handleApiResponse(response: Response, successMessage: string) {
    if (response.ok) {
        debugLog('API request successful');
        let resultData: any = null;

        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                resultData = await response.json();
                debugLog('Parsed JSON response', resultData);
            } else {
                const responseText = await response.text();
                debugLog('Response text:', responseText);
            }
        } catch (parseErr) {
            debugLog('Failed to parse response - treating as success');
        }

        return { success: true, data: resultData, message: successMessage };
    } else {
        // Handle error response
        let errorMessage = 'An error occurred while processing your request';
        let errorText = '';

        try {
            errorText = await response.text();
            debugLog('Error response text:', errorText);

            if (errorText) {
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                    errorLog('Parsed error response', errorData);
                } catch (e) {
                    errorMessage = errorText;
                }
            }
        } catch (e) {
            errorLog('Failed to read error response', e);
        }

        // Map status codes to user-friendly messages
        let failStatus = 500;
        switch (response.status) {
            case 400:
                failStatus = 400;
                errorMessage = errorMessage || 'Bad request. Please check your input.';
                break;
            case 401:
                failStatus = 401;
                errorMessage = 'Authentication failed. Please log in again.';
                break;
            case 403:
                failStatus = 403;
                errorMessage = 'Access denied. You are not authorized for this action.';
                break;
            case 404:
                failStatus = 404;
                errorMessage = 'Resource not found.';
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
                errorMessage = errorMessage || `Server Error (${response.status}). Please try again later.`;
        }

        errorLog(`API request failed with status ${response.status}`, { errorMessage, errorText });
        return fail(failStatus, { error: errorMessage });
    }
}

export const actions: Actions = {
    // Create service action
    create: async ({ request, params, fetch, cookies }) => {
        debugLog("=== STARTING CREATE SERVICE ACTION ===");
        const { publicId } = params;

        // Validate environment
        if (!env.API_URL) {
            errorLog("CRITICAL: env.API_URL is undefined or empty!");
            return fail(500, { error: 'Server configuration error' });
        }

        // Get and validate form data
        const formData = await request.formData();
        debugLog("Form data received", {
            name: formData.get('name'),
            price: formData.get('price'),
            duration: formData.get('duration'),
            hasImage: formData.get('image') ? 'yes' : 'no'
        });

        const validation = validateServiceData(formData);
        if (!validation.isValid) {
            errorLog('Form validation failed', validation.errors);
            return fail(400, { error: validation.errors.join(', ') });
        }

        // Validate authentication
        const accessToken = validateAuth(cookies);
        if (!accessToken) {
            return fail(401, { error: 'Authentication required. Please log in again.' });
        }

        try {
            // Note: Fixed URL spacing issue from original code
            const response = await fetch(`${env.API_URL}/create-service/${publicId}`, {
                method: 'POST',
                headers: {
                    cookie: `access_token=${accessToken}`
                },
                body: formData
            });
            return await handleApiResponse(response, 'Service created successfully!');
        } catch (err: any) {
            errorLog('Network error during create service request', err);
            return fail(500, {
                error: 'Failed to connect to the server. Please check your connection and try again.'
            });
        }
    },

    // Update service action
    update: async ({ request, params, fetch, cookies }) => {
        debugLog("=== STARTING UPDATE SERVICE ACTION ===");
        const { publicId } = params;

        // Validate environment
        if (!env.API_URL) {
            errorLog("CRITICAL: env.API_URL is undefined or empty!");
            return fail(500, { error: 'Server configuration error' });
        }

        // Get and validate form data
        const formData = await request.formData();
        const serviceId = formData.get('serviceId')?.toString();

        debugLog("Update form data received", {
            serviceId,
            name: formData.get('name'),
            price: formData.get('price'),
            duration: formData.get('duration'),
            hasImage: formData.get('image') ? 'yes' : 'no',
            existingImage: formData.get('existingImage')
        });

        if (!serviceId) {
            errorLog('Service ID is required for update');
            return fail(400, { error: 'Service ID is required' });
        }

        const validation = validateServiceData(formData);
        if (!validation.isValid) {
            errorLog('Form validation failed', validation.errors);
            return fail(400, { error: validation.errors.join(', ') });
        }

        // Validate authentication
        const accessToken = validateAuth(cookies);
        if (!accessToken) {
            return fail(401, { error: 'Authentication required. Please log in again.' });
        }

        try {
            const backendUrl = `${env.API_URL}/update-service/${serviceId}`;
            const response = await makeApiRequest(backendUrl, 'PATCH', accessToken, formData);
            return await handleApiResponse(response, 'Service updated successfully!');
        } catch (err: any) {
            errorLog('Network error during update service request', err);
            return fail(500, {
                error: 'Failed to connect to the server. Please check your connection and try again.'
            });
        }
    },

    // Delete service action
    delete: async ({ request, params, fetch, cookies }) => {
        debugLog("=== STARTING DELETE SERVICE ACTION ===");
        const { publicId } = params;

        // Validate environment
        if (!env.API_URL) {
            errorLog("CRITICAL: env.API_URL is undefined or empty!");
            return fail(500, { error: 'Server configuration error' });
        }

        // Get service ID from form data
        const formData = await request.formData();
        const serviceId = formData.get('serviceId')?.toString();

        debugLog("Delete request received", { serviceId, publicId });

        if (!serviceId) {
            errorLog('Service ID is required for deletion');
            return fail(400, { error: 'Service ID is required' });
        }

        // Validate authentication
        const accessToken = validateAuth(cookies);
        if (!accessToken) {
            return fail(401, { error: 'Authentication required. Please log in again.' });
        }

        try {
            const backendUrl = `${env.API_URL}/delete-service/${publicId}/${serviceId}`;
            const response = await makeApiRequest(backendUrl, 'DELETE', accessToken);
            return await handleApiResponse(response, 'Service deleted successfully!');
        } catch (err: any) {
            errorLog('Network error during delete service request', err);
            return fail(500, {
                error: 'Failed to connect to the server. Please check your connection and try again.'
            });
        }
    },

};