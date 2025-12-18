import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { planService } from '../../services/planService';
import Swal from 'sweetalert2';
import { Building, User, Mail, Lock, Phone, MapPin, FileText, Check, ArrowRight, Loader, LayoutDashboard, Briefcase } from 'lucide-react';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [searchParams] = useSearchParams();
    const planIdParam = searchParams.get('plan');

    // State
    const [plans, setPlans] = useState([]);
    const [selectedPlanId, setSelectedPlanId] = useState(planIdParam ? parseInt(planIdParam) : null);
    const [loadingPlans, setLoadingPlans] = useState(true);

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
                const response = await planService.getAllPlans();
                if (response.success && Array.isArray(response.data)) {
                    setPlans(response.data);
                    if (planIdParam) {
                        setSelectedPlanId(parseInt(planIdParam));
                    }
                }
            } catch (error) {
                console.error("Failed to load plans", error);
            } finally {
                setLoadingPlans(false);
            }
        };
        fetchPlans();
    }, [planIdParam]);


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedPlanId) {
            setError('Veuillez sélectionner un plan ci-dessus.');
            return;
        }

        setLoading(true);

        try {
            const registrationData = { ...formData, plan_id: selectedPlanId };
            const response = await register(registrationData);

            if (response.success) {
                Swal.fire({
                    title: 'Compte créé avec succès !',
                    text: 'Votre demande a bien été reçue. Un administrateur va valider votre compte sous peu.',
                    icon: 'success',
                    confirmButtonColor: '#2563eb'
                }).then(() => {
                    navigate('/login');
                });
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Erreur lors de l\'inscription. Vérifiez vos données.');
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            {/* LEFT PANEL - Visual (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-primary-900 relative overflow-hidden flex-col justify-between p-12 text-white">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse"></div>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 relative z-10 w-fit">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                        <Building className="text-white h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold">
                        Noor<span className="text-primary-400">Immo</span>.
                    </span>
                </Link>

                {/* Content */}
                <div className="relative z-10 max-w-lg">
                    <h2 className="text-4xl font-bold mb-6 leading-tight">
                        Propulsez votre agence <br />
                        <span className="text-primary-400">vers le succès.</span>
                    </h2>
                    <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                        La solution complète pour digitaliser votre agence immobilière au Sénégal.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                                <LayoutDashboard className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold">Gestion Centralisée</h4>
                                <p className="text-sm text-slate-400">Tout vos biens et locataires au même endroit.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
                            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold">Outils Professionnels</h4>
                                <p className="text-sm text-slate-400">Quittances automatiques, contrats, états des lieux.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="relative z-10 text-sm text-slate-500">
                    &copy; 2025 Noor Immobilier. Tous droits réservés.
                </div>
            </div>

            {/* RIGHT PANEL - Form (Scrollable) */}
            <div className="w-full lg:w-1/2 h-screen overflow-y-auto bg-slate-50">
                <div className="min-h-full flex items-center justify-center p-6 lg:p-12">
                    <div className="w-full max-w-xl">

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <Building className="text-white h-6 w-6" />
                            </div>
                            <span className="text-2xl font-bold text-slate-900">
                                Noor<span className="text-primary-600">Immo</span>.
                            </span>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Créer un compte Agence</h1>
                            <p className="text-slate-600">Commencez votre essai gratuit aujourd'hui.</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5">!</div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-900">Erreur d'inscription</p>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* STEP 1: PLAN SELECTION */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs">1</span>
                                    Choisir une offre
                                </h3>

                                {loadingPlans ? (
                                    <div className="flex justify-center p-8"><Loader className="animate-spin text-primary-600" /></div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {plans.map((plan) => {
                                            const isSelected = selectedPlanId === plan.id;
                                            return (
                                                <div
                                                    key={plan.id}
                                                    onClick={() => setSelectedPlanId(plan.id)}
                                                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 relative ${isSelected
                                                        ? 'bg-primary-50 border-primary-600 shadow-lg shadow-primary-900/10'
                                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                                        }`}
                                                >
                                                    {isSelected && <div className="absolute top-2 right-2 text-primary-600"><Check className="w-4 h-4" /></div>}
                                                    <div className="font-bold text-slate-900 text-sm mb-1">{plan.nom}</div>
                                                    <div className="text-primary-600 font-extrabold text-lg mb-2">
                                                        {parseFloat(plan.prix_mensuel).toLocaleString('fr-FR')} <span className="text-xs font-normal text-slate-500">F</span>
                                                    </div>
                                                    {/* Compact feature list for sidebar */}
                                                    <div className="text-xs text-slate-500 line-clamp-2">
                                                        {(plan.fonctionnalites || []).join(', ')}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>


                            {/* STEP 2: AGENCY INFO */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span>
                                    Identité
                                </h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700">Prénom</label>
                                            <input id="prenom" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" value={formData.prenom} onChange={handleChange} required placeholder="Votre prénom" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700">Nom</label>
                                            <input id="nom" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" value={formData.nom} onChange={handleChange} required placeholder="Votre nom" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700">Email Professionnel</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="email" id="email" className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" value={formData.email} onChange={handleChange} required placeholder="nom@agence.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input id="telephone" className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" value={formData.telephone} onChange={handleChange} required placeholder="77 000 00 00" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 3: COMPANY INFO */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">3</span>
                                    Société
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700">Raison Sociale</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input id="raison_sociale" className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" value={formData.raison_sociale} onChange={handleChange} required placeholder="Nom de votre agence" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700">NINEA</label>
                                            <input id="ninea" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" value={formData.ninea} onChange={handleChange} required placeholder="Identification" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-700">Adresse</label>
                                            <input id="adresse" className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" value={formData.adresse} onChange={handleChange} required placeholder="Siège social" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STEP 4: PASSWORD */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">4</span>
                                    Sécurité
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700">Mot de passe</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="password" id="password" className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" value={formData.password} onChange={handleChange} required minLength={8} placeholder="8+ caractères" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-700">Confirmation</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input type="password" id="password_confirmation" className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all" value={formData.password_confirmation} onChange={handleChange} required minLength={8} placeholder="Répéter" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 
                                         text-white rounded-xl font-semibold shadow-lg shadow-primary-900/20
                                         hover:shadow-xl hover:shadow-primary-900/30 hover:-translate-y-0.5
                                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                         transition-all duration-200 flex items-center justify-center gap-2 text-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        <span>Validation...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Créer mon compte</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            <div className="text-center">
                                <span className="text-sm text-slate-500">Vous avez déjà un compte ?</span>
                                <Link to="/login" className="ml-1 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors">
                                    Se connecter
                                </Link>
                            </div>

                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
}
