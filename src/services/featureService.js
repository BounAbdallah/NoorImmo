import api from './api';

export const featureService = {
    /**
     * Get features available to the authenticated user
     */
    async getUserFeatures() {
        const response = await api.get('/user/fonctionnalites');
        return response.data;
    },

    /**
     * Check if user has a specific feature
     */
    async checkFeature(code) {
        const response = await api.get(`/user/fonctionnalites/${code}/check`);
        return response.data;
    },

    /**
     * Get all features (Admin only)
     */
    async getAllFeatures() {
        const response = await api.get('/admin/fonctionnalites');
        return response.data;
    },

    /**
     * Create a new feature (Admin only)
     */
    async createFeature(data) {
        const response = await api.post('/admin/fonctionnalites', data);
        return response.data;
    },

    /**
     * Update a feature (Admin only)
     */
    async updateFeature(id, data) {
        const response = await api.put(`/admin/fonctionnalites/${id}`, data);
        return response.data;
    },

    /**
     * Delete a feature (Admin only)
     */
    async deleteFeature(id) {
        const response = await api.delete(`/admin/fonctionnalites/${id}`);
        return response.data;
    },

    /**
     * Get features for a specific plan (Admin only)
     */
    async getPlanFeatures(planId) {
        const response = await api.get(`/admin/plans/${planId}/fonctionnalites`);
        return response.data;
    },

    /**
     * Update features for a specific plan (Admin only)
     */
    async updatePlanFeatures(planId, featureIds) {
        const response = await api.put(`/admin/plans/${planId}/fonctionnalites`, {
            fonctionnalite_ids: featureIds
        });
        return response.data;
    },

    /**
     * Remove a feature from a plan (Admin only)
     */
    async removePlanFeature(planId, featureId) {
        const response = await api.delete(`/admin/plans/${planId}/fonctionnalites/${featureId}`);
        return response.data;
    }
};
