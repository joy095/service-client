// src/lib/utils/refreshToken.ts
import { initializeFromServer, logout } from '$lib/store/authStore';

export async function tryRefreshToken(): Promise<void> {
    try {
        // Check if access token already exists (stored in a cookie)
        const cookies = document.cookie;
        const hasAccessToken = cookies.includes('access_token=');

        if (hasAccessToken) {
            // Access token exists, no need to refresh
            return;
        }

        // Make request only if access token is not found
        const res = await fetch(`${import.meta.env.API_URL}/refresh - token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include' // Send refresh token cookie
        });

        if (!res.ok) {
            console.warn('Refresh token request failed');
            logout(); // clear auth store
            return;
        }

        const data = await res.json();

        if (data?.user) {
            initializeFromServer(data.user);
        } else {
            logout();
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        logout(); // fallback
    }
}
