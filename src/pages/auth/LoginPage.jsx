import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Check, ArrowRight, User, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// --- COMPOSANTS UI ---

const Logo = ({ className = "" }) => (
    <div className={`flex items-center gap-3 select-none ${className}`}>
        <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-40"></div>
            {/* <div className="relative w-full h-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-xl border border-blue-500/30 flex items-center justify-center shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 text-white">
                    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M5 21V7L12 3L19 7V21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M9 21V11L12 9.5L15 11V21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M12 14V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div> */}
        </div>
        <div className="flex flex-col justify-center">
            <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                Noor<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Immo</span>
            </span>
        </div>
    </div>
);

// Visualisation CSS pur du Dashboard pour éviter les images
const AbstractDashboard = () => (
    <div className="w-full aspect-[16/10] bg-[#0f172a] rounded-xl border border-white/10 relative overflow-hidden p-4 flex flex-col gap-4 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="w-24 h-2 bg-white/10 rounded-full"></div>
            <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-white/5"></div>
                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30"></div>
            </div>
        </div>
        {/* Content */}
        <div className="grid grid-cols-12 gap-4 h-full">
            {/* Sidebar */}
            <div className="col-span-3 space-y-2 border-r border-white/5 pr-2">
                <div className="h-6 w-full bg-blue-600/20 rounded border border-blue-500/20"></div>
                <div className="h-3 w-3/4 bg-white/5 rounded"></div>
                <div className="h-3 w-1/2 bg-white/5 rounded"></div>
            </div>
            {/* Charts */}
            <div className="col-span-9 flex flex-col gap-3">
                <div className="flex gap-3">
                    <div className="h-16 flex-1 bg-white/5 rounded-lg border border-white/5 p-2">
                        <div className="w-6 h-6 bg-green-500/20 rounded mb-2"></div>
                        <div className="w-12 h-1.5 bg-white/20 rounded"></div>
                    </div>
                    <div className="h-16 flex-1 bg-white/5 rounded-lg border border-white/5 p-2">
                        <div className="w-6 h-6 bg-blue-500/20 rounded mb-2"></div>
                        <div className="w-12 h-1.5 bg-white/20 rounded"></div>
                    </div>
                </div>
                <div className="flex-1 bg-white/5 rounded-lg border border-white/5 flex items-end justify-between px-3 pb-2 gap-1 relative overflow-hidden">
                    {/* Bars */}
                    <div className="w-full bg-white/10 rounded-t-sm h-[30%]"></div>
                    <div className="w-full bg-white/10 rounded-t-sm h-[50%]"></div>
                    <div className="w-full bg-blue-500 rounded-t-sm h-[80%] shadow-[0_0_15px_rgba(59,130,246,0.4)] animate-pulse"></div>
                    <div className="w-full bg-white/10 rounded-t-sm h-[40%]"></div>
                    <div className="w-full bg-white/10 rounded-t-sm h-[60%]"></div>
                </div>
            </div>
        </div>
    </div>
);

export default function LoginPage() {
    const [loginIdentifier, setLoginIdentifier] = useState('');
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
            await login(loginIdentifier, password);
            if (rememberMe) {
                localStorage.setItem('remember_login', loginIdentifier);
            }
            // Force full page reload to ensure all state is fresh
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.response?.data?.message || 'Identifiants incorrects');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex font-sans selection:bg-blue-500 selection:text-white overflow-hidden text-slate-200">

            {/* LEFT PANEL - Visual & Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] border-r border-white/5 flex-col justify-between p-12 overflow-hidden">

                {/* Background Textures */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/10 via-transparent to-indigo-900/10"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>

                {/* Header */}
                <Link to="/" className="relative z-10 w-fit block hover:opacity-80 transition-opacity">
                    <Logo />
                </Link>

                {/* Main Content (Carousel) */}
                <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">

                    {/* Floating Card */}
                    <div className="relative group perspective-1000 mb-12">
                        {/* Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                        <div className="card-glass p-6 rounded-2xl bg-[#0f172a]/80 backdrop-blur-xl border-white/10 relative">
                            <AbstractDashboard />

                            {/* Floating Stat Badge */}
                            <div className="absolute -bottom-6 -right-6 bg-[#050505] border border-white/10 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-float">
                                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <ArrowRight className="w-5 h-5 text-green-500 -rotate-45" />
                                </div>
                                <div>
                                    <div className="text-xl font-black text-white leading-none mb-1">
                                        {testimonials[currentSlide].stat}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        {testimonials[currentSlide].statLabel}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonials Text */}
                    <div className="transition-all duration-500 ease-in-out pl-4 border-l-2 border-blue-500/30">
                        <p className="text-xl text-slate-300 mb-6 leading-relaxed italic">
                            "{testimonials[currentSlide].quote}"
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner">
                                {testimonials[currentSlide].author.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-white text-sm">
                                    {testimonials[currentSlide].author}
                                </div>
                                <div className="text-xs text-blue-400 font-medium">
                                    {testimonials[currentSlide].role}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dots */}
                    <div className="flex gap-2 mt-8">
                        {testimonials.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Footer Trust */}
                <div className="relative z-10 flex gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-blue-500" /> Sécurisé SSL
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-blue-500" /> Support 24/7
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
                {/* Mobile Back Button */}
                <Link to="/" className="lg:hidden absolute top-6 left-6 p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>

                <div className="w-full max-w-sm space-y-8">

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Logo />
                    </div>

                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Bon retour.</h1>
                        <p className="text-slate-400 text-sm">Connectez-vous pour piloter votre agence.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Error Alert */}
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-reveal">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-red-400 uppercase tracking-wide">Erreur de connexion</p>
                                    <p className="text-sm text-slate-300 mt-0.5">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email ou Téléphone</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Email ou N° de téléphone"
                                        className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        value={loginIdentifier}
                                        onChange={(e) => setLoginIdentifier(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mot de passe</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-3.5 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-slate-600 group-hover:border-slate-500'}`}>
                                    {rememberMe && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Se souvenir</span>
                            </label>
                            <Link to="/forgot-password" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Se connecter</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-4 bg-[#050505] text-slate-600 font-bold">Ou</span>
                            </div>
                        </div>

                        <Link
                            to="/register"
                            className="w-full py-4 bg-white/[0.03] border border-white/10 text-slate-300 rounded-xl font-bold hover:bg-white/[0.05] hover:border-white/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            <User className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                            <span>Créer une agence</span>
                        </Link>
                    </form>
                </div>
            </div>
        </div>
    );
}