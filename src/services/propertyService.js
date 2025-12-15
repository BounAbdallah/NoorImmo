import api from './api';

export const propertyService = {
    getAll: (params) => api.get('/biens', { params }),
    getOne: (id) => api.get(`/biens/${id}`),
    create: (data) => api.post('/biens', data),
    update: (id, data) => api.put(`/biens/${id}`, data),
    delete: async (id) => {
        const response = await api.delete(`/biens/${id}`);
        return response.data;
    },

    downloadMandat: async (id) => {
        const response = await api.get(`/biens/${id}/mandat/download`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `mandat_gerance_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    viewMandat: async (id) => {
        const response = await api.get(`/biens/${id}/mandat/view`, {
            responseType: 'blob'
        });
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
    },
    getAllProperties: (params) => api.get('/biens', { params }),
};
