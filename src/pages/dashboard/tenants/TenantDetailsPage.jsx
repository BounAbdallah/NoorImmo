import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tenantService } from '../../../services/tenantService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
    ArrowLeft, User, Mail, Phone, Briefcase, Building2, CreditCard,
    FileText, AlertTriangle, TrendingUp, Calendar, Home, CheckCircle,
    Clock, XCircle, Edit, Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import Swal from 'sweetalert2';
import PermissionGuard from '../../../components/auth/PermissionGuard';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const getStorageUrl = (path) => {
    if (!path) return null;
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    // Remove the /api/v1 (or /api/v1/) suffix to get the root URL
    baseUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
    // Ensure no trailing slash
    baseUrl = baseUrl.replace(/\/+$/, '');

    return `${baseUrl}/storage/${path.replace(/^\/+/, '')}`;
};

export default function TenantDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState(null);
    const [stats, setStats] = useState({});
    const [bauxActifs, setBauxActifs] = useState([]);
    const [bauxHistorique, setBauxHistorique] = useState([]);
    const [paiements, setPaiements] = useState([]);
    const [paymentsChart, setPaymentsChart] = useState([]);
    const [statusDistribution, setStatusDistribution] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('contrats');

    useEffect(() => {
        loadTenant();
    }, [id]);

    const loadTenant = async () => {
        try {
            const response = await tenantService.getTenant(id);
            if (response.success) {
                setTenant(response.data);
                setStats(response.stats || {});
                setBauxActifs(response.baux_actifs || []);
                setBauxHistorique(response.baux_historique || []);
                setPaiements(response.paiements || []);
                setPaymentsChart(response.payments_chart || []);
                setStatusDistribution(response.status_distribution || {});
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Locataire introuvable', 'error');
            navigate('/tenants');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            html: `Voulez-vous vraiment supprimer le locataire <strong>${tenant.user?.prenom} ${tenant.user?.nom}</strong> ?<br/><span class="text-red-600">Cette action est irréversible.</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                await tenantService.delete(id);
                Swal.fire({
                    icon: 'success',
                    title: 'Supprimé !',
                    text: 'Le locataire a été supprimé avec succès.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/tenants');
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: error.response?.data?.message || 'Impossible de supprimer ce locataire.'
                });
            }
        }
    };

    const barChartData = {
        labels: paymentsChart.map(p => p.month),
        datasets: [{
            label: 'Montant payé (FCFA)',
            data: paymentsChart.map(p => p.montant),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 6,
        }]
    };

    const doughnutChartData = {
        labels: ['Payé', 'Partiel', 'En retard'],
        datasets: [{
            data: [statusDistribution.paye || 0, statusDistribution.partiel || 0, statusDistribution.en_retard || 0],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        }]
    };

    const getStatusBadge = (statut) => {
        switch (statut) {
            case 'paye':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Payé</span>;
            case 'partiel':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Partiel</span>;
            case 'en_retard':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">En retard</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{statut}</span>;
        }
    };

    const getBailStatusBadge = (statut) => {
        switch (statut) {
            case 'actif':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Actif</span>;
            case 'expire':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Expiré</span>;
            case 'resilie':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Résilié</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{statut}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
            </div>
        );
    }

    if (!tenant) return null;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate('/tenants')} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
            </Button>

            {/* Header Card */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start md:items-center gap-6 flex-1">
                            <div className="flex-shrink-0 h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
                                {tenant.user?.prenom?.[0]}{tenant.user?.nom?.[0]}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {tenant.user?.prenom} {tenant.user?.nom}
                                </h1>
                                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        {tenant.user?.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {tenant.user?.telephone || 'Non renseigné'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="h-4 w-4 text-gray-400" />
                                        {tenant.profession || 'Non renseigné'}
                                    </div>
                                </div>
                                {tenant.employeur && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                        <Building2 className="h-4 w-4 text-gray-400" />
                                        Employeur: {tenant.employeur}
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <PermissionGuard module="locataires" action="edit">
                                <button
                                    onClick={() => navigate(`/tenants/edit/${id}`)}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                </button>
                            </PermissionGuard>
                            <PermissionGuard module="locataires" action="delete">
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                </button>
                            </PermissionGuard>
                        </div>
                    </div>

                    {/* Documents d'identité */}
                    {(tenant.cni_recto || tenant.cni_verso || tenant.numero_cni) && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-primary-500" /> Documents d'Identité
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {tenant.numero_cni && (
                                    <div>
                                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro CNI</dt>
                                        <dd className="mt-1 text-sm font-bold text-gray-900">{tenant.numero_cni}</dd>
                                    </div>
                                )}
                                {tenant.cni_recto && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">CNI Recto</p>
                                        <a
                                            href={getStorageUrl(tenant.cni_recto)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <img
                                                src={getStorageUrl(tenant.cni_recto)}
                                                alt="CNI Recto"
                                                className="h-32 w-auto rounded-lg shadow-sm border border-gray-200 hover:opacity-90 transition-opacity cursor-zoom-in"
                                            />
                                        </a>
                                    </div>
                                )}
                                {tenant.cni_verso && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">CNI Verso</p>
                                        <a
                                            href={getStorageUrl(tenant.cni_verso)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <img
                                                src={getStorageUrl(tenant.cni_verso)}
                                                alt="CNI Verso"
                                                className="h-32 w-auto rounded-lg shadow-sm border border-gray-200 hover:opacity-90 transition-opacity cursor-zoom-in"
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700">Total payé</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {parseFloat(stats.total_paye || 0).toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                                </p>
                            </div>
                            <CreditCard className="h-10 w-10 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700">Solde dû</p>
                                <p className="text-2xl font-bold text-red-900">
                                    {parseFloat(stats.solde_du || 0).toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                                </p>
                            </div>
                            <AlertTriangle className="h-10 w-10 text-red-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700">Baux actifs</p>
                                <p className="text-2xl font-bold text-blue-900">{stats.baux_actifs || 0}</p>
                                <p className="text-xs text-blue-600">{stats.nombre_baux || 0} au total</p>
                            </div>
                            <FileText className="h-10 w-10 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700">Taux paiement</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.taux_paiement || 0}%</p>
                                <p className="text-xs text-purple-600">À temps (≤5 du mois)</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Historique des paiements (12 derniers mois)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <Bar
                            data={barChartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true } }
                            }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Statut des paiements</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex justify-center items-center">
                        {(statusDistribution.paye || statusDistribution.partiel || statusDistribution.en_retard) ? (
                            <Doughnut
                                data={doughnutChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } }
                                }}
                            />
                        ) : (
                            <p className="text-gray-500">Aucun paiement</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {['contrats', 'paiements', 'incidents'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === tab
                                ? 'border-primary-500 text-primary-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Contrats Tab */}
            {activeTab === 'contrats' && (
                <div className="space-y-6">
                    {/* Active Leases */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                Baux actifs ({bauxActifs.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bauxActifs.length > 0 ? (
                                <div className="space-y-4">
                                    {bauxActifs.map((bail) => (
                                        <div key={bail.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-100">
                                            <div className="flex items-center gap-4">
                                                <Home className="h-8 w-8 text-green-600" />
                                                <div>
                                                    <Link to={`/biens/${bail.bien?.id}`} className="text-primary-600 font-medium hover:underline">
                                                        {bail.bien?.reference || bail.bien?.nom}
                                                    </Link>
                                                    <p className="text-sm text-gray-600">{bail.bien?.adresse}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                        <span><Calendar className="inline h-3 w-3 mr-1" />{format(new Date(bail.date_debut), 'dd/MM/yyyy')} - {format(new Date(bail.date_fin), 'dd/MM/yyyy')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900">{parseFloat(bail.loyer_mensuel).toLocaleString()} FCFA</p>
                                                <p className="text-xs text-gray-500">Loyer mensuel</p>
                                                <Link to={`/leases/${bail.id}`} className="text-xs text-primary-600 hover:underline">Voir le bail →</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center py-8 text-gray-500">Aucun bail actif</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Historical Leases */}
                    {bauxHistorique.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                    Historique des baux ({bauxHistorique.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {bauxHistorique.map((bail) => (
                                        <div key={bail.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Home className="h-6 w-6 text-gray-400" />
                                                <div>
                                                    <p className="font-medium text-gray-700">{bail.bien?.reference || bail.bien?.nom}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {format(new Date(bail.date_debut), 'MMM yyyy', { locale: fr })} - {format(new Date(bail.date_fin), 'MMM yyyy', { locale: fr })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {getBailStatusBadge(bail.statut)}
                                                <Link to={`/leases/${bail.id}`} className="text-xs text-primary-600 hover:underline">Voir →</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Paiements Tab */}
            {activeTab === 'paiements' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Historique des paiements ({paiements.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {paiements.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bien</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paiements.slice(0, 20).map((paiement) => (
                                            <tr key={paiement.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                    {format(new Date(paiement.date_paiement), 'dd/MM/yyyy')}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <Link to={`/biens/${paiement.bail?.bien?.id}`} className="text-primary-600 hover:underline">
                                                        {paiement.bail?.bien?.reference}
                                                    </Link>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                    {paiement.periode_debut && format(new Date(paiement.periode_debut), 'MMM yyyy', { locale: fr })}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-right font-medium">
                                                    {parseFloat(paiement.montant).toLocaleString()} FCFA
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {getStatusBadge(paiement.statut)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {paiements.length > 20 && (
                                    <p className="text-center py-3 text-sm text-gray-500">
                                        ... et {paiements.length - 20} autres paiements
                                    </p>
                                )}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-gray-500">Aucun paiement enregistré</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Incidents signalés ({tenant.incidents?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tenant.incidents?.length > 0 ? (
                            <div className="space-y-3">
                                {tenant.incidents.map((incident) => (
                                    <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div>
                                            <p className="font-medium text-gray-900">{incident.titre}</p>
                                            <p className="text-sm text-gray-600">{incident.bail?.bien?.reference}</p>
                                            <span className={`text-xs px-2 py-1 rounded-full ${incident.priorite === 'urgente' ? 'bg-red-100 text-red-800' :
                                                incident.priorite === 'haute' ? 'bg-orange-100 text-orange-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {incident.priorite}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 text-xs rounded-full ${incident.statut === 'resolu' ? 'bg-green-100 text-green-800' :
                                                incident.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {incident.statut}
                                            </span>
                                            <Link to={`/incidents/${incident.id}`} className="block text-xs text-primary-600 hover:underline mt-1">Voir →</Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center py-8 text-gray-500">Aucun incident signalé</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
