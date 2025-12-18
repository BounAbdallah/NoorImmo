import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { ArrowLeft, User, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PlanDetailsPage({ planId }) {
    const { id } = useParams();
    const finalId = planId || id;
    const navigate = useNavigate();
    const [plan, setPlan] = useState(null);
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (finalId) loadData();
    }, [finalId]);

    const loadData = async () => {
        try {
            const response = await adminService.getPlanDetails(finalId);
            if (response.success) {
                setPlan(response.data.plan);
                setSubscribers(response.data.subscribers.data || []);
            }
        } catch (error) {
            console.error('Error fetching plan details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (!plan) return <div className="p-8 text-center text-red-500">Plan introuvable</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate('/admin/plans')}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{plan.nom}</h1>
                    <p className="text-gray-500">Détails et Abonnés</p>
                </div>
            </div>

            {/* Plan Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">Prix Mensuel</p>
                        <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR').format(plan.prix_mensuel)} F</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">Abonnés Actifs</p>
                        <p className="text-2xl font-bold">{plan.abonnements_count}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">Limite Biens</p>
                        <p className="text-2xl font-bold">{plan.limite_biens === 0 ? 'Illimité' : plan.limite_biens}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm text-gray-500">Limite Utilisateurs</p>
                        <p className="text-2xl font-bold">{plan.limite_utilisateurs}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Subscribers List */}
            <Card>
                <CardHeader>
                    <CardTitle>Liste des Abonnés ({subscribers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agence</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Début</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Aucun abonné pour ce plan</td>
                                    </tr>
                                ) : (
                                    subscribers.map((sub) => (
                                        <tr key={sub.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{sub.agence?.raison_sociale}</div>
                                                        <div className="text-sm text-gray-500">ID: {sub.agence?.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{sub.agence?.user?.prenom} {sub.agence?.user?.nom}</div>
                                                <div className="text-sm text-gray-500">{sub.agence?.user?.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${sub.statut === 'actif' ? 'bg-green-100 text-green-800' :
                                                    sub.statut === 'expire' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {sub.statut}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(sub.date_debut), 'dd MMM yyyy', { locale: fr })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {sub.date_fin ? format(new Date(sub.date_fin), 'dd MMM yyyy', { locale: fr }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/agencies/${sub.agence_id}`)}
                                                >
                                                    Voir Agence
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
