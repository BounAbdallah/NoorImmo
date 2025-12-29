import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { landlordService } from '../../../services/landlordService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Info, Loader } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';

const getStorageUrl = (path) => {
    if (!path) return null;
    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    baseUrl = baseUrl.replace(/\/api\/v1\/?$/, '');
    baseUrl = baseUrl.replace(/\/+$/, '');
    return `${baseUrl}/storage/${path.replace(/^\/+/, '')}`;
};

export default function EditLandlord() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user, hasPermission } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(true);

    useEffect(() => {
        if (user && !hasPermission('bailleurs', 'edit')) {
            navigate('/bailleurs');
            Swal.fire('Accès refusé', 'Vous n\'avez pas la permission de modifier un bailleur.', 'error');
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
    const [existingCniRecto, setExistingCniRecto] = useState(null);
    const [existingCniVerso, setExistingCniVerso] = useState(null);

    useEffect(() => {
        loadLandlordData();
    }, [id]);

    const loadLandlordData = async () => {
        try {
            const response = await landlordService.getById(id);
            if (response.success) {
                const landlord = response.data;
                setFormData({
                    prenom: landlord.user?.prenom || '',
                    nom: landlord.user?.nom || '',
                    email: landlord.user?.email || '',
                    telephone: landlord.user?.telephone || '',
                    pays: landlord.pays || '',
                    adresse_diaspora: landlord.adresse_diaspora || '',
                    numero_cni: landlord.numero_cni || '',
                    date_naissance: landlord.date_naissance || '',
                    lieu_naissance: landlord.lieu_naissance || ''
                });
                setExistingCniRecto(landlord.cni_recto);
                setExistingCniVerso(landlord.cni_verso);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger les données du bailleur', 'error');
            navigate('/bailleurs');
        } finally {
            setFetchingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
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
            const data = new FormData();

            // Append all common fields
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key] || '');
            });

            if (cniRecto) data.append('cni_recto', cniRecto);
            if (cniVerso) data.append('cni_verso', cniVerso);

            // Laravel workaround for PUT requests with FormData
            data.append('_method', 'PUT');

            const response = await landlordService.update(id, data);
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Modifié !',
                    text: 'Le bailleur a été modifié avec succès.',
                    timer: 2000,
                    showConfirmButton: false
                });
                navigate('/bailleurs');
            }
        } catch (error) {
            console.error(error);
            const message = error.response?.data?.message || 'Erreur lors de la modification.';
            const errors = error.response?.data?.errors;

            if (errors) {
                const errorMessages = Object.values(errors).flat().join('<br/>');
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur de validation',
                    html: `<div class="text-left">${errorMessages}</div>`,
                });
            } else {
                Swal.fire('Erreur', message, 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    if (fetchingData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier le Bailleur</h1>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Informations Personnelles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="prenom">Prénom</Label>
                                <Input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required />
                            </div>
                            <div>
                                <Label htmlFor="nom">Nom</Label>
                                <Input id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email (Optionnel si téléphone renseigné)</Label>
                            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                        </div>

                        <div>
                            <Label htmlFor="telephone">Téléphone {!formData.email && <span className="text-red-500">*</span>}</Label>
                            <Input
                                type="tel"
                                id="telephone"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleChange}
                                required={!formData.email}
                                placeholder={!formData.email ? "Requis car pas d'email" : "Numéro de téléphone"}
                            />
                        </div>

                        <div>
                            <Label htmlFor="pays">Pays</Label>
                            <Input id="pays" name="pays" value={formData.pays} onChange={handleChange} required placeholder="Ex: Sénégal" />
                        </div>

                        <div>
                            <Label htmlFor="adresse_diaspora">Adresse Diaspora</Label>
                            <Input id="adresse_diaspora" name="adresse_diaspora" value={formData.adresse_diaspora} onChange={handleChange} placeholder="Adresse complète" />
                        </div>

                        {/* Identity Section */}
                        <div className="border-t pt-4 mt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations d'Identité</h3>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="numero_cni">Numéro CNI / Passeport</Label>
                                    <Input id="numero_cni" name="numero_cni" value={formData.numero_cni} onChange={handleChange} placeholder="Ex: 1234567890123" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="date_naissance">Date de naissance</Label>
                                        <Input type="date" id="date_naissance" name="date_naissance" value={formData.date_naissance} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <Label htmlFor="lieu_naissance">Lieu de naissance</Label>
                                        <Input id="lieu_naissance" name="lieu_naissance" value={formData.lieu_naissance} onChange={handleChange} placeholder="Ex: Dakar" />
                                    </div>
                                </div>

                                {/* CNI Photos */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="cni_recto">Photo CNI Recto</Label>
                                        <Input type="file" id="cni_recto" accept="image/jpeg,image/png,image/jpg" onChange={(e) => handleFileChange(e, 'recto')} className="cursor-pointer" />
                                        <p className="text-xs text-gray-500 mt-1">Max 2MB - JPEG, PNG</p>
                                        {cniRectoPreview ? (
                                            <div className="mt-2">
                                                <img src={cniRectoPreview} alt="CNI Recto" className="h-32 w-auto rounded border" />
                                            </div>
                                        ) : existingCniRecto && (
                                            <div className="mt-2">
                                                <img src={getStorageUrl(existingCniRecto)} alt="CNI Recto actuel" className="h-32 w-auto rounded border" />
                                                <p className="text-xs text-gray-500 mt-1">Photo actuelle</p>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="cni_verso">Photo CNI Verso</Label>
                                        <Input type="file" id="cni_verso" accept="image/jpeg,image/png,image/jpg" onChange={(e) => handleFileChange(e, 'verso')} className="cursor-pointer" />
                                        <p className="text-xs text-gray-500 mt-1">Max 2MB - JPEG, PNG</p>
                                        {cniVersoPreview ? (
                                            <div className="mt-2">
                                                <img src={cniVersoPreview} alt="CNI Verso" className="h-32 w-auto rounded border" />
                                            </div>
                                        ) : existingCniVerso && (
                                            <div className="mt-2">
                                                <img src={getStorageUrl(existingCniVerso)} alt="CNI Verso actuel" className="h-32 w-auto rounded border" />
                                                <p className="text-xs text-gray-500 mt-1">Photo actuelle</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Modification des informations</p>
                                <p>Les modifications seront enregistrées immédiatement. Le mot de passe reste inchangé.</p>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/bailleurs')}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={loading}>
                            Enregistrer les modifications
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
