import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { incidentService } from '../../../services/incidentService';
import { leaseService } from '../../../services/leaseService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

export default function IncidentForm() {
    const { user, hasPermission } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Allow tenants to create incidents without permission check
        // For other user types (agence, team members), check permissions
        if (user && user.user_type !== 'locataire' && !hasPermission('incidents.create')) {
            Swal.fire({
                icon: 'error',
                title: 'Accès refusé',
                text: "Vous n'avez pas la permission de signaler un incident.",
                timer: 3000,
                showConfirmButton: false
            });
            navigate('/incidents');
        }
    }, [hasPermission, navigate, user]);

    const [leases, setLeases] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

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
                const activeLeases = (response.data.data || []).filter(l => l.statut === 'actif');
                setLeases(activeLeases);

                // Auto-select for tenants
                if (user && user.user_type === 'locataire' && activeLeases.length > 0) {
                    const firstLease = activeLeases[0];
                    setFormData(prev => ({
                        ...prev,
                        bail_id: firstLease.id,
                        locataire_id: firstLease.locataire_id
                    }));
                }
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

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            const isImage = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

            if (!isImage) {
                Swal.fire('Erreur', `${file.name} n'est pas une image valide.`, 'error');
                return false;
            }
            if (!isValidSize) {
                Swal.fire('Erreur', `${file.name} dépasse la taille maximale de 5MB.`, 'error');
                return false;
            }
            return true;
        });

        setSelectedImages(prev => [...prev, ...validFiles]);

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Create FormData for file upload
            const submitData = new FormData();
            submitData.append('bail_id', formData.bail_id);
            submitData.append('locataire_id', formData.locataire_id);
            submitData.append('titre', formData.titre);
            submitData.append('description', formData.description);
            submitData.append('categorie', formData.categorie);
            submitData.append('priorite', formData.priorite);

            // Append images
            selectedImages.forEach((image, index) => {
                submitData.append('images[]', image);
            });

            const response = await incidentService.create(submitData);
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

                        {/* Image Upload Section */}
                        <div>
                            <Label htmlFor="images">Photos de l'incident (optionnel)</Label>
                            <div className="mt-2">
                                <label
                                    htmlFor="images"
                                    className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600">
                                            Cliquez pour ajouter des photos
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PNG, JPG, GIF jusqu'à 5MB par image
                                        </p>
                                    </div>
                                    <input
                                        id="images"
                                        name="images"
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            </div>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                                                {selectedImages[index]?.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
