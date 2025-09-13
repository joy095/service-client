// src/routes/api/payment/+server.ts
import { PUBLIC_API_URL } from '$env/static/public';
import { error, type RequestHandler } from '@sveltejs/kit';

async function makeAuthenticatedRequest(
	url: string,
	method: 'GET' | 'POST',
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

// src/routes/api/payment/+server.ts
export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { currency, service_id, start_time, upi_id, payment_method } = await request.json();

		if (!currency || !service_id || !start_time) {
			throw error(400, 'Missing required fields: currency, service_id, start_time');
		}

		const accessToken = cookies.get('access_token');
		if (!accessToken) {
			throw error(401, 'Authentication required');
		}

		if (payment_method === 'upi_id') {
			if (!upi_id) throw error(400, 'UPI ID is required');
			const upiRegex = /^[a-zA-Z0-9]([a-zA-Z0-9.\-_]*[a-zA-Z0-9])?@[a-zA-Z0-9]+$/;
			if (!upiRegex.test(upi_id)) throw error(400, 'Invalid UPI ID');
		}

		const orderPayload: any = { currency, service_id, start_time };
		if (payment_method === 'upi_id' && upi_id) orderPayload.upi_id = upi_id;

		// Step 1: Create order
		const orderRes = await makeAuthenticatedRequest(
			`${PUBLIC_API_URL}/orders-and-pay`,
			'POST',
			accessToken,
			orderPayload
		);

		if (!orderRes.ok) {
			const errorText = await orderRes.text();
			throw error(orderRes.status, `Order creation failed: ${errorText}`);
		}

		const order = await orderRes.json();
		console.log('Created order:', order);

		// Step 2: wait 8s before checking status
		await new Promise((resolve) => setTimeout(resolve, 8000));

		const statusRes = await makeAuthenticatedRequest(
			`${PUBLIC_API_URL}/orders/${order.order_id}`,
			'GET',
			accessToken
		);

		if (!statusRes.ok) {
			const errorText = await statusRes.text();
			throw error(statusRes.status, `Order status update failed: ${errorText}`);
		}

		const statusData = await statusRes.json();

		return new Response(
			JSON.stringify({
				order_id: order.order_id,
				status: statusData.status,
				qr_code: statusData.qr_code ?? null,
				upi_link: statusData.upi_link ?? null
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (err) {
		console.error('Payment processing error:', err);

		return new Response(
			JSON.stringify({
				status: 'failed',
				message: 'Payment processing failed'
			}),
			{ status: 500 }
		);
	}
};
