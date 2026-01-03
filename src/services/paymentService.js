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
        const response = await api.get('/paiements-loyer/unpaid');
        return response.data;
    },

    downloadDebtDocument: async (id) => {
        const response = await api.get(`/paiements-loyer/${id}/dette/download`, {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `reconnaissance_dette_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    },

    viewDebtDocument: async (id) => {
        const response = await api.get(`/paiements-loyer/${id}/dette/view`, {
            responseType: 'blob'
        });
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        window.open(fileURL, '_blank');
    },

    getLeaseTimeline: async (leaseId) => {
        const response = await api.get(`/baux/${leaseId}/timeline`);
        return response.data;
    },

    initiateWavePayment: async (bailId, montant, month, year) => {
        const response = await api.post('/paiements-loyer/wave/initiate', {
            bail_id: bailId,
            montant: montant,
            month: month,
            year: year
        });
        return response.data;
    },

    confirmWavePayment: async (paymentData) => {
        const response = await api.post('/paiements-loyer/wave/confirm', paymentData);
        return response.data;
    }
};
