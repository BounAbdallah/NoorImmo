import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyService } from '../../../services/propertyService';
import { bailleurService } from '../../../services/bailleurService';
import { structureService } from '../../../services/structureService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Swal from 'sweetalert2';

export default function EditPropertyPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Data Sources
    const [bailleurs, setBailleurs] = useState([]);
    const [immeubles, setImmeubles] = useState([]);
    const [etages, setEtages] = useState([]);

    const [formData, setFormData] = useState({
        reference: '',
        adresse: '',
        description: '',
        type: 'appartement',
        statut: 'disponible',
        loyer_mensuel: '',
        nombre_pieces: '',
        surface: '',
        bailleur_id: '',
        immeuble_id: '',
        etage_id: ''
    });

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Load Bailleurs if needed
                if (user?.user_type === 'agence' || user?.user_type === 'admin') {
                    const bRes = await bailleurService.getAll();
                    setBailleurs(bRes.data.data);
                }

                // 2. Load Property
                const pRes = await propertyService.getOne(id);
                const property = pRes.data.data;

                // 3. Load Buildings for this bailleur
                const bailleurId = property.bailleur_id;
                if (bailleurId) {
                    const iRes = await structureService.getAllBuildings({ bailleur_id: bailleurId });
                    setImmeubles(iRes.data.data);
                }

                // 4. Load Floors for this building if set
                if (property.immeuble_id) {
                    const fRes = await structureService.getBuilding(property.immeuble_id);
                    setEtages(fRes.data.etages || []);
                }

                // Set Form Data
                setFormData({
                    reference: property.reference,
                    adresse: property.adresse,
                    description: property.description || '',
                    type: property.type,
                    statut: property.statut,
                    loyer_mensuel: property.loyer_mensuel,
                    nombre_pieces: property.nombre_pieces,
                    surface: property.surface,
                    bailleur_id: property.bailleur_id,
                    immeuble_id: property.immeuble_id || '',
                    etage_id: property.etage_id || ''
                });

            } catch (error) {
                console.error("Error loading property", error);
                Swal.fire('Erreur', 'Impossible de charger le bien', 'error');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, user]);

    // Handle Immeuble Change dynamically
    const handleImmeubleChange = async (e) => {
        const immeubleId = e.target.value;
        setFormData(prev => ({ ...prev, immeuble_id: immeubleId, etage_id: '' }));

        if (immeubleId) {
            try {
                const response = await structureService.getBuilding(immeubleId);
                setEtages(response.data.etages || []);
                // Optional: Auto-fill address if switching building
                setFormData(prev => ({ ...prev, adresse: response.data.adresse }));
            } catch (error) {
                console.error(error);
            }
        } else {
            setEtages([]);
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
            await propertyService.update(id, formData);
            Swal.fire('Succès', 'Bien mis à jour avec succès', 'success');
            navigate(`/biens/${id}`);
        } catch (error) {
            Swal.fire('Erreur', error.response?.data?.message || error.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <Button variant="ghost" onClick={() => navigate(`/biens/${id}`)} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au détail
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Modifier le Bien</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {(user?.user_type === 'agence' || user?.user_type === 'admin') && (
                            <div className="space-y-2">
                                <Label>Propriétaire (Bailleur)</Label>
                                <select
                                    name="bailleur_id"
                                    value={formData.bailleur_id}
                                    onChange={handleChange} // Changing bailleur in edit mode is risky, logic needed if we allow it
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                                    disabled // Disable changing owner for now to avoid complexity
                                    required
                                >
                                    {bailleurs.map(b => (
                                        <option key={b.id} value={b.id}>{b.user.prenom} {b.user.nom} ({b.pays})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500">Le propriétaire ne peut pas être modifié.</p>
                            </div>
                        )}

                        {/* Immeuble / Etage Selection */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                            <div className="space-y-2">
                                <Label>Immeuble</Label>
                                <select
                                    name="immeuble_id"
                                    value={formData.immeuble_id}
                                    onChange={handleImmeubleChange}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Aucun (Maison/Autre)</option>
                                    {immeubles.map(im => (
                                        <option key={im.id} value={im.id}>{im.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Étage</Label>
                                <select
                                    name="etage_id"
                                    value={formData.etage_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    disabled={!formData.immeuble_id}
                                >
                                    <option value="">Sélectionner l'étage...</option>
                                    {etages.map(et => (
                                        <option key={et.id} value={et.id}>{et.nom}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Référence / Nom du bien</Label>
                            <Input name="reference" value={formData.reference} onChange={handleChange} required />
                        </div>

                        <div className="space-y-2">
                            <Label>Adresse</Label>
                            <Input
                                name="adresse"
                                value={formData.adresse}
                                onChange={handleChange}
                                required
                                disabled={!!formData.immeuble_id} // Lock address if part of building
                                className="disabled:bg-gray-100 disabled:text-gray-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="appartement">Appartement</option>
                                    <option value="maison">Maison</option>
                                    <option value="studio">Studio</option>
                                    <option value="commerce">Commerce</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Loyer Mensuel (CFA)</Label>
                                <Input name="loyer_mensuel" type="number" value={formData.loyer_mensuel} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre de pièces</Label>
                                <Input name="nombre_pieces" type="number" value={formData.nombre_pieces} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Surface (m²)</Label>
                                <Input name="surface" type="number" value={formData.surface} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Statut</Label>
                            <select
                                name="statut"
                                value={formData.statut}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="disponible">Disponible</option>
                                <option value="loue">Loué</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="vendu">Vendu</option>
                                <option value="indisponible">Indisponible</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                            />
                        </div>

                        <Button type="submit" isLoading={submitting} className="w-full">
                            Mettre à jour le bien
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
