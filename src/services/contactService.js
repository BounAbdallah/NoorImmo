import api from './api';

export const contactService = {
    // Send contact message (Public)
    sendMessage: async (data) => {
        const response = await api.post('/contact', data);
        return response.data;
    },

    // Admin: Get all contact messages
    getAllMessages: async (filters = {}) => {
        // Filter out empty values
        const cleanFilters = Object.entries(filters)
            .filter(([key, value]) => value !== '' && value !== null && value !== undefined)
            .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        const params = new URLSearchParams(cleanFilters).toString();
        const url = params ? `/admin/contact-messages?${params}` : '/admin/contact-messages';
        // console.log('Fetching messages from:', url);
        const response = await api.get(url);
        return response.data;
    },

    // Admin: Get single message
    getMessage: async (id) => {
        const response = await api.get(`/admin/contact-messages/${id}`);
        return response.data;
    },

    // Admin: Update message status
    updateMessage: async (id, data) => {
        const response = await api.put(`/admin/contact-messages/${id}`, data);
        return response.data;
    }
};
