import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { structureService } from '../../../services/structureService';
import { bailleurService } from '../../../services/bailleurService';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import Swal from 'sweetalert2';

export default function BuildingForm() {
    const navigate = useNavigate();
    const { user, hasPermission } = useAuth();
    const [loading, setLoading] = useState(false);
    const [bailleurs, setBailleurs] = useState([]);
    const [formData, setFormData] = useState({
        nom: '',
        adresse: '',
        nombre_etages: '', // Backend will auto-create floors
        description: '',
        bailleur_id: ''
    });

    useEffect(() => {
        if (user && !hasPermission('immeubles', 'create')) {
            navigate('/immeubles');
            Swal.fire('Accès refusé', 'Vous n\'avez pas la permission de créer un immeuble.', 'error');
        }
    }, [user, hasPermission, navigate]);

    useEffect(() => {
        if (user?.user_type === 'agence' || user?.user_type === 'admin') {
            loadBailleurs();
        }
    }, [user]);

    const loadBailleurs = async () => {
        try {
            const response = await bailleurService.getAll();
            setBailleurs(response.data?.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await structureService.createBuilding(formData);
            Swal.fire('Succès', 'Immeuble créé avec ses étages !', 'success');
            navigate('/immeubles');
        } catch (error) {
            Swal.fire('Erreur', 'Impossible de créer l\'immeuble', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un Immeuble</h1>
            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Informations Générales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(user?.user_type === 'agence' || user?.user_type === 'admin') && (
                            <div className="space-y-2">
                                <Label>Bailleur Propriétaire</Label>
                                <select
                                    name="bailleur_id"
                                    value={formData.bailleur_id}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                >
                                    <option value="">Sélectionner un bailleur...</option>
                                    {bailleurs.map(b => (
                                        <option key={b.id} value={b.id}>{b.user.prenom} {b.user.nom}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>Nom de l'immeuble</Label>
                            <Input name="nom" value={formData.nom} onChange={handleChange} placeholder="Résidence La Paix" required />
                        </div>

                        <div className="space-y-2">
                            <Label>Adresse</Label>
                            <Input name="adresse" value={formData.adresse} onChange={handleChange} required />
                        </div>

                        <div className="space-y-2">
                            <Label>Nombre d'étages (sans compter le RDC)</Label>
                            <Input
                                name="nombre_etages"
                                type="number"
                                min="0"
                                value={formData.nombre_etages}
                                onChange={handleChange}
                                placeholder="Ex: 4 (va créer RDC + Etage 1 à 4)"
                                required
                            />
                            <p className="text-xs text-gray-500">Le système générera automatiquement les étages.</p>
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
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/immeubles')}>Annuler</Button>
                        <Button type="submit" isLoading={loading}>Créer l'immeuble</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
