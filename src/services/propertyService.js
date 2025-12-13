import api from './api';

export const propertyService = {
    getAll: (params) => api.get('/biens', { params }),
    getOne: (id) => api.get(`/biens/${id}`),
    create: (data) => api.post('/biens', data),
    update: (id, data) => api.put(`/biens/${id}`, data),
    delete: (id) => api.delete(`/biens/${id}`),
    getAllProperties: (params) => api.get('/biens', { params }),
};
