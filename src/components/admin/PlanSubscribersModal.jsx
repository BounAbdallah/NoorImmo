import React, { useState, useEffect } from 'react';
import { X, Users, Mail, Phone, MapPin, Calendar, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { planService } from '../../services/planService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import AgencyProfileModal from './AgencyProfileModal';

export default function PlanSubscribersModal({ isOpen, onClose, planId }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [selectedAgency, setSelectedAgency] = useState(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        if (isOpen && planId) {
            fetchSubscribers();
        }
    }, [isOpen, planId]);

    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            const response = await planService.getPlanSubscribers(planId);
            if (response.success) {
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching subscribers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewAgency = (agency) => {
        setSelectedAgency(agency);
        setShowProfileModal(true);
    };

    const handleAgencyUpdate = (updatedAgency) => {
        // Refresh the subscribers list
        fetchSubscribers();
        setShowProfileModal(false);
    };

    const getStatusBadge = (statut) => {
        const badges = {
            actif: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Actif' },
            suspendu: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'Suspendu' },
            expire: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Expiré' },
            en_attente: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'En attente' }
        };
        const badge = badges[statut] || badges.en_attente;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-3 h-3 mr-1" />
                {badge.label}
            </span>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {data?.plan?.nom || 'Détails du plan'}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {data?.total_subscribers || 0} agence(s) abonnée(s)
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Chargement...</p>
                        </div>
                    ) : data?.subscribers?.length === 0 ? (
                        <div className="py-12 text-center">
                            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">Aucune agence abonnée à ce plan</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data?.subscribers?.map((agency) => (
                                <div key={agency.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {agency.raison_sociale}
                                                </h3>
                                                {agency.abonnement && getStatusBadge(agency.abonnement.statut)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                                {agency.user?.email && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail className="w-4 h-4" />
                                                        <span>{agency.user.email}</span>
                                                    </div>
                                                )}
                                                {agency.user?.telephone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        <span>{agency.user.telephone}</span>
                                                    </div>
                                                )}
                                                {agency.adresse && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{agency.adresse}</span>
                                                    </div>
                                                )}
                                                {agency.abonnement && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>
                                                            Du {format(new Date(agency.abonnement.date_debut), 'dd/MM/yyyy')}
                                                            {agency.abonnement.date_fin && ` au ${format(new Date(agency.abonnement.date_fin), 'dd/MM/yyyy')}`}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* View Details Button */}
                                        <div className="mt-3">
                                            <button
                                                onClick={() => handleViewAgency(agency)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Voir Détails
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>

            {/* Agency Profile Modal */}
            {showProfileModal && selectedAgency && (
                <AgencyProfileModal
                    agency={selectedAgency}
                    onClose={() => setShowProfileModal(false)}
                    onUpdate={handleAgencyUpdate}
                />
            )}
        </div>
    );
}
