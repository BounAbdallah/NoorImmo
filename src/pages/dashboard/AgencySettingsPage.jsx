import React, { useEffect, useState } from 'react';
import { agencyService } from '../../services/agencyService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Settings, Percent, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AgencySettingsPage() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [settings, setSettings] = useState({
        taux_commission_agence: 10,
        taux_commission_plateforme: 5,
        raison_sociale: '',
        ninea: '',
        adresse: ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const response = await agencyService.getSettings();
            if (response.success) {
                setSettings(response.data);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            Swal.fire('Erreur', 'Impossible de charger les paramètres', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const tauxAgence = parseFloat(settings.taux_commission_agence);
        const tauxPlateforme = parseFloat(settings.taux_commission_plateforme);

        if (tauxAgence + tauxPlateforme > 100) {
            Swal.fire('Erreur', 'La somme des commissions ne peut pas dépasser 100%', 'error');
            return;
        }

        setSubmitting(true);
        try {
            const response = await agencyService.updateSettings({
                taux_commission_agence: tauxAgence,
                taux_commission_plateforme: tauxPlateforme,
                raison_sociale: settings.raison_sociale,
                ninea: settings.ninea,
                rccm: settings.rccm,
                adresse: settings.adresse
            });

            if (response.success) {
                Swal.fire('Succès', 'Paramètres mis à jour avec succès', 'success');
            }
        } catch (error) {
            console.error('Error updating settings:', error);
            Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de la mise à jour', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const tauxBailleur = 100 - parseFloat(settings.taux_commission_agence || 0) - parseFloat(settings.taux_commission_plateforme || 0);

    if (loading) {
        return <div className="p-12 text-center">Chargement...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8 text-primary-600" />
                <h1 className="text-3xl font-bold text-gray-900">Paramètres de l'Agence</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Settings className="h-5 w-5 mr-2 text-primary-600" />
                            Informations & Commissions
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-2">
                            Gérez les informations légales et les paramètres financiers de votre agence.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Legal Info Section */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="text-sm font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Identité et Légal</h4>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="raison_sociale">Raison Sociale</Label>
                                    <Input
                                        type="text"
                                        id="raison_sociale"
                                        name="raison_sociale"
                                        value={settings.raison_sociale}
                                        onChange={handleChange}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="adresse">Adresse</Label>
                                    <Input
                                        type="text"
                                        id="adresse"
                                        name="adresse"
                                        value={settings.adresse}
                                        onChange={handleChange}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ninea">NINEA</Label>
                                    <Input
                                        type="text"
                                        id="ninea"
                                        name="ninea"
                                        value={settings.ninea}
                                        onChange={handleChange}
                                        placeholder="Numéro d'Identification Nationale"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="rccm">RCCM</Label>
                                    <Input
                                        type="text"
                                        id="rccm"
                                        name="rccm"
                                        value={settings.rccm || ''}
                                        onChange={handleChange}
                                        placeholder="Registre du Commerce"
                                        className="mt-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Commission Settings Section */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h4 className="text-sm font-medium text-blue-900 mb-4 flex items-center border-b border-blue-200 pb-2">
                                <Percent className="h-4 w-4 mr-2" />
                                Configuration des Commissions
                            </h4>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="taux_commission_agence">Commission Agence (%)</Label>
                                    <div className="mt-1 relative">
                                        <Input
                                            type="number"
                                            id="taux_commission_agence"
                                            name="taux_commission_agence"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={settings.taux_commission_agence}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <Percent className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Votre commission sur chaque loyer
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor="taux_commission_plateforme">Commission Plateforme (%)</Label>
                                    <div className="mt-1 relative">
                                        <Input
                                            type="number"
                                            id="taux_commission_plateforme"
                                            name="taux_commission_plateforme"
                                            step="0.01"
                                            min="0"
                                            max="100"
                                            value={settings.taux_commission_plateforme}
                                            onChange={handleChange}
                                            required
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <Percent className="h-4 w-4 text-gray-400" />
                                        </div>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Commission de la plateforme Noor Immo
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-indigo-600" />
                                Répartition pour un loyer de 100 000 F
                            </h4>
                            <dl className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <dt className="text-xs text-gray-500">Agence</dt>
                                    <dd className="text-lg font-semibold text-indigo-600">
                                        {(100000 * (settings.taux_commission_agence / 100)).toLocaleString()} F
                                    </dd>
                                    <dd className="text-xs text-gray-500">{settings.taux_commission_agence}%</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500">Plateforme</dt>
                                    <dd className="text-lg font-semibold text-purple-600">
                                        {(100000 * (settings.taux_commission_plateforme / 100)).toLocaleString()} F
                                    </dd>
                                    <dd className="text-xs text-gray-500">{settings.taux_commission_plateforme}%</dd>
                                </div>
                                <div>
                                    <dt className="text-xs text-gray-500">Bailleur</dt>
                                    <dd className="text-lg font-semibold text-green-600">
                                        {(100000 * (tauxBailleur / 100)).toLocaleString()} F
                                    </dd>
                                    <dd className="text-xs text-gray-500">{tauxBailleur.toFixed(2)}%</dd>
                                </div>
                            </dl>
                        </div>

                        {tauxBailleur < 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">
                                    ⚠️ La somme des commissions dépasse 100%. Veuillez ajuster les valeurs.
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={submitting} disabled={tauxBailleur < 0}>
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
