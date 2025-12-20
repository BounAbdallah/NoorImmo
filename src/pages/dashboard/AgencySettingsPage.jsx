import React, { useState, useEffect } from 'react';
import { agenceService } from '../../services/agenceService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Building2, Upload, X, Save, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AgencySettingsPage() {
    const { hasPermission } = useAuth();
    const canEdit = hasPermission('agence', 'edit');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [agence, setAgence] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    const [formData, setFormData] = useState({
        raison_sociale: '',
        ninea: '',
        rccm: '',
        adresse: '',
        telephone: '',
        email: ''
    });

    useEffect(() => {
        loadAgence();
    }, []);

    const loadAgence = async () => {
        try {
            const response = await agenceService.getProfile();
            if (response.success) {
                const data = response.data;
                setAgence(data);
                setFormData({
                    raison_sociale: data.raison_sociale || '',
                    ninea: data.ninea || '',
                    rccm: data.rccm || '',
                    adresse: data.adresse || '',
                    telephone: data.user?.telephone || '',
                    email: data.user?.email || ''
                });
                if (data.logo_url) {
                    setLogoPreview(data.logo_url);
                }
            }
        } catch (error) {
            console.error('Error loading agency:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        if (!canEdit) return;
        setSaving(true);
        try {
            const response = await agenceService.updateSettings(formData);
            if (response.success) {
                alert('Paramètres mis à jour avec succès !');
                await loadAgence();
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Erreur lors de la mise à jour des paramètres');
        } finally {
            setSaving(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file
            if (!file.type.match('image.*')) {
                alert('Veuillez sélectionner une image');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                alert('Le fichier ne doit pas dépasser 2 MB');
                return;
            }

            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => setLogoPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUploadLogo = async () => {
        if (!selectedFile) return;
        if (!canEdit) return;

        setSaving(true);
        try {
            const response = await agenceService.uploadLogo(selectedFile);
            if (response.success) {
                alert('Logo téléchargé avec succès !');
                setSelectedFile(null);
                await loadAgence();
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            const errorMsg = error.response?.data?.message || 'Erreur lors du téléchargement du logo';
            alert(errorMsg);

            // Log more details for debugging
            if (error.response) {
                // console.log('Status:', error.response.status);
                // console.log('Data:', error.response.data);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLogo = async () => {
        if (!confirm('Voulez-vous vraiment supprimer le logo ?')) return;
        if (!canEdit) return;

        setSaving(true);
        try {
            const response = await agenceService.deleteLogo();
            if (response.success) {
                alert('Logo supprimé avec succès !');
                setLogoPreview(null);
                setSelectedFile(null);
                await loadAgence();
            }
        } catch (error) {
            console.error('Error deleting logo:', error);
            alert('Erreur lors de la suppression du logo');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Paramètres de l'Agence</h1>
                    <p className="mt-1 text-sm text-gray-500">Gérez les informations de votre agence</p>
                </div>
                {!canEdit && (
                    <div className="mt-4 sm:mt-0 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center text-yellow-800 text-sm">
                        <Lock className="h-4 w-4 mr-2" />
                        Lecture seule
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Logo Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Upload className="mr-2 h-5 w-5 text-gray-400" />
                            Logo de l'Agence
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {logoPreview && (
                                <div className="relative">
                                    <img
                                        src={logoPreview}
                                        alt="Logo"
                                        className="w-full h-40 object-contain bg-gray-50 rounded border"
                                    />
                                    {agence?.logo_url && canEdit && (
                                        <button
                                            onClick={handleDeleteLogo}
                                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                                            disabled={saving}
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            )}

                            {canEdit ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Choisir un nouveau logo
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            JPG, PNG ou SVG. Max 2MB.
                                        </p>
                                    </div>

                                    {selectedFile && (
                                        <Button
                                            onClick={handleUploadLogo}
                                            disabled={saving}
                                            className="w-full"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            {saving ? 'Téléchargement...' : 'Télécharger'}
                                        </Button>
                                    )}
                                </>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Vous n'avez pas la permission de modifier le logo.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Form */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Building2 className="mr-2 h-5 w-5 text-gray-400" />
                            Informations de l'Agence
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveSettings} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Raison Sociale <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="raison_sociale"
                                        value={formData.raison_sociale}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!canEdit}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${!canEdit && 'bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email (Non modifiable)
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        NINEA
                                    </label>
                                    <input
                                        type="text"
                                        name="ninea"
                                        value={formData.ninea}
                                        onChange={handleInputChange}
                                        disabled={!canEdit}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${!canEdit && 'bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        RCCM
                                    </label>
                                    <input
                                        type="text"
                                        name="rccm"
                                        value={formData.rccm}
                                        onChange={handleInputChange}
                                        disabled={!canEdit}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${!canEdit && 'bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Téléphone
                                    </label>
                                    <input
                                        type="tel"
                                        name="telephone"
                                        value={formData.telephone}
                                        onChange={handleInputChange}
                                        disabled={!canEdit}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${!canEdit && 'bg-gray-100 cursor-not-allowed'}`}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Adresse
                                    </label>
                                    <textarea
                                        name="adresse"
                                        value={formData.adresse}
                                        onChange={handleInputChange}
                                        rows="3"
                                        disabled={!canEdit}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 ${!canEdit && 'bg-gray-100 cursor-not-allowed'}`}
                                    ></textarea>
                                </div>
                            </div>

                            {canEdit && (
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </Button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
