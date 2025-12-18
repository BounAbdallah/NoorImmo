import React, { useState, useEffect } from 'react';
import { planService } from '../../../services/planService';
import { Plus, Edit, Trash2, Check, X, Eye } from 'lucide-react';
import Swal from 'sweetalert2';
import PlanFormModal from '../../../components/admin/PlanFormModal';
import PlanSubscribersModal from '../../../components/admin/PlanSubscribersModal';

export default function AdminPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showSubscribersModal, setShowSubscribersModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await planService.getAllPlans();
            if (response.success) {
                setPlans(response.data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de charger les plans',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedPlan(null);
        setShowModal(true);
    };

    const handleEdit = (plan) => {
        setSelectedPlan(plan);
        setShowModal(true);
    };

    const handleViewSubscribers = (plan) => {
        setSelectedPlan(plan);
        setShowSubscribersModal(true);
    };

    const handleDelete = async (plan) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr?',
            text: `Voulez - vous vraiment supprimer le plan "${plan.nom}" ? `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                const response = await planService.deletePlan(plan.id);
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Supprimé!',
                        text: response.message,
                        confirmButtonColor: '#2563eb'
                    });
                    fetchPlans();
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: error.response?.data?.message || 'Impossible de supprimer le plan',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    };

    const handleSubmit = async (formData) => {
        try {
            let response;
            if (selectedPlan) {
                // Update existing plan
                response = await planService.updatePlan(selectedPlan.id, formData);
            } else {
                // Create new plan
                response = await planService.createPlan(formData);
            }

            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès!',
                    text: response.message,
                    confirmButtonColor: '#2563eb'
                });
                setShowModal(false);
                fetchPlans();
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.response?.data?.message || 'Une erreur est survenue',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Abonnements</h1>
                    <p className="text-gray-600 mt-1">Gérez les plans d'abonnement disponibles</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nouveau Plan
                </button>
            </div>

            {/* Plans List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement...</p>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">Aucun plan disponible</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Plan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prix Mensuel
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Prix Annuel
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Limites
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {plans.map((plan) => (
                                    <tr key={plan.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{plan.nom}</div>
                                                <div className="text-sm text-gray-500">{plan.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatPrice(plan.prix_mensuel)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {plan.prix_annuel ? formatPrice(plan.prix_annuel) : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {plan.limite_utilisateurs === -1 ? '∞' : plan.limite_utilisateurs} utilisateurs
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {plan.limite_biens === -1 ? '∞' : plan.limite_biens} biens
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {plan.actif ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Actif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    <X className="w-3 h-3 mr-1" />
                                                    Inactif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleViewSubscribers(plan)}
                                                className="text-green-600 hover:text-green-900 mr-4"
                                                title="Voir les abonnés"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(plan)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                                title="Modifier"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Plan Form Modal */}
            <PlanFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                plan={selectedPlan}
            />

            {/* Plan Subscribers Modal */}
            <PlanSubscribersModal
                isOpen={showSubscribersModal}
                onClose={() => setShowSubscribersModal(false)}
                planId={selectedPlan?.id}
            />
        </div>
    );
}
