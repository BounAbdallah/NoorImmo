import api from './api';

export const teamService = {
    // Get all team members
    getTeamMembers: async () => {
        try {
            const response = await api.get('/agence/equipe');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Invite a new member
    inviteMember: async (data) => {
        try {
            const response = await api.post('/agence/equipe', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Update member permissions
    updateMemberPermissions: async (id, permissions) => {
        try {
            const response = await api.put(`/agence/equipe/${id}`, { permissions });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Remove a member
    removeMember: async (id) => {
        try {
            const response = await api.delete(`/agence/equipe/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
