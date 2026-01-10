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

    downloadMandat: async (id) => {
        const response = await api.get(`/immeubles/${id}/mandat/download`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `mandat_gerance_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        return response.data;
    },

    viewMandat: (id) => {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams({ token });
        const url = `${baseUrl}/immeubles/${id}/mandat/view?${queryParams}`;
        window.open(url, '_blank');
    },

    // Floors (usually accessed via Building, but maybe standalone if we add endpoint?)
    // For now, floors are listed in building details.
};
