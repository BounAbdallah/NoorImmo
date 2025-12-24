import api from './api';

const quittanceService = {
    // Get all receipts (filtered by backend for tenants)
    getReceipts: async () => {
        const response = await api.get('/quittances');
        return response.data;
    },

    // Get single receipt
    getReceipt: async (id) => {
        const response = await api.get(`/quittances/${id}`);
        return response.data;
    },

    // Download receipt PDF
    downloadReceipt: async (id) => {
        const response = await api.get(`/quittances/${id}/download`, {
            responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Quittance_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return response.data;
    },

    // View receipt PDF in browser
    viewReceipt: async (id) => {
        const response = await api.get(`/quittances/${id}/view`, {
            responseType: 'blob'
        });

        // Open in new tab
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        window.open(url, '_blank');

        return response.data;
    },

    // Create receipt (agency/admin only)
    createReceipt: async (data) => {
        const response = await api.post('/quittances', data);
        return response.data;
    },

    // Delete receipt (agency/admin only)
    deleteReceipt: async (id) => {
        const response = await api.delete(`/quittances/${id}`);
        return response.data;
    }
};

export { quittanceService };
