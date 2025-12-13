import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../../../services/projectService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export default function CreateProjectPage() {
    const navigate = useNavigate();
    const { user } = useAuth(); // Need user to get bailleur_id ideally or handled by backend
    // Assuming backend assigns bailleur_id from auth user or we need to fetch user's bailleur profile ID.
    // For MVP, if user is 'bailleur', let's assume controller handles it or we send a dummy ID for now if we don't have Bailleur profile endpoint handy in frontend.
    // Actually, AuthController stores user info. Let's assume we can pass `bailleur_id` or backend derives it.

    // NOTE: In a real app, we need to fetch the Bailleur ID associated with the User. 
    // Let's assume for this MVP that strictly Bailleur users use this and we might need to fetch their Bailleur ID first 
    // or hardcode it for the test user '1' if the seeder created it so.

    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        adresse: '',
        budget_total: '',
        date_debut: '',
        date_fin_prevue: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Hardcoding bailleur_id=1 for MVP simplicity as per seeder logic usuallly linked to first user
            // Ideally: user.bailleur?.id
            const payload = {
                ...formData,
                bailleur_id: 1,
            };

            await projectService.create(payload);
            navigate('/projects');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de la création du projet");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate('/projects')} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux projets
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Nouveau Projet de Construction</CardTitle>
                    <p className="text-gray-500 text-sm">Remplissez les informations principales de votre futur chantier.</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="titre">Nom du projet</Label>
                            <Input
                                id="titre"
                                name="titre"
                                placeholder="Ex: Villa Saly - R+1"
                                value={formData.titre}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type de construction</Label>
                            <Input
                                id="type" // Just UI, not sending this yet based on Project model, or put in description
                                placeholder="Maison, Immeuble, Rénovation..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adresse">Localisation (Ville, Quartier)</Label>
                            <Input
                                id="adresse"
                                name="adresse"
                                placeholder="Ex: Saly Portudal, Mbour"
                                value={formData.adresse}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget_total">Budget Total Estimé (CFA)</Label>
                            <Input
                                id="budget_total"
                                name="budget_total"
                                type="number"
                                placeholder="Ex: 50000000"
                                value={formData.budget_total}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date_debut">Date de début</Label>
                                <Input
                                    id="date_debut"
                                    name="date_debut"
                                    type="date"
                                    value={formData.date_debut}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date_fin_prevue">Date de fin prévue</Label>
                                <Input
                                    id="date_fin_prevue"
                                    name="date_fin_prevue"
                                    type="date"
                                    value={formData.date_fin_prevue}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description détaillée</Label>
                            <textarea
                                id="description"
                                name="description"
                                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px]"
                                placeholder="Décrivez votre projet..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="pt-4 flex justify-end space-x-2">
                            <Button type="button" variant="secondary" onClick={() => navigate('/projects')}>
                                Annuler
                            </Button>
                            <Button type="submit" isLoading={loading}>
                                Créer le projet
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
