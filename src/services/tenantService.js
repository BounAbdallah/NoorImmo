import api from './api';

export const tenantService = {
    getAllTenants: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/locataires?${params}`);
        return response.data; // response.data.data because of pagination or structure
    },

    getTenant: async (id) => {
        const response = await api.get(`/locataires/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/locataires', data);
        return response.data;
    }
};
