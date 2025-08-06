// src/lib/stores/businessStore.ts
import { writable, derived } from 'svelte/store';
import type { Business } from '$lib/types';

const initialBusinessState: Business | null = null;

export const businessStore = writable<Business | null>(initialBusinessState);

export const hasBusiness = derived(businessStore, ($businessStore) => !!$businessStore);

export function setBusiness(businessData: Business | null) {
    businessStore.set(businessData);
}

export function clearBusiness() {
    businessStore.set(null);
}

