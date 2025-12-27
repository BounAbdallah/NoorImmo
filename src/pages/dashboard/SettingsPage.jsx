import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

export default function SettingsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordUpdate = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Veuillez remplir tous les champs',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Les nouveaux mots de passe ne correspondent pas',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        if (newPassword.length < 8) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: 'Le mot de passe doit contenir au moins 8 caractères',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        try {
            setLoading(true);
            await api.put('/user/password', {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword
            });

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Mot de passe modifié avec succès',
                showConfirmButton: false,
                timer: 3000
            });

            // Clear fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: error.response?.data?.message || "Erreur lors de la modification du mot de passe",
                showConfirmButton: false,
                timer: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div>Chargement...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Profil Utilisateur ({user.user_type})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Prénom</Label>
                            <Input defaultValue={user.prenom} />
                        </div>
                        <div className="space-y-2">
                            <Label>Nom</Label>
                            <Input defaultValue={user.nom} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input defaultValue={user.email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input defaultValue={user.telephone} />
                    </div>
                    <Button>Enregistrer</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Sécurité</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Mot de passe actuel</Label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nouveau mot de passe</Label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirmer le mot de passe</Label>
                            <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={handlePasswordUpdate}
                            disabled={loading}
                        >
                            {loading ? 'Modification...' : 'Changer mot de passe'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Section Permissions pour les membres d'équipe */}
            {user.permissions && Object.keys(user.permissions).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Mes Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {user.employeur_agence && (
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                <h3 className="text-sm font-semibold text-blue-900 mb-1">Information Agence</h3>
                                <p className="text-sm text-blue-800">
                                    <span className="font-medium">Agence:</span> {user.employeur_agence.raison_sociale}
                                </p>
                                {user.employeur_agence.user && (
                                    <p className="text-sm text-blue-800 mt-1">
                                        <span className="font-medium">Invité par:</span> {user.employeur_agence.user.nom} {user.employeur_agence.user.prenom}
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(user.permissions).map(([module, dbActions]) => {
                                // dbActions peut être un objet { create: true, ... } ou un tableau de strings
                                // Pour l'affichage, on transforme tout en tableau de clés actives
                                let activeActions = [];
                                if (Array.isArray(dbActions)) {
                                    activeActions = dbActions;
                                } else if (typeof dbActions === 'object' && dbActions !== null) {
                                    activeActions = Object.keys(dbActions).filter(k => dbActions[k]);
                                }

                                if (activeActions.length === 0) return null;

                                return (
                                    <div key={module} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <h3 className="font-bold text-gray-700 capitalize mb-2">{module}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {activeActions.map(action => (
                                                <span key={action} className="px-2 py-1 bg-white border border-gray-200 text-xs text-gray-600 rounded-md shadow-sm">
                                                    {action === 'view' ? 'Lecture' :
                                                        action === 'create' ? 'Création' :
                                                            action === 'edit' ? 'Modification' :
                                                                action === 'delete' ? 'Suppression' : action}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
