import type { LayoutServerLoadEvent } from './$types';
import { env } from '$env/dynamic/private';

export const load = async ({ fetch }: LayoutServerLoadEvent) => {
    let user = null;

    try {
        const res = await fetch(env.API_URL + '/profile', {
            method: 'GET',
            credentials: 'include'
        });

        if (res.ok) {
            user = await res.json();
        }
    } catch (err) {
        console.error('Failed to load user from backend:', err);
    }

    console.log(user)
    return { user };
};
