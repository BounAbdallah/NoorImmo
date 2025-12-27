import api from './api';

export const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    getAgencies: async (params = {}) => {
        const response = await api.get('/admin/agencies', { params });
        return response.data;
    },

    toggleUserStatus: async (userId) => {
        const response = await api.put(`/admin/users/${userId}/status`);
        return response.data;
    },

    getAgencyDetails: async (id) => {
        const response = await api.get(`/admin/agencies/${id}`);
        return response.data;
    },

    getPlans: async () => {
        const response = await api.get('/admin/plans');
        return response.data;
    },

    getPlanDetails: async (id) => {
        const response = await api.get(`/admin/plans/${id}`);
        return response.data;
    },

    savePlan: async (plan) => {
        if (plan.id) {
            const response = await api.put(`/admin/plans/${plan.id}`, plan);
            return response.data;
        } else {
            const response = await api.post('/admin/plans', plan);
            return response.data;
        }
    },

    getCommissions: async (page = 1, search = '') => {
        const response = await api.get(`/admin/commissions?page=${page}&search=${search}`);
        return response.data;
    },

    updateAgencySubscription: async (agencyId, data) => {
        const response = await api.put(`/admin/agencies/${agencyId}/subscription`, data);
        return response.data;
    },

    getAllPlans: async () => {
        const response = await api.get('/admin/plans');
        return response.data;
    },

    logVisit: async (page) => {
        // This is a public/semi-public route, so if api interceptor adds token it's fine
        // If no token, it should still work if the route is not protected by auth:sanctum strictly
        // We put it in 'v1' group but outside 'auth:sanctum' middleware group in api.php
        const response = await api.post('/analytics/visit', { page });
        return response.data;
    }
};
