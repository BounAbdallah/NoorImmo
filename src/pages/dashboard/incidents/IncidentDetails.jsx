import React, { useEffect, useState } from 'react';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentService } from '../../../services/incidentService';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { ArrowLeft, CheckCircle, User } from 'lucide-react';
import Swal from 'sweetalert2';

export default function IncidentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(false);

    useEffect(() => {
        loadIncident();
    }, [id]);

    const loadIncident = async () => {
        try {
            const response = await incidentService.getOne(id);
            setIncident(response.data);
        } catch (error) {
            console.error('🔴 Error loading incident:', error);
            Swal.fire('Erreur', 'Incident introuvable', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        const { value: notes } = await Swal.fire({
            title: 'Résolution',
            input: 'textarea',
            inputLabel: 'Notes de résolution',
            inputPlaceholder: 'Expliquez comment le problème a été résolu...',
            showCancelButton: true
        });

        if (notes) {
            setResolving(true);
            try {
                await incidentService.resolve(id, notes);
                Swal.fire('Succès', 'Incident marqué comme résolu', 'success');
                loadIncident();
            } catch (error) {
                console.error(error);
                Swal.fire('Erreur', 'Impossible de résoudre l\'incident', 'error');
            } finally {
                setResolving(false);
            }
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (!incident) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate('/incidents')} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux incidents
            </Button>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            #{incident.id} - {incident.titre}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Signalé le {new Date(incident.created_at).toLocaleDateString()} pour {incident.bail?.bien?.nom}
                        </p>
                    </div>
                    <span className={`px-2 py-1 text-sm rounded-full ${incident.statut === 'resolu' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {incident.statut}
                    </span>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{incident.description}</dd>
                        </div>

                        {incident.resolution_notes && (
                            <div className="sm:col-span-2 bg-green-50 p-4 rounded-md">
                                <dt className="text-sm font-medium text-green-800">Notes de résolution</dt>
                                <dd className="mt-1 text-sm text-green-700">{incident.resolution_notes}</dd>
                            </div>
                        )}

                        {incident.technicien && (
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Technicien assigné</dt>
                                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                    <User className="h-4 w-4 mr-2 text-gray-400" />
                                    {incident.technicien.prenom} {incident.technicien.nom}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
                    {incident.statut !== 'resolu' && incident.statut !== 'ferme' && (
                        <PermissionGuard permission="incidents.edit">
                            <Button onClick={handleResolve} isLoading={resolving}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marquer comme résolu
                            </Button>
                        </PermissionGuard>
                    )}
                </div>
            </div>
        </div>
    );
}
