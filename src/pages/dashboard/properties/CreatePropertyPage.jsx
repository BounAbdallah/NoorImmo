import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { propertyService } from '../../../services/propertyService';
import { bailleurService } from '../../../services/bailleurService';
import { structureService } from '../../../services/structureService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function CreatePropertyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

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
        immeuble_id: searchParams.get('immeuble_id') || '',
        etage_id: searchParams.get('etage_id') || ''
    });

    // 0. Initial Load from Params (Deep linking from Building Details)
    useEffect(() => {
        const initFromParams = async () => {
            const iId = searchParams.get('immeuble_id');
            const eId = searchParams.get('etage_id');

            if (iId) {
                try {
                    setLoading(true);
                    const response = await structureService.getBuilding(iId);
                    const building = response.data;

                    setFormData(prev => ({
                        ...prev,
                        immeuble_id: iId,
                        etage_id: eId || '',
                        bailleur_id: building.bailleur_id,
                        adresse: building.adresse // Pre-fill address
                    }));

                    // Also load related data
                    setImmeubles([building]); // Ensure selected building is in list
                    setEtages(building.etages || []);
                } catch (error) {
                    console.error("Error loading building details", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        initFromParams();
    }, [searchParams]);

    // 1. Load Bailleurs (Agency/Admin) - Only if not already set by params? 
    // Actually we might still want to load them for the dropdown to work visually if not disabled
    useEffect(() => {
        if ((user?.user_type === 'agence' || user?.user_type === 'admin') && !formData.bailleur_id) {
            loadBailleurs();
        } else if (user?.user_type === 'bailleur') {
            loadBuildings(user.bailleur?.id || 'me');
        }
    }, [user, formData.bailleur_id]);

    // 2. Load Buildings when Bailleur changes (or initial load)
    useEffect(() => {
        if (formData.bailleur_id) {
            loadBuildings(formData.bailleur_id);
        }
    }, [formData.bailleur_id]);

    // 3. Load Floors when Immeuble changes
    useEffect(() => {
        if (formData.immeuble_id) {
            loadFloors(formData.immeuble_id);
        } else {
            setEtages([]);
        }
    }, [formData.immeuble_id]);


    const loadBailleurs = async () => {
        try {
            const response = await bailleurService.getAll();
            setBailleurs(response.data.data);
        } catch (error) { console.error(error); }
    };

    const loadBuildings = async (bailleurId) => {
        try {
            // Should filter by bailleur_id in structureService if implemented, 
            // but structureService.getAllBuildings usually returns all for user. 
            // If Agency, we might want to filter client-side or add param.
            // For now, let's just fetch all visible buildings and filter client side if needed.
            // A better API: GET /immeubles?bailleur_id=X
            const response = await structureService.getAllBuildings({ bailleur_id: bailleurId });
            setImmeubles(response.data?.data || []);
        } catch (error) { console.error(error); }
    };

    const loadFloors = async (immeubleId) => {
        try {
            // We can fetch building details to get floors
            const response = await structureService.getBuilding(immeubleId);
            setEtages(response.data.etages || []);
        } catch (error) { console.error(error); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await propertyService.create(formData);
            navigate('/biens');
        } catch (error) {
            alert("Erreur: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate('/biens')} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux biens
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Ajouter un Bien Immobilier</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {(user?.user_type === 'agence' || user?.user_type === 'admin') && (
                            <div className="space-y-2">
                                <Label>Propriétaire (Bailleur)</Label>
                                <select
                                    name="bailleur_id"
                                    value={formData.bailleur_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                                    required
                                    disabled={!!searchParams.get('immeuble_id')} // Locked if coming from building
                                >
                                    <option value="">Sélectionner un bailleur...</option>
                                    {bailleurs.map(b => (
                                        <option key={b.id} value={b.id}>{b.user.prenom} {b.user.nom} ({b.pays})</option>
                                    ))}
                                    {/* Handle case where bailleur is set but list not loaded */}
                                    {formData.bailleur_id && !bailleurs.find(b => b.id === formData.bailleur_id) && (
                                        <option value={formData.bailleur_id}>Bailleur sélectionné</option>
                                    )}
                                </select>
                            </div>
                        )}

                        {/* Immeuble / Etage Selection */}
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                            <div className="space-y-2">
                                <Label>Immeuble (Optionnel)</Label>
                                <select
                                    name="immeuble_id"
                                    value={formData.immeuble_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-500"
                                    disabled={!!searchParams.get('immeuble_id')}
                                >
                                    <option value="">Aucun (Maison/Autre)</option>
                                    {immeubles.map(im => (
                                        <option key={im.id} value={im.id}>{im.nom}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Étage (Si Immeuble)</Label>
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
                            <Input name="reference" value={formData.reference} onChange={handleChange} required placeholder="Ex: REF-APP-001" />
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
                            <Label>Description</Label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
                            />
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full">
                            Créer le bien
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
