// src/lib/store/authStore.ts
import { writable, derived } from 'svelte/store';
import type { User } from '$lib/types';

export type AuthState = {
    user: User | null;
};

const initialAuthState: AuthState = {
    user: null
};

const authStore = writable<AuthState>(initialAuthState);

// Derived: boolean true/false for reactivity in templates
const isAuthenticated = derived(authStore, ($authStore) => !!$authStore.user);

// Set user
function login(userData: User) {
    authStore.set({ user: userData });
}

// Clear user
function logout() {
    authStore.set(initialAuthState);
}

// Initialize from SSR data or refreshed token
function initializeFromServer(user: User | null) {
    if (user) login(user);
    else logout();
}

// Export everything
export { login, logout, initializeFromServer, isAuthenticated };
