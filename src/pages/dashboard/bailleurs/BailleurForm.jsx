import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bailleurService } from '../../../services/bailleurService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Info } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';
import { useEffect } from 'react';

export default function BailleurForm() {
    const navigate = useNavigate();
    const { user, hasPermission } = useAuth();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && !hasPermission('bailleurs', 'create')) {
            navigate('/bailleurs');
            Swal.fire('Accès refusé', 'Vous n\'avez pas la permission de créer un bailleur.', 'error');
        }
    }, [user, hasPermission, navigate]);

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        pays: '',
        adresse_diaspora: '',
        numero_cni: '',
        date_naissance: '',
        lieu_naissance: ''
    });
    const [cniRecto, setCniRecto] = useState(null);
    const [cniVerso, setCniVerso] = useState(null);
    const [cniRectoPreview, setCniRectoPreview] = useState(null);
    const [cniVersoPreview, setCniVersoPreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('Erreur', 'La taille du fichier ne doit pas dépasser 2MB', 'error');
                return;
            }

            if (type === 'recto') {
                setCniRecto(file);
                setCniRectoPreview(URL.createObjectURL(file));
            } else {
                setCniVerso(file);
                setCniVersoPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create FormData for file upload
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    data.append(key, formData[key]);
                }
            });

            if (cniRecto) data.append('cni_recto', cniRecto);
            if (cniVerso) data.append('cni_verso', cniVerso);

            const response = await bailleurService.create(data);
            if (response.success) {
                // Show success message
                Swal.fire({
                    icon: 'success',
                    title: 'Bailleur créé !',
                    html: response.email_sent
                        ? `Le compte a été créé avec succès.<br/>Un email avec les identifiants de connexion a été envoyé à <strong>${formData.email}</strong>`
                        : `Le compte a été créé avec succès.<br/><span style="color: #f59e0b;">⚠️ L'email n'a pas pu être envoyé. Veuillez contacter le bailleur manuellement.</span>`,
                    confirmButtonText: 'OK'
                });
                navigate('/bailleurs');
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
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un Bailleur</h1>

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

                        <div>
                            <Label htmlFor="pays">Pays</Label>
                            <Input
                                id="pays"
                                name="pays"
                                value={formData.pays}
                                onChange={handleChange}
                                required
                                placeholder="Ex: Sénégal"
                            />
                        </div>

                        <div>
                            <Label htmlFor="adresse_diaspora">Adresse Diaspora (si applicable)</Label>
                            <Input
                                id="adresse_diaspora"
                                name="adresse_diaspora"
                                value={formData.adresse_diaspora}
                                onChange={handleChange}
                                placeholder="Adresse complète"
                            />
                        </div>

                        {/* Identity Section */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations d'Identité (Optionnel)</h3>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="numero_cni">Numéro CNI / Passeport</Label>
                                    <Input
                                        id="numero_cni"
                                        name="numero_cni"
                                        value={formData.numero_cni}
                                        onChange={handleChange}
                                        placeholder="Ex: 1234567890123"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date_naissance">Date de naissance</Label>
                                        <Input
                                            type="date"
                                            id="date_naissance"
                                            name="date_naissance"
                                            value={formData.date_naissance}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
                                        <Input
                                            id="lieu_naissance"
                                            name="lieu_naissance"
                                            value={formData.lieu_naissance}
                                            onChange={handleChange}
                                            placeholder="Ex: Dakar"
                                        />
                                    </div>
                                </div>

                                {/* CNI Photos */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="cni_recto">Photo CNI Recto</Label>
                                        <Input
                                            type="file"
                                            id="cni_recto"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={(e) => handleFileChange(e, 'recto')}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max 2MB - JPEG, PNG</p>
                                        {cniRectoPreview && (
                                            <div className="mt-2">
                                                <img src={cniRectoPreview} alt="CNI Recto" className="h-32 w-auto rounded border" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="cni_verso">Photo CNI Verso</Label>
                                        <Input
                                            type="file"
                                            id="cni_verso"
                                            accept="image/jpeg,image/png,image/jpg"
                                            onChange={(e) => handleFileChange(e, 'verso')}
                                            className="cursor-pointer"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max 2MB - JPEG, PNG</p>
                                        {cniVersoPreview && (
                                            <div className="mt-2">
                                                <img src={cniVersoPreview} alt="CNI Verso" className="h-32 w-auto rounded border" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Mot de passe automatique</p>
                                <p>Un mot de passe sécurisé sera généré automatiquement et envoyé par email au bailleur.</p>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/bailleurs')}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Créer le compte bailleur
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
