import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../../services/inventoryService';
import { leaseService } from '../../../services/leaseService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import Swal from 'sweetalert2';

export default function InventoryForm() {
    const navigate = useNavigate();
    const [leases, setLeases] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        bail_id: '',
        type: 'entrant',
        date_etat_des_lieux: new Date().toISOString().split('T')[0],
        observations: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await leaseService.getAllLeases();
            if (response.success) {
                setLeases(response.data.data || []);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger les baux.', 'error');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await inventoryService.create(formData);
            if (response.success) {
                Swal.fire('Succès', 'État des lieux enregistré', 'success');
                navigate('/dashboard/inventory');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de l\'enregistrement.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <div className="p-12 text-center">Chargement...</div>;

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouvel État des Lieux</h1>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Informations Générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="type">Type</Label>
                                <select
                                    id="type"
                                    name="type"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <option value="entrant">Entrant (Aménagement)</option>
                                    <option value="sortant">Sortant (Déménagement)</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="date_etat_des_lieux">Date</Label>
                                <Input
                                    type="date"
                                    id="date_etat_des_lieux"
                                    name="date_etat_des_lieux"
                                    value={formData.date_etat_des_lieux}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="bail_id">Bail concerné</Label>
                            <select
                                id="bail_id"
                                name="bail_id"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                value={formData.bail_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Sélectionner un bail...</option>
                                {leases.map(lease => (
                                    <option key={lease.id} value={lease.id}>
                                        {lease.bien?.nom} - {lease.locataire?.user?.prenom} {lease.locataire?.user?.nom} ({lease.statut})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="observations">Observations / Remarques</Label>
                            <textarea
                                id="observations"
                                name="observations"
                                rows={6}
                                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3"
                                placeholder="État des murs, sols, équipements... Notez tous les détails ici."
                                value={formData.observations}
                                onChange={handleChange}
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/dashboard/inventory')}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={submitting}>
                            Enregistrer
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
