// src/routes/somepage/[publicId]/currentpage/+server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const actions: Actions = {
    default: async ({ request, fetch, cookies }) => {
        const formData = await request.formData();
        const accessToken = cookies.get('access_token');

        // Validate access token exists
        if (!accessToken) {
            return fail(401, { error: 'Authentication required' });
        }

        const apiUrl = `${env.API_URL}/create-service`;

        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                cookie: `access_token=${accessToken}`
            },
            credentials: 'include',
            body: formData
        });

        console.log(accessToken)

        console.log(formData)

        if (!res.ok) {
            const data = await res.json();
            console.error(`Service creation failed: ${res.status} - ${data?.error}`);
            return fail(400, { error: data?.error || 'Failed to create service' });
        }

        return { type: 'success' };
    }
};
