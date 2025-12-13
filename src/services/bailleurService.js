import api from './api';

export const bailleurService = {
    getAll: async (params) => {
        const response = await api.get('/bailleurs', { params });
        return response.data;
    },

    getOne: async (id) => {
        const response = await api.get(`/bailleurs/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/bailleurs', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/bailleurs/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/bailleurs/${id}`);
        return response.data;
    }
};
