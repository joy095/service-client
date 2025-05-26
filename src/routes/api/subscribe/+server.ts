// src/routes/api/subscribe/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SubscriptionRequestBody, SubscriptionResponse, ErrorResponse, SubscriberStatus } from '$lib/types';
import db from '$lib/server/db';
import { v4 as uuidv4 } from 'uuid';
import { sendConfirmationEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request }) => {
    console.log('[API] Starting subscription request');

    try {
        console.log('[API] Parsing request body...');
        const requestBody: SubscriptionRequestBody = await request.json();
        const { email } = requestBody;
        console.log(`[API] Email received: ${email}`);

        if (!email) {
            console.log('[API] No email provided');
            const errorResponse: ErrorResponse = { message: 'Email address is required.' };
            return json(errorResponse, { status: 400 });
        }

        const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('[API] Invalid email format');
            const errorResponse: ErrorResponse = { message: 'Please enter a valid email address format.' };
            return json(errorResponse, { status: 400 });
        }

        console.log('[API] Starting database operations...');

        try {
            const token = uuidv4();
            console.log(`[API] Generated token for ${email}`);

            console.log('[API] Executing database query...');
            const result = await db.query(
                `INSERT INTO subscribers(email, status, confirmation_token)
                 VALUES($1, 'pending', $2)
                 ON CONFLICT (email) DO UPDATE SET
                    confirmation_token = EXCLUDED.confirmation_token,
                    status = CASE
                                 WHEN subscribers.status = 'unsubscribed' THEN 'pending'
                                 ELSE subscribers.status
                             END
                 RETURNING id, status, email`,
                [email, token]
            );

            console.log(`[API] Database query completed. Row count: ${result.rowCount}`);

            if (result.rowCount && result.rowCount > 0) {
                const subscriberStatus: SubscriberStatus = result.rows[0]?.status;
                const subscriberEmail: string = result.rows[0]?.email;
                console.log(`[API] Subscriber status: ${subscriberStatus} for ${subscriberEmail}`);

                if (subscriberStatus === 'confirmed') {
                    console.log(`[API] Email already confirmed: ${subscriberEmail}`);
                    const successResponse: SubscriptionResponse = { message: 'You are already subscribed and confirmed!' };
                    return json(successResponse, { status: 200 });
                } else {
                    console.log(`[API] Attempting to send confirmation email to: ${subscriberEmail}`);
                    try {
                        await sendConfirmationEmail({ to: subscriberEmail, token: token });
                        console.log(`Successfully processed subscription for (pending confirmation): ${subscriberEmail}`);
                        const successResponse: SubscriptionResponse = { message: 'Please check your email to confirm your subscription!' };
                        return json(successResponse, { status: 200 });
                    } catch (emailSendError: unknown) {
                        console.error('Failed to send confirmation email:', emailSendError);
                        const successResponse: SubscriptionResponse = { message: 'Subscription saved! Please check your email or contact support if you don\'t receive confirmation.' };
                        return json(successResponse, { status: 200 });
                    }
                }
            } else {
                console.error(`[API] Database query returned no rows for: ${email}`);
                const errorResponse: ErrorResponse = { message: 'Failed to process subscription request. Please try again.' };
                return json(errorResponse, { status: 500 });
            }

        } catch (dbError: unknown) {
            console.error('[API] Database error:', dbError);
            if (dbError instanceof Error) {
                console.error('[API] Database error details:', {
                    message: dbError.message,
                    stack: dbError.stack
                });
            }
            const errorResponse: ErrorResponse = { message: 'Database error occurred. Please try again later.' };
            return json(errorResponse, { status: 500 });
        }

    } catch (apiError: unknown) {
        console.error('[API] Top-level API error:', apiError);
        if (apiError instanceof Error) {
            console.error('[API] API error details:', {
                message: apiError.message,
                stack: apiError.stack
            });
        }
        const errorResponse: ErrorResponse = { message: 'Internal server error occurred.' };
        return json(errorResponse, { status: 500 });
    }
};