import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bailleurService } from '../../../services/bailleurService';
import { Plus, Search, User, Mail, Phone, ExternalLink, Users, Home, Wallet, Building } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/Card';
import Swal from 'sweetalert2';

export default function BailleurList() {
    const [bailleurs, setBailleurs] = useState([]);
    const [stats, setStats] = useState({
        total_bailleurs: 0,
        total_biens: 0,
        total_locataires: 0,
        total_revenus: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        loadBailleurs();
    }, [searchTerm, currentPage]);

    const loadBailleurs = async () => {
        setLoading(true);
        try {
            const response = await bailleurService.getAll({
                search: searchTerm,
                page: currentPage
            });

            if (response.success) {
                setBailleurs(response.data.data);
                if (response.data.current_page) {
                    setCurrentPage(response.data.current_page);
                    setTotalPages(response.data.last_page);
                    setTotalItems(response.data.total);
                }

                if (response.stats) {
                    setStats(response.stats);
                }
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger la liste des bailleurs', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes Bailleurs</h1>
                    <p className="mt-1 text-sm text-gray-500">Gérez les propriétaires et suivez leurs performances.</p>
                </div>
                <Link
                    to="/bailleurs/new"
                    className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Nouveau Bailleur
                </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700">Total Bailleurs</p>
                                <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
                            </div>
                            <User className="h-10 w-10 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-purple-700">Total Biens Gérés</p>
                                <p className="text-2xl font-bold text-purple-900">{stats.total_biens}</p>
                            </div>
                            <Home className="h-10 w-10 text-purple-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700">Locataires</p>
                                <p className="text-2xl font-bold text-orange-900">{stats.total_locataires}</p>
                            </div>
                            <Users className="h-10 w-10 text-orange-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700">Revenus Générés</p>
                                <p className="text-xl font-bold text-green-900">
                                    {new Intl.NumberFormat('fr-FR').format(stats.total_revenus)} <span className="text-xs font-normal">CFA</span>
                                </p>
                            </div>
                            <Wallet className="h-10 w-10 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search Filter */}
            <Card>
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bailleurs.map((bailleur) => (
                            <Link key={bailleur.id} to={`/bailleurs/${bailleur.id}`} className="block group">
                                <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-gray-200">
                                    <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400 relative">
                                        <div className="absolute -bottom-10 left-6">
                                            <div className="h-20 w-20 bg-white p-1 rounded-full shadow-md">
                                                <div className="h-full w-full bg-primary-50 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
                                                    {bailleur.user?.prenom?.[0]}{bailleur.user?.nom?.[0]}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <CardContent className="pt-12 px-6 pb-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                    {bailleur.user?.prenom} {bailleur.user?.nom}
                                                </h3>
                                                <div className="flex items-center text-sm text-gray-500 mt-1">
                                                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                                                    {bailleur.user?.email}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-gray-100">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 flex items-center">
                                                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                                                    Biens gérés
                                                </span>
                                                <span className="font-semibold text-gray-900">{bailleur.biens_count || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 flex items-center">
                                                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                                                    Locataires
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {bailleur.locataires_count || 0}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 flex items-center">
                                                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                                                    Téléphone
                                                </span>
                                                <span className="text-gray-900">{bailleur.user?.telephone || '-'}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                    {bailleurs.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg shadow">
                            <User className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun bailleur trouvé</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Commencez par ajouter un nouveau propriétaire.
                            </p>
                            <div className="mt-6">
                                <Link
                                    to="/bailleurs/new"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                                >
                                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                    Ajouter un bailleur
                                </Link>
                            </div>
                        </div>
                    )}
                </>

                    {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Précédent
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Suivant
                        </button>
                    </div>
                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Affichage de <span className="font-medium">{(currentPage - 1) * 15 + 1}</span> à <span className="font-medium">{Math.min(currentPage * 15, totalItems)}</span> sur <span className="font-medium">{totalItems}</span> résultats
                            </p>
                        </div>
                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Précédent</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === i + 1 ? 'bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600' : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                                >
                                    <span className="sr-only">Suivant</span>
                                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
        </div >
    );
}
