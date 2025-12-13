import api from './api';

export const incidentService = {
    getAll: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/incidents?${params}`);
        return response.data;
    },

    getOne: async (id) => {
        const response = await api.get(`/incidents/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/incidents', data);
        return response.data;
    },

    assign: async (id, technicianId) => {
        const response = await api.post(`/incidents/${id}/assign`, { technicien_id: technicianId });
        return response.data;
    },

    resolve: async (id, notes) => {
        const response = await api.post(`/incidents/${id}/resolve`, { resolution_notes: notes });
        return response.data;
    }
};
