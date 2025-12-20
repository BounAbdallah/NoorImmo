import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Building, Check, TrendingUp, Users, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const { login } = useAuth();
    const navigate = useNavigate();

    // Carousel auto-rotate
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 3);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const testimonials = [
        {
            quote: "Un gain de temps phénoménal. Mes quittances partent toutes seules.",
            author: "Moussa Diop",
            role: "Gestionnaire d'Agence",
            stat: "98%",
            statLabel: "Taux de recouvrement"
        },
        {
            quote: "Enfin je vois clair dans mes revenus locatifs. Transparence totale.",
            author: "Fatou Sow",
            role: "Directrice Agence",
            stat: "+50%",
            statLabel: "Gain de temps"
        },
        {
            quote: "Interface intuitive, équipe réactive. Parfait pour notre agence.",
            author: "Jean Gomis",
            role: "Responsable Patrimoine",
            stat: "1200+",
            statLabel: "Utilisateurs actifs"
        }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            if (rememberMe) {
                localStorage.setItem('remember_email', email);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* LEFT PANEL - Visual */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                {/* Animated Blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"></div>

                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                            <Building className="text-white h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold">
                            Noor<span className="text-primary-400">Immo</span>.
                        </span>
                    </Link>

                    {/* Carousel Content */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="max-w-lg">
                            {/* Dashboard Screenshot Placeholder */}
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 mb-8 shadow-2xl">
                                <div className="aspect-video bg-gradient-to-br from-primary-900/50 to-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                                    <img
                                        src="/images/dashboard_banner.png"
                                        alt="Dashboard"
                                        className="w-full h-full object-cover opacity-80"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.innerHTML = '<div class="text-slate-400 text-center"><Building class="w-16 h-16 mx-auto mb-4" /><p>Tableau de Bord</p></div>';
                                        }}
                                    />
                                    {/* Floating stat badge */}
                                    <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-lg">
                                        <div className="text-2xl font-bold text-green-400">
                                            {testimonials[currentSlide].stat}
                                        </div>
                                        <div className="text-xs text-slate-300">
                                            {testimonials[currentSlide].statLabel}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Testimonial Carousel */}
                            <div className="transition-all duration-500 ease-in-out">
                                <p className="text-xl text-slate-300 mb-6 leading-relaxed italic">
                                    "{testimonials[currentSlide].quote}"
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-full flex items-center justify-center font-bold text-slate-900 text-lg">
                                        {testimonials[currentSlide].author.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">
                                            {testimonials[currentSlide].author}
                                        </div>
                                        <div className="text-sm text-slate-400">
                                            {testimonials[currentSlide].role}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Carousel dots */}
                            <div className="flex gap-2 mt-8 justify-center">
                                {testimonials.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-primary-400' : 'w-2 bg-slate-600'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-8 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Sécurisé SSL</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>Support 24/7</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span>1200+ Utilisateurs</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                            <Building className="text-white h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold text-slate-900">
                            Noor<span className="text-primary-600">Immo</span>.
                        </span>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">
                            Bon retour !
                        </h1>
                        <p className="text-slate-600">
                            Connectez-vous pour accéder à votre espace
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                                    !
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-900">Erreur de connexion</p>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                                Adresse email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="nom@exemple.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl 
                                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                             transition-all duration-200 text-slate-900 placeholder-slate-400"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 bg-white border border-slate-300 rounded-xl 
                                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                             transition-all duration-200 text-slate-900 placeholder-slate-400"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-primary-600 
                                             focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                                />
                                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                    Se souvenir de moi
                                </span>
                            </label>
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                            >
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 
                                     text-white rounded-xl font-semibold shadow-lg shadow-primary-900/20
                                     hover:shadow-xl hover:shadow-primary-900/30 hover:-translate-y-0.5
                                     disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                     transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Connexion en cours...</span>
                                </>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-slate-50 text-slate-500">Nouveau sur Noor-Immo ?</span>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <Link
                            to="/register"
                            className="w-full py-3.5 border-2 border-slate-300 text-slate-700 rounded-xl 
                                     font-semibold hover:bg-white hover:border-primary-300 hover:text-primary-700
                                     transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <Users className="w-5 h-5" />
                            <span>Créer un compte</span>
                        </Link>
                    </form>

                    {/* Demo Credentials (Dev Mode Only) */}

                </div>
            </div>
        </div>
    );
}
