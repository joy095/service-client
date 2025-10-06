import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { PUBLIC_API_URL } from '$env/static/public';
import type { User, Business } from '$lib/types';

interface TokenData {
    user: User | null;
    businessData: Business | null;
    isAuthenticated: boolean;
}

// Well-known routes handler
const wellKnownHandler: Handle = async ({ event, resolve }) => {
    const pathname = event.url.pathname;

    // Allow known well-known routes to pass through
    if (
        pathname.startsWith('/.well-known/acme-challenge/') ||
        pathname === '/.well-known/apple-app-site-association' ||
        pathname === '/.well-known/assetlinks.json'
    ) {
        return resolve(event);
    }

    // Short-circuit unknown well-known paths
    if (pathname === '/.well-known' || pathname.startsWith('/.well-known/')) {
        return new Response(null, { status: 204 });
    }

    return resolve(event);
};

// Token handler
export const tokenHandler: Handle = async ({ event, resolve }) => {
    // Initialize token data
    const tokenData: TokenData = {
        user: null,
        businessData: null,
        isAuthenticated: false
    };

    try {
        const accessToken = event.cookies.get('access_token');

        if (!accessToken) {
            event.locals.tokenData = tokenData;
            return resolve(event);
        }

        // Fetch user profile
        const profileRes = await event.fetch(`${PUBLIC_API_URL}/profile`, {
            headers: {
                cookie: `access_token=${accessToken}`
            },
            credentials: 'include'
        });

        if (profileRes.ok) {
            const profileData = await profileRes.json();
            const user: User | null = profileData?.user || null;

            if (user) {
                tokenData.user = user;
                tokenData.isAuthenticated = true;

                // Fetch business data
                const businessRes = await event.fetch(`${PUBLIC_API_URL}/business/by-user`, {
                    method: 'GET',
                    headers: {
                        cookie: `access_token=${accessToken}`
                    },
                    credentials: 'include'
                });

                if (businessRes.ok) {
                    if (businessRes.status !== 204) {
                        const businessResponseData = await businessRes.json();
                        const payload = (businessResponseData && typeof businessResponseData === 'object'
                            && 'business' in businessResponseData)
                            ? (businessResponseData as any).business
                            : businessResponseData;
                        tokenData.businessData = (payload ?? null) as Business | null;
                    }
                } else if (businessRes.status !== 404) {
                    const errorText = await businessRes.text();
                    console.error(`Failed to fetch business: ${businessRes.status} - ${errorText}`);
                }
            }
        } else {
            const errorText = await profileRes.text();
            console.error(`Failed to fetch profile: ${profileRes.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('Error in token handler:', error);
    }

    event.locals.tokenData = tokenData;
    return resolve(event);
};

// Export the sequence with both handlers
export const handle = sequence(wellKnownHandler, tokenHandler);