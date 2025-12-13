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
        </div>
    );
}
