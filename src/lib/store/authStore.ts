// src/lib/store/authStore.ts
import { writable } from 'svelte/store';
import type { User, AuthState } from '../types';

// Initial state
const initialAuthState: AuthState = {
    isAuthenticated: false,
    user: null
};

// Writable store with initial value
const authStore = writable<AuthState>(initialAuthState);

// Login: set authenticated user
function login(userData: User) {
    authStore.set({
        isAuthenticated: true,
        user: userData
    });
}

// Logout: clear everything
function logout() {
    authStore.set(initialAuthState);
}

// Sync user from server (e.g., from +layout.server.ts or +layout.ts)
function initializeFromServer(user: User | null) {
    if (user) {
        login(user);
    } else {
        logout();
    }
}

// Export everything
export { authStore, login, logout, initializeFromServer };
