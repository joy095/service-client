import { writable } from 'svelte/store';
import { getProperties, getProperty } from '../api';

export const properties = writable([]);
export const currentProperty = writable(null);
export const isLoading = writable(false);
export const error = writable(null);

/**
 * Loads properties from the API with pagination support.
 * @param {number} limit - The number of properties to fetch (defaults to 50).
 * @param {number} offset - The number of properties to skip (for pagination, defaults to 0).
 */
export async function loadProperties(limit = 50, offset = 0) { // Updated default limit and added offset
	isLoading.set(true);
	error.set(null);
	try {
		const data = await getProperties(limit, offset); // Pass both limit and offset to the API
		properties.set(data);
	} catch (err) {
		console.error("Error loading properties:", err); // Log the full error for debugging
		error.set(err.message);
	} finally {
		isLoading.set(false);
	}
}

/**
 * Loads a single property's details from the API.
 * @param {string} id - The ID of the property to load.
 */
export async function loadProperty(id) {
	isLoading.set(true);
	error.set(null);
	try {
		const data = await getProperty(id);
		currentProperty.set(data);
	} catch (err) {
		console.error(`Error loading property ${id}:`, err); // Log the full error for debugging
		error.set(err.message);
	} finally {
		isLoading.set(false);
	}
}
