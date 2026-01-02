import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { landlordService } from '../../../services/landlordService';
import { propertyService } from '../../../services/propertyService';
import { structureService } from '../../../services/structureService';
import { User, Phone, Mail, MapPin, Building, ArrowLeft, Loader, TrendingUp, Home, DollarSign, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import LandlordMonthlyReportModal from './LandlordMonthlyReportModal';

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

export default function LandlordDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [landlord, setLandlord] = useState(null);
    const [stats, setStats] = useState(null);
    const [immeubles, setImmeubles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            html: `Voulez-vous vraiment supprimer le bailleur <strong>${landlord.user?.prenom} ${landlord.user?.nom}</strong> ?<br/><span class="text-red-600">Cette action est irréversible.</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                await landlordService.delete(id);
                Swal.fire({
                    icon: 'success',
                    title: 'Supprimé !',
                    text: 'Le bailleur a été supprimé avec succès.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/bailleurs');
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: error.response?.data?.message || 'Impossible de supprimer ce bailleur.'
                });
            }
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const fetchDetails = async () => {
        try {
            const response = await landlordService.getById(id);
            setLandlord(response.data);
            setStats(response.stats);

            // Fetch Buildings
            const buildingsRes = await structureService.getAllBuildings({ bailleur_id: id });
            setImmeubles(buildingsRes.data.data || []);
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
                <div className="px-4 py-5 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center space-x-5">
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
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <PermissionGuard module="bailleurs" action="view">
                            <button
                                onClick={() => setIsReportModalOpen(true)}
                                className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Rapport Mensuel
                            </button>
                        </PermissionGuard>
                        <PermissionGuard module="bailleurs" action="edit">
                            <button
                                onClick={() => navigate(`/bailleurs/edit/${id}`)}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                            </button>
                        </PermissionGuard>
                        <PermissionGuard module="bailleurs" action="delete">
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
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center"><Mail className="h-4 w-4 mr-2" /> Email</dt>
                            <dd className="mt-1 text-sm text-gray-900">{landlord.user?.email || 'Pas d\'email'}</dd>
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

                {/* Documents d'identité */}
                {(landlord.cni_recto || landlord.cni_verso || landlord.numero_cni) && (
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-500 mb-4 flex items-center">
                            <FileText className="h-4 w-4 mr-2" /> Documents d'Identité
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {landlord.numero_cni && (
                                <div>
                                    <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro CNI</dt>
                                    <dd className="mt-1 text-sm font-bold text-gray-900">{landlord.numero_cni}</dd>
                                </div>
                            )}
                            {landlord.cni_recto && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">CNI Recto</p>
                                    <a
                                        href={getStorageUrl(landlord.cni_recto)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <img
                                            src={getStorageUrl(landlord.cni_recto)}
                                            alt="CNI Recto"
                                            className="h-32 w-auto rounded-lg shadow-sm border border-gray-200 hover:opacity-90 transition-opacity cursor-zoom-in"
                                        />
                                    </a>
                                </div>
                            )}
                            {landlord.cni_verso && (
                                <div className="space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">CNI Verso</p>
                                    <a
                                        href={getStorageUrl(landlord.cni_verso)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <img
                                            src={getStorageUrl(landlord.cni_verso)}
                                            alt="CNI Verso"
                                            className="h-32 w-auto rounded-lg shadow-sm border border-gray-200 hover:opacity-90 transition-opacity cursor-zoom-in"
                                        />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}
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

            {/* Immeubles List (Buildings) */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        <Building className="h-5 w-5 mr-2 text-indigo-500" />
                        Immeubles ({immeubles.length})
                    </h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {immeubles.length > 0 ? (
                        immeubles.map((immeuble) => (
                            <li key={immeuble.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-600 truncate">{immeuble.nom}</p>
                                            <p className="text-sm text-gray-500">{immeuble.adresse}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => structureService.viewMandat(immeuble.id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                            >
                                                <FileText className="h-3 w-3 mr-1 text-gray-500" />
                                                Voir Mandat
                                            </button>
                                            <button
                                                onClick={() => structureService.downloadMandat(immeuble.id)}
                                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                            >
                                                <Download className="h-3 w-3 mr-1 text-gray-500" />
                                                Télécharger
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-sm text-gray-500">
                                        {immeuble.etages?.length || 0} étages • {immeuble.nombre_biens || 0} biens
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500 text-sm">
                            Aucun immeuble associé à ce bailleur.
                        </li>
                    )}
                </ul>
            </div>

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

            <LandlordMonthlyReportModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                landlordId={id}
                landlordName={`${landlord.user?.prenom} ${landlord.user?.nom}`}
            />
        </div >
    );
}
