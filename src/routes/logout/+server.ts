// src/routes/logout/+server.ts
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    const accessToken = cookies.get('access_token');
    if (!accessToken) {
        // No token = already logged out
        return new Response(null, { status: 200 });
    }

    try {
        // Call your actual backend API to revoke tokens
        const response = await fetch(`${import.meta.env.VITE_API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                cookie: `access_token=${accessToken}`
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Failed to revoke refresh token:', errorData.message);
            // Continue anyway — best effort
        }
    } catch (err) {
        console.error('Error revoking refresh token:', err);
        // Don't block logout just because of network issues
    }

    // Clear the access_token cookie
    cookies.delete('access_token', { path: '/' });
    cookies.delete('refresh_token', { path: '/' });

    // Return success
    return new Response(null, {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
};