import api from './api';

export const planService = {
    // Get all active plans
    getAllPlans: async () => {
        const response = await api.get('/plans');
        return response.data;
    },

    // Get a specific plan
    getPlan: async (id) => {
        const response = await api.get(`/plans/${id}`);
        return response.data;
    },

    // Subscribe to a plan (Protected)
    subscribe: async (planId, durationMonths = 12) => {
        const response = await api.post('/subscriptions/subscribe', {
            plan_id: planId,
            duree_mois: durationMonths
        });
        return response.data;
    }
};
