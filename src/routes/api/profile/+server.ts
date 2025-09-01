// src/routes/api/profile/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';

export const PATCH: RequestHandler = async ({ request, cookies }) => {
    try {
        const { firstName, lastName, phone } = await request.json();

        if (!firstName && !lastName && !phone) {
            throw error(400, 'At least one field (firstName, lastName, phone) is required');
        }

        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            throw error(401, 'Authentication required');
        }

        // Forward request to backend identity-service
        const res = await fetch(`${PUBLIC_API_URL}/update-profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Cookie: `access_token=${accessToken}`
            },
            body: JSON.stringify({ firstName, lastName, phone })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw error(res.status, errData.error || 'Failed to update profile');
        }

        const data = await res.json();
        return json(data);
    } catch (err) {
        console.error('Profile update error:', err);
        // Re-throw SvelteKit errors to preserve status codes
        if (err && typeof err === 'object' && 'status' in err) {
            throw err;
        }
        throw error(500, 'Failed to update profile');
    }
};
