// place files you want to import through the `$lib` alias in this folder.
import { writable } from 'svelte/store';
import { getProperties } from './api';

export const properties = writable([]);

export async function loadProperties() {
    const data = await getProperties();
    properties.set(data);
}