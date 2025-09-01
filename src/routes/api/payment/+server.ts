// src/routes/api/payment/+server.ts
import type { RequestHandler } from '@sveltejs/kit';
import { json, error } from '@sveltejs/kit';
import { PUBLIC_API_URL } from '$env/static/public';

// Helper function to make authenticated API requests
async function makeAuthenticatedRequest(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    accessToken: string,
    body?: unknown,
    timeoutMs: number = 15000
) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (accessToken) {
            headers.Cookie = `access_token=${encodeURIComponent(accessToken)}`;
        }
        if (body !== undefined) {
            headers['Content-Type'] = 'application/json';
        }
        const response = await fetch(url, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: controller.signal
        });
        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === 'AbortError') {
            throw error(504, 'Request timed out');
        }
        throw err;
    }
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        const { order_id, payment_method, upi_id, card_details } = await request.json();

        // Validate required fields
        if (!order_id || !payment_method) {
            throw error(400, 'Missing required fields: order_id and payment_method');
        }

        // Get access token
        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            throw error(401, 'Authentication required');
        }

        // Fetch order details to validate order existence
        const orderRes = await makeAuthenticatedRequest(
            `${PUBLIC_API_URL}/orders/${order_id}/status`,
            'GET',
            accessToken
        );

        if (!orderRes.ok) {
            const errorText = await orderRes.text();
            throw error(orderRes.status, `Order not found or invalid: ${errorText}`);
        }

        const order = await orderRes.json();

        // Payment method handling
        let paymentResponse;
        let paymentPayload: any;

        if (payment_method === 'upi_id') {
            if (!upi_id) throw error(400, 'UPI ID is required');

            // Validate UPI ID format
            const upiRegex = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;
            if (!upiRegex.test(upi_id)) {
                throw error(400, 'Invalid UPI ID');
            }

            paymentPayload = {
                payment_session_id: order.payment_session_id || order_id, // Use order_id as fallback
                upi_id,
            };

            paymentResponse = await makeAuthenticatedRequest(
                `${PUBLIC_API_URL}/payments/upi/collect`,
                'POST',
                accessToken,
                paymentPayload
            );
        } else if (payment_method === 'upi_qr') {
            paymentPayload = {
                payment_session_id: order.payment_session_id || order_id,
            };

            paymentResponse = await makeAuthenticatedRequest(
                `${PUBLIC_API_URL}/payments/upi/qr`,
                'POST',
                accessToken,
                paymentPayload
            );
        } else if (payment_method === 'card') {
            if (!card_details) throw error(400, 'Card details are required');

            // Validate card details
            const { number, expiry, cvv, name } = card_details;
            if (!number || !expiry || !cvv || !name) {
                throw error(400, 'Missing card details');
            }

            const cardNumberRegex = /^\d{13,19}$/;
            if (!cardNumberRegex.test(number.replace(/\s/g, ''))) {
                throw error(400, 'Invalid card number');
            }

            const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
            if (!expiryRegex.test(expiry)) {
                throw error(400, 'Invalid expiry date (MM/YY)');
            }

            const [mm, yy] = expiry.split('/');
            const expMonth = parseInt(mm, 10);
            const expYear = 2000 + parseInt(yy, 10);
            // Last millisecond of the expiry month
            const expiryDate = new Date(expYear, expMonth, 0, 23, 59, 59, 999);
            const now = new Date();
            if (now > expiryDate) {
                throw error(400, 'Card has expired');
            }

            const cvvRegex = /^\d{3,4}$/;
            if (!cvvRegex.test(cvv)) {
                throw error(400, 'Invalid CVV');
            }

            paymentPayload = {
                payment_session_id: order.payment_session_id || order_id,
                card_details: { number, expiry, cvv, name },
            };

            paymentResponse = await makeAuthenticatedRequest(
                `${PUBLIC_API_URL}/payments/process`,
                'POST',
                accessToken,
                paymentPayload
            );
        } else {
            throw error(400, 'Invalid payment method');
        }

        if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json().catch(() => ({}));
            throw error(
                paymentResponse.status,
                errorData.error || 'Payment processing failed'
            );
        }

        const paymentResult = await paymentResponse.json();

        // Format response based on payment method
        const responseData: any = {
            amount: order.payment?.order_amount || paymentResult.amount,
            currency: order.payment?.order_currency || paymentResult.currency || 'INR',
        };

        if (payment_method === 'upi_id') {
            responseData.upi_link = paymentResult.payment_url || paymentResult.upi_link;
        } else if (payment_method === 'upi_qr') {
            responseData.qr_code = paymentResult.qr_code;
        } else if (payment_method === 'card') {
            if ('status' in paymentResult) {
                responseData.status = paymentResult.status;
            }
        }

        return json(responseData);
    } catch (err) {
        console.error('Payment processing error:', err);
        // Handle SvelteKit errors
        if (err instanceof Error && 'status' in err) {
            throw err;
        }
        // Convert unexpected errors to 500
        throw error(500, 'Payment processing failed');
    }
};