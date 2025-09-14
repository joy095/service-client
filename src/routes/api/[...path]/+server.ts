import { PUBLIC_API_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

export async function GET({ url, fetch, params }) {
    const path = params.path;
    console.log('🚀 API Route hit:', { path, params, url: url.toString() });

    if (path === 'unavailable-times' || path === 'unavailable-times/') {

        const serviceId = url.searchParams.get('serviceId');
        const date = url.searchParams.get('date');

        if (!serviceId || !date) {
            console.log('❌ Missing required params:', { serviceId: !!serviceId, date: !!date });
            return json({ times: [] }, { status: 400 });
        }

        try {
            const safeServiceId = encodeURIComponent(serviceId);
            const safeDate = encodeURIComponent(date);
            const apiUrl = `${PUBLIC_API_URL}/public/services/${safeServiceId}/unavailable-times?date=${safeDate}`;

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                if (response.status === 204) {
                    console.log('📭 204 No Content - returning empty times');
                    return json({ times: [] });
                }

                const contentType = response.headers.get('content-type') ?? '';

                if (!contentType.includes('application/json')) {
                    return json({ times: [] });
                }

                let result: unknown;
                try {
                    result = await response.json();
                    console.log('📋 Backend API result:', result);
                } catch (parseError) {
                    console.error('❌ JSON parse error:', parseError);
                    return json({ times: [] });
                }

                const times = Array.isArray((result as any)?.times) ? (result as any).times : [];
                return json({ times });

            } else {
                const errorText = await response.text();
                console.error(`❌ Failed to fetch unavailable times (${response.status}):`, errorText);
                return json({ times: [] }, { status: response.status });
            }
        } catch (err) {
            console.error('💥 Error fetching unavailable times:', err);
            return json({ times: [] }, { status: 500 });
        }
    }

    console.error('❌ GET route not found:', path);
    return json({ error: 'Not found' }, { status: 404 });
}