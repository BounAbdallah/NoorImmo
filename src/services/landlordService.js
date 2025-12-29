import api from './api';

export const landlordService = {
    // Get all landlords (filtered by agency on backend)
    getAll: async (params) => {
        const response = await api.get('/bailleurs', { params });
        return response.data;
    },

    // Get single landlord details
    getById: async (id) => {
        const response = await api.get(`/bailleurs/${id}`);
        return response.data;
    },

    // Create new landlord
    create: async (data) => {
        const response = await api.post('/bailleurs', data);
        return response.data;
    },

    // Update landlord
    update: async (id, data) => {
        const response = await api.put(`/bailleurs/${id}`, data);
        return response.data;
    },

    // Delete landlord
    delete: async (id) => {
        const response = await api.delete(`/bailleurs/${id}`);
        return response.data;
    },

    // Reports
    downloadMonthlyReport: async (params) => {
        const response = await api.get('/reports/landlord-monthly', {
            params,
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        const filename = `rapport-mensuel-${params.bailleur_id}-${params.month}-${params.year}.pdf`;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return response.data;
    }
};
