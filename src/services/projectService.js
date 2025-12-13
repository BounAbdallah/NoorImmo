import api from './api';

export const projectService = {
    // Projects
    getAll: (params) => api.get('/projets', { params }),
    getOne: (id) => api.get(`/projets/${id}`),
    create: (data) => api.post('/projets', data),
    update: (id, data) => api.put(`/projets/${id}`, data),
    delete: (id) => api.delete(`/projets/${id}`),

    // Milestones (Etapes)
    addStep: (data) => api.post('/etapes', data),
    updateStep: (id, data) => api.put(`/etapes/${id}`, data),
    deleteStep: (id) => api.delete(`/etapes/${id}`),

    // Escrow
    depositFunds: (data) => api.post('/paiements-escrow', data), // { projet_id, etape_id, entrepreneur_id, montant, description }
    releaseFunds: (id) => api.post(`/paiements-escrow/${id}/release`),
    getPayments: (params) => api.get('/paiements-escrow', { params }),

    // Proofs
    uploadProof: (data) => api.post('/preuves', data),
    getProofs: (etapeId) => api.get('/preuves', { params: { etape_id: etapeId } }),

    // Assignments & Invitations
    assignPartner: (projectId, data) => api.post(`/projets/${projectId}/assign`, data),
    getPartners: (projectId) => api.get(`/projets/${projectId}/partenaires`),
    createInvitation: (projectId, data) => api.post(`/projets/${projectId}/invite`, data),
    acceptInvitation: (token) => api.post(`/invitations/${token}/accept`),
};
