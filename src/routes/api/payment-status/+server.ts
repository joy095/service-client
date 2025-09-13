// src/routes/api/payment-status/+server.ts
import { PUBLIC_API_URL } from "$env/static/public";
import { error, json, type RequestHandler } from "@sveltejs/kit";

async function makeAuthenticatedRequest(
    url: string,
    method: "GET" | "POST",
    accessToken: string,
    body?: unknown,
    timeoutMs: number = 15000
) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const headers: Record<string, string> = { Accept: "application/json" };
        if (accessToken) {
            headers.Cookie = `access_token=${encodeURIComponent(accessToken)}`;
        }
        if (body !== undefined) {
            headers["Content-Type"] = "application/json";
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
        if (err instanceof Error && err.name === "AbortError") {
            throw error(504, "Request timed out");
        }
        throw err;
    }
}

export const GET: RequestHandler = async ({ url, cookies }) => {
    const orderId = url.searchParams.get("order_id");
    if (!orderId) throw error(400, "order_id query param is required");

    const accessToken = cookies.get("access_token");
    if (!accessToken) throw error(401, "Authentication required");

    // Call backend API to fetch order status
    const statusRes = await makeAuthenticatedRequest(
        `${PUBLIC_API_URL}/orders/${encodeURIComponent(orderId)}`,
        "GET",
        accessToken
    );

    if (!statusRes.ok) {
        const errorText = await statusRes.text();
        throw error(statusRes.status, `Order fetch failed: ${errorText}`);
    }

    const updatedOrder = await statusRes.json();
    return json(updatedOrder);
};
