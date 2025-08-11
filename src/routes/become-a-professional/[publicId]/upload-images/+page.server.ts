// src/routes/become-a-professional/[publicId]/upload-images/+page.server.ts
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

// --- Type Definitions for API Responses ---
interface BusinessImageData {
    imageId: string; // Unique identifier for the image record
    url: string;     // URL to access the image (from objectName)
    position: number; // Display order position
}

// --- Load Function: Fetch existing images ---
export const load: PageServerLoad = async ({ params, cookies }) => {
    const { publicId } = params;
    const accessToken = cookies.get('access_token');
    if (!accessToken) {
        throw redirect(303, '/login');
    }
    try {
        const response = await fetch(`${PUBLIC_API_URL}/business-image/${publicId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `access_token=${accessToken}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            console.error('[Image Load] API GET Error:', response.status, errorBody);
            // Return an empty array if fetching fails
            return { images: [], error: errorBody.error || `Failed to load images: ${response.statusText}` };
        }

        // --- FIX: Parse the response and extract the array ---
        const apiResponseData: { images: BusinessImageData[] } = await response.json();
        // Check if apiResponseData has an 'images' property and it's an array
        const imagesArray = Array.isArray(apiResponseData.images) ? apiResponseData.images : [];

        // Optional: Log to verify the structure


        // Return the extracted array
        return { images: imagesArray, error: null };
    } catch (err) {
        console.error('[Image Load] Fetch error:', err);
        // Return an empty array on error
        return { images: [], error: 'Could not connect to server to load images.' };
    }
};

// --- Actions: Handle image operations ---
export const actions: Actions = {
    // --- Add New Images ---
    add: async ({ request, cookies, params }) => {
        const { publicId } = params;
        const accessToken = cookies.get('access_token');

        if (!accessToken) {
            return fail(401, {
                error: 'Not authenticated',
                success: false,
                message: 'Please login to continue'
            });
        }

        const formData = await request.formData();
        const images = formData.getAll('images') as File[]; // Get all files associated with 'images'

        if (!images || images.length === 0) {
            return fail(400, {
                error: 'No images provided',
                success: false,
                message: 'Please upload at least one image'
            });
        }

        // Prepare FormData for the API request
        const uploadForm = new FormData();
        for (const file of images) {
            // Basic client-side validation mimic on server (optional but good practice)
            // You might want more robust validation based on your API requirements
            if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                return fail(400, {
                    error: `Invalid file type for ${file.name}`,
                    success: false,
                    message: 'Only PNG, JPG, and JPEG files are allowed.'
                });
            }
            // const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB example
            // if (file.size > MAX_FILE_SIZE) {
            //   return fail(400, { error: `File ${file.name} is too large`, success: false, message: 'File size exceeds limit.' });
            // }
            uploadForm.append('images', file); // Append each file
        }

        try {
            // Make POST request to add images
            const response = await fetch(`${PUBLIC_API_URL}/business-image/${publicId}`, {
                method: 'POST',
                // Don't set Content-Type header manually for FormData, let the browser set it
                headers: {
                    // Include the access token via Cookie
                    Cookie: `access_token=${accessToken}`
                },
                body: uploadForm, // Send the FormData object
                credentials: 'include' // Include cookies if needed by the API
            });

            if (!response.ok) {
                // Handle non-2xx responses from the API
                const errorResult = await response.json().catch(() => ({}));
                console.error('[Image Add] API POST Error:', response.status, errorResult);
                return fail(response.status, {
                    error: errorResult.error || 'Failed to upload images',
                    success: false,
                    message: errorResult.message || `Upload failed: ${response.statusText}`
                });
            }

            return {
                success: true,
                message: 'Images uploaded successfully'
                // Optionally return data about the new images if the API provides it
                // newImages: result?.newImages // Adjust based on API response
            };

        } catch (err) {
            // Handle network errors or unexpected issues during the fetch
            console.error('[Image Add] Network/Fetch error:', err);
            return fail(500, {
                error: 'Server error',
                success: false,
                message: 'Failed to connect to server for image upload'
            });
        }
    },

    // --- Delete an Image ---
    delete: async ({ request, cookies, params }) => {
        const { publicId } = params;
        const accessToken = cookies.get('access_token');

        if (!accessToken) {
            return fail(401, {
                error: 'Not authenticated',
                success: false,
                message: 'Please login to continue'
            });
        }

        const formData = await request.formData();
        const imageId = formData.get('imageId')?.toString(); // Get the ID of the image to delete

        if (!imageId) {
            return fail(400, {
                error: 'Image ID is required',
                success: false,
                message: 'Missing image identifier for deletion'
            });
        }

        try {
            // Make DELETE request to remove the specific image
            const response = await fetch(`${PUBLIC_API_URL}/business-image/${publicId}/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json', // Standard for DELETE with no body
                    // Include the access token via Cookie
                    Cookie: `access_token=${accessToken}`
                },
                credentials: 'include' // Include cookies if needed by the API
            });

            if (!response.ok) {
                // Handle non-2xx responses from the API
                const errorResult = await response.json().catch(() => ({}));
                console.error('[Image Delete] API DELETE Error:', response.status, errorResult);
                return fail(response.status, {
                    error: errorResult.error || 'Failed to delete image',
                    success: false,
                    message: errorResult.message || `Deletion failed: ${response.statusText}`
                });
            }

            return {
                success: true,
                message: 'Image deleted successfully'
            };

        } catch (err) {
            // Handle network errors or unexpected issues during the fetch
            console.error('[Image Delete] Network/Fetch error:', err);
            return fail(500, {
                error: 'Server error',
                success: false,
                message: 'Failed to connect to server for image deletion'
            });
        }
    },

    // --- Reorder Images ---
    // This action now sends the FULL order to the dedicated backend reorder endpoint.
    reorder: async ({ request, cookies, params }) => {
        const { publicId } = params;
        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            return fail(401, {
                error: 'Not authenticated',
                success: false,
                message: 'Please login to continue'
            });
        }

        const formData = await request.formData();
        const orderString = formData.get('order')?.toString();

        if (!orderString) {
            return fail(400, {
                error: 'New image order is required',
                success: false,
                message: 'Image order data is missing'
            });
        }

        // Parse the order string into an array of IDs (these are the existing image objectNames/IDs)
        const newOrder = orderString
            .split(',')
            .map(id => id.trim())
            .filter(id => id.length > 0 && id !== 'undefined'); // Filter out invalid IDs

        if (newOrder.length === 0) {
            return {
                success: true,
                message: 'No images specified for reordering.'
            };
        }

        // --- Send the full order to the backend reorder endpoint ---
        try {
            // Prepare data for the reorder API call - Send as JSON
            const reorderData = { order: newOrder }; // Send the full array of existing image IDs/objectNames

            const response = await fetch(`${PUBLIC_API_URL}/business-image/${publicId}/reorder`, {
                method: 'POST', // Method matches the new Go Fiber route
                headers: {
                    'Content-Type': 'application/json', // Sending JSON
                    Cookie: `access_token=${accessToken}`
                },
                body: JSON.stringify(reorderData), // Send JSON body
                credentials: 'include'
            });

            if (!response.ok) {
                const errorResult = await response.json().catch(() => ({}));
                console.error('[Image Reorder] API Reorder Error:', response.status, errorResult);
                // Return appropriate error
                return fail(response.status, {
                    error: errorResult.error || 'Failed to reorder images',
                    success: false,
                    message: errorResult.message || `Reorder failed: ${response.statusText}`
                });
            }

            // --- Success ---
            const reorderResult = await response.json();
            return {
                success: true,
                message: reorderResult.message || 'Image order updated successfully.'
            };

            // Note: The Go ReorderBusinessImages function handles shifting positions correctly.
            // The primary image will be the one at position 1 after the reorder.
            // The previous logic that explicitly called /primary is usually redundant now.

        } catch (err) {
            console.error('[Image Reorder] Network/Fetch error:', err);
            return fail(500, {
                error: 'Server error',
                success: false,
                message: 'Failed to connect to server for image reordering.'
            });
        }
    }
    // --- End Actions ---
};