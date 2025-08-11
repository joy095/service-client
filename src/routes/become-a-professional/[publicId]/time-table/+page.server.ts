import { fail, error, redirect, type Actions } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { PageServerLoad } from './$types';
import { PUBLIC_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const { publicId } = params;

    try {
        const apiUrl = `${PUBLIC_API_URL}/public-working-hour/${publicId}`;
        const response = await fetch(apiUrl, {
            method: 'GET',
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw error(404, 'Business working hours not found');
            }
            throw error(response.status, `Backend returned status: ${response.status}`);
        }

        const data = await response.json();

        return {
            workingHours: data.workingHours || data,
        };
    } catch (err) {
        // Preserve SvelteKit control-flow errors (HttpError/Redirect)
        if (err && typeof err === 'object' && 'status' in err) {
            throw err as any;
        }
        console.error('Error fetching working hours:', err);
        throw error(500, 'Failed to connect to backend service');
    }
};

export const actions = {
    default: async ({ request, params, cookies }) => {
        const publicId = params.publicId;
        const formData = await request.formData();
        const accessToken = cookies.get('access_token');

        if (!accessToken) {
            console.error('No access token found');
            return fail(401, {
                error: 'Not authenticated',
                message: 'Please login to continue',
            });
        }

        if (!publicId) {
            console.error('Invalid publicId');
            return fail(400, {
                error: 'Invalid publicId',
                message: 'Business ID is missing',
            });
        }

        // Extract days data
        const days: { dayOfWeek: string; openTime: string; closeTime: string; isClosed: boolean }[] = [];
        const dayIndices = new Set<number>();

        for (const key of formData.keys()) {
            const match = key.match(/days\[(\d+)\]\.dayOfWeek/);
            if (match) {
                dayIndices.add(parseInt(match[1]));
            }
        }

        for (const index of dayIndices) {
            days.push({
                dayOfWeek: formData.get(`days[${index}].dayOfWeek`) as string,
                openTime: formData.get(`days[${index}].openTime`) as string,
                closeTime: formData.get(`days[${index}].closeTime`) as string,
                isClosed: ['true', 'on', '1'].includes(
                    ((formData.get(`days[${index}].isClosed`) ?? '') as string).toString()
                ),
            });
        }

        const timezone = formData.get('timezone') as string;

        try {
            const response = await fetch(`${PUBLIC_API_URL}/working-hour/bulk/${publicId}`, {
                method: 'POST',
                headers: {
                    Cookie: `access_token=${accessToken}`,
                },
                credentials: 'include',
                body: JSON.stringify({ days, timezone }),
            });

            const responseBody = await response.text(); // Get raw response body

            if (!response.ok) {
                let errorData;
                try {
                    errorData = JSON.parse(responseBody);
                } catch (e) {
                    errorData = {};
                }
                console.error('Backend error:', errorData.message || responseBody);
                return fail(response.status, {
                    error: 'Save failed',
                    message: errorData.message || 'Failed to save working hours',
                });
            }

            throw redirect(303, `/become-a-professional/${publicId}/service`);
        } catch (err) {
            // Preserve SvelteKit control-flow errors (redirects/HttpErrors)
            if (err && typeof err === 'object' && 'status' in err) {
                throw err as any;
            }
            console.error('Error saving working hours:', err);
            return fail(500, {
                error: 'Save failed',
                message: err instanceof Error ? err.message : 'Unknown error',
            });
        }
    },
} satisfies Actions;