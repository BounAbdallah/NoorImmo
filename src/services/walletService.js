import api from './api';

export const walletService = {
    getBalance: () => api.get('/portefeuille'),
    getHistory: () => api.get('/portefeuille/history'),
    getStats: () => api.get('/portefeuille/stats'),
};
