import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { landlordService } from '../../../services/landlordService';
import { propertyService } from '../../../services/propertyService';
import { User, Phone, Mail, MapPin, Building, ArrowLeft, Loader, TrendingUp, Home, DollarSign, FileText, Download } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function LandlordDetailsPage() {
    const { id } = useParams();
    const [landlord, setLandlord] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const response = await landlordService.getById(id);
            setLandlord(response.data);
            setStats(response.stats);
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Loader className="animate-spin h-8 w-8 text-indigo-500" /></div>;
    if (!landlord) return <div>Bailleur introuvable</div>;

    // Chart Data
    const revenueChartData = stats?.revenue_by_month ? {
        labels: stats.revenue_by_month.map(item => item.month),
        datasets: [{
            label: 'Revenus Mensuels',
            data: stats.revenue_by_month.map(item => item.revenue),
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 1
        }]
    } : null;

    const occupancyChartData = stats?.property_distribution ? {
        labels: ['Loués', 'Disponibles', 'Maintenance'],
        datasets: [{
            data: [
                stats.property_distribution.loue,
                stats.property_distribution.disponible,
                stats.property_distribution.maintenance
            ],
            backgroundColor: ['rgb(34, 197, 94)', 'rgb(59, 130, 246)', 'rgb(251, 146, 60)']
        }]
    } : null;

    return (
        <div className="space-y-6">
            <Link to="/bailleurs" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Retour à la liste
            </Link>

            {/* Header Profile */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 flex items-center space-x-5">
                    <div className="bg-purple-100 rounded-full p-4">
                        <User className="h-12 w-12 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {landlord.user?.prenom} {landlord.user?.nom}
                        </h1>
                        <p className="text-sm text-gray-500">Bailleur Partenaire</p>
                    </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center"><Mail className="h-4 w-4 mr-2" /> Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{landlord.user?.email}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center"><Phone className="h-4 w-4 mr-2" /> Téléphone</dt>
                            <dd className="mt-1 text-sm text-gray-900">{landlord.user?.telephone || 'Non renseigné'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center"><MapPin className="h-4 w-4 mr-2" /> Pays / Adresse</dt>
                            <dd className="mt-1 text-sm text-gray-900">{landlord.pays} {landlord.adresse_diaspora && ` - ${landlord.adresse_diaspora} `}</dd>
                        </div>
                    </dl>
                </div>
            </div>

            {/* Statistics KPIs */}
            {stats && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Home className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Biens</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{stats.total_properties}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Building className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Baux Actifs</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{stats.active_leases}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <DollarSign className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Revenus (Mois)</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{new Intl.NumberFormat('fr-FR').format(stats.current_month_revenue || 0)} F</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <TrendingUp className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Revenus Totaux</dt>
                                        <dd className="text-lg font-semibold text-gray-900">{new Intl.NumberFormat('fr-FR').format(stats.total_revenue || 0)} F</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts */}
            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {revenueChartData && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des Revenus (12 mois)</h3>
                            <Bar data={revenueChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                        </div>
                    )}

                    {occupancyChartData && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition des Biens</h3>
                            <div className="max-w-xs mx-auto">
                                <Doughnut data={occupancyChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Properties List */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-indigo-500" />
                        Biens Immobiliers ({landlord.biens?.length || 0})
                    </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {landlord.biens && landlord.biens.length > 0 ? (
                        landlord.biens.map((bien) => (
                            <li key={bien.id}>
                                <Link to={`/biens/${bien.id}`} className="block hover:bg-gray-50">
                                    <div className="px-4 py-4 sm:px-6">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-indigo-600 truncate">{bien.reference}</p>
                                            <div className="ml-2 flex-shrink-0 flex">
                                                <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${bien.statut === 'loue' ? 'bg-green-100 text-green-800' :
                                                        bien.statut === 'disponible' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {bien.statut}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-2 sm:flex sm:justify-between">
                                            <div className="sm:flex sm:flex-col sm:items-end space-y-2">
                                                <p className="flex items-center text-sm text-gray-500">
                                                    {bien.type} - {bien.surface} m² - {bien.nombre_pieces} pièces
                                                </p>
                                                <div className="flex space-x-2 mt-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            propertyService.viewMandat(bien.id);
                                                        }}
                                                        className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                    >
                                                        <FileText className="h-3 w-3 mr-1 text-gray-500" />
                                                        Mandat
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            propertyService.downloadMandat(bien.id);
                                                        }}
                                                        className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                                    >
                                                        <Download className="h-3 w-3 mr-1 text-gray-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500 text-sm">
                            Aucun bien associé à ce bailleur.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
