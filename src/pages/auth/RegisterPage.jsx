import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { planService } from '../../services/planService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import Swal from 'sweetalert2';
import { Building, User, Mail, Lock, Phone, MapPin, FileText } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [searchParams] = useSearchParams();
    const planId = searchParams.get('plan');

    // Default to 'agence' if coming from pricing, else default or user choice
    // For now we focus on Agency registration flow as requested
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        password_confirmation: '',
        user_type: 'agence', // forcing agency for this specific flow
        raison_sociale: '',
        ninea: '',
        adresse: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Include plan_id in registration data if present
            const registrationData = {
                ...formData,
                plan_id: planId
            };

            const response = await register(registrationData);

            if (response.success) {
                Swal.fire({
                    title: 'Compte créé & Demande envoyée',
                    text: 'Votre compte a été créé et votre demande d\'abonnement a bien été transmise. Un administrateur vous contactera pour l\'activation.',
                    icon: 'success',
                    confirmButtonColor: '#0f172a'
                }).then(() => {
                    navigate('/login');
                });
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription. Vérifiez vos données.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-slate-900">
                        {planId ? 'Finalisez votre inscription' : 'Créer un compte Agence'}
                    </CardTitle>
                    <p className="text-slate-500">
                        {planId ? 'Créez votre compte pour valider votre demande d\'abonnement.' : 'Rejoignez la plateforme Bâti Yakaar.'}
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900 border-b pb-2">Informations Personnelles</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="prenom">Prénom</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="prenom" className="pl-9" value={formData.prenom} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="nom">Nom</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="nom" className="pl-9" value={formData.nom} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="email" type="email" className="pl-9" value={formData.email} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telephone">Téléphone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="telephone" className="pl-9" value={formData.telephone} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            {/* Agency Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-900 border-b pb-2">Informations Agence</h3>
                                <div className="space-y-2">
                                    <Label htmlFor="raison_sociale">Raison Sociale</Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="raison_sociale" className="pl-9" value={formData.raison_sociale} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ninea">NINEA</Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="ninea" className="pl-9" value={formData.ninea} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="adresse">Adresse Siège</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="adresse" className="pl-9" value={formData.adresse} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Security */}
                        <div className="pt-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Mot de passe</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="password" type="password" className="pl-9" value={formData.password} onChange={handleChange} required minLength={8} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirmer Mot de passe</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="password_confirmation" type="password" className="pl-9" value={formData.password_confirmation} onChange={handleChange} required minLength={8} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white" isLoading={loading}>
                            {load => load ? 'Création en cours...' : 'Créer mon compte'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center flex-col space-y-2 bg-slate-50 rounded-b-xl border-t">
                    <div className="text-sm text-slate-500">
                        Déjà un compte ? <a href="/login" className="text-blue-600 hover:underline font-medium">Se connecter</a>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
