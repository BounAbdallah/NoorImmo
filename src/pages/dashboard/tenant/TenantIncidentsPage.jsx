import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { incidentService } from '../../../services/incidentService';
import { AlertCircle, Plus, Clock, CheckCircle, XCircle, Wrench } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function TenantIncidentsPage() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadIncidents();
    }, []);

    const loadIncidents = async () => {
        try {
            const res = await incidentService.getIncidents();
            if (res.data) {
                const data = res.data.data || res.data;
                setIncidents(data);
            }
        } catch (error) {
            console.error("Failed to load incidents", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            ouvert: 'bg-red-100 text-red-800',
            en_cours: 'bg-yellow-100 text-yellow-800',
            resolu: 'bg-green-100 text-green-800',
            ferme: 'bg-gray-100 text-gray-800'
        };

        const icons = {
            ouvert: AlertCircle,
            en_cours: Wrench,
            resolu: CheckCircle,
            ferme: XCircle
        };

        const labels = {
            ouvert: 'Ouvert',
            en_cours: 'En cours',
            resolu: 'Résolu',
            ferme: 'Fermé'
        };

        const Icon = icons[status] || Clock;

        return (
            <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${styles[status] || styles.ouvert}`}>
                <Icon className="h-3 w-3 mr-1" />
                {labels[status] || status}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const styles = {
            faible: 'bg-blue-100 text-blue-800',
            moyenne: 'bg-yellow-100 text-yellow-800',
            haute: 'bg-orange-100 text-orange-800',
            urgente: 'bg-red-100 text-red-800'
        };

        const labels = {
            faible: 'Faible',
            moyenne: 'Moyenne',
            haute: 'Haute',
            urgente: 'Urgente'
        };

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[priority] || styles.faible}`}>
                {labels[priority] || priority}
            </span>
        );
    };

    const getCategoryIcon = (category) => {
        const icons = {
            plomberie: '🚰',
            electricite: '⚡',
            serrurerie: '🔑',
            climatisation: '❄️',
            autre: '🔧'
        };
        return icons[category] || '🔧';
    };

    if (loading) {
        return <div className="p-8 text-center">Chargement...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Mes Signalements</h1>
                <Button onClick={() => navigate('/dashboard/incidents/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Signalement
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{incidents.length}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-gray-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Ouverts</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {incidents.filter(i => i.statut === 'ouvert').length}
                                </p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">En cours</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {incidents.filter(i => i.statut === 'en_cours').length}
                                </p>
                            </div>
                            <Wrench className="h-8 w-8 text-yellow-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Résolus</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {incidents.filter(i => i.statut === 'resolu').length}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-400" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Incidents List */}
            <Card>
                <CardHeader>
                    <CardTitle>Historique des Signalements</CardTitle>
                </CardHeader>
                <CardContent>
                    {incidents.length === 0 ? (
                        <div className="text-center py-12">
                            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">Aucun signalement pour le moment.</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Signalez un problème pour que votre agence puisse intervenir rapidement.
                            </p>
                            <Button onClick={() => navigate('/dashboard/incidents/new')} className="mt-4">
                                <Plus className="h-4 w-4 mr-2" />
                                Créer un signalement
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {incidents.map((incident) => (
                                <div
                                    key={incident.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => navigate(`/dashboard/incidents/${incident.id}`)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="text-2xl">{getCategoryIcon(incident.categorie)}</span>
                                                <h3 className="text-lg font-semibold text-gray-900">{incident.titre}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{incident.description}</p>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    {new Date(incident.date_declaration).toLocaleDateString('fr-FR')}
                                                </div>
                                                <div className="capitalize">
                                                    {incident.categorie}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2 ml-4">
                                            {getStatusBadge(incident.statut)}
                                            {getPriorityBadge(incident.priorite)}
                                        </div>
                                    </div>
                                    {incident.technicien && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-xs text-gray-500">
                                                Assigné à: <span className="font-medium text-gray-700">
                                                    {incident.technicien.user?.prenom} {incident.technicien.user?.nom}
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Conseil</p>
                        <p>
                            Pour un traitement plus rapide, décrivez le problème de manière détaillée et ajoutez des photos si possible.
                            En cas d'urgence (fuite d'eau, panne électrique), contactez directement votre agence par téléphone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
