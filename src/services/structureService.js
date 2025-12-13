import api from './api';

export const structureService = {
    // Buildings
    getAllBuildings: async (params) => {
        const response = await api.get('/immeubles', { params });
        return response.data;
    },

    getBuilding: async (id) => {
        const response = await api.get(`/immeubles/${id}`);
        return response.data;
    },

    createBuilding: async (data) => {
        const response = await api.post('/immeubles', data);
        return response.data;
    },

    updateBuilding: async (id, data) => {
        const response = await api.put(`/immeubles/${id}`, data);
        return response.data;
    },

    deleteBuilding: async (id) => {
        const response = await api.delete(`/immeubles/${id}`);
        return response.data;
    },

    // Floors (usually accessed via Building, but maybe standalone if we add endpoint?)
    // For now, floors are listed in building details.
};
