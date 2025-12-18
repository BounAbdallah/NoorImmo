import api from './api';

export const planService = {
    // Get all plans (Public)
    getAllPlans: async () => {
        const response = await api.get('/plans');
        return response.data;
    },

    // Validate token for private plan
    validateToken: async (planId, token) => {
        const response = await api.post('/plans/validate-token', {
            plan_id: planId,
            token: token
        });
        return response.data;
    },

    // Admin: Create new plan
    createPlan: async (data) => {
        const response = await api.post('/admin/plans', data);
        return response.data;
    },

    // Admin: Update plan
    updatePlan: async (id, data) => {
        const response = await api.put(`/admin/plans/${id}`, data);
        return response.data;
    },

    // Admin: Delete plan
    deletePlan: async (id) => {
        const response = await api.delete(`/admin/plans/${id}`);
        return response.data;
    },

    // Admin: Get plan subscribers
    getPlanSubscribers: async (id) => {
        const response = await api.get(`/admin/plans/${id}/subscribers`);
        return response.data;
    }
};
