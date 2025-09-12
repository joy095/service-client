// src/routes/api/payment/+server.ts
import { PUBLIC_API_URL } from "$env/static/public";
import { error, json, type RequestHandler } from "@sveltejs/kit";

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
        clearTimeout(timeoutId);
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
        const { currency, service_id, start_time, upi_id, payment_method } =
            await request.json();

        // Validate required fields
        if (!currency || !service_id || !start_time) {
            throw error(400, 'Missing required fields: currency, service_id, start_time');
        }

        // Authentication
        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            throw error(401, 'Authentication required');
        }

        // Validate UPI if provided
        if (payment_method === 'upi_id') {
            if (!upi_id) throw error(400, 'UPI ID is required');
            const upiRegex = /^[a-zA-Z0-9]([a-zA-Z0-9.\-_]*[a-zA-Z0-9])?@[a-zA-Z0-9]+$/;
            if (!upiRegex.test(upi_id)) throw error(400, 'Invalid UPI ID');
        }

        // Prepare payload for Go backend - SIMPLIFIED STRUCTURE
        const orderPayload: any = {
            currency,
            service_id,
            start_time,
        };

        // Only include upi_id if payment method is upi_id
        if (payment_method === 'upi_id' && upi_id) {
            orderPayload.upi_id = upi_id;
        }

        console.log('Sending payload to Go backend:', JSON.stringify(orderPayload, null, 2));

        // Call backend
        const orderRes = await makeAuthenticatedRequest(
            `${PUBLIC_API_URL}/orders-and-pay`,
            'POST',
            accessToken,
            orderPayload
        );

        if (!orderRes.ok) {
            const errorText = await orderRes.text();
            console.error('Backend error response:', errorText);
            throw error(orderRes.status, `Order creation failed: ${errorText}`);
        }

        const order = await orderRes.json();

        // Return what Go responds (order_id, payment_session_id, status)
        return json(order);
    } catch (err) {
        console.error('Payment processing error:', err);
        if (err instanceof Error && 'status' in err) {
            throw err;
        }
        throw error(500, 'Payment processing failed');
    }
};