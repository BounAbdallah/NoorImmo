import api from './api';

export const agencyService = {
    getSettings: async () => {
        const response = await api.get('/agency/settings');
        return response.data;
    },

    updateSettings: async (settings) => {
        const response = await api.put('/agency/settings', settings);
        return response.data;
    }
};
