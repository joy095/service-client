// src/lib/auth/logout.ts
import { logout as logoutStore } from '$lib/stores/authStore'; // your store's logout
import { goto } from '$app/navigation';

export async function logout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });

        if (!response.ok) {
            console.warn('Failed to log out on server');
        }
    } catch (err) {
        console.error('Logout network error:', err);
    }

    finally {
        logoutStore();
        await goto('/');
    }
}