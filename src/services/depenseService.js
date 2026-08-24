import api from './api';

export const depenseService = {
    // Get all expense notes with optional filters
    async getExpenses(filters = {}) {
        const params = new URLSearchParams();
        if (filters.bailleur_id) params.append('bailleur_id', filters.bailleur_id);
        if (filters.immeuble_id) params.append('immeuble_id', filters.immeuble_id);
        if (filters.mois) params.append('mois', filters.mois);
        if (filters.annee) params.append('annee', filters.annee);
        if (filters.page) params.append('page', filters.page);

        const response = await api.get(`/note-depenses?${params.toString()}`);
        return response.data;
    },

    // Get single expense note
    async getExpense(id) {
        const response = await api.get(`/note-depenses/${id}`);
        return response.data;
    },

    // Create new expense note (with items)
    async createExpense(data) {
        const response = await api.post('/note-depenses', data);
        return response.data;
    },

    // Update existing expense note
    async updateExpense(id, data) {
        const response = await api.put(`/note-depenses/${id}`, data);
        return response.data;
    },

    // Note: PDF download remains similar but points to /note-depenses/{id}/pdf
    async downloadExpensePDF(id) {
        const response = await api.get(`/note-depenses/${id}/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Delete expense note
    async deleteExpense(id) {
        const response = await api.delete(`/note-depenses/${id}`);
        return response.data;
    },

    // Download periodic report PDF
    async downloadPeriodicReport(params) {
        const queryParams = new URLSearchParams(params).toString();
        const response = await api.get(`/reports/periodic-expenses?${queryParams}`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Bailleurs who have at least one note de dépense (includes soft-deleted users)
    async getBailleursWithExpenses() {
        const response = await api.get('/reports/bailleurs-with-expenses');
        return response.data;
    },
};
