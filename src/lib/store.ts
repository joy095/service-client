import { writable } from 'svelte/store';

export const isFormOpen = writable(false);

export const userPendingBusiness = writable();