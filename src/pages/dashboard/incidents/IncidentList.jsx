import React, { useEffect, useState } from 'react';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { Link } from 'react-router-dom';
import { incidentService } from '../../../services/incidentService';
import { Plus, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function IncidentList() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadIncidents();
    }, []);

    const loadIncidents = async () => {
        try {
            const response = await incidentService.getAll();
            if (response.success) {
                setIncidents(response.data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'nouveau':
                return { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Nouveau' };
            case 'en_cours':
                return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'En cours' };
            case 'resolu':
                return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Résolu' };
            case 'ferme':
                return { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Fermé' };
            default:
                return { color: 'bg-gray-100 text-gray-800', icon: AlertTriangle, label: status };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'elevee': return 'text-red-600 font-bold';
            case 'moyenne': return 'text-orange-600';
            case 'faible': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Incidents</h1>
                    <p className="mt-1 text-sm text-gray-500">Suivi des réclamations et problèmes techniques.</p>
                </div>
                <div className="mt-4 sm:mt-0">
                    <PermissionGuard permission="incidents.create">
                        <Link
                            to="/incidents/new"
                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            Signaler un incident
                        </Link>
                    </PermissionGuard>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Titre / Bien
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Priorité
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
                            {incidents.map((incident) => {
                                const status = getStatusInfo(incident.statut);
                                const StatusIcon = status.icon;
                                return (
                                    <tr key={incident.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(incident.created_at), 'dd MMM yyyy', { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{incident.titre}</div>
                                            <div className="text-sm text-gray-500">{incident.bail?.bien?.nom}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={getPriorityColor(incident.priorite)}>
                                                {incident.priorite}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                <StatusIcon className="mr-1 h-3 w-3" />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link to={`/incidents/${incident.id}`} className="text-primary-600 hover:text-primary-900">
                                                Voir
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                            {incidents.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        Aucun incident signalé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
