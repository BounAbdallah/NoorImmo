import React, { useEffect, useState, useCallback } from 'react';
import PermissionGuard from '../../components/auth/PermissionGuard';
import { Link, useSearchParams } from 'react-router-dom';
import { leaseService } from '../../services/leaseService';
import { Plus, Search, FileText, CheckCircle, AlertCircle, Eye, ChevronLeft, ChevronRight, Users, Home, DollarSign, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function LeaseList() {
    const [leases, setLeases] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // Statistics state
    const [stats, setStats] = useState({
        total: 0,
        actif: 0,
        expire: 0,
        resilie: 0,
        totalRevenue: 0
    });

    const loadLeases = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                ...(searchQuery && { search: searchQuery }),
                ...(selectedStatus && { statut: selectedStatus }),
            };

            const response = await leaseService.getAllLeases(params);
            if (response.success) {
                const data = response.data;
                setLeases(data.data);
                setCurrentPage(data.current_page);
                setTotalPages(data.last_page);
                setTotalItems(data.total);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger les baux.', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchQuery, selectedStatus]);

    // Load stats separately
    const loadStats = useCallback(async () => {
        try {
            const [actifRes, expireRes, resilieRes, allRes] = await Promise.all([
                leaseService.getAllLeases({ statut: 'actif', per_page: 1 }),
                leaseService.getAllLeases({ statut: 'expire', per_page: 1 }),
                leaseService.getAllLeases({ statut: 'resilie', per_page: 1 }),
                leaseService.getAllLeases({ per_page: 100 })
            ]);

            const allLeases = allRes.data.data || [];
            const totalRevenue = allLeases
                .filter(l => l.statut === 'actif')
                .reduce((sum, l) => sum + (parseFloat(l.loyer_mensuel) || 0), 0);

            setStats({
                total: allRes.data.total || 0,
                actif: actifRes.data.total || 0,
                expire: expireRes.data.total || 0,
                resilie: resilieRes.data.total || 0,
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
        loadLeases();
    }, [loadLeases]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
    };

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const statusParam = searchParams.get('statut');
        if (statusParam) {
            setSelectedStatus(statusParam);
        }
    }, [searchParams]);

    useEffect(() => {
        if (selectedStatus !== undefined) {
            setCurrentPage(1);
        }
    }, [selectedStatus]);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'actif':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Actif</span>;
            case 'expire':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Expiré</span>;
            case 'resilie':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Résilié</span>;
            default:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{status}</span>;
        }
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
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Baux</h1>
                    <p className="mt-1 text-sm text-gray-500">Liste de tous les contrats de location actifs et archivés.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <PermissionGuard permission="baux.create">
                        <Link
                            to="/leases/new"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Nouveau Bail
                        </Link>
                    </PermissionGuard>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Baux"
                    value={stats.total}
                    icon={FileText}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                />
                <StatCard
                    title="Baux Actifs"
                    value={stats.actif}
                    icon={CheckCircle}
                    color="text-green-600"
                    bgColor="bg-green-50"
                />
                <StatCard
                    title="Baux Expirés"
                    value={stats.expire}
                    icon={Clock}
                    color="text-red-600"
                    bgColor="bg-red-50"
                />
                <StatCard
                    title="Revenus Mensuels"
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
                                placeholder="Rechercher par bien ou locataire..."
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
                            <option value="actif">Actif</option>
                            <option value="expire">Expiré</option>
                            <option value="resilie">Résilié</option>
                        </select>

                        <Button type="submit">
                            <Search className="h-4 w-4 mr-2" />
                            Rechercher
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Leases Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
                    </div>
                ) : leases.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Aucun bail trouvé</h3>
                        <p className="text-gray-500 mt-1">
                            {searchQuery || selectedStatus
                                ? "Essayez de modifier vos filtres de recherche."
                                : "Ajoutez votre premier bail."}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Results count */}
                        <div className="px-6 py-3 bg-gray-50 text-sm text-gray-500 border-b">
                            Affichage de {leases.length} sur {totalItems} bail(s)
                        </div>

                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Bien / Adresse
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Locataire
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Période
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Loyer
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Statut
                                    </th>
                                    <th scope="col" className="relative px-6 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {leases.map((lease) => (
                                    <tr key={lease.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                                                    <FileText className="h-6 w-6 text-gray-500" />
                                                </div>
                                                <div className="ml-4">
                                                    <Link
                                                        to={`/biens/${lease.bien?.id}`}
                                                        className="text-sm font-medium text-primary-600 hover:text-primary-900 hover:underline"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {lease.bien?.nom || lease.bien?.reference || 'Bien Inconnu'}
                                                    </Link>
                                                    <div className="text-sm text-gray-500">{lease.bien?.adresse}</div>
                                                    <Link to={`/leases/${lease.id}`} className="text-xs text-primary-500 hover:text-primary-700 hover:underline mt-0.5 block">
                                                        Voir le bail
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{lease.locataire?.user?.prenom} {lease.locataire?.user?.nom}</div>
                                            <div className="text-sm text-gray-500">{lease.locataire?.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">Du {format(new Date(lease.date_debut), 'dd/MM/yyyy')}</div>
                                            <div className="text-sm text-gray-500">Au {format(new Date(lease.date_fin), 'dd/MM/yyyy')}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className="font-bold text-gray-900">{parseFloat(lease.loyer_mensuel).toLocaleString()}</span> FCFA
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(lease.statut)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/leases/${lease.id}`} className="text-primary-600 hover:text-primary-900">
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 py-4 border-t">
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
        </div>
    );
}
