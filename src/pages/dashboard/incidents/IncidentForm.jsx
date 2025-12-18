import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { incidentService } from '../../../services/incidentService';
import { leaseService } from '../../../services/leaseService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import Swal from 'sweetalert2';

export default function IncidentForm() {
    const navigate = useNavigate();
    const [leases, setLeases] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        bail_id: '',
        locataire_id: '',
        titre: '',
        description: '',
        categorie: 'autre',
        priorite: 'moyenne',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await leaseService.getAllLeases();
            if (response.success) {
                // Filter active leases
                setLeases((response.data.data || []).filter(l => l.statut === 'actif'));
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger vos baux.', 'error');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-fill locataire_id when bail is selected
            if (name === 'bail_id') {
                const selectedLease = leases.find(l => l.id == value);
                if (selectedLease) {
                    newData.locataire_id = selectedLease.locataire_id;
                }
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await incidentService.create(formData);
            if (response.success) {
                Swal.fire('Succès', 'Incident signalé avec succès', 'success');
                navigate('/incidents');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors du signalement.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <div className="p-12 text-center">Chargement...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Signaler un Incident</h1>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Détails du problème</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="bail_id">Bien concerné (Bail)</Label>
                            <select
                                id="bail_id"
                                name="bail_id"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                value={formData.bail_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner...</option>
                                {leases.map(lease => (
                                    <option key={lease.id} value={lease.id}>
                                        {lease.bien?.nom} (Locataire: {lease.locataire?.user?.prenom} {lease.locataire?.user?.nom})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="titre">Titre (Bref résumé)</Label>
                            <Input
                                id="titre"
                                name="titre"
                                placeholder="Ex: Fuite d'eau salle de bain"
                                value={formData.titre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="categorie">Catégorie</Label>
                            <select
                                id="categorie"
                                name="categorie"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                value={formData.categorie}
                                onChange={handleChange}
                                required
                            >
                                <option value="plomberie">Plomberie</option>
                                <option value="electricite">Électricité</option>
                                <option value="serrurerie">Serrurerie</option>
                                <option value="climatisation">Climatisation</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="priorite">Urgence</Label>
                            <select
                                id="priorite"
                                name="priorite"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                value={formData.priorite}
                                onChange={handleChange}
                            >
                                <option value="faible">Faible (Peut attendre)</option>
                                <option value="moyenne">Moyenne (Gênant)</option>
                                <option value="urgente">Élevée (Urgent)</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="description">Description détaillée</Label>
                            <textarea
                                id="description"
                                name="description"
                                rows={4}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3"
                                placeholder="Décrivez le problème le plus précisément possible..."
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/incidents')}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={submitting}>
                            Envoyer le signalement
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
