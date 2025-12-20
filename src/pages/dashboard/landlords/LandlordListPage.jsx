import React, { useEffect, useState } from 'react';
import { landlordService } from '../../../services/landlordService';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Phone, MapPin, Building, Loader, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import PermissionGuard from '../../../components/auth/PermissionGuard';

export default function LandlordListPage() {
    const [landlords, setLandlords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchLandlords();
    }, [searchTerm]);

    const fetchLandlords = async () => {
        try {
            const response = await landlordService.getAll({ search: searchTerm });
            setLandlords(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching landlords:', error);
            setLandlords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id, name) => {
        e.preventDefault();
        e.stopPropagation();

        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            html: `Voulez-vous vraiment supprimer le bailleur <strong>${name}</strong> ?<br/><span class="text-red-600">Cette action est irréversible.</span>`,
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
                fetchLandlords();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: error.response?.data?.message || 'Impossible de supprimer ce bailleur.'
                });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes Bailleurs</h1>
                    <p className="text-gray-500">Gérez vos propriétaires partenaires</p>
                </div>
                <PermissionGuard module="bailleurs" action="create">
                    <Link
                        to="/bailleurs/create"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Bailleur
                    </Link>
                </PermissionGuard>
            </div>

            {/* Search */}
            <div className="flex space-x-4 mb-6">
                <div className="flex-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                        placeholder="Rechercher un bailleur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader className="animate-spin h-8 w-8 text-indigo-500" />
                </div>
            ) : landlords.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun bailleur</h3>
                    <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouveau propriétaire.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {landlords.map((landlord) => (
                        <div key={landlord.id} className="relative group">
                            <Link to={`/bailleurs/${landlord.id}`} className="block hover:bg-gray-50">
                                <div className="bg-white overflow-hidden shadow rounded-lg border border-transparent group-hover:border-indigo-500 transition-colors">
                                    <div className="px-4 py-5 sm:p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
                                                    <User className="h-6 w-6 text-indigo-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {landlord.user?.prenom} {landlord.user?.nom}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 flex items-center mt-1">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {landlord.pays || 'Non renseigné'}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Action buttons */}
                                            <div className="flex gap-1">
                                                <PermissionGuard module="bailleurs" action="edit">
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            window.location.href = `/bailleurs/edit/${landlord.id}`;
                                                        }}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                        title="Modifier"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                </PermissionGuard>
                                                <PermissionGuard module="bailleurs" action="delete">
                                                    <button
                                                        onClick={(e) => handleDelete(e, landlord.id, `${landlord.user?.prenom} ${landlord.user?.nom}`)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </PermissionGuard>
                                            </div>
                                        </div>
                                        <div className="mt-4 border-t border-gray-100 pt-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 flex items-center">
                                                    <Phone className="h-3 w-3 mr-1" />
                                                    {landlord.user?.telephone || '-'}
                                                </span>
                                                <span className="text-gray-500 flex items-center">
                                                    <Building className="h-3 w-3 mr-1" />
                                                    Voir détails
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
