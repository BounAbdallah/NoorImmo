import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { structureService } from '../../../services/structureService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Building, Plus, Search, Home, Users, CreditCard, TrendingUp, ChevronLeft, ChevronRight, MapPin, Layers } from 'lucide-react';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BuildingList() {
    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBailleurId, setFilterBailleurId] = useState('');
    const [bailleurs, setBailleurs] = useState([]);

    // Stats
    const [stats, setStats] = useState({
        totalImmeubles: 0,
        totalEtages: 0,
        totalBiens: 0,
        totalLocataires: 0,
    });

    // Load bailleurs for filter dropdown
    useEffect(() => {
        const loadBailleurs = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/bailleurs', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Accept': 'application/json'
                    }
                });
                const data = await response.json();
                if (data.success) {
                    setBailleurs(data.data?.data || data.data || []);
                }
            } catch (e) { console.error('Error loading bailleurs:', e); }
        };
        loadBailleurs();
    }, []);

    const loadBuildings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                ...(searchTerm && { search: searchTerm }),
                ...(filterBailleurId && { bailleur_id: filterBailleurId }),
            };
            const response = await structureService.getAllBuildings(params);
            const data = response.data?.data || [];
            setBuildings(data);

            if (response.data?.current_page) {
                setCurrentPage(response.data.current_page);
                setTotalPages(response.data.last_page);
                setTotalItems(response.data.total);
            } else {
                setTotalItems(data.length);
            }

            // Use stats from API response
            if (response.stats) {
                setStats({
                    totalImmeubles: response.data?.total || data.length,
                    totalEtages: response.stats.total_etages || 0,
                    totalBiens: response.stats.total_biens || 0,
                    totalLocataires: response.stats.total_locataires || 0,
                    totalChiffreAffaires: response.stats.total_chiffre_affaires || 0,
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterBailleurId]);

    const calculateStats = (data) => {
        let totalEtages = 0;
        let totalBiens = 0;
        let totalLocataires = 0;

        data.forEach(building => {
            totalEtages += building.etages?.length || building.nombre_etages || 0;

            // Count biens and locataires from etages if available
            if (building.etages) {
                building.etages.forEach(etage => {
                    if (etage.biens) {
                        totalBiens += etage.biens.length;
                        etage.biens.forEach(bien => {
                            if (bien.baux) {
                                totalLocataires += bien.baux.filter(b => b.statut === 'actif').length;
                            }
                        });
                    }
                });
            }
        });

        setStats({
            totalImmeubles: data.length,
            totalEtages,
            totalBiens,
            totalLocataires,
        });
    };

    useEffect(() => {
        loadBuildings();
    }, [loadBuildings]);

    // Chart data - buildings by number of floors
    const chartData = {
        labels: buildings.slice(0, 10).map(b => b.nom?.substring(0, 10) || 'N/A'),
        datasets: [{
            label: 'Nombre d\'étages',
            data: buildings.slice(0, 10).map(b => b.etages?.length || b.nombre_etages || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 6,
        }]
    };

    // Filter buildings locally for search
    const filteredBuildings = searchTerm
        ? buildings.filter(b =>
            b.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : buildings;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes Immeubles</h1>
                    <p className="mt-1 text-sm text-gray-500">Gérez vos immeubles, étages et appartements.</p>
                </div>
                <PermissionGuard module="immeubles" action="create">
                    <Link
                        to="/immeubles/new"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        Nouvel Immeuble
                    </Link>
                </PermissionGuard>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700">Total Immeubles</p>
                                <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
                            </div>
                            <Building className="h-10 w-10 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700">Total Étages</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.totalEtages}</p>
                            </div>
                            <Layers className="h-10 w-10 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700">Total Biens</p>
                                <p className="text-2xl font-bold text-green-900">{stats.totalBiens}</p>
                            </div>
                            <Home className="h-10 w-10 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700">Locataires</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.totalLocataires}</p>
                            </div>
                            <Users className="h-10 w-10 text-orange-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-emerald-700">Chiffre d'affaires estimé</p>
                                <p className="text-xl font-bold text-emerald-900">
                                    {stats.totalChiffreAffaires?.toLocaleString() || 0} <span className="text-xs font-normal">FCFA/mois</span>
                                </p>
                            </div>
                            <CreditCard className="h-10 w-10 text-emerald-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par nom ou adresse..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <select
                            value={filterBailleurId}
                            onChange={(e) => { setFilterBailleurId(e.target.value); setCurrentPage(1); }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Tous les bailleurs</option>
                            {bailleurs.map(b => (
                                <option key={b.id} value={b.id}>
                                    {b.user?.prenom} {b.user?.nom}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Buildings Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
                </div>
            ) : filteredBuildings.length > 0 ? (
                <>
                    <div className="text-sm text-gray-500 mb-2">
                        {filteredBuildings.length} immeuble(s) trouvé(s)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredBuildings.map((building) => (
                            <Link key={building.id} to={`/immeubles/${building.id}`} className="block group">
                                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                                    <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400">
                                        {building.image ? (
                                            <img src={building.image} alt={building.nom} className="h-full w-full object-cover" />
                                        ) : (
                                            <Building className="h-16 w-16" />
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                            {building.nom}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-500 mt-1">
                                            <MapPin className="h-4 w-4 mr-1" />
                                            {building.adresse}
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-1 text-gray-600">
                                                <Layers className="h-4 w-4" />
                                                <span>{building.etages?.length || building.nombre_etages || 0} Niveaux</span>
                                            </div>
                                            {building.chiffre_mensuel > 0 && (
                                                <span className="text-xs font-semibold text-emerald-600">
                                                    {building.chiffre_mensuel?.toLocaleString()} F/mois
                                                </span>
                                            )}
                                        </div>
                                        {building.bailleur && (
                                            <div className="mt-2 text-xs text-gray-500">
                                                {building.bailleur.user?.prenom} {building.bailleur.user?.nom}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 py-4">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Précédent
                            </Button>
                            <span className="text-sm text-gray-500">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Suivant
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Building className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun immeuble</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'Aucun immeuble ne correspond à votre recherche.' : 'Commencez par créer votre premier immeuble.'}
                    </p>
                    {!searchTerm && (
                        <div className="mt-6">
                            <PermissionGuard module="immeubles" action="create">
                                <Link
                                    to="/immeubles/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                                    Créer un immeuble
                                </Link>
                            </PermissionGuard>
                        </div>
                    )}
                </div>
            )}

            {/* Chart at the bottom */}
            {buildings.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Nombre d'étages par immeuble</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <Bar
                            data={chartData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: { legend: { display: false } },
                                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
                            }}
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
