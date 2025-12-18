import api from './api';

export const customPlanService = {
    submitRequest: async (data) => {
        const response = await api.post('/custom-plan-requests', data);
        return response.data;
    },

    // Admin methods
    getAll: async (params) => {
        const response = await api.get('/admin/custom-plan-requests', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/admin/custom-plan-requests/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/admin/custom-plan-requests/${id}`, data);
        return response.data;
    },

    approve: async (id, planData) => {
        const response = await api.post(`/admin/custom-plan-requests/${id}/approve`, planData);
        return response.data;
    }
};
