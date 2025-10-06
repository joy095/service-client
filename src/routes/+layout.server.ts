import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    // Now you can access the token data from locals
    return {
        user: locals.tokenData?.user || null,
        businessData: locals.tokenData?.businessData || null,
        isAuthenticated: locals.tokenData?.isAuthenticated || false
    };
};