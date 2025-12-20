import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { planService } from '../../services/planService';
import { Check, Star, ShieldCheck, Zap, Users, Building } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export default function PricingPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const response = await planService.getAllPlans();
            if (response.success) {
                const formattedPlans = response.data.map(plan => {
                    let features = [];
                    try {
                        const rawFeatures = plan.fonctionnalites;
                        if (typeof rawFeatures === 'string') {
                            features = JSON.parse(rawFeatures);
                        } else if (Array.isArray(rawFeatures)) {
                            features = rawFeatures;
                        }
                    } catch (e) {
                        console.error("Error parsing features for plan:", plan.nom, e);
                    }
                    return { ...plan, fonctionnalites: features };
                });
                setPlans(formattedPlans);
            }
        } catch (error) {
            console.error("Error loading plans:", error);
            Swal.fire('Erreur', 'Impossible de charger les plans.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (plan) => {
        if (!user) {
            navigate(`/register?plan=${plan.id}`);
            return;
        }

        if (user.user_type !== 'agence') {
            Swal.fire({
                title: 'Accès restreint',
                text: 'Seules les Agences peuvent souscrire à un abonnement. Voulez-vous créer un compte Agence ?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Oui, créer un compte Agence',
                cancelButtonText: 'Annuler',
                confirmButtonColor: '#0f172a'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/register');
                }
            });
            return;
        }

        navigate(`/register?plan=${plan.id}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getPlanIcon = (index) => {
        const icons = [ShieldCheck, Zap, Star];
        return icons[index % icons.length];
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200 py-4">
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                            <Building className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-slate-900 transition-colors">
                            Noor<span className="text-blue-500">Immo</span>.
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8">
                        <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-500 transition-colors">
                            Accueil
                        </Link>
                        <Link to="/pricing" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                            Tarifs
                        </Link>
                        <Link to="/contact" className="text-sm font-medium text-slate-600 hover:text-blue-500 transition-colors">
                            Contact
                        </Link>
                        <div className="h-4 w-px bg-slate-300"></div>
                        <Link to="/login" className="text-sm font-semibold text-slate-900 hover:text-blue-500 transition-colors">
                            Connexion
                        </Link>
                        <Link
                            to="/register"
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
                        >
                            Commencer gratuitement
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="pt-24 px-4 sm:px-6 lg:px-8 py-20">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3">Tarification Flexible</h2>
                        <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl mb-6 leading-tight">
                            Investissez dans votre <span className="text-blue-600">Croissance</span>
                        </h1>
                        <p className="text-xl text-slate-600 leading-relaxed">
                            Des solutions sur mesure pour les professionnels de l'immobilier. Choisissez l'excellence.
                        </p>
                    </div>

                    {/* Plans Grid */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                            {plans.map((plan, index) => {
                                const Icon = getPlanIcon(index);
                                const isPopular = index === 1;

                                return (
                                    <div
                                        key={plan.id}
                                        className={cn(
                                            "relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2",
                                            isPopular && "ring-2 ring-blue-600"
                                        )}
                                    >
                                        {isPopular && (
                                            <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                                                POPULAIRE
                                            </div>
                                        )}

                                        <div className="p-8">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-3 bg-blue-100 rounded-lg">
                                                        <Icon className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold text-slate-900">{plan.nom}</h3>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-extrabold text-slate-900">
                                                        {formatPrice(plan.prix_mensuel)}
                                                    </span>
                                                    <span className="text-slate-500">/mois</span>
                                                </div>
                                            </div>

                                            <p className="text-slate-600 mb-6">{plan.description}</p>

                                            <ul className="space-y-3 mb-8">
                                                <li className="flex items-center gap-3">
                                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span className="text-slate-700">
                                                        {plan.limite_utilisateurs === -1 ? 'Utilisateurs illimités' : `${plan.limite_utilisateurs} utilisateurs`}
                                                    </span>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                    <span className="text-slate-700">
                                                        {plan.limite_biens === -1 ? 'Biens illimités' : `${plan.limite_biens} biens`}
                                                    </span>
                                                </li>
                                                {Array.isArray(plan.fonctionnalites) && plan.fonctionnalites.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-3">
                                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                        <span className="text-slate-700">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <button
                                                onClick={() => handleSubscribe(plan)}
                                                className={cn(
                                                    "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300",
                                                    isPopular
                                                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                                                        : "bg-slate-100 text-slate-900 hover:bg-slate-200"
                                                )}
                                            >
                                                Choisir ce plan
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Custom Plan CTA */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-8 md:p-12 text-center text-white">
                        <h2 className="text-3xl font-bold mb-4">Besoin d'un plan personnalisé ?</h2>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                            Contactez-nous pour créer une solution sur mesure adaptée à vos besoins spécifiques
                        </p>
                        <Link
                            to="/custom-plan-request"
                            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                        >
                            <Users className="w-5 h-5" />
                            Demander un plan personnalisé
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
