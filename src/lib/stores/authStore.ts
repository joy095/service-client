// src/lib/store/authStore.ts
import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';
import { browser } from '$app/environment';

export type AuthState = {
    user: User | null;
    isAuthenticated: boolean,
};

const initialAuthState: AuthState = {
    user: null,
    isAuthenticated: false,
};

const authStore = writable<AuthState>(initialAuthState);

// Derived: boolean true/false for reactivity in templates
const isAuthenticated = derived(authStore, ($authStore) => !!$authStore.user);

// Set user
function login(userData: User) {
    authStore.set({ user: userData, isAuthenticated: true });
}

// Clear user
function logout() {
    authStore.set(initialAuthState);
}

// Initialize from SSR data or refreshed token
function initializeFromServer(user: User | null) {
    if (!browser) return; // Avoid mutating shared state on server
    if (user) login(user);
    else logout();
}

// Export everything
export { login, logout, initializeFromServer, isAuthenticated };
