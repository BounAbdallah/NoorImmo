import api from './api';

export const inventoryService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/etats-des-lieux?${params}`);
        return response.data;
    },

    getOne: async (id) => {
        const response = await api.get(`/etats-des-lieux/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/etats-des-lieux', data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/etats-des-lieux/${id}`);
        return response.data;
    }
};
