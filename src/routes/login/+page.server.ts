import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const formData = await request.formData();
        const email = formData.get('email')?.toString();
        const password = formData.get('password')?.toString();

        if (!email || !password) {
            return fail(400, { error: 'Email and password are required.' });
        }

        try {
            const res = await fetch(env.API_URL + '/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const data = await res.json();
                return fail(res.status, { error: data.message || 'Invalid credentials.' });
            }

            const data = await res.json();
            // store token in cookie
            cookies.set('session', data.token, {
                path: '/',
                httpOnly: true,
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            });

            // redirect after login
            throw redirect(303, '/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            return fail(500, { error: 'Server error. Please try again later.' });
        }
    }
};
