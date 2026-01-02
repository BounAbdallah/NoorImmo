import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { structureService } from '../../../services/structureService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Building, MapPin, Layers, ChevronDown, ChevronUp, ArrowRight, Users, Coins, AlertTriangle, Search } from 'lucide-react';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BuildingDetails() {
    const { id } = useParams();
    const [building, setBuilding] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    // State to track expanded floors. Initialize with all collapsed or first open.
    const [expandedFloors, setExpandedFloors] = useState({});

    // Filters
    const [filterSearch, setFilterSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');

    useEffect(() => {
        loadBuilding();
    }, [id]);

    const loadBuilding = async () => {
        try {
            const response = await structureService.getBuilding(id);
            setBuilding(response.data);
            if (response.statistics) {
                setStatistics(response.statistics);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFloor = (floorId) => {
        setExpandedFloors(prev => ({
            ...prev,
            [floorId]: !prev[floorId]
        }));
    };

    const handleDownloadMandat = async () => {
        try {
            const blob = await structureService.downloadMandat(building.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Mandat_Gerance_${building.nom}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (error) {
            console.error('Erreur lors du téléchargement du mandat:', error);
            alert('Impossible de télécharger le mandat.');
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (!building) return <div className="p-8 text-center">Immeuble non trouvé.</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Building className="mr-2 h-6 w-6 text-gray-500" />
                        {building.nom}
                    </h1>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPin className="mr-1.5 h-4 w-4 text-gray-400" />
                        {building.adresse}
                    </p>
                </div>
                <div className="flex space-x-3">
                    <Button
                        onClick={handleDownloadMandat}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Créer Mandat (PDF)
                    </Button>
                </div>
            </div>

            {/* Statistics Section */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Locataires Actifs</p>
                                <p className="text-2xl font-bold text-gray-900">{statistics.total_locataires}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                <Coins className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Chiffre d'Affaires</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('fr-FR').format(statistics.chiffre_affaires)} CFA
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6 flex items-center">
                            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Loyers Impayés</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {new Intl.NumberFormat('fr-FR').format(statistics.loyers_impayes)} CFA
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Charts Row */}
            {statistics && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    {statistics.revenus_chart && statistics.revenus_chart.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Évolution des Revenus</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={statistics.revenus_chart}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="mois" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => new Intl.NumberFormat('fr-FR').format(value) + ' CFA'} />
                                        <Bar dataKey="revenu" name="Revenus (CFA)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}

                    {/* Tenants Evolution Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition par étage</CardTitle>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={building.etages?.map(e => ({
                                    nom: e.nom?.substring(0, 12) || `Étage ${e.numero}`,
                                    locataires: e.stats?.locataires || 0,
                                    biens_loues: e.stats?.biens_loues || 0,
                                    biens_vides: e.stats?.biens_vides || 0,
                                })) || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="nom" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="locataires" name="Locataires" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="biens_loues" name="Biens loués" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="biens_vides" name="Biens vides" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Détails Généraux</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Propriétaire</dt>
                                <dd className="mt-1 text-sm text-gray-900">{building.bailleur?.user?.prenom} {building.bailleur?.user?.nom}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Nombre d'étages</dt>
                                <dd className="mt-1 text-sm text-gray-900">{building.etages?.length} niveaux</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 mb-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par référence, type..."
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="loue">Loué</option>
                            <option value="disponible">Disponible</option>
                            <option value="occupe">Occupé</option>
                            <option value="travaux">Travaux</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Tous les types</option>
                            <option value="appartement">Appartement</option>
                            <option value="studio">Studio</option>
                            <option value="maison">Maison</option>
                            <option value="commerce">Commerce</option>
                        </select>
                        {(filterSearch || filterStatus || filterType) && (
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFilterSearch('');
                                    setFilterStatus('');
                                    setFilterType('');
                                }}
                            >
                                Réinitialiser
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <h2 className="text-lg font-medium text-gray-900 mt-8">Niveaux & Appartements</h2>
            <div className="space-y-4">
                {building.etages?.map((etage) => {
                    // Filter biens for this floor using the new utility function or inline logic
                    const filteredBiens = etage.biens?.filter(bien => {
                        const matchesSearch = !filterSearch ||
                            bien.reference?.toLowerCase().includes(filterSearch.toLowerCase()) ||
                            bien.type?.toLowerCase().includes(filterSearch.toLowerCase());
                        const matchesStatus = !filterStatus || bien.statut === filterStatus;
                        const matchesType = !filterType || bien.type === filterType;
                        return matchesSearch && matchesStatus && matchesType;
                    }) || [];

                    // If filters are active, only show floors that have matching biens
                    const hasActiveFilters = filterSearch || filterStatus || filterType;
                    if (hasActiveFilters && filteredBiens.length === 0) return null;

                    return (
                        <div key={etage.id} className="bg-white shadow rounded-lg overflow-hidden border border-gray-100">
                            {/* Floor Header - Clickable */}
                            <div
                                className="px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                                onClick={() => toggleFloor(etage.id)}
                            >
                                <div className="flex items-center">
                                    <Layers className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-lg font-medium text-gray-900">{etage.nom}</span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {etage.stats && (
                                        <>
                                            <span className="text-gray-700 bg-gray-100 px-2 py-1 rounded-md" title="Revenu Estimé (Basé sur les baux actifs)">
                                                Estimé: {new Intl.NumberFormat('fr-FR').format(etage.stats.loyer_attendu)} F
                                            </span>
                                            <span className="text-green-700 bg-green-50 px-2 py-1 rounded-md" title="Revenu encaissé">
                                                Reçu: {new Intl.NumberFormat('fr-FR').format(etage.stats.revenu)} F
                                            </span>
                                            {etage.stats.impaye > 0 && (
                                                <span className="text-red-700 bg-red-50 px-2 py-1 rounded-md">
                                                    Impayé: {new Intl.NumberFormat('fr-FR').format(etage.stats.impaye)} F
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 text-xs">
                                    {hasActiveFilters ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            {filteredBiens.length} Trouvés
                                        </span>
                                    ) : etage.stats ? (
                                        <>
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{etage.stats.biens_loues} Loués</span>
                                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{etage.stats.biens_vides} Vides</span>
                                        </>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {etage.biens?.length || 0} Biens
                                        </span>
                                    )}
                                </div>
                                {expandedFloors[etage.id] ? (
                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                            </div>

                            {/* Expanded Content: Apartments List */}
                            {expandedFloors[etage.id] && (
                                <div className="border-t border-gray-100 bg-gray-50 px-4 py-5 sm:px-6">
                                    {filteredBiens.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {filteredBiens.map((bien) => (
                                                <Link key={bien.id} to={`/biens/${bien.id}`} className="block group">
                                                    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-semibold text-gray-900 group-hover:text-primary-600">
                                                                {bien.reference}
                                                            </h4>
                                                            <span className={`px-2 py-0.5 text-xs rounded-full uppercase ${bien.statut === 'disponible' ? 'bg-green-100 text-green-800' :
                                                                bien.statut === 'loue' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {bien.statut}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-500 mb-3 space-y-1">
                                                            <p>{bien.type} • {bien.surface} m²</p>
                                                            <p className="capitalize">{bien.nombre_pieces} pièces</p>
                                                        </div>
                                                        <div className="flex items-center text-primary-600 text-sm font-medium">
                                                            Voir détails <ArrowRight className="ml-1 h-4 w-4" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-500">
                                            <p>{hasActiveFilters ? 'Aucun bien ne correspond aux filtres.' : 'Aucun bien assigné à cet étage.'}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <PermissionGuard module="biens" action="create">
                                            <Link
                                                to={`/biens/create?immeuble_id=${building.id}&etage_id=${etage.id}`}
                                                className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                                            >
                                                + Ajouter un bien à cet étage
                                            </Link>
                                        </PermissionGuard>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
