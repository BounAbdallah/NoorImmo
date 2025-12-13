import api from './api';

export const paymentService = {
    getPayments: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/paiements-loyer?${params}`);
        return response.data;
    },

    getPaymentById: async (id) => {
        const response = await api.get(`/paiements-loyer/${id}`);
        return response.data;
    },

    recordPayment: async (paymentData) => {
        const response = await api.post('/paiements-loyer', paymentData);
        return response.data;
    },

    downloadReceipt: async (id) => {
        const response = await api.get(`/paiements-loyer/${id}/quittance`, {
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `quittance-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return response.data;
    },

    getUnpaidRents: async () => {
        const response = await api.get('/paiements-loyer/unpaid/all');
        return response.data;
    }
};
