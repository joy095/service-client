import { writable } from 'svelte/store';
import type { Business } from '$lib/types';

export const isFormOpen = writable<boolean>(false);

export const userPendingBusiness = writable<Business[]>([]);