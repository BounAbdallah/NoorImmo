import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { planService } from '../../services/planService';
import Swal from 'sweetalert2';
import {
    Building, Mail, Lock, Phone, Check, ArrowRight, Loader,
    LayoutDashboard, Briefcase, Sparkles, AlertTriangle, ArrowLeft
} from 'lucide-react';

// Composant Logo (Réutilisé pour la cohérence)
const Logo = () => (
    <div className="flex items-center gap-3 select-none">
     
        <div className="flex flex-col justify-center">
            <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                Noor<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Immo</span>
            </span>
        </div>
    </div>
);

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [searchParams] = useSearchParams();
    const planIdParam = searchParams.get('plan');
    const tokenParam = searchParams.get('token');

    // State
    const [plans, setPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [plansLoading, setPlansLoading] = useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [tokenValidated, setTokenValidated] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [privatePlan, setPrivatePlan] = useState(null);

    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        password_confirmation: '',
        user_type: 'agence',
        raison_sociale: '',
        ninea: '',
        adresse: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Load plans on mount
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Logic for private plans (Mocked validation for now if needed, or using service)
                /* 
                   Note: planService.validateToken implementation is assumed based on old code.
                   If not present in current planService, this block might need adjustment.
                   For now, we follow the structure provided.
                */

                // Fetch public plans
                const response = await planService.getAllPlans();
                if (response.success) {
                    setPlans(response.data);
                    if (planIdParam && !tokenParam) {
                        setSelectedPlanId(parseInt(planIdParam));
                    }
                }
            } catch (error) {
                console.error('Error fetching plans:', error);
            } finally {
                setPlansLoading(false);
            }
        };
        fetchPlans();
    }, [planIdParam, tokenParam]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedPlanId) {
            setError('Veuillez sélectionner un plan ci-dessus.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);

        try {
            const registrationData = { ...formData, plan_id: selectedPlanId };
            const response = await register(registrationData);

            if (response.success) {
                Swal.fire({
                    title: 'Compte créé !',
                    text: 'Votre demande a bien été reçue. Bienvenue sur Noor Immo.',
                    icon: 'success',
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonColor: '#2563eb'
                }).then(() => {
                    navigate('/login');
                });
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription. Vérifiez vos données.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex font-sans selection:bg-blue-500 selection:text-white text-slate-200">

            {/* LEFT PANEL - Visual (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-5/12 bg-[#0a0a0a] border-r border-white/5 relative overflow-hidden flex-col justify-between p-12">
                {/* Effects */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>

                {/* Header */}
                <Link to="/" className="relative z-10 w-fit block hover:opacity-80 transition-opacity">
                    <Logo />
                </Link>

                {/* Content */}
                <div className="relative z-10 max-w-lg">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3 h-3" /> Rejoignez l'élite
                    </div>
                    <h2 className="text-4xl font-black mb-6 leading-tight text-white">
                        Propulsez votre agence <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">vers le succès.</span>
                    </h2>
                    <p className="text-lg text-slate-400 mb-10 leading-relaxed font-medium">
                        La solution complète pour digitaliser votre agence immobilière au Sénégal. Rejoignez nous.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Gestion Centralisée</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Tout vos biens et locataires au même endroit.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/[0.03] rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">Outils Professionnels</h4>
                                <p className="text-xs text-slate-400 mt-0.5">Quittances automatiques, contrats, états des lieux.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="relative z-10 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    &copy; 2025 Noor Immobilier. Tous droits réservés.
                </div>
            </div>

            {/* RIGHT PANEL - Form (Scrollable) */}
            <div className="w-full lg:w-7/12 h-screen overflow-y-auto bg-[#050505] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="min-h-full flex items-center justify-center p-6 lg:p-16">
                    <div className="w-full max-w-2xl relative">

                        {/* Mobile Logo / Back */}
                        <div className="lg:hidden flex justify-between items-center mb-8">
                            <Link to="/" className="p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <Logo />
                            <div className="w-9"></div> {/* Spacer */}
                        </div>

                        <div className="mb-10 text-center lg:text-left">
                            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Créer un compte Agence</h1>
                            <p className="text-slate-400">Commencez votre essai gratuit de 14 jours aujourd'hui.</p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-reveal">
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-red-400 uppercase tracking-wide">Erreur d'inscription</p>
                                    <p className="text-sm text-slate-300 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-12">

                            {/* STEP 1: PLAN SELECTION */}
                            <div>
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px]">01</span>
                                    Choisir une offre
                                </h3>

                                {plansLoading ? (
                                    <div className="flex justify-center p-8"><Loader className="animate-spin text-blue-500 w-8 h-8" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {plans.map((plan) => {
                                            const isSelected = selectedPlanId === plan.id;
                                            return (
                                                <div
                                                    key={plan.id}
                                                    onClick={() => setSelectedPlanId(plan.id)}
                                                    className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative group flex flex-col h-full ${isSelected
                                                        ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_30px_rgba(37,99,235,0.15)]'
                                                        : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                                                        }`}
                                                >
                                                    {isSelected && (
                                                        <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                    <div className={`font-bold text-sm mb-2 uppercase tracking-wide ${isSelected ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                                        {plan.nom}
                                                    </div>
                                                    <div className="text-white font-black text-2xl mb-4 tracking-tight">
                                                        {parseFloat(plan.prix_mensuel).toLocaleString('fr-FR')} <span className="text-xs font-bold text-slate-500">F</span>
                                                    </div>

                                                    {/* Feature preview */}
                                                    <div className="mt-auto pt-4 border-t border-white/5">
                                                        <div className="text-[10px] font-medium text-slate-500 leading-relaxed">
                                                            {(() => {
                                                                try {
                                                                    const raw = plan.fonctionnalites;
                                                                    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
                                                                    return Array.isArray(arr) ? arr.slice(0, 3).join(' • ') + (arr.length > 3 ? '...' : '') : '';
                                                                } catch (e) { return 'Fonctionnalités standards'; }
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                                <div className="mt-4 text-right">
                                    <Link
                                        to="/custom-plan-request"
                                        className="text-xs font-bold text-blue-400 hover:text-white transition-colors border-b border-blue-400/30 hover:border-white pb-0.5"
                                    >
                                        Besoin d'un plan sur mesure ?
                                    </Link>
                                </div>
                            </div>


                            {/* STEP 2: AGENCY INFO */}
                            <div>
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-md bg-white/10 text-white flex items-center justify-center text-[10px]">02</span>
                                    Identité
                                </h3>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Prénom</label>
                                            <input
                                                id="prenom"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.prenom}
                                                onChange={handleChange}
                                                required
                                                placeholder="Votre prénom"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nom</label>
                                            <input
                                                id="nom"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.nom}
                                                onChange={handleChange}
                                                required
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Pro</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="email"
                                                id="email"
                                                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                placeholder="nom@agence.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Téléphone</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                id="telephone"
                                                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                                required
                                                placeholder="77 000 00 00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 3: COMPANY INFO */}
                            <div>
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-md bg-white/10 text-white flex items-center justify-center text-[10px]">03</span>
                                    Société
                                </h3>
                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Raison Sociale</label>
                                        <div className="relative group">
                                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                id="raison_sociale"
                                                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.raison_sociale}
                                                onChange={handleChange}
                                                required
                                                placeholder="Nom de votre agence"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">NINEA</label>
                                            <input
                                                id="ninea"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.ninea}
                                                onChange={handleChange}
                                                required
                                                placeholder="Identification"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Adresse</label>
                                            <input
                                                id="adresse"
                                                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.adresse}
                                                onChange={handleChange}
                                                required
                                                placeholder="Siège social"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 4: PASSWORD */}
                            <div>
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-md bg-white/10 text-white flex items-center justify-center text-[10px]">04</span>
                                    Sécurité
                                </h3>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Mot de passe</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="password"
                                                id="password"
                                                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                                minLength={8}
                                                placeholder="8+ caractères"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Confirmation</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="password"
                                                id="password_confirmation"
                                                className="w-full pl-12 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                                value={formData.password_confirmation}
                                                onChange={handleChange}
                                                required
                                                minLength={8}
                                                placeholder="Répéter"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 
                                            text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-600/20
                                            hover:shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99]
                                            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                            transition-all duration-300 flex items-center justify-center gap-3 group"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            <span>Configuration en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Créer mon compte</span>
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>

                                <div className="mt-6 text-center">
                                    <span className="text-sm text-slate-500">Vous avez déjà un compte ?</span>
                                    <Link to="/login" className="ml-2 text-sm font-bold text-blue-400 hover:text-white transition-colors">
                                        Se connecter
                                    </Link>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}