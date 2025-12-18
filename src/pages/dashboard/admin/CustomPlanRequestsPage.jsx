import React, { useState, useEffect } from 'react';
import { customPlanService } from '../../../services/customPlanService';
import { Eye, Check, X, Clock, Loader, Filter } from 'lucide-react';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CustomPlanRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, en_attente, en_cours, approuve, refuse
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadRequests();
    }, [filter]);

    const loadRequests = async () => {
        try {
            const params = filter !== 'all' ? { statut: filter } : {};
            const response = await customPlanService.getAll(params);
            if (response.success) {
                setRequests(response.data.data || response.data);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger les demandes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (statut) => {
        const badges = {
            en_attente: 'bg-yellow-100 text-yellow-800',
            en_cours: 'bg-blue-100 text-blue-800',
            approuve: 'bg-green-100 text-green-800',
            refuse: 'bg-red-100 text-red-800'
        };
        const labels = {
            en_attente: 'En attente',
            en_cours: 'En cours',
            approuve: 'Approuvé',
            refuse: 'Refusé'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[statut]}`}>
                {labels[statut]}
            </span>
        );
    };

    const handleViewDetails = async (id) => {
        try {
            const response = await customPlanService.getById(id);
            if (response.success) {
                setSelectedRequest(response.data);
                setShowModal(true);
            }
        } catch (error) {
            Swal.fire('Erreur', 'Impossible de charger les détails', 'error');
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await customPlanService.update(id, { statut: newStatus });
            if (response.success) {
                Swal.fire('Succès', 'Statut mis à jour', 'success');
                loadRequests();
                if (selectedRequest?.id === id) {
                    setSelectedRequest({ ...selectedRequest, statut: newStatus });
                }
            }
        } catch (error) {
            Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
        }
    };

    const handleApprove = async (request) => {
        const { value: formValues } = await Swal.fire({
            title: 'Créer le plan personnalisé',
            html: `
                <div class="text-left space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nom du plan</label>
                        <input id="nom_plan" class="swal2-input w-full" placeholder="Ex: Plan Premium ${request.prenom}" value="Plan ${request.entreprise || request.nom}">
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Prix mensuel (FCFA)</label>
                            <input id="prix_mensuel" type="number" class="swal2-input w-full" placeholder="50000" value="${request.budget_mensuel || ''}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Prix annuel (FCFA)</label>
                            <input id="prix_annuel" type="number" class="swal2-input w-full" placeholder="540000">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de biens max</label>
                            <input id="nombre_biens_max" type="number" class="swal2-input w-full" value="${request.nombre_biens}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre d'utilisateurs max</label>
                            <input id="nombre_utilisateurs_max" type="number" class="swal2-input w-full" value="${request.nombre_utilisateurs}">
                        </div>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Créer le plan',
            cancelButtonText: 'Annuler',
            preConfirm: () => {
                return {
                    nom_plan: document.getElementById('nom_plan').value,
                    prix_mensuel: document.getElementById('prix_mensuel').value,
                    prix_annuel: document.getElementById('prix_annuel').value,
                    nombre_biens_max: document.getElementById('nombre_biens_max').value,
                    nombre_utilisateurs_max: document.getElementById('nombre_utilisateurs_max').value,
                    fonctionnalites: request.fonctionnalites_souhaitees
                };
            }
        });

        if (formValues) {
            try {
                const response = await customPlanService.approve(request.id, formValues);
                if (response.success) {
                    Swal.fire('Succès !', 'Plan personnalisé créé et demande approuvée', 'success');
                    loadRequests();
                    setShowModal(false);
                }
            } catch (error) {
                Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de la création', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Demandes de Plans Personnalisés</h1>
                    <p className="text-gray-500">Gérez les demandes de devis personnalisés</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Filtrer par statut:</span>
                    <div className="flex gap-2">
                        {['all', 'en_attente', 'en_cours', 'approuve', 'refuse'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === status
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'Tous' : status.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Requests List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entreprise</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Besoins</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    Aucune demande trouvée
                                </td>
                            </tr>
                        ) : (
                            requests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {request.prenom} {request.nom}
                                        </div>
                                        <div className="text-sm text-gray-500">{request.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {request.entreprise || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {request.nombre_biens} biens • {request.nombre_utilisateurs} users
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {request.budget_mensuel ? `${parseInt(request.budget_mensuel).toLocaleString()} F` : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(request.statut)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {format(new Date(request.created_at), 'dd MMM yyyy', { locale: fr })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewDetails(request.id)}
                                            className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Voir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {showModal && selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {selectedRequest.prenom} {selectedRequest.nom}
                                    </h2>
                                    <p className="text-gray-500">{selectedRequest.email}</p>
                                </div>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                                <div className="flex gap-2">
                                    {['en_attente', 'en_cours', 'approuve', 'refuse'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => handleUpdateStatus(selectedRequest.id, status)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium ${selectedRequest.statut === status
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {status.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Entreprise</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.entreprise || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.telephone || '-'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre de biens</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.nombre_biens}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre d'utilisateurs</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.nombre_utilisateurs}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Budget mensuel</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedRequest.budget_mensuel ? `${parseInt(selectedRequest.budget_mensuel).toLocaleString()} FCFA` : 'Non spécifié'}
                                    </p>
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fonctionnalités souhaitées</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedRequest.fonctionnalites_souhaitees?.map((feature, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Specific Needs */}
                            {selectedRequest.besoins_specifiques && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Besoins spécifiques</label>
                                    <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                                        {selectedRequest.besoins_specifiques}
                                    </p>
                                </div>
                            )}

                            {/* Actions */}
                            {selectedRequest.statut === 'en_attente' && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => handleApprove(selectedRequest)}
                                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center"
                                    >
                                        <Check className="w-5 h-5 mr-2" />
                                        Approuver et créer le plan
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedRequest.id, 'refuse')}
                                        className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        Refuser
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
