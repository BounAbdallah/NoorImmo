import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Users, Building, DollarSign, Activity, Search, Ban, CheckCircle, AlertTriangle, X } from 'lucide-react';
import Swal from 'sweetalert2';

import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut } from 'react-chartjs-2';

// Modal Component for Online Users
const OnlineUsersModal = ({ isOpen, onClose, users }) => {
    if (!isOpen) return null;

    // Ensure users is an array
    const userList = Array.isArray(users) ? users : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Utilisateurs En Ligne ({userList.length})</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière activité</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {userList.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.nom} {user.prenom}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            {user.user_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.last_seen_at).toLocaleTimeString()}
                                    </td>
                                </tr>
                            ))}
                            {userList.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Aucun utilisateur en ligne (à part vous peut-être ?)
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={onClose}>Fermer</Button>
                </div>
            </div>
        </div>
    );
};

export default function SuperAdminDashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOnlineUsersModalOpen, setIsOnlineUsersModalOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        loadData();
    }, [page, search]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsRes, agenciesRes] = await Promise.all([
                adminService.getStats(),
                adminService.getAgencies({ page, search })
            ]);

            if (statsRes.success) {
                setStats(statsRes.data);

                // Prepare Chart Data (Mocking evolution for demo as we don't have historical data endpoint yet)
                setChartData({
                    labels: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin'],
                    datasets: [
                        {
                            label: 'Nouveaux Abonnements',
                            data: [1, 2, 1, 3, 2, 4], // Fake data for demo
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        },
                        {
                            label: 'Revenus (k FCFA)',
                            data: [50, 100, 80, 150, 120, 200], // Fake data for demo
                            backgroundColor: 'rgba(16, 185, 129, 0.5)',
                        }
                    ]
                });
            }
            if (agenciesRes.success) {
                setAgencies(agenciesRes.data.data);
                setTotalPages(agenciesRes.data.last_page);
            }
        } catch (error) {
            console.error("Error loading admin data", error);
            setError("Erreur lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user, currentStatus) => {
        const action = currentStatus ? 'désactiver' : 'activer';
        const result = await Swal.fire({
            title: 'Confirmation',
            text: `Voulez-vous vraiment ${action} cet utilisateur ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                const response = await adminService.toggleUserStatus(user.id);
                if (response.success) {
                    Swal.fire('Succès', response.message, 'success');
                    loadData(); // Reload to update list
                }
            } catch (error) {
                Swal.fire('Erreur', 'Impossible de modifier le statut', 'error');
            }
        }
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page
    };

    if (loading && !stats) return <div className="p-12 text-center">Chargement du tableau de bord administrateur...</div>;
    if (error) return <div className="p-12 text-center text-red-500">{error}</div>; // Display error message

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Administration Globale</h1>
                <Button onClick={() => navigate('/admin/plans')} className="w-full sm:w-auto">
                    Gestion des Abonnements
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div onClick={() => setIsOnlineUsersModalOpen(true)} className="cursor-pointer transition-transform hover:scale-105">
                    <StatsCard title="Utilisateurs En Ligne" value={stats?.users?.online || 0} icon={Activity} color="text-green-500" bg="bg-green-50" />
                </div>
                <StatsCard title="Visites Plateforme" value={stats?.visits?.platform || 0} icon={Search} color="text-blue-500" bg="bg-blue-50" />
                <StatsCard title="Visites Landing" value={stats?.visits?.landing || 0} icon={Search} color="text-indigo-500" bg="bg-indigo-50" />

                <StatsCard title="Agences" value={stats?.agencies?.total || 0} icon={Building} color="text-blue-600" bg="bg-blue-100" />
                <StatsCard title="Abonnements Actifs" value={stats?.agencies?.active_subscriptions || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-100" />
                <StatsCard title="Utilisateurs Totaux" value={stats?.users?.total || 0} icon={Users} color="text-purple-600" bg="bg-purple-100" />
                <StatsCard title="Revenus (MRR Est.)" value={`${new Intl.NumberFormat('fr-FR').format(stats?.revenue?.current_mrr || 0)} F`} icon={DollarSign} color="text-emerald-600" bg="bg-emerald-100" />

                {/* Platform Commission Wallet */}
                <StatsCard
                    title="Portefeuille Commissions"
                    value={`${new Intl.NumberFormat('fr-FR').format(stats?.platform_wallet_balance || 0)} F`}
                    icon={DollarSign}
                    color="text-amber-600"
                    bg="bg-amber-100"
                />
                <StatsCard
                    title="Commissions (Mois)"
                    value={`${new Intl.NumberFormat('fr-FR').format(stats?.platform_revenue_month || 0)} F`}
                    icon={Activity}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
            </div>

            {/* Recent Earnings Table */}
            {stats?.recent_earnings?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Derniers Gains (Commissions)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bien</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agence</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {stats.recent_earnings.map((earning, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(earning.date).toLocaleDateString()} <span className="text-xs">{new Date(earning.date).toLocaleTimeString()}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                {earning.transaction_ref}
                                                <div className="text-xs text-gray-500">{earning.mode}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{earning.client}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{earning.property}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{earning.agence}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right">
                                                +{new Intl.NumberFormat('fr-FR').format(earning.amount)} F
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Modal for online users */}
            <OnlineUsersModal
                isOpen={isOnlineUsersModalOpen}
                onClose={() => setIsOnlineUsersModalOpen(false)}
                users={stats?.users?.online_list || []}
            />

            {/* Charts Section */}
            {chartData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Évolution de la plateforme</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center h-64">
                            <Doughnut data={{
                                labels: ['Agences', 'Bailleurs', 'Locataires'],
                                datasets: [{
                                    data: [stats?.users?.agences, stats?.users?.bailleurs, stats?.users?.locataires],
                                    backgroundColor: ['#3b82f6', '#8b5cf6', '#10b981']
                                }]
                            }} options={{ responsive: true, maintainAspectRatio: false }} />
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Agencies List */}
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Gestion des Agences</CardTitle>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher une agence..."
                            className="pl-8 w-full"
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agence</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abonnement</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {agencies.map((agency) => (
                                    <tr key={agency.id} className={!agency.user.actif ? 'bg-red-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{agency.raison_sociale}</div>
                                            <div className="text-sm text-gray-500">{agency.adresse}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{agency.user?.prenom} {agency.user?.nom}</div>
                                            <div className="text-sm text-gray-500">{agency.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {agency.abonnement && agency.abonnement.statut === 'actif' ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    {agency.abonnement.plan?.nom}
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    Gratuit / Inactif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {agency.biens_count || 0} Biens | {agency.baux_count || 0} Baux
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {agency.user?.actif ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Actif</span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Bloqué</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/admin/agencies/${agency.id}`)}
                                            >
                                                Détails
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleStatus(agency.user, agency.user.actif)}
                                                className={agency.user.actif ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"}
                                            >
                                                {agency.user.actif ? <Ban className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                                {agency.user.actif ? 'Bloquer' : 'Activer'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="mt-4 flex justify-between items-center">
                        <Button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            variant="outline"
                            size="sm"
                        >
                            Précédent
                        </Button>
                        <span className="text-sm text-gray-600">Page {page} sur {totalPages}</span>
                        <Button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            variant="outline"
                            size="sm"
                        >
                            Suivant
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, bg }) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </CardContent>
        </Card>
    );
}
