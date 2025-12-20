import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
    const { user } = useAuth();

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
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nouveau mot de passe</Label>
                        <Input type="password" />
                    </div>
                    <Button variant="outline">Changer mot de passe</Button>
                </CardContent>
            </Card>

            {/* Section Permissions pour les membres d'équipe */}
            {user.permissions && Object.keys(user.permissions).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Mes Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
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
