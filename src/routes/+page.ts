// src/routes/+page.ts
import { PUBLIC_BASE_URL } from '$env/static/public';
import type { PageLoad } from './$types';

// The 'data' parameter here contains the data returned from +page.server.ts
export const load: PageLoad = async ({ data }) => {
    // We combine the server-fetched posts with the meta data.
    // 'data' here refers to the data resolved from +page.server.ts load function.
    return {
        // Spread the server data (which contains 'posts' and potential 'error/status')
        ...data,
        // Add your static meta data
        meta: {
            title: 'Timezly - A booking website',
            description: 'Booking for service workers.',
            url: PUBLIC_BASE_URL,
            image: PUBLIC_BASE_URL + '/logo.jpg',
            siteName: 'Timezly',
            twitterHandle: '@Timezly'
        }
    };
};