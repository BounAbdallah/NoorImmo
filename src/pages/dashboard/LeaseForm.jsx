import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { leaseService } from '../../services/leaseService';
import { propertyService } from '../../services/propertyService'; // Need to fetch properties
import { tenantService } from '../../services/tenantService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import Swal from 'sweetalert2';

export default function LeaseForm() {
    const navigate = useNavigate();
    const { id } = useParams(); // Get ID for edit mode
    const { user, hasPermission } = useAuth();
    const isEditMode = !!id;

    useEffect(() => {
        if (!hasPermission('baux.create') && !isEditMode) {
            // For edit, maybe checking baux.edit would be better but keeping simple
            Swal.fire({
                icon: 'error',
                title: 'Accès refusé',
                text: "Vous n'avez pas la permission de créer un bail.",
                timer: 3000,
                showConfirmButton: false
            });
            navigate('/leases');
        }
    }, [hasPermission, navigate, isEditMode]);

    const [properties, setProperties] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        bien_id: '',
        locataire_id: '',
        date_debut: '',
        date_fin: '',
        type_duree: 'indeterminee',
        loyer_mensuel: '',
        caution: ''
    });

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            // Fetch available properties and tenants
            // For edit mode, we might need to fetch ALL properties or at least the one currently linked
            const [propsRes, tenantsRes] = await Promise.all([
                propertyService.getAllProperties({ all: 'true' }), // Fetch ALL to ensure current property is visible in edit
                tenantService.getAllTenants()
            ]);

            if (propsRes.data) {
                const pData = propsRes.data.data;
                setProperties(pData?.data || pData || []);
            }
            if (tenantsRes.data) {
                const tData = tenantsRes.data.data;
                setTenants(tData?.data || tData || []);
            }

            // If Edit Mode, Fetch Lease Data
            if (isEditMode) {
                const leaseRes = await leaseService.getLease(id);
                if (leaseRes.success) {
                    const data = leaseRes.data;
                    setFormData({
                        bien_id: data.bien_id,
                        locataire_id: data.locataire_id,
                        date_debut: data.date_debut,
                        date_fin: data.date_fin,
                        type_duree: data.type_duree,
                        loyer_mensuel: data.loyer_mensuel,
                        caution: data.caution
                    });
                }
            }
        } catch (error) {
            console.error("Error loading form data", error);
            Swal.fire('Erreur', 'Impossible de charger les données du formulaire.', 'error');
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
            const payload = {
                ...formData,
                agence_id: user.agence?.id // Pass agency ID if available
            };

            let response;
            if (isEditMode) {
                response = await leaseService.updateLease(id, payload);
            } else {
                response = await leaseService.createLease(payload);
            }

            if (response.success) {
                Swal.fire('Succès', `Bail ${isEditMode ? 'modifié' : 'créé'} avec succès`, 'success');
                navigate('/leases');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', error.response?.data?.message || `Erreur lors de la ${isEditMode ? 'modification' : 'création'} du bail.`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return <div className="p-12 text-center">Chargement...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEditMode ? 'Modifier le Bail' : 'Nouveau Bail Numérique'}</h1>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Détails du contrat</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Property Selection */}
                            <div className="md:col-span-2">
                                <Label htmlFor="bien_id">Bien Immobilier</Label>
                                <select
                                    id="bien_id"
                                    name="bien_id"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                    value={formData.bien_id}
                                    onChange={handleChange}
                                    required
                                    disabled={isEditMode} // Usually shouldn't change property of an existing lease easily without recreation? User can try.
                                >
                                    <option value="">Sélectionner un bien...</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.reference} - {p.adresse} {p.statut !== 'disponible' && p.id != formData.bien_id ? '(Occupé)' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tenant Selection */}
                            <div className="md:col-span-2">
                                <Label htmlFor="locataire_id">Locataire</Label>
                                <select
                                    id="locataire_id"
                                    name="locataire_id"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                    value={formData.locataire_id}
                                    onChange={handleChange}
                                    required
                                    disabled={isEditMode} // Keep tenant fixed if editing
                                >
                                    <option value="">Sélectionner un locataire...</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.user?.prenom} {t.user?.nom} ({t.user?.email})</option>
                                    ))}
                                </select>
                                {!isEditMode && <p className="mt-1 text-xs text-gray-500">Le locataire n'est pas dans la liste ? Ajoutez-le d'abord dans l'annuaire.</p>}
                            </div>

                            {/* Contract Type */}
                            <div className="md:col-span-2">
                                <Label htmlFor="type_duree">Type de Durée</Label>
                                <select
                                    id="type_duree"
                                    name="type_duree"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                    value={formData.type_duree}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="indeterminee">Indéterminée</option>
                                    <option value="determinee">Déterminée</option>
                                </select>
                            </div>

                            {/* Dates */}
                            <div>
                                <Label htmlFor="date_debut">Date d'entrée</Label>
                                <Input
                                    type="date"
                                    id="date_debut"
                                    name="date_debut"
                                    value={formData.date_debut}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="date_fin">Date de fin</Label>
                                <Input
                                    type="date"
                                    id="date_fin"
                                    name="date_fin"
                                    value={formData.date_fin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Financials */}
                            <div>
                                <Label htmlFor="loyer_mensuel">Loyer Mensuel (FCFA)</Label>
                                <Input
                                    type="number"
                                    id="loyer_mensuel"
                                    name="loyer_mensuel"
                                    placeholder="Ex: 250000"
                                    value={formData.loyer_mensuel}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="caution">Caution (FCFA)</Label>
                                <Input
                                    type="number"
                                    id="caution"
                                    name="caution"
                                    placeholder="Ex: 500000"
                                    value={formData.caution}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/leases')}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={submitting}>
                            {isEditMode ? 'Enregistrer les modifications' : 'Créer le bail'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
