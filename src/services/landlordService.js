import api from './api';

export const landlordService = {
    // Get all landlords (filtered by agency on backend)
    getAll: async (params) => {
        const response = await api.get('/bailleurs', { params });
        return response.data;
    },

    // Get single landlord details
    getById: async (id) => {
        const response = await api.get(`/bailleurs/${id}`);
        return response.data;
    },

    // Create new landlord
    create: async (data) => {
        const response = await api.post('/bailleurs', data);
        return response.data;
    },

    // Update landlord
    update: async (id, data) => {
        const response = await api.put(`/bailleurs/${id}`, data);
        return response.data;
    },

    // Delete landlord
    delete: async (id) => {
        const response = await api.delete(`/bailleurs/${id}`);
        return response.data;
    }
};
