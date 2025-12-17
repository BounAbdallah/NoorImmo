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

    downloadPdf: async (id) => {
        const response = await api.get(`/etats-des-lieux/${id}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `etat_des_lieux_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    delete: async (id) => {
        const response = await api.delete(`/etats-des-lieux/${id}`);
        return response.data;
    }
};
