// src/routes/confirm-subscription/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import type { ErrorResponse, SubscriptionResponse } from '$lib/types';
import db from '$lib/server/db';

export const GET: RequestHandler = async ({ url }) => {
    const token = url.searchParams.get('token');

    if (!token) {
        console.warn('Confirmation attempt with missing token');
        const errorResponse: ErrorResponse = { message: 'Confirmation token is missing from the link.' };
        // In a real app, you might redirect to a client-side error page for a better UX
        // throw redirect(303, '/subscription-error?code=token_missing');
        return json(errorResponse, { status: 400 });
    }

    try {
        const result = await db.query(
            `UPDATE subscribers
             SET status = 'confirmed', confirmation_token = NULL, updated_at = NOW()
             WHERE confirmation_token = $1 AND status = 'pending'
             RETURNING id, email`,
            [token]
        );

        if (result.rowCount && result.rowCount > 0) {
            const confirmedEmail = result.rows[0]?.email;
            console.log(`Subscription successfully confirmed for: ${confirmedEmail}`);
            const successResponse: SubscriptionResponse = { message: 'Your subscription has been successfully confirmed!' };
            // Redirect to a success page for better UX
            // throw redirect(303, '/subscription-success');
            return json(successResponse, { status: 200 });
        } else {
            console.warn(`Invalid, expired, or already used confirmation token: ${token}`);
            const errorResponse: ErrorResponse = { message: 'Invalid or expired confirmation link, or subscription already confirmed.' };
            // Redirect to a specific error page
            // throw redirect(303, '/subscription-error?code=invalid_token');
            return json(errorResponse, { status: 404 });
        }

    } catch (dbError: unknown) {
        const errorMessage = (dbError instanceof Error) ? dbError.message : 'An unknown database error occurred during confirmation.';
        console.error('Database error during confirmation:', errorMessage);
        const errorResponse: ErrorResponse = { message: 'An error occurred during confirmation. Please try again.' };
        return json(errorResponse, { status: 500 });
    }
};