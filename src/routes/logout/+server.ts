// src/routes/logout/+server.ts
import { PUBLIC_API_URL } from '$env/static/public';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    const accessToken = cookies.get('access_token');
    if (!accessToken) {
        // No token = already logged out
        cookies.delete('access_token', { path: '/' });
        cookies.delete('refresh_token', { path: '/' });
        return new Response(null, { status: 204 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000); // 7s safety timeout
    try {
        // Call your actual backend API to revoke tokens
        const response = await fetch(`${PUBLIC_API_URL}/logout`, {
            method: 'POST',
            headers: {
                cookie: `access_token=${accessToken}`
            },
            credentials: 'include',
            signal: controller.signal
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Failed to revoke refresh token:', errorData.message);
            // Continue anyway — best effort
        }
    } catch (err) {
        console.error('Error revoking refresh token:', err);
        // Don't block logout just because of network issues
    } finally {
        clearTimeout(timeout);
    }

    // Clear the access_token cookie
    // cookies.delete('access_token', { path: '/' });
    // cookies.delete('refresh_token', { path: '/' });

    // Use the same options you used when setting these cookies
    cookies.delete('access_token', { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
    cookies.delete('refresh_token', { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });
    // If you originally set a Domain attribute (e.g., ".example.com"), include it here as well.


    // Return success
    return new Response(null, { status: 204 });
};