// /business-image/: publicId

import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request, cookies, params }) => {
        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            return fail(401, {
                error: 'Not authenticated',
                success: false,
                message: 'Please login to continue'
            });
        }

        const form = await request.formData();
        const images = form.getAll('images') as File[];

        if (!images.length) {
            return fail(400, {
                error: 'No images provided',
                success: false,
                message: 'Please upload at least one image'
            });
        }

        const uploadForm = new FormData();
        for (const file of images) {
            uploadForm.append('images', file);
        }

        try {
            const response = await fetch(`${env.API_URL}/business-image/${params.publicId}`, {
                method: 'POST',
                headers: {
                    Cookie: `access_token=${accessToken}`
                },
                body: uploadForm
            });

            const result = await response.json();
            if (!response.ok) {
                return fail(response.status, {
                    error: result.error || 'Failed to upload images',
                    success: false,
                    message: result.message
                });
            }

            return {
                success: true,
                message: 'Images uploaded successfully'
            };
        } catch (err) {
            console.error('Image upload error:', err);
            return fail(500, {
                error: 'Server error',
                success: false,
                message: 'Failed to connect to server'
            });
        }
    }
};
