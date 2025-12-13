import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Users, Building, DollarSign, Database, ArrowLeft, FileText, Activity } from 'lucide-react';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AgencyDetailsAdminPage({ agencyId }) {
    const { id: paramId } = useParams();
    const id = agencyId || paramId;
    const navigate = useNavigate();
    const [agency, setAgency] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            const response = await adminService.getAgencyDetails(id);
            if (response.success) {
                setAgency(response.data.agency);
                setStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error loading agency details", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Chargement...</div>;
    if (!agency) return <div className="p-12 text-center text-red-500">Agence introuvable</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="p-2">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{agency.raison_sociale}</h1>
                        <p className="text-gray-500">{agency.user.email} - {agency.adresse}</p>
                    </div>
                </div>
                <div className="sm:ml-auto">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${agency.user.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {agency.user.actif ? 'Actif' : 'Inactif'}
                    </span>
                </div>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Chiffre d'Affaires"
                    value={`${new Intl.NumberFormat('fr-FR').format(stats.total_revenue || 0)} F`}
                    icon={DollarSign}
                    color="text-emerald-600"
                    bg="bg-emerald-100"
                />
                <StatsCard
                    title="Utilisation DB (Est.)"
                    value={`${stats.db_usage.approx_size_mb} MB`}
                    subValue={`${stats.db_usage.records_count} enregistrements`}
                    icon={Database}
                    color="text-blue-600"
                    bg="bg-blue-100"
                />
                <StatsCard
                    title="Total Biens"
                    value={stats.properties_count}
                    icon={Building}
                    color="text-indigo-600"
                    bg="bg-indigo-100"
                />
                <StatsCard
                    title="Locataires Actifs"
                    value={stats.tenants_count}
                    icon={Users}
                    color="text-purple-600"
                    bg="bg-purple-100"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Répartition du Portefeuille</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center h-64">
                        <Doughnut
                            data={{
                                labels: ['Biens', 'Locataires', 'Bailleurs'],
                                datasets: [{
                                    data: [stats.properties_count, stats.tenants_count, stats.landlords_count],
                                    backgroundColor: ['#4f46e5', '#10b981', '#f59e0b'],
                                    borderWidth: 0
                                }]
                            }}
                            options={{ responsive: true, maintainAspectRatio: false }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>État des Locations</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center h-64">
                        <Pie
                            data={{
                                labels: ['Baux Actifs', 'Baux Terminés/Inactifs'],
                                datasets: [{
                                    data: [stats.active_leases_count, stats.leases_count - stats.active_leases_count],
                                    backgroundColor: ['#22c55e', '#9ca3af'],
                                    borderWidth: 0
                                }]
                            }}
                            options={{ responsive: true, maintainAspectRatio: false }}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Usage */}
            <Card>
                <CardHeader>
                    <CardTitle>Détails Volumétrie</CardTitle>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                        <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Baux (Total / Actifs)</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.leases_count} / <span className="text-green-600">{stats.active_leases_count}</span></dd>
                        </div>
                        <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
                            <dt className="text-sm font-medium text-gray-500 truncate">Bailleurs</dt>
                            <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.landlords_count}</dd>
                        </div>
                        <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6 relative">
                            <dt className="text-sm font-medium text-gray-500 truncate">Plan Actuel</dt>
                            <dd className="mt-1 text-xl font-semibold text-indigo-600">{agency.abonnement?.plan?.nom || 'Aucun'}</dd>
                            {agency.abonnement?.plan && (
                                <p className="text-sm text-gray-500 mt-1">{new Intl.NumberFormat('fr-FR').format(agency.abonnement.plan.prix_mensuel)} FCFA / mois</p>
                            )}
                            <button
                                onClick={() => setIsPlanModalOpen(true)}
                                className="absolute top-4 right-4 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100"
                            >
                                Modifier
                            </button>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            {/* Informations Légales et Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Informations Légales & Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">NINEA</label>
                                <p className="text-gray-900">{agency.ninea || 'Non renseigné'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">RCCM</label>
                                <p className="text-gray-900">{agency.rccm || 'Non renseigné'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Responsable</label>
                                <p className="text-gray-900">{agency.user.prenom} {agency.user.nom}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Téléphone</label>
                                <p className="text-gray-900">{agency.user.telephone || 'Non renseigné'}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-gray-500">Adresse</label>
                                <p className="text-gray-900">{agency.adresse || 'Non renseigné'}</p>
                            </div>
                            <div className="col-span-2 border-t pt-4 mt-2">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Activité & Sécurité</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Dernière Connexion</label>
                                        <p className="text-gray-900 font-medium">
                                            {stats.last_seen ? new Date(stats.last_seen).toLocaleString() : 'Jamais'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Appareils Connectés</label>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stats.device_count > 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                                {stats.device_count || 0} session(s)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Configuration & Commissions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Commission Agence</label>
                                <p className="text-xl font-bold text-blue-600">{agency.taux_commission_agence}%</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Commission Plateforme</label>
                                <p className="text-xl font-bold text-purple-600">{agency.taux_commission_plateforme}%</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Date d'inscription</label>
                                <p className="text-gray-900">{new Date(agency.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Dernière mise à jour</label>
                                <p className="text-gray-900">{new Date(agency.updated_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Plan Modal */}
            <EditPlanModal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                agency={agency}
                onSuccess={loadData}
            />
        </div>
    );
}

function EditPlanModal({ isOpen, onClose, agency, onSuccess }) {
    const [plans, setPlans] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(agency?.abonnement?.plan_id || '');
    const [status, setStatus] = useState(agency?.abonnement?.statut || 'actif');
    const [duration, setDuration] = useState(12);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadPlans();
            if (agency?.abonnement) {
                setSelectedPlan(agency.abonnement.plan_id);
                setStatus(agency.abonnement.statut);
            }
        }
    }, [isOpen, agency]);

    const loadPlans = async () => {
        try {
            const res = await adminService.getAllPlans();
            if (res.success) setPlans(res.data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await adminService.updateAgencySubscription(agency.id, {
                plan_id: selectedPlan,
                statut: status,
                duree_mois: duration
            });
            if (res.success) {
                onSuccess();
                onClose();
            }
        } catch (e) {
            alert('Erreur: ' + (e.response?.data?.message || 'Erreur inconnue'));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Modifier l'abonnement</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Plan</label>
                        <select
                            value={selectedPlan}
                            onChange={e => setSelectedPlan(e.target.value)}
                            className="w-full border rounded-lg p-2"
                            required
                        >
                            <option value="">Sélectionner un plan</option>
                            {plans.map(p => (
                                <option key={p.id} value={p.id}>{p.nom} ({p.prix_mensuel} F)</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Statut</label>
                        <select
                            value={status}
                            onChange={e => setStatus(e.target.value)}
                            className="w-full border rounded-lg p-2"
                        >
                            <option value="actif">Actif</option>
                            <option value="en_attente">En attente</option>
                            <option value="suspendu">Suspendu</option>
                            <option value="expire">Expiré</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Durée (Mois) - Réinitialisera la date de fin</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            className="w-full border rounded-lg p-2"
                            min="1"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
                        <Button type="submit" isLoading={loading}>Enregistrer</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function StatsCard({ title, value, subValue, icon: Icon, color, bg }) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
                </div>
                <div className={`p-3 rounded-full ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </CardContent>
        </Card>
    );
}
