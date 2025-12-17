import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../../services/planService';
import { Check, Star, ShieldCheck, Zap, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export default function PricingPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [billingCycle, setBillingCycle] = useState('monthly'); // Just UI for now
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const response = await planService.getAllPlans();
            if (response.success) {
                // Sort plans by price usually, assuming backend returns them.
                setPlans(response.data);
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
            // Redirect to registration with plan context
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
                    // Logout then redirect to register with plan
                    localStorage.removeItem('token');
                    window.location.href = `/register?plan=${plan.id}`;
                }
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Confirmer la demande',
            html: `Vous souhaitez souscrire au pack <b>${plan.nom}</b>.<br/>Un administrateur recevra votre demande et vous contactera pour le paiement.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Envoyer ma demande',
            confirmButtonColor: '#0f172a',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                // Assuming 12 months for now as per current mock, or just pass 1 for monthly cycle context if needed
                const response = await planService.subscribe(plan.id, billingCycle === 'yearly' ? 12 : 1);
                if (response.success) {
                    Swal.fire({
                        title: 'Demande envoyée !',
                        text: response.message,
                        icon: 'success',
                        confirmButtonColor: '#0f172a'
                    });
                    navigate('/dashboard');
                }
            } catch (error) {
                Swal.fire('Oups', error.response?.data?.message || 'Erreur inconnue.', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-slate-900 mb-4"></div>
                    <p className="text-slate-600 font-medium tracking-wide">Chargement des offres...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-blue-600 font-bold tracking-widest uppercase text-xs mb-3">Tarification Flexible</h2>
                    <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl mb-6 leading-tight">
                        Investissez dans votre <span className="text-blue-600">Croissance</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        Des solutions sur mesure pour les professionnels de l'immobilier.
                        <br />Choisissez l'excellence.
                    </p>

                    {/* Toggle UI */}
                    <div className="mt-10 flex justify-center items-center space-x-4 bg-white p-1 rounded-full shadow-sm inline-flex border border-slate-200">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={cn("px-6 py-2 rounded-full text-sm font-semibold transition-all", billingCycle === 'monthly' ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900")}
                        >
                            Mensuel
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={cn("px-6 py-2 rounded-full text-sm font-semibold transition-all flex items-center", billingCycle === 'yearly' ? "bg-slate-900 text-white shadow-md" : "text-slate-600 hover:text-slate-900")}
                        >
                            Annuel <span className="ml-2 bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">-10%</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:gap-10 lg:grid-cols-3 items-stretch">
                    {plans.map((plan, index) => {
                        const isPopular = index === 1; // Middle plan highlighted
                        return (
                            <div
                                key={plan.id}
                                className={cn(
                                    "relative rounded-3xl p-8 flex flex-col transition-all duration-300",
                                    isPopular
                                        ? "bg-slate-900 text-white shadow-2xl scale-105 z-10 ring-1 ring-slate-800"
                                        : "bg-white text-slate-900 shadow-xl border border-slate-100 hover:shadow-2xl hover:-translate-y-1"
                                )}
                            >
                                {isPopular && (
                                    <div className="absolute top-0 right-0 -mt-3 -mr-3">
                                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg uppercase tracking-wider">
                                            Le Plus Populaire
                                        </span>
                                    </div>
                                )}

                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className={cn("text-lg font-bold uppercase tracking-wider", isPopular ? "text-blue-400" : "text-slate-900")}>
                                                {plan.nom}
                                            </h3>
                                            <p className={cn("mt-2 text-sm", isPopular ? "text-slate-400" : "text-slate-500")}>
                                                {plan.description}
                                            </p>
                                        </div>
                                        {isPopular ? <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" /> : <ShieldCheck className="h-6 w-6 text-slate-300" />}
                                    </div>

                                    <div className="mt-8 flex items-baseline">
                                        <span className="text-5xl font-extrabold tracking-tight">
                                            {parseFloat(plan.prix_mensuel).toLocaleString('fr-FR')}
                                        </span>
                                        <span className={cn("ml-2 text-sm font-medium", isPopular ? "text-slate-400" : "text-slate-500")}>
                                            FCFA / mois
                                        </span>
                                    </div>

                                    <ul className="mt-8 space-y-4">
                                        <li className="flex items-center">
                                            <Check className={cn("h-5 w-5 flex-shrink-0", isPopular ? "text-blue-400" : "text-blue-600")} />
                                            <span className={cn("ml-3 text-sm", isPopular ? "text-slate-300" : "text-slate-600")}>
                                                Jusqu'à <strong className={isPopular ? "text-white" : "text-slate-900"}>{plan.limite_biens}</strong> biens
                                            </span>
                                        </li>
                                        <li className="flex items-center">
                                            <Users className={cn("h-5 w-5 flex-shrink-0", isPopular ? "text-blue-400" : "text-blue-600")} />
                                            <span className={cn("ml-3 text-sm", isPopular ? "text-slate-300" : "text-slate-600")}>
                                                <strong className={isPopular ? "text-white" : "text-slate-900"}>{plan.limite_utilisateurs}</strong> utilisateurs
                                            </span>
                                        </li>
                                        {plan.fonctionnalites && Array.isArray(plan.fonctionnalites) && plan.fonctionnalites.map((feature, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <Check className={cn("h-5 w-5 flex-shrink-0 mt-0.5", isPopular ? "text-blue-400" : "text-blue-600")} />
                                                <span className={cn("ml-3 text-sm", isPopular ? "text-slate-300" : "text-slate-600")}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => handleSubscribe(plan)}
                                    className={cn(
                                        "mt-8 w-full py-4 px-6 rounded-xl font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                                        isPopular
                                            ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-900/20"
                                            : "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500"
                                    )}
                                >
                                    Demander ce plan
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-20 text-center border-t border-slate-200 pt-10">
                    <p className="text-slate-500 mb-4">Besoin d'une solution personnalisée pour un grand réseau ?</p>
                    <button className="text-slate-900 font-bold hover:text-blue-600 flex items-center justify-center mx-auto transition-colors">
                        <Zap className="h-4 w-4 mr-2" />
                        Contacter notre équipe commerciale
                    </button>
                </div>
            </div>
        </div>
    );
}
