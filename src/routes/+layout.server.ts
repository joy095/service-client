// src/routes/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import type { User, Business } from '$lib/types';
import { env } from '$env/dynamic/private';

export const load: LayoutServerLoad = async ({ fetch, cookies }) => {
    // --- Initialize return data ---
    const returnData: { user: User | null; businessData: Business | null } = { user: null, businessData: null };

    try {
        const accessToken = cookies.get('access_token');
        if (!accessToken) {
            // console.warn('No access token found in cookies.');
            // Return defaults (nulls) if no token
            return returnData;
        }

        // --- 1. Fetch User Profile ---
        try {
            const profileRes = await fetch(`${env.API_URL}/profile`, {
                headers: {
                    cookie: `access_token=${accessToken}`
                },
                credentials: 'include'
            });

            if (!profileRes.ok) {
                const errorText = await profileRes.text();
                console.error(`Failed to fetch profile: ${profileRes.status} - ${errorText}`);
            } else {
                const profileData = await profileRes.json();
                const user: User | null = profileData?.user || null;

                if (!user) {
                    console.warn('Fetched profile data is missing the expected user object.');
                } else {
                    returnData.user = user; // Assign user data if successful
                }
            }
        } catch (profileError) {
            console.error('Error fetching user profile:', profileError);

        }

        // --- 2. Fetch Business Data ---
        try {
            const businessRes = await fetch(`${env.API_URL}/business/by-user`, {
                method: 'GET',
                headers: {
                    // Alternatively, if your backend expects cookie for this endpoint too:
                    cookie: `access_token=${accessToken}`
                },
                credentials: 'include'
            });

            if (!businessRes.ok) {
                if (businessRes.status === 404) {
                    console.info('No business found for this user.');
                    // businessData remains null
                } else {
                    const errorText = await businessRes.text();
                    console.error(`Failed to fetch business: ${businessRes.status} - ${errorText}`);
                    // businessData remains null
                }
            } else {
                if (businessRes.status === 204) {
                    console.info('Business endpoint returned 204 No Content.');
                } else if ((businessRes.headers.get('content-type') || '').includes('application/json')) {
                    const businessResponseData = await businessRes.json();
                    // Normalize shape: prefer explicit property when present
                    const payload = (businessResponseData && typeof businessResponseData === 'object'
                        && 'business' in businessResponseData)
                        ? (businessResponseData as any).business
                        : businessResponseData;
                    returnData.businessData = (payload ?? null) as Business | null;
                } else {
                    const text = await businessRes.text();
                    console.warn(`Business responded with non-JSON content-type. Status ${businessRes.status}. Body (truncated): ${text.slice(0, 500)}`);
                }
            }
        } catch (businessError) {
            console.error('Error fetching business data:', businessError);
            // Handle business fetch error specifically if needed.
        }
        return returnData;

    } catch (error) {
        // Catch any unexpected errors in the main try block
        console.error('Unexpected error in profile/business page load:', error);
        // Return the default object with nulls
        return returnData;
    }
};