// src/routes/somepage/[publicId]/currentpage/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const { publicId } = params;

    try {
        const response = await fetch(`${env.API_URL}/services/${publicId}`);

        if (!response.ok) {
            return {
                publicId,
                services: []
            };
        }

        const services = await response.json();

        console.log('service', services)

        return {
            publicId,
            services
        };
    } catch (error) {
        console.error('Failed to load services:', error);
        return {
            publicId,
            services: []
        };
    }
};

export const actions: Actions = {
    create: async ({ request, fetch, cookies }) => {
        const formData = await request.formData();
        const accessToken = cookies.get('access_token');

        if (!accessToken) {
            return fail(401, { error: 'Authentication required' });
        }

        try {
            const res = await fetch(`${env.API_URL}/create-service`, {
                method: 'POST',
                headers: {
                    cookie: `access_token=${accessToken}`
                },
                credentials: 'include',
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                return fail(400, { error: data?.error || 'Failed to create service' });
            }

            return { type: 'success', message: 'Service created successfully!' };
        } catch (error) {
            console.error('Create service error:', error);
            return fail(500, { error: 'Internal server error' });
        }
    },

    update: async ({ request, fetch, cookies, params }) => {
        const formData = await request.formData();
        const accessToken = cookies.get('access_token');
        const serviceId = formData.get('serviceId');

        if (!accessToken) {
            return fail(401, { error: 'Authentication required' });
        }

        if (!serviceId) {
            return fail(400, { error: 'Service ID is required' });
        }

        try {
            const res = await fetch(`${env.API_URL}/update-service/${serviceId}`, {
                method: 'PATCH',
                headers: {
                    cookie: `access_token=${accessToken}`
                },
                credentials: 'include',
                body: formData
            });

            if (!res.ok) {
                const data = await res.json();
                return fail(400, { error: data?.error || 'Failed to update service' });
            }

            return { type: 'success', message: 'Service updated successfully!' };
        } catch (error) {
            console.error('Update service error:', error);
            return fail(500, { error: 'Internal server error' });
        }
    },

    delete: async ({ request, fetch, cookies }) => {
        const formData = await request.formData();
        const accessToken = cookies.get('access_token');
        const serviceId = formData.get('serviceId');

        if (!accessToken) {
            return fail(401, { error: 'Authentication required' });
        }

        if (!serviceId) {
            return fail(400, { error: 'Service ID is required' });
        }

        try {
            const res = await fetch(`${env.API_URL}/service/${serviceId}`, {
                method: 'DELETE',
                headers: {
                    cookie: `access_token=${accessToken}`
                },
                credentials: 'include'
            });

            if (!res.ok) {
                const data = await res.json();
                return fail(400, { error: data?.error || 'Failed to delete service' });
            }

            return { type: 'success', message: 'Service deleted successfully!' };
        } catch (error) {
            console.error('Delete service error:', error);
            return fail(500, { error: 'Internal server error' });
        }
    }
};