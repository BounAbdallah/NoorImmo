import api from './api';

export const leaseService = {
    getAllLeases: async (params = {}) => {
        const response = await api.get('/baux', { params });
        return response.data;
    },

    getLease: async (id) => {
        const response = await api.get(`/baux/${id}`);
        return response.data;
    },

    createLease: async (leaseData) => {
        const response = await api.post('/baux', leaseData);
        return response.data;
    },

    updateLease: async (id, leaseData) => {
        const response = await api.put(`/baux/${id}`, leaseData);
        return response.data;
    },

    terminateLease: async (id) => {
        // Assuming termination might be an update to status or a specific endpoint
        // For now, let's assume it's an update to set status to 'termine'
        const response = await api.put(`/baux/${id}`, { statut: 'termine' });
        return response.data;
    },

    deleteLease: async (id) => {
        const response = await api.delete(`/baux/${id}`);
        return response.data;
    }
};
