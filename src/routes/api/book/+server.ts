import { PUBLIC_API_URL } from '$env/static/public';
import { parseDateTime, toZoned } from '@internationalized/date';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, fetch, cookies }) => {
    console.log('POST /api/book received:', { url: request.url });
    try {
        const payload = await request.json();
        const { service_id, date, time, duration } = payload;

        const errors: string[] = [];
        if (service_id == null || (typeof service_id !== 'string' && typeof service_id !== 'number'))
            errors.push('service_id');
        if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('date');
        if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) errors.push('time');
        const durationMin = duration == null ? 30 : Number(duration);
        if (!Number.isFinite(durationMin) || durationMin <= 0 || durationMin > 24 * 60)
            errors.push('duration');
        if (errors.length) {
            console.error('Validation failed:', { errors });
            return json({ error: 'Invalid input', fields: errors }, { status: 400 });
        }

        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            return json({ error: 'Authentication required' }, { status: 401 });
        }

        // Parse local date & time
        const localDateTime = parseDateTime(`${date}T${time}`);

        // Assume input is in Asia/Kolkata (IST)
        const zoned = toZoned(localDateTime, 'Asia/Kolkata');

        // Convert to JS Date (UTC)
        const openTime = zoned.toDate();

        // Add duration
        const closeTime = new Date(openTime.getTime() + durationMin * 60000);

        const transformedPayload = {
            service_id,
            open_time: openTime.toISOString(),
            close_time: closeTime.toISOString()
        };

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Cookie: `access_token=${accessToken}`
        };

        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 10_000);
        let response = await fetch(`${PUBLIC_API_URL}/schedule-slots`, {
            method: 'POST',
            headers,
            body: JSON.stringify(transformedPayload),
            redirect: 'manual',
            signal: controller.signal
        }).finally(() => clearTimeout(t));

        for (let i = 0; i < 3 && (response.status === 307 || response.status === 308); i++) {
            const location = response.headers.get('location');
            if (!location) break;
            const nextUrl = new URL(location, response.url).toString();
            console.log(`Redirecting to: ${nextUrl}`);
            const c = new AbortController();
            const tt = setTimeout(() => c.abort(), 10_000);
            response = await fetch(nextUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(transformedPayload),
                redirect: 'manual',
                signal: c.signal
            }).finally(() => clearTimeout(tt));
        }


        const bodyText = await response.text();
        const contentType = response.headers.get('content-type') || '';
        const parseMaybeJson = (t: string) => {
            try {
                return JSON.parse(t);
            } catch {
                return t;
            }
        };
        if (response.ok) {
            const result = contentType.includes('application/json')
                ? parseMaybeJson(bodyText)
                : { raw: bodyText };

            if (result?.slot) {
                const { id, service_id, open_time, close_time, status, created_at, updated_at, user_id } = result.slot;
                return json({
                    id,
                    service_id,
                    open_time,
                    close_time,
                    status,
                    created_at,
                    updated_at,
                    user_id,
                    message: result.message || 'Slot created successfully'
                });
            }
        } else {
            const details = contentType.includes('application/json')
                ? parseMaybeJson(bodyText)
                : bodyText;
            console.error(`Failed to book slot (${response.status})`, details);
            return json({ error: 'Failed to book slot', details }, { status: response.status });
        }
    } catch (err) {
        console.error('Error booking slot:', err);
        return json(
            { error: 'An error occurred while booking', details: err.message },
            { status: 500 }
        );
    }
};
