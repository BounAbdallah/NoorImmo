import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tenantService } from '../../services/tenantService';
import { Search, User, Mail, Phone, ExternalLink, Plus } from 'lucide-react';
import Swal from 'sweetalert2';

export default function TenantsList() {
    const [tenants, setTenants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadTenants();
    }, [searchTerm]);

    const loadTenants = async () => {
        try {
            const response = await tenantService.getAllTenants({ search: searchTerm });
            if (response.success) {
                setTenants(response.data.data);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger les locataires', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Annuaire des Locataires</h1>
                    <p className="mt-1 text-sm text-gray-500">Gérez les dossiers de vos locataires.</p>
                </div>
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    <div className="relative rounded-md shadow-sm">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                    <Link
                        to="/dashboard/tenants/new"
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Nouveau Locataire
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {tenants.length > 0 ? (
                            tenants.map((tenant) => (
                                <li key={tenant.id}>
                                    <Link to={`/tenants/${tenant.id}`} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                                        {tenant.user?.prenom?.[0]}{tenant.user?.nom?.[0]}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-primary-600 truncate">
                                                            {tenant.user?.prenom} {tenant.user?.nom}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                            {tenant.user?.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        {tenant.user?.telephone || 'N/A'}
                                                    </div>
                                                    {tenant.baux?.length > 0 && (
                                                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                            {tenant.baux.length} bail{tenant.baux.length > 1 ? 's' : ''} actif{tenant.baux.length > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                    <ExternalLink className="h-4 w-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-12 text-center text-gray-500">
                                Aucun locataire trouvé.
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
