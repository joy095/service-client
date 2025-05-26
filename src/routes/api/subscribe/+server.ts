// src/routes/api/subscribe/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { SubscriptionRequestBody, SubscriptionResponse, ErrorResponse, SubscriberStatus } from '$lib/types';
import db from '$lib/server/db';
import { v4 as uuidv4 } from 'uuid';
import { sendConfirmationEmail } from '$lib/server/email';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const requestBody: SubscriptionRequestBody = await request.json();
        const { email } = requestBody;

        if (!email) {
            const errorResponse: ErrorResponse = { message: 'Email address is required.' };
            return json(errorResponse, { status: 400 });
        }

        const emailRegex: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const errorResponse: ErrorResponse = { message: 'Please enter a valid email address format.' };
            return json(errorResponse, { status: 400 });
        }

        try {
            const token = uuidv4();

            const result = await db.query(
                `INSERT INTO subscribers(email, status, confirmation_token)
                 VALUES($1, 'pending', $2)
                 ON CONFLICT (email) DO UPDATE SET
                    confirmation_token = EXCLUDED.confirmation_token,
                    status = CASE
                                 WHEN subscribers.status = 'unsubscribed' THEN 'pending'
                                 ELSE subscribers.status
                             END,
                    updated_at = NOW() -- Explicitly update updated_at on conflict
                 RETURNING id, status, email`,
                [email, token]
            );

            if (result.rowCount && result.rowCount > 0) {
                const subscriberStatus: SubscriberStatus = result.rows[0]?.status;
                const subscriberEmail: string = result.rows[0]?.email;

                if (subscriberStatus === 'confirmed') {
                    console.log(`Email already confirmed: ${subscriberEmail}`);
                    const successResponse: SubscriptionResponse = { message: 'You are already subscribed and confirmed!' };
                    return json(successResponse, { status: 200 });
                } else {
                    // This block will be executed if status is 'pending' (new or re-subscribed)
                    try {
                        await sendConfirmationEmail({ to: subscriberEmail, token: token });
                        console.log(`Successfully processed subscription for (pending confirmation): ${subscriberEmail}`);
                        const successResponse: SubscriptionResponse = { message: 'Please check your email to confirm your subscription!' };
                        return json(successResponse, { status: 200 });
                    } catch (emailSendError: unknown) {
                        console.error('Failed to send confirmation email:', emailSendError);
                        // Decide how to handle this:
                        // 1. Return a success message but log the email error (if email is not critical)
                        //    const successResponse: SubscriptionResponse = { message: 'Subscription processed, but failed to send confirmation email. Please check your email spam or contact support.' };
                        //    return json(successResponse, { status: 200 });
                        // 2. Return an error, as email confirmation is crucial for subscription completion.
                        const errorResponse: ErrorResponse = { message: 'Failed to send confirmation email. Please try again or contact support.' };
                        return json(errorResponse, { status: 500 });
                    }
                }
            } else {
                console.error(`Failed to insert or update subscriber for: ${email}. Database query returned no rows.`);
                const errorResponse: ErrorResponse = { message: 'Failed to process subscription request. Please try again.' };
                return json(errorResponse, { status: 500 });
            }

        } catch (dbOrEmailError: unknown) {
            const errorMessage = (dbOrEmailError instanceof Error) ? dbOrEmailError.message : 'An unknown database or email error occurred.';
            console.error('Database or email sending error during subscription:', errorMessage);
            const errorResponse: ErrorResponse = { message: 'Failed to subscribe. Please try again later.' };
            return json(errorResponse, { status: 500 });
        }

    } catch (apiError: unknown) {
        const errorMessage = (apiError instanceof Error) ? apiError.message : 'An unknown API processing error occurred.';
        console.error('API processing error (parsing request, etc.):', errorMessage);
        const errorResponse: ErrorResponse = { message: 'Internal server error occurred.' };
        return json(errorResponse, { status: 500 });
    }
};