import { writable } from 'svelte/store';
import { getProperties, getProperty } from '../api';

export const properties = writable([]);
export const currentProperty = writable(null);
export const isLoading = writable(false);
export const error = writable(null);

export async function loadProperties(limit = 12) {
	isLoading.set(true);
	error.set(null);
	try {
		const data = await getProperties(limit);
		properties.set(data);
	} catch (err) {
		error.set(err.message);
	} finally {
		isLoading.set(false);
	}
}

export async function loadProperty(id) {
	isLoading.set(true);
	error.set(null);
	try {
		const data = await getProperty(id);
		currentProperty.set(data);
	} catch (err) {
		error.set(err.message);
	} finally {
		isLoading.set(false);
	}
}
