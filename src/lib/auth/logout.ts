// src/lib/auth/logout.ts
import { logout as resetStore } from '$lib/store/authStore';
import { goto } from '$app/navigation';

export async function logout() {
    try {
        await fetch(`${import.meta.env.API_URL}/logout`, {
            method: 'POST',
            credentials: 'include' // sends HttpOnly access_token cookie
        });
    } catch (err) {
        console.error('Logout failed:', err);
    }

    resetStore();     // Clear Svelte store
    goto('/');   // Redirect client-side
}
