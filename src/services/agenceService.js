import api from './api';

export const agenceService = {
    getProfile: async () => {
        const response = await api.get('/agence/profile');
        return response.data;
    },

    updateSettings: async (data) => {
        const response = await api.put('/agence/settings', data);
        return response.data;
    },

    uploadLogo: async (file) => {
        const formData = new FormData();
        formData.append('logo', file);

        const response = await api.post('/agence/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    deleteLogo: async () => {
        const response = await api.delete('/agence/logo');
        return response.data;
    }
};
