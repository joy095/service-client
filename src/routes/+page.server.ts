// src/routes/businesses/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
const BASE_URL = 'https://r2-worker-proxy.joykarmakar987654321.workers.dev';
import type { Business } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ fetch }) => {

    try {
        const res = await fetch(`${env.API_URL}/business`);
        if (!res.ok) {
            throw new Error('Failed to fetch properties');
        }
        const data = await res.json();
        const businesses: Business[] = data.businesses.map((b: Business) => {
            const isFullUrl = b.ObjectName?.startsWith('http');
            return {
                ...b,
                ObjectName: b.ObjectName
                    ? isFullUrl
                        ? b.ObjectName
                        : BASE_URL + b.ObjectName
                    : `https://picsum.photos/536/354?random=${b.id}`
            };
        });
        return { businesses };
    } catch (error) {
        console.error(error);
        return {
            businesses: []
        };
    }

};

export const actions: Actions = {

    requestOtp: async ({ request }) => {
        const data = await request.formData();
        const email = data.get('email');

        // Basic server-side validation
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return fail(400, { email, error: 'Please enter a valid email address.' });
        }

        try {
            const response = await fetch(`${env.API_URL}/request-login-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                // If OTP request is successful, return success message and the email
                // The email is returned so the client can pre-fill it for the next step
                return { success: true, email: email as string, message: 'OTP sent to your email.' };
            } else {
                const errorData = await response.json();
                return fail(response.status, { email, error: errorData.message || 'Failed to request OTP.' });
            }
        } catch (err) {
            console.error('Error requesting OTP:', err);
            return fail(500, { email, error: 'Network error or server is unreachable.' });
        }
    },

    /**
     * Server action to verify the OTP and log in the user.
     * It makes a POST request to the /verify-email endpoint.
     * On success, it sets HttpOnly cookies for accessToken and refreshToken.
     */
    verifyOtp: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get('email');
        const otp = data.get('otp');
        const device = data.get('device') || 'Web Browser'; // Default device name

        // Basic server-side validation
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            return fail(400, { email, error: 'Email is required for verification.' });
        }
        if (!otp || typeof otp !== 'string' || otp.length !== 6) { // Assuming 6-digit OTP
            return fail(400, { email, otp, error: 'Please enter a valid 6-digit OTP.' });
        }

        try {
            const response = await fetch(`${env.API_URL}/verify-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp, device })
            });

            if (response.ok) {
                const responseData = await response.json();
                const { accessToken, refreshToken, message } = responseData;

                if (accessToken && refreshToken) {
                    // Set HttpOnly cookies for security
                    // max-age is in seconds. Example: 1 hour for access, 30 days for refresh
                    cookies.set('accessToken', accessToken, {
                        path: '/',
                        httpOnly: true, // Crucial for security: prevents client-side JS access
                        secure: process.env.NODE_ENV === 'production', // Use secure in production (HTTPS)
                        maxAge: 60 * 60, // 1 hour
                        sameSite: 'lax' // CSRF protection
                    });

                    cookies.set('refreshToken', refreshToken, {
                        path: '/',
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 60 * 60 * 24 * 30, // 30 days
                        sameSite: 'lax'
                    });

                    // Redirect the user to a protected page or homepage after successful login
                    throw redirect(303, '/businesses'); // Or any other protected route
                } else {
                    return fail(500, { email, otp, error: message || 'Login successful, but tokens were not received.' });
                }
            } else {
                const errorData = await response.json();
                return fail(response.status, { email, otp, error: errorData.message || 'Failed to verify OTP.' });
            }
        } catch (err) {
            // If it's a redirect error from SvelteKit, re-throw it
            if (err instanceof Error && 'status' in err && typeof err.status === 'number' && err.status === 303) {
                throw err;
            }
            console.error('Error verifying OTP:', err);
            return fail(500, { email, otp, error: 'Network error or server is unreachable.' });
        }
    }
};