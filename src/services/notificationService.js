import api from './api';

export const notificationService = {
    getAll: async (params = {}) => {
        const response = await api.get('/notifications', { params });
        return response.data;
    },

    getOne: async (id) => {
        const response = await api.get(`/notifications/${id}`);
        return response.data;
    },

    getUnreadCount: async () => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },

    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    }
};
