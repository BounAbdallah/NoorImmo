import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { planService } from '../../services/planService';
import {
    Check, ArrowRight, Building, Menu, X, Star,
    Shield, BarChart3, Users, Clock, Home, Zap
} from 'lucide-react';

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [stats, setStats] = useState({ users: 0, properties: 0, rate: 0 });
    const [pricingPlans, setPricingPlans] = useState([]);

    // --- EFFECTS ---

    // 1. Scroll Handler for Sticky Navbar
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 2. Load Pricing Plans from API
    useEffect(() => {
        const loadPlans = async () => {
            try {
                const response = await planService.getAllPlans();
                if (response.success && Array.isArray(response.data)) {
                    const mappedPlans = response.data.slice(0, 3).map((plan, index) => ({
                        id: plan.id,
                        name: plan.nom,
                        price: parseFloat(plan.prix_mensuel).toLocaleString('fr-FR'),
                        period: '/mois',
                        features: plan.fonctionnalites || [],
                        cta: index === 0 ? 'Commencer' : 'Essai 14 jours',
                        // Highlight the middle plan (Standard) for better UX flow
                        highlighted: index === 1
                    }));
                    setPricingPlans(mappedPlans);
                }
            } catch (error) {
                console.error("Failed to load plans:", error);
                // Fallback in case of API error to avoid white screen
                setPricingPlans([]);
            }
        };
        loadPlans();
    }, []);

    // 3. Animated Statistics
    useEffect(() => {
        const duration = 2000;
        const targets = { users: 1500, properties: 8000, rate: 99 };
        const start = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - start) / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            setStats({
                users: Math.floor(targets.users * easeOutQuart),
                properties: Math.floor(targets.properties * easeOutQuart),
                rate: Math.floor(targets.rate * easeOutQuart)
            });

            if (progress < 1) requestAnimationFrame(animate);
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) animate();
        }, { threshold: 0.5 });

        const statsElement = document.getElementById('stats-counter');
        if (statsElement) observer.observe(statsElement);

        return () => observer.disconnect();
    }, []);


    // --- RENDERING HELPERS ---

    const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
        <div className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500 hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
            <p className="text-slate-500 leading-relaxed">{desc}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">

            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-lg border-b border-slate-200 py-4' : 'bg-transparent py-6'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                            <Building className="text-white w-6 h-6" />
                        </div>
                        <span className={`text-2xl font-bold tracking-tight ${scrolled ? 'text-slate-900' : 'text-slate-900 lg:text-white'} transition-colors`}>
                            Noor<span className="text-blue-500">Immo</span>.
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-8">
                        {['Fonctionnalités', 'Tarifs', 'Témoignages'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}
                                className={`text-sm font-medium hover:text-blue-500 transition-colors ${scrolled ? 'text-slate-600' : 'text-slate-300 hover:text-white'}`}
                            >
                                {item}
                            </a>
                        ))}
                        <div className={`h-4 w-px ${scrolled ? 'bg-slate-300' : 'bg-slate-700'}`}></div>
                        <Link to="/login" className={`text-sm font-semibold ${scrolled ? 'text-slate-900' : 'text-white'} hover:text-blue-500 transition-colors`}>
                            Connexion
                        </Link>
                        <Link
                            to="/register"
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-full transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5"
                        >
                            S'inscrire
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden p-2 text-slate-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 bg-white pt-24 px-6 lg:hidden animate-in slide-in-from-top-10">
                    <div className="flex flex-col gap-6 text-center">
                        <a href="#fonctionnalites" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-slate-900">Fonctionnalités</a>
                        <a href="#tarifs" onClick={() => setMobileMenuOpen(false)} className="text-xl font-medium text-slate-900">Tarifs</a>
                        <Link to="/login" className="text-xl font-medium text-blue-600">Connexion</Link>
                        <Link to="/register" className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-xl">Créer un compte</Link>
                    </div>
                </div>
            )}


            {/* --- HERO SECTION --- */}
            <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-slate-900 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0">
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px]"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 text-center lg:text-left flex flex-col lg:flex-row items-center gap-16">
                    {/* Text Content */}
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800 text-blue-400 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            Nouveau Standard 2025
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-8">
                            Gérez votre parc <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                avec élégance.
                            </span>
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                            La plateforme tout-en-un pour les agences immobilières modernes.
                            Automatisez les quittances, suivez les paiements et impressionnez vos clients.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <Link to="/register" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-1 flex items-center justify-center gap-2">
                                Commencer gratuitement
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/pricing" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all border border-slate-700">
                                Voir les tarifs
                            </Link>
                        </div>

                        <div className="mt-12 flex items-center gap-8 justify-center lg:justify-start text-slate-500 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-blue-500" />
                                <span>Installation instantanée</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5 text-blue-500" />
                                <span>Sans engagement</span>
                            </div>
                        </div>
                    </div>

                    {/* Visual Content (Dashboard Preview) */}
                    <div className="lg:w-1/2 relative">
                        <div className="relative rounded-2xl bg-slate-800 border border-slate-700 p-2 shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                            <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video relative group">
                                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-500/10 pointer-events-none z-10"></div>
                                {/* Replacing static image with a CSS-based placeholder if image fails, but trying image first */}
                                <img
                                    src="/images/dashboard_banner.png"
                                    alt="Tableau de bord"
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.style.display = 'none';
                                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                                        e.target.parentElement.innerHTML = '<div class="text-slate-500 flex flex-col items-center"><svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg><span class="font-bold">Aperçu du Dashboard</span></div>';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Floating Widget 1 */}
                        <div className="absolute -left-8 top-12 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce [animation-duration:3s]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Loyer Reçu</div>
                                    <div className="text-lg font-extrabold text-slate-900">+ 250.000 F</div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Widget 2 */}
                        <div className="absolute -right-8 bottom-12 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce [animation-duration:4s]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 font-bold uppercase">Nouveaux Locataires</div>
                                    <div className="text-lg font-extrabold text-slate-900">+ 12 this month</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>


            {/* --- STATS SECTION --- */}
            <div id="stats-counter" className="py-12 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
                        {[
                            { label: 'Utilisateurs Actifs', val: stats.users, suffix: '+' },
                            { label: 'Biens Gérés', val: stats.properties, suffix: '+' },
                            { label: 'Taux de Recouvrement', val: stats.rate, suffix: '%' },
                            { label: 'Support Client', val: '24/7', suffix: '' },
                        ].map((stat, idx) => (
                            <div key={idx} className="px-4">
                                <div className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-2 tracking-tight">
                                    {typeof stat.val === 'number' ? stat.val.toLocaleString() : stat.val}{stat.suffix}
                                </div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* --- FEATURES GRID (Bento Style) --- */}
            <section id="fonctionnalites" className="py-32 bg-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Fonctionnalités</span>
                        <h2 className="mt-4 text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6">
                            Tout pour gérer votre agence.<br />
                            <span className="text-slate-400">Rien de superflu.</span>
                        </h2>
                        <p className="text-xl text-slate-600">
                            Une suite d'outils puissants conçus spécifiquement pour le marché immobilier sénégalais.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Building}
                            title="Gestion de Parc"
                            desc="Vue d'ensemble sur tous vos immeubles, appartements et studios. Filtrage intelligent et statut d'occupation en temps réel."
                        />
                        <FeatureCard
                            icon={BarChart3}
                            title="Comptabilité Automatisée"
                            desc="Génération automatique des quittances, suivi des encaissements et calcul des commissions d'agence sans erreur."
                        />
                        <FeatureCard
                            icon={Users}
                            title="Portail Locataire"
                            desc="Offrez un espace moderne à vos locataires pour télécharger leurs documents et signaler des incidents."
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Sécurité Bancaire"
                            desc="Toutes les données sont chiffrées. Sauvegardes quotidiennes automatiques pour une tranquillité d'esprit totale."
                        />
                        <FeatureCard
                            icon={Clock}
                            title="Relances Intelligentes"
                            desc="Notifications automatiques par SMS et Email pour les loyers impayés avant même qu'ils ne deviennent problématiques."
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Performance"
                            desc="Une interface ultra-rapide qui charge en moins de 0.5 seconde, même avec une connexion internet lente."
                        />
                    </div>
                </div>
            </section>


            {/* --- PRICING SECTION --- */}
            <section id="tarifs" className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div className="max-w-2xl">
                            <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Des tarifs transparents.</h2>
                            <p className="text-xl text-slate-600">
                                Choisissez le plan qui correspond à la taille de votre parc immobilier.
                                Changez à tout moment.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full">
                            <span className="px-4 py-2 text-sm font-bold text-slate-600">Mensuel</span>
                            <span className="px-4 py-2 text-sm font-bold bg-white text-slate-900 rounded-full shadow-sm">Annuel (-10%)</span>
                        </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {pricingPlans.length > 0 ? pricingPlans.map((plan, idx) => (
                            <div
                                key={idx}
                                className={`relative rounded-3xl p-8 transition-all duration-300 ${plan.highlighted
                                        ? 'bg-slate-900 text-white shadow-2xl scale-105 z-10 ring-1 ring-slate-800'
                                        : 'bg-white text-slate-900 border border-slate-200 shadow-xl hover:-translate-y-2'
                                    }`}
                            >
                                {plan.highlighted && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                                        Recommandé
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-4xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                                        <span className={`text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}> F{plan.period}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlighted ? 'bg-blue-600/20' : 'bg-blue-50'}`}>
                                                <Check className={`w-3 h-3 ${plan.highlighted ? 'text-blue-400' : 'text-blue-600'}`} />
                                            </div>
                                            <span className={`text-sm ${plan.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/register"
                                    className={`block w-full py-4 rounded-xl font-bold text-center transition-all ${plan.highlighted
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        )) : (
                            // Loading State Skeleton
                            [1, 2, 3].map((i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-3xl p-8 h-96 animate-pulse">
                                    <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
                                    <div className="h-12 bg-slate-200 rounded w-1/2 mb-8"></div>
                                    <div className="space-y-3">
                                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                        <div className="h-4 bg-slate-200 rounded w-4/6"></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-16 text-center">
                        <Link to="/pricing" className="text-blue-600 font-bold hover:text-blue-800 transition-colors inline-flex items-center gap-2 group">
                            Voir le comparatif complet
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>


            {/* --- CTA FINAL --- */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-8 tracking-tight">
                        Une gestion immobilière <br />
                        <span className="text-blue-500">enfin simplifiée.</span>
                    </h2>
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                        Rejoignez plus de 1500 agences qui font confiance à Batiyakaar pour automatiser leur croissance.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-2xl hover:scale-105 transition-all duration-300">
                            Créer mon compte
                        </Link>
                        <Link to="/login" className="w-full sm:w-auto px-10 py-5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full backdrop-blur-sm transition-all">
                            Démo gratuite
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Building className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-white">Noor<span className="text-blue-500">Immo</span>.</span>
                        </div>
                        <p className="max-w-xs text-sm">
                            La solution complète pour digitaliser votre agence immobilière au Sénégal.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Plateforme</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Fonctionnalités</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Tarifs</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Connexion</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4">Légal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Mentions Légales</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">CGU</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Confidentialité</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-900 text-center text-sm text-slate-600">
                    &copy; 2025 Noor Immobilier. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}
