import api from './api';

// Export base URL for direct links (PDFs, etc.)
export const API_BASE_URL = 'http://localhost:8000/api/v1';

export const leaseService = {
    getAllLeases: async (params = {}) => {
        const response = await api.get('/baux', { params });
        return response.data;
    },

    getLease: async (id) => {
        const response = await api.get(`/baux/${id}`);
        return response.data;
    },

    createLease: async (leaseData) => {
        const response = await api.post('/baux', leaseData);
        return response.data;
    },

    updateLease: async (id, leaseData) => {
        const response = await api.put(`/baux/${id}`, leaseData);
        return response.data;
    },

    terminateLease: async (id) => {
        // Assuming termination might be an update to status or a specific endpoint
        // For now, let's assume it's an update to set status to 'termine'
        const response = await api.put(`/baux/${id}`, { statut: 'termine' });
        return response.data;
    },

    deleteLease: async (id) => {
        const response = await api.delete(`/baux/${id}`);
        return response.data;
    },

    downloadContract: async (id) => {
        const response = await api.get(`/baux/${id}/contract/download`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `contrat_bail_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    viewContract: (id) => {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams({ token });
        const url = `${API_BASE_URL}/baux/${id}/contract/view?${queryParams}`;
        window.open(url, '_blank');
    },

    downloadDebtForBail: async (id, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/baux/${id}/dette/download?${queryString}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reconnaissance_dette_bail_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    viewDebtForBail: (id, params = {}) => {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams({
            ...params,
            token: token
        });
        const url = `${API_BASE_URL}/baux/${id}/dette/view?${queryParams}`;
        window.open(url, '_blank');
    },

    downloadDemandLetter: async (id, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await api.get(`/baux/${id}/demande/download?${queryString}`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `mise_en_demeure_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    viewDemandLetter: (id, params = {}) => {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams({
            ...params,
            token: token
        });
        const url = `${API_BASE_URL}/baux/${id}/demande/view?${queryParams}`;
        window.open(url, '_blank');
    }
};
