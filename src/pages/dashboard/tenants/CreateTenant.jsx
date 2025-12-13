import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantService } from '../../../services/tenantService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import Swal from 'sweetalert2';

export default function CreateTenant() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        password: '', // Should be auto-generated or set by user? Let's generic it.
        password_confirmation: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password_confirmation) {
            Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await tenantService.create(formData);
            if (response.success) {
                Swal.fire('Succès', 'Locataire (et compte utilisateur) créé avec succès', 'success');
                navigate('/tenants');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de la création.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un Locataire</h1>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Informations Personnelles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="prenom">Prénom</Label>
                                <Input
                                    id="prenom"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="nom">Nom</Label>
                                <Input
                                    id="nom"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email (Sera utilisé pour la connexion)</Label>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="telephone">Téléphone</Label>
                            <Input
                                type="tel"
                                id="telephone"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 mt-4">
                            <div>
                                <Label htmlFor="password">Mot de passe provisoire</Label>
                                <Input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <Label htmlFor="password_confirmation">Confirmer mot de passe</Label>
                                <Input
                                    type="password"
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/tenants')}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Créer le compte locataire
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
