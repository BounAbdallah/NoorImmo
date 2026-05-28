import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl text-center font-bold text-primary-700">Noor Immo</CardTitle>
                    <p className="text-center text-gray-500">Connectez-vous à votre espace</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="nom@exemple.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" isLoading={loading}>
                            Se connecter
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center flex-col space-y-2">
                    <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
                        Mot de passe oublié ?
                    </Link>
                    <div className="text-sm text-gray-500">
                        Pas encore de compte ? <Link to="/register" className="text-primary-600 hover:underline">S'inscrire</Link>
                    </div>
                </CardFooter>
            </Card>

            {/* Credentials Demo */}
            <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border text-xs">
                <p className="font-bold mb-2">Comptes de test :</p>
                <p>Bailleur: amadou.diop@diaspora.sn</p>
                <p>Agence: contact@immoplus.sn</p>
                <p>Mdp: password123</p>
            </div>
        </div>
    );
}
