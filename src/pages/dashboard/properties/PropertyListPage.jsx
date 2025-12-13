import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { propertyService } from '../../../services/propertyService';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { Home, MapPin, Tag, Plus, Search, Building, DollarSign, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PropertyListPage() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedType, setSelectedType] = useState('');

    // Statistics state
    const [stats, setStats] = useState({
        total: 0,
        disponible: 0,
        loue: 0,
        maintenance: 0,
        totalRevenue: 0
    });

    const loadProperties = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                ...(searchQuery && { search: searchQuery }),
                ...(selectedStatus && { statut: selectedStatus }),
                ...(selectedType && { type: selectedType }),
            };

            const response = await propertyService.getAll(params);
            const data = response.data.data;

            setProperties(data.data);
            setCurrentPage(data.current_page);
            setTotalPages(data.last_page);
            setTotalItems(data.total);

            // Calculate stats from all properties (first load or when filters change)
            if (currentPage === 1 && !searchQuery && !selectedStatus && !selectedType) {
                calculateStats(data.data, data.total);
            }
        } catch (error) {
            console.error("Failed to load properties", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, selectedStatus, selectedType]);

    // Load stats separately to get accurate totals
    const loadStats = useCallback(async () => {
        try {
            // Load all properties for stats (without pagination)
            const [disponibleRes, loueRes, maintenanceRes, allRes] = await Promise.all([
                propertyService.getAll({ statut: 'disponible', per_page: 1 }),
                propertyService.getAll({ statut: 'loue', per_page: 1 }),
                propertyService.getAll({ statut: 'maintenance', per_page: 1 }),
                propertyService.getAll({ per_page: 100 }) // Get more for revenue calculation
            ]);

            const allProperties = allRes.data.data.data || [];
            const totalRevenue = allProperties.reduce((sum, p) => sum + (parseFloat(p.loyer_mensuel) || 0), 0);

            setStats({
                total: allRes.data.data.total || 0,
                disponible: disponibleRes.data.data.total || 0,
                loue: loueRes.data.data.total || 0,
                maintenance: maintenanceRes.data.data.total || 0,
                totalRevenue
            });
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    useEffect(() => {
        loadProperties();
    }, [loadProperties]);

    const calculateStats = (props, total) => {
        const disponible = props.filter(p => p.statut === 'disponible').length;
        const loue = props.filter(p => p.statut === 'loue').length;
        const maintenance = props.filter(p => p.statut === 'maintenance').length;
        const totalRevenue = props.reduce((sum, p) => sum + (parseFloat(p.loyer_mensuel) || 0), 0);

        setStats({ total, disponible, loue, maintenance, totalRevenue });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        loadProperties();
    };

    const handleFilterChange = () => {
        setCurrentPage(1);
    };

    useEffect(() => {
        if (selectedStatus !== '' || selectedType !== '') {
            handleFilterChange();
        }
    }, [selectedStatus, selectedType]);

    const getStatusBadge = (status) => {
        const colors = {
            disponible: 'bg-green-100 text-green-800',
            loue: 'bg-blue-100 text-blue-800',
            maintenance: 'bg-orange-100 text-orange-800',
            vendu: 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${colors[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
        <Card>
            <CardContent className={`p-4 flex items-center justify-between ${bgColor}`}>
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </div>
                <div className={`p-3 rounded-full ${bgColor}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes Biens Immobiliers</h1>
                    <p className="text-gray-500">Gérez votre parc locatif</p>
                </div>
                <Button onClick={() => navigate('/biens/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un bien
                </Button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Biens"
                    value={stats.total}
                    icon={Building}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Disponibles"
                    value={stats.disponible}
                    icon={CheckCircle}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Loués"
                    value={stats.loue}
                    icon={Home}
                    color="text-indigo-600"
                    bgColor="bg-indigo-50"
                />
                <StatCard
                    title="Revenus Potentiels"
                    value={`${stats.totalRevenue.toLocaleString()} F`}
                    icon={DollarSign}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                />
            </div>

            {/* Search and Filters */}
            <Card>
                <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par référence ou adresse..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="disponible">Disponible</option>
                            <option value="loue">Loué</option>
                            <option value="maintenance">Maintenance</option>
                        </select>

                        {/* Type Filter */}
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">Tous les types</option>
                            <option value="appartement">Appartement</option>
                            <option value="maison">Maison</option>
                            <option value="studio">Studio</option>
                            <option value="villa">Villa</option>
                            <option value="commerce">Commerce</option>
                            <option value="terrain">Terrain</option>
                        </select>

                        <Button type="submit">
                            <Search className="h-4 w-4 mr-2" />
                            Rechercher
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Properties Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />)}
                </div>
            ) : properties.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Home className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Aucun bien trouvé</h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery || selectedStatus || selectedType
                                ? "Essayez de modifier vos filtres de recherche."
                                : "Ajoutez votre premier bien à louer."}
                        </p>
                        {!searchQuery && !selectedStatus && !selectedType && (
                            <Button onClick={() => navigate('/biens/create')}>Ajouter un bien</Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Results count */}
                    <div className="text-sm text-gray-500">
                        Affichage de {properties.length} sur {totalItems} bien(s)
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/biens/${property.id}`)}>
                                <div className="h-40 bg-gray-200 w-full object-cover rounded-t-lg flex items-center justify-center text-gray-400">
                                    <Home className="h-12 w-12" />
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg">{property.reference}</h3>
                                        {getStatusBadge(property.statut)}
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600">
                                        <div className="flex items-center">
                                            <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                            {property.adresse}
                                        </div>
                                        <div className="flex items-center">
                                            <Tag className="h-4 w-4 mr-2 text-gray-400" />
                                            {new Intl.NumberFormat('fr-FR').format(property.loyer_mensuel)} CFA / mois
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
                                        <span className="text-gray-500">{property.nombre_pieces} pièces</span>
                                        <span className="text-gray-500">{property.surface} m²</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Précédent
                            </Button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'bg-primary-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

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
            )}
        </div>
    );
}
