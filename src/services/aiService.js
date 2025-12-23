import api from './api';

export const aiService = {
    /**
     * Send a message to the AI assistant
     */
    async chat(message, conversationId = null) {
        const response = await api.post('/ai/chat', {
            message,
            conversation_id: conversationId
        });
        return response.data;
    },

    /**
     * Get suggested questions
     */
    async getSuggestions() {
        const response = await api.get('/ai/suggestions');
        return response.data;
    },

    /**
     * Check AI service health
     */
    async checkHealth() {
        const response = await api.get('/ai/health');
        return response.data;
    }
};
