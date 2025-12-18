
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Building, Home, FileText, Activity, Users, Wallet, AlertTriangle, TrendingUp, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { projectService } from '../../services/projectService';
import { Link } from 'react-router-dom';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut, Pie } from 'react-chartjs-2';
import SuperAdminDashboard from './SuperAdminDashboard';
import AgencyDetailsAdminPage from './admin/AgencyDetailsAdminPage';
import PlansManagementPage from './admin/PlansManagementPage';
import PlanDetailsPage from './admin/PlanDetailsPage';
import CommissionsPage from './admin/CommissionsPage';
import { useLocation } from 'react-router-dom'; // Import useLocation

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [recentProjects, setRecentProjects] = useState([]);
    const [projectsLoading, setProjectsLoading] = useState(true);
    const location = useLocation();

    // Simple internal routing for Admin features
    // In a real app setup, these would be defined in App.js routes
    if (user?.user_type === 'admin') {
        if (location.pathname === '/admin/plans') return <PlansManagementPage />;

        const planMatch = location.pathname.match(/^\/admin\/plans\/(\d+)$/);
        if (planMatch) return <PlanDetailsPage planId={planMatch[1]} />;

        if (location.pathname === '/admin/commissions') return <CommissionsPage />;

        const agencyMatch = location.pathname.match(/^\/admin\/agencies\/(\d+)$/);
        if (agencyMatch) {
            return <AgencyDetailsAdminPage agencyId={agencyMatch[1]} />;
        }

        return <SuperAdminDashboard />;
    }

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const statsRes = await dashboardService.getStats();
            if (statsRes.success) {
                setStats(statsRes.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setStatsLoading(false);
        }

        if (['bailleur', 'entrepreneur', 'admin'].includes(user?.user_type)) {
            try {
                const projectsRes = await projectService.getAll();
                const data = projectsRes.data.data?.data || projectsRes.data.data || [];
                setRecentProjects(data);
            } catch (error) {
                console.error("Failed to fetch projects", error);
            } finally {
                setProjectsLoading(false);
            }
        } else {
            setProjectsLoading(false);
        }
    };

    // --- Chart Data Preparation ---
    const revenueChartData = stats?.revenue_history ? {
        labels: stats.revenue_history.map(d => d.month),
        datasets: [
            {
                label: 'Reçu (FCFA)',
                data: stats.revenue_history.map(d => d.collected),
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
            },
            {
                label: 'Attendu (FCFA)',
                data: stats.revenue_history.map(d => d.expected),
                backgroundColor: 'rgba(99, 102, 241, 0.3)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1,
            },
        ],
    } : null;

    const occupancyChartData = stats?.property_distribution ? {
        labels: ['Loué', 'Disponible', 'Maintenance'],
        datasets: [
            {
                data: [
                    stats.property_distribution.loue || 0,
                    stats.property_distribution.disponible || 0,
                    stats.property_distribution.maintenance || 0
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)', // Green
                    'rgba(59, 130, 246, 0.8)', // Blue
                    'rgba(239, 68, 68, 0.8)', // Red
                ],
                borderWidth: 1,
            },
        ],
    } : null;

    const paymentChartData = stats?.payment_status_distribution ? {
        labels: ['Payé', 'Retard', 'Impayé'],
        datasets: [
            {
                data: [
                    stats.payment_status_distribution.paye || 0,
                    stats.payment_status_distribution.retard || 0,
                    stats.payment_status_distribution.impaye || 0
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)', // Green
                    'rgba(234, 179, 8, 0.8)', // Yellow
                    'rgba(239, 68, 68, 0.8)', // Red
                ],
                borderWidth: 1,
            },
        ],
    } : null;

    const renderAgencyStats = () => (
        <>
            <StatsCard title="Biens gérés" value={stats?.properties_count || 0} icon={Home} color="text-blue-600" />
            <StatsCard title="Bailleurs partenaires" value={stats?.landlords_count || 0} icon={Users} color="text-purple-600" />
            <StatsCard title="Baux actifs" value={stats?.active_leases_count || 0} icon={FileText} color="text-green-600" />
            <StatsCard title="Locataires" value={stats?.tenants_count || 0} icon={Users} color="text-pink-600" />
            <StatsCard title="Incidents en cours" value={stats?.incidents_pending_count || 0} icon={AlertTriangle} color="text-orange-600" />
            <StatsCard title="Loyers en Retard" value={stats?.loyers_en_retard || 0} icon={AlertTriangle} color="text-red-600" />

            <StatsCard title="Revenus Encaissés (Mois)" value={`${(stats?.revenue_collected_month || 0).toLocaleString()} F`} icon={CheckCircle} color="text-emerald-600" />
            <StatsCard title="Revenus Attendus (Mois)" value={`${(stats?.revenue_expected_month || 0).toLocaleString()} F`} icon={TrendingUp} color="text-indigo-600" />
            <StatsCard title="Mes Commissions (Mois)" value={`${(stats?.commissions_month || 0).toLocaleString()} F`} icon={DollarSign} color="text-yellow-600" />
        </>
    );

    const renderLandlordStats = () => (
        <>
            <StatsCard title="Mes Biens" value={stats?.properties_count || 0} icon={Home} color="text-blue-600" />
            <StatsCard title="Revenus Encaissés (Mois)" value={`${(stats?.revenue_collected_month || 0).toLocaleString()} F`} icon={CheckCircle} color="text-emerald-600" />
            <StatsCard title="Revenus Attendus (Mois)" value={`${(stats?.revenue_expected_month || 0).toLocaleString()} F`} icon={TrendingUp} color="text-indigo-600" />
            <StatsCard title="Incidents signalés" value={stats?.incidents_pending_count || 0} icon={AlertTriangle} color="text-orange-600" />
        </>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    Tableau de Bord
                </h1>
                <span className="text-sm text-gray-500">Bienvenue, {user?.prenom}</span>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsLoading ? (
                    <div className="col-span-4 text-center py-12">Chargement des données...</div>
                ) : (
                    <>
                        {user?.user_type === 'agence' && renderAgencyStats()}
                        {user?.user_type === 'bailleur' && renderLandlordStats()}

                        {/* Tenant View (kept simple) */}
                        {user?.user_type === 'locataire' && (
                            <>
                                <StatsCard title="Statut Bail" value={stats?.has_active_lease ? "Actif" : "Aucun"} icon={FileText} color={stats?.has_active_lease ? "text-green-600" : "text-gray-400"} />
                                <StatsCard title="Loyer" value={`${parseFloat(stats?.rent_due || 0).toLocaleString()} F`} icon={Wallet} color="text-blue-600" />
                                <StatsCard title="Signalements" value={stats?.incidents_reported_count || 0} icon={Activity} color="text-orange-600" />
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Charts Grid (Agency/Bailleur) */}
            {['agence', 'bailleur'].includes(user?.user_type) && !statsLoading && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trends */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Évolution des Revenus (12 derniers mois)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[350px]">
                            {revenueChartData && <Bar
                                data={revenueChartData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    scales: {
                                        y: { beginAtZero: true }
                                    }
                                }}
                            />}
                        </CardContent>
                    </Card>

                    {/* Occupancy */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Taux d'Occupation</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] flex justify-center">
                            {occupancyChartData && <Doughnut
                                data={occupancyChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    cutout: '60%',
                                    plugins: {
                                        legend: { position: 'bottom' }
                                    }
                                }}
                            />}
                        </CardContent>
                    </Card>

                    {/* Payment Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Status des Paiements (Mois en cours)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] flex justify-center">
                            {paymentChartData && <Pie
                                data={paymentChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom' }
                                    }
                                }}
                            />}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Advanced Stats Row (Agency & Bailleur) */}
            {['agence', 'bailleur'].includes(user?.user_type) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-6 flex items-center justify-between bg-yellow-50">
                            <div>
                                <p className="text-sm font-medium text-yellow-800">Cautions Détenues</p>
                                <p className="text-2xl font-bold text-yellow-900 mt-1">
                                    {stats?.total_deposits ? new Intl.NumberFormat('fr-FR').format(stats.total_deposits) : 0} F
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-yellow-200">
                                <Wallet className="h-6 w-6 text-yellow-800" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6 flex items-center justify-between bg-red-50">
                            <div>
                                <p className="text-sm font-medium text-red-800">Baux expirant (60 jours)</p>
                                <p className="text-2xl font-bold text-red-900 mt-1">
                                    {stats?.leases_expiring_soon || 0}
                                </p>
                            </div>
                            <div className="p-3 rounded-full bg-red-200">
                                <AlertTriangle className="h-6 w-6 text-red-800" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Recent Activities Feed (Agency & Bailleur) */}
            {['agence', 'bailleur'].includes(user?.user_type) && stats?.recent_activities && stats.recent_activities.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-6">Dernières Activités</h2>
                    <div className="flow-root">
                        <ul className="-mb-8">
                            {stats.recent_activities.map((activity, activityIdx) => (
                                <li key={activityIdx}>
                                    <div className="relative pb-8">
                                        {activityIdx !== stats.recent_activities.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h - 8 w - 8 rounded - full flex items - center justify - center ring - 8 ring - white 
                                                    ${activity.type === 'payment' ? 'bg-green-500' :
                                                        activity.type === 'incident' ? 'bg-red-500' :
                                                            'bg-blue-500'
                                                    } `}>
                                                    {activity.type === 'payment' && <Wallet className="h-5 w-5 text-white" />}
                                                    {activity.type === 'incident' && <AlertTriangle className="h-5 w-5 text-white" />}
                                                    {activity.type === 'lease' && <FileText className="h-5 w-5 text-white" />}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-medium text-gray-900">{activity.title}</span>: {activity.description}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time dateTime={activity.date}>{new Date(activity.date).toLocaleDateString()}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Tenant Payment History */}
            {user?.user_type === 'locataire' && stats?.payments_history && (
                <Card>
                    <CardHeader>
                        <CardTitle>Historique Récent</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-200">
                            {stats.payments_history.map((payment, idx) => (
                                <li key={idx} className="py-4 flex justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Loyer {new Date(payment.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                                        <p className="text-sm text-gray-500">{new Intl.NumberFormat('fr-FR').format(payment.amount)} FCFA</p>
                                    </div>
                                    <span className={`inline - flex items - center px - 2.5 py - 0.5 rounded - full text - xs font - medium ${payment.status === 'paye' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} `}>
                                        {payment.status}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Recent Projects Table (Optional) */}
            {['bailleur', 'entrepreneur'].includes(user?.user_type) && recentProjects.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Projets Récents</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progression</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentProjects.slice(0, 5).map((project) => (
                                        <tr key={project.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.titre}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px - 2 inline - flex text - xs leading - 5 font - semibold rounded - full ${project.statut === 'termine' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} `}>
                                                    {project.statut}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {project.pourcentage_avancement}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color }) {
    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`p - 3 rounded - full bg - opacity - 10 ${color.replace('text-', 'bg-')} `}>
                    <Icon className={`h - 6 w - 6 ${color} `} />
                </div>
            </CardContent>
        </Card>
    );
}
