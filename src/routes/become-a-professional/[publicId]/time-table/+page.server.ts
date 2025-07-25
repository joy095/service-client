// src/routes/working-hour/bulk/[businessId]/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { env } from '$env/dynamic/private';

export const actions = {
    default: async ({ request, params }) => {
        const businessId = params.publicId;
        const formData = await request.formData();

        // Extract days data
        const days = [];
        const dayIndices = new Set<number>();

        // Get all day indices from form data
        for (const key of formData.keys()) {
            const match = key.match(/days\[(\d+)\]\.dayOfWeek/);
            if (match) {
                dayIndices.add(parseInt(match[1]));
            }
        }

        // Build days array
        for (const index of dayIndices) {
            days.push({
                dayOfWeek: formData.get(`days[${index}].dayOfWeek`) as string,
                openTime: formData.get(`days[${index}].openTime`) as string,
                closeTime: formData.get(`days[${index}].closeTime`) as string,
                isClosed: formData.get(`days[${index}].isClosed`) === 'true'
            });
        }

        // Get timezone
        const timezone = formData.get('timezone') as string;

        try {
            // Call your backend API
            const response = await fetch(`${env.API_URL}/working-hour/bulk/${businessId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ days, timezone })
            });

            if (!response.ok) {
                throw new Error('Failed to save working hours');
            }

            // Handle success (redirect or show message)
            return { success: true };
        } catch (error) {
            console.error('Error saving working hours:', error);
            return fail(500, { error: 'Failed to save working hours' });
        }
    }
} satisfies Actions;