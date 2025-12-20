import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Building, Menu, X, Shield, BarChart3, Users, Clock, Zap,
    ArrowUpRight, Play, Sparkles, Globe, Layers, Smartphone,
    FileCheck, CreditCard, Star, MessageSquare, TrendingUp,
    Wallet, Bell, Check, MousePointer2, Trophy, Award, Target, Flame
} from 'lucide-react';
import { planService } from '../../services/planService';

// Hook personnalisé pour les animations d'apparition au défilement
function useReveal() {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);
    return { ref, isVisible };
}

// Composant pour les icônes de fonctionnalités avec animation au survol
const FeatureIcon = ({ Icon, color, animationClass = "" }) => (
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 group-hover:border-${color}-500/50 transition-all duration-500`}>
        <Icon className={`w-7 h-7 text-white group-hover:text-${color}-400 transition-colors ${animationClass}`} />
    </div>
);

// Points d'interaction interactifs sur l'aperçu du tableau de bord
const Hotspot = ({ top, left, title, desc, active, onClick }) => (
    <div className="absolute transition-all duration-300" style={{ top, left }}>
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-blue-500 scale-125' : 'bg-white/20 hover:bg-white/40'}`}
        >
            <span className={`absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75 ${active ? 'hidden' : ''}`}></span>
            <div className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-blue-400'}`}></div>
        </button>

        {active && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 p-4 card-glass rounded-xl shadow-2xl z-50 animate-reveal">
                <h4 className="text-xs font-black mb-1 uppercase tracking-wider text-blue-400">{title}</h4>
                <p className="text-[10px] text-slate-300 leading-tight font-medium">{desc}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white/10"></div>
            </div>
        )}
    </div>
);

// Logo des partenaires avec effet de grisaille au repos
const PartnerLogo = ({ name, colorClass }) => (
    <div className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/20 hover:bg-white/[0.08] transition-all duration-300 group cursor-default grayscale hover:grayscale-0">
        <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
        <span className="text-xl font-black italic tracking-tighter text-white/40 group-hover:text-white transition-colors uppercase">
            {name}
        </span>
    </div>
);

// Barre de progression pour la gamification (Impact utilisateur)
const ProgressBar = ({ label, percentage, color }) => {
    const { ref, isVisible } = useReveal();
    return (
        <div ref={ref} className="space-y-2 w-full">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-1000 ease-out`}
                    style={{
                        width: isVisible ? `${percentage}%` : '0%',
                        boxShadow: `0 0 10px ${color.replace('bg-', 'rgba(')}`
                    }}
                ></div>
            </div>
        </div>
    );
};

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [pricingPlans, setPricingPlans] = useState([]);
    const [activeHotspot, setActiveHotspot] = useState(null);
    const [countdown, setCountdown] = useState(12);

    // Gestionnaire de scroll pour les effets parallaxe
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Chargement des tarifs via le service
    useEffect(() => {
        const fetchPlans = async () => {
            const res = await planService.getAllPlans();
            if (res.success) {
                setPricingPlans(res.data.map((p, i) => {
                    let features = [];
                    try {
                        const rawFeatures = p.fonctionnalites;
                        if (typeof rawFeatures === 'string') {
                            features = JSON.parse(rawFeatures);
                        } else if (Array.isArray(rawFeatures)) {
                            features = rawFeatures;
                        }
                    } catch (e) {
                        console.error("Error parsing features for plan:", p.nom, e);
                    }
                    return {
                        id: p.id,
                        name: p.nom,
                        price: parseFloat(p.prix_mensuel).toLocaleString('fr-FR'),
                        period: 'mois',
                        features: features,
                        highlighted: i === 1,
                        cta: i === 1 ? 'Essai Gratuit' : 'Choisir'
                    };
                }));
            }
        };
        fetchPlans();
    }, []);

    // Compteur factice pour créer un sentiment d'urgence (Gamification)
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => (prev > 3 ? prev - 1 : prev));
        }, 15000);
        return () => clearInterval(timer);
    }, []);

    // Refs pour les animations d'apparition
    const reveals = [useReveal(), useReveal(), useReveal(), useReveal(), useReveal(), useReveal()];

    const hotspots = [
        { title: "Dashboard Live", desc: "Suivez vos indicateurs de performance en temps réel sur une vue consolidée.", top: "25%", left: "30%" },
        { title: "Filtrage Intelligent", desc: "Recherchez instantanément par locataire, bâtiment ou statut de paiement.", top: "15%", left: "75%" },
        { title: "Gestion Documents", desc: "Accédez en un clic à toutes les quittances et contrats stockés en sécurité.", top: "65%", left: "45%" },
        { title: "Alertes Critiques", desc: "Soyez informé des impayés ou des fins de bail avant qu'ils n'arrivent.", top: "80%", left: "15%" }
    ];

    const testimonials = [
        {
            name: "Abdoulaye Ndiaye",
            role: "Directeur Général",
            company: "Immo Excellence Dakar",
            quote: "NoorImmo a radicalement changé notre façon de travailler. La génération automatique des quittances nous fait gagner des jours entiers.",
            stars: 5,
            badge: "Power User"
        },
        {
            name: "Fatou Fall",
            role: "Gestionnaire",
            company: "Sunu Keur Immobilière",
            quote: "L'interface est incroyablement intuitive. Mes agents sur le terrain utilisent l'application mobile pour tout.",
            stars: 5,
            badge: "Mobile Master"
        },
        {
            name: "Saliou Sow",
            role: "Propriétaire",
            company: "Résidences Horizon",
            quote: "La transparence offerte par le portail locataire a réduit nos appels de support de 40%.",
            stars: 5,
            badge: "Client Focus"
        }
    ];

    const partners = [
        { name: 'Orange Money', color: 'bg-orange-500' },
        { name: 'Wave', color: 'bg-blue-400' },
        { name: 'Free Money', color: 'bg-red-600' },
        { name: 'Ecobank', color: 'bg-teal-500' },
        { name: 'Société Générale', color: 'bg-red-500' },
        { name: 'UBA', color: 'bg-red-700' },
        { name: 'CBAO', color: 'bg-blue-800' }
    ];

    const navLinks = [
        { label: 'Fonctionnalités', href: '#fonctionnalites' },
        { label: 'Tarifs', href: '#tarifs' },
        { label: 'Témoignages', href: '#temoignages' }
    ];

    return (
        <div className="min-h-screen overflow-hidden bg-[#050505] selection:bg-blue-600 selection:text-white" onClick={() => setActiveHotspot(null)}>

            {/* EFFETS DE FOND PARALLAXE */}
            <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none"></div>
            <div
                className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-circle transition-transform duration-75 ease-out"
                style={{ transform: `translateY(${scrollY * 0.15}px)` }}
            ></div>
            <div
                className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-circle transition-transform duration-75 ease-out"
                style={{ transform: `translateY(${scrollY * -0.1}px)` }}
            ></div>

            {/* --- BARRE DE NAVIGATION --- */}
            <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-4' : 'py-8'}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                            <Building className="text-white w-5 h-4" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white uppercase italic">NoorImmo</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-8 card-glass px-8 py-3 rounded-full">
                        {navLinks.map((link, i) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="text-sm font-bold text-slate-400 hover:text-white transition-all duration-300 relative group"
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                {link.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-400 hover:text-white px-4 py-2 transition-colors">Connexion</Link>
                        <div className="relative group">
                            <Link to="/register" className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)] block">Démarrer</Link>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-ping"></div>
                        </div>
                        <button className="lg:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(!mobileMenuOpen); }}>
                            {mobileMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* MENU MOBILE */}
            <div className={`fixed inset-0 z-[90] bg-black/95 backdrop-blur-xl transition-all duration-500 flex flex-col items-center justify-center gap-10 lg:hidden ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {navLinks.map((link, i) => (
                    <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="text-4xl font-black text-white hover:text-blue-500 transition-colors uppercase tracking-tighter" style={{ transitionDelay: `${i * 100}ms` }}>
                        {link.label}
                    </a>
                ))}
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold text-slate-400 hover:text-white transition-colors">Connexion</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="bg-blue-600 text-white px-10 py-4 rounded-full font-black text-xl shadow-xl shadow-blue-600/20">S'inscrire</Link>
            </div>

            {/* --- SECTION HERO --- */}
            <section className="relative pt-40 pb-20 min-h-[90vh] flex items-center overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 items-center relative z-10">

                    {/* CONTENU TEXTUEL */}
                    <div
                        className="lg:col-span-7 text-center lg:text-left transition-transform duration-75 ease-out hero-entrance"
                        style={{ transform: `translateY(${scrollY * 0.04}px)` }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-[0.3em] uppercase mb-8">
                            <Sparkles className="w-4 h-4 animate-pulse" /> Infrastructure Next-Gen 2025
                        </div>
                        <h1 className="text-6xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-8">
                            L'immobilier <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500">Réimaginé.</span>
                        </h1>
                        <p className="text-lg lg:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed mb-12">
                            Scalez votre agence avec la plateforme de gestion la plus rapide au Sénégal. Sans friction. Sans limites.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                            <div className="relative group w-full sm:w-auto">
                                <Link to="/register" className="group bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-blue-600/30 transition-all hover:-translate-y-1">
                                    Déployer maintenant
                                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </Link>
                                {/* Gamification: Badge de rareté */}
                                <div className="absolute -bottom-4 -right-4 card-glass px-3 py-1.5 rounded-lg border-blue-500/30 bg-blue-900/40 backdrop-blur-md animate-soft-bounce">
                                    <div className="flex items-center gap-2">
                                        <Flame className="w-3 h-3 text-orange-500" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-tighter">Plus que {countdown} places Pionnier</span>
                                    </div>
                                </div>
                            </div>
                            <button className="flex items-center gap-3 px-8 py-5 card-glass rounded-2xl font-bold hover:bg-white/10 transition-all group">
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors"><Play className="w-4 h-4 fill-current" /></div>
                                Voir la démo
                            </button>
                        </div>
                    </div>

                    {/* CONTENU VISUEL (Dashboard & Mockups) */}
                    <div className="lg:col-span-5 relative hidden lg:block perspective-1000 hero-entrance" style={{ animationDelay: '0.2s' }}>
                        <div
                            className="relative transition-transform duration-100 ease-out"
                            style={{ transform: `translateY(${scrollY * -0.12}px) rotateX(${scrollY * 0.03}deg) rotateY(${scrollY * 0.01}deg)` }}
                        >
                            {/* Badge de succès doré */}
                            <div className="absolute -top-32 right-10 z-30 card-glass p-4 rounded-full shimmer-effect shimmer-gold border-yellow-500/40 animate-slow-spin">
                                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                                    <Trophy className="w-8 h-8 text-yellow-500" />
                                </div>
                            </div>

                            {/* Cartes flottantes */}
                            <div
                                className="card-glass p-6 rounded-[2rem] shadow-3xl absolute -top-20 -left-10 z-20 w-64 animate-float"
                                style={{ transform: `translateY(${scrollY * 0.08}px)` }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center"><TrendingUp className="text-green-400 w-4 h-4" /></div>
                                    <span className="text-[10px] text-slate-500 font-black uppercase">Croissance</span>
                                </div>
                                <div className="text-2xl font-black">+42.8%</div>
                                <div className="text-[10px] text-green-400 font-bold">Recouvrement Mensuel</div>
                            </div>

                            {/* Mockup Smartphone interactif */}
                            <div className="bg-slate-900 border border-white/20 rounded-[3rem] p-4 shadow-[0_0_80px_rgba(59,130,246,0.3)] overflow-hidden aspect-[9/19] w-[310px] mx-auto flex items-center justify-center relative shimmer-effect transition-all duration-300">
                                <div className="w-full h-full bg-slate-800/50 rounded-[2.5rem] border border-white/5 flex flex-col p-6 gap-6">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                        <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                        <div className="w-3 h-3 rounded-full bg-white/10"></div>
                                    </div>
                                    <div className="h-8 bg-white/5 rounded-lg w-1/2"></div>
                                    <div className="space-y-4">
                                        <div className="h-32 bg-blue-600/10 rounded-2xl border border-blue-500/20 flex items-center justify-center">
                                            <BarChart3 className="w-10 h-10 text-blue-500/50" />
                                        </div>
                                        <div className="h-24 bg-white/5 rounded-2xl flex items-center px-4 gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/5"></div>
                                            <div className="flex-grow space-y-2">
                                                <div className="h-2 bg-white/10 rounded w-1/2"></div>
                                                <div className="h-2 bg-white/10 rounded w-3/4"></div>
                                            </div>
                                        </div>
                                        <div className="h-32 bg-white/5 rounded-2xl"></div>
                                    </div>
                                </div>
                                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-950 rounded-full flex items-center justify-center px-2">
                                    <div className="w-1 h-1 bg-blue-500/50 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BARRE DE CONFIANCE (PARTENAIRES) --- */}
            <section className="py-16 bg-white/5 border-y border-white/5 overflow-hidden relative z-20">
                <div className="max-w-7xl mx-auto px-6 mb-8 flex items-center gap-4 reveal-item">
                    <div className="h-px flex-grow bg-gradient-to-r from-transparent to-white/10"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 text-center">Infrastructures de Paiement & Partenaires</span>
                    <div className="h-px flex-grow bg-gradient-to-l from-transparent to-white/10"></div>
                </div>
                <div className="flex whitespace-nowrap animate-marquee">
                    {[1, 2, 3].map((set) => (
                        <div key={set} className="flex gap-10 items-center px-5">
                            {partners.map((partner, idx) => (
                                <PartnerLogo
                                    key={`${set}-${idx}`}
                                    name={partner.name}
                                    colorClass={partner.color}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* --- SECTION FONCTIONNALITÉS (GRILLE BENTO) --- */}
            <section id="fonctionnalites" className={`py-40 px-6 reveal ${reveals[0].isVisible ? 'visible' : ''}`} ref={reveals[0].ref}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 card-glass p-12 rounded-[3rem] group reveal-item" style={{ transitionDelay: '0.1s' }}>
                            <div className="flex flex-col md:flex-row gap-12 items-center">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <FeatureIcon Icon={Zap} color="blue" animationClass="group-hover:animate-icon-pulse" />
                                        <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[8px] font-black text-blue-400 uppercase tracking-widest">Performances débloquées</div>
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter leading-none">Vitesse <br />Éclair.</h2>
                                    <p className="text-slate-400 font-medium">Générez 1000 quittances en moins de 3 secondes. Notre moteur de rendu est le plus rapide du marché.</p>

                                    {/* Indicateurs d'impact */}
                                    <div className="space-y-4 pt-4">
                                        <ProgressBar label="Gain de temps moyen" percentage={85} color="bg-blue-600" />
                                        <ProgressBar label="Précision comptable" percentage={100} color="bg-green-600" />
                                    </div>
                                </div>
                                {/* Animation de pile de cartes */}
                                <div className="w-full md:w-64 aspect-square bg-slate-900 rounded-[2rem] border border-white/10 relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 bg-blue-600/10 blur-3xl"></div>
                                    <div className="relative w-32 h-40">
                                        {[0, 1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="absolute inset-0 bg-white border border-slate-200 rounded-xl p-4 shadow-2xl animate-stack-card"
                                                style={{ animationDelay: `${i * 400}ms` }}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="w-8 h-2 bg-slate-200 rounded"></div>
                                                    <div className="w-4 h-4 bg-blue-600/20 rounded-full"></div>
                                                </div>
                                                <div className="space-y-2 mb-6">
                                                    <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                                                    <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                                                </div>
                                                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                                    <div className="h-2 w-8 bg-blue-600/30 rounded"></div>
                                                    <div className="h-2 w-6 bg-slate-200 rounded"></div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="absolute -right-4 top-0 w-px h-full bg-gradient-to-b from-transparent via-blue-500/50 to-transparent animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card-glass p-12 rounded-[3rem] group text-center flex flex-col items-center reveal-item" style={{ transitionDelay: '0.2s' }}>
                            <FeatureIcon Icon={Shield} color="indigo" animationClass="group-hover:animate-soft-bounce" />
                            <h2 className="text-3xl font-black mt-8 mb-4">Compliance OHADA</h2>
                            <p className="text-slate-400 font-medium text-sm">Vos documents sont 100% légaux et mis à jour selon les régulations locales du Sénégal.</p>
                            <div className="mt-8 px-4 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 group-hover:border-indigo-500/50 transition-colors">
                                <Award className="w-4 h-4 text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Certifié Standard 2025</span>
                            </div>
                        </div>

                        {/* TOUR INTERACTIF DU DASHBOARD */}
                        <div className="lg:col-span-3 card-glass p-12 rounded-[3rem] group overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent reveal-item" style={{ transitionDelay: '0.3s' }}>
                            <div className="grid lg:grid-cols-5 gap-12 items-center">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black tracking-widest uppercase">Exploration Interactive</div>
                                    <h2 className="text-4xl font-black tracking-tighter leading-none">Une interface <br /><span className="text-blue-500">conçue pour vous.</span></h2>
                                    <p className="text-slate-400 font-medium text-sm leading-relaxed">Cliquez sur les points lumineux pour découvrir comment NoorImmo simplifie vos opérations.</p>
                                    <div className="flex items-center gap-4 pt-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center animate-bounce"><MousePointer2 className="w-4 h-4 text-blue-400" /></div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cliquez pour explorer</span>
                                    </div>
                                </div>

                                <div className="lg:col-span-3 relative aspect-video bg-slate-900 rounded-[2rem] border border-white/10 p-4 shadow-3xl group/tour overflow-hidden">
                                    <div className="w-full h-full bg-slate-800/40 rounded-2xl flex flex-col p-6 gap-6 relative">
                                        <div className="flex justify-between items-center pb-4 border-b border-white/5">
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                                            </div>
                                            <div className="w-1/3 h-6 bg-white/5 rounded-full"></div>
                                        </div>
                                        <div className="flex gap-6 h-full">
                                            <div className="w-16 h-full bg-white/5 rounded-xl hidden md:block"></div>
                                            <div className="flex-grow space-y-6">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="h-20 bg-blue-600/10 rounded-xl border border-blue-500/10"></div>
                                                    <div className="h-20 bg-white/5 rounded-xl"></div>
                                                    <div className="h-20 bg-white/5 rounded-xl"></div>
                                                </div>
                                                <div className="flex-grow h-32 bg-white/5 rounded-xl"></div>
                                            </div>
                                        </div>

                                        {hotspots.map((hs, idx) => (
                                            <Hotspot
                                                key={idx}
                                                {...hs}
                                                active={activeHotspot === idx}
                                                onClick={() => setActiveHotspot(idx)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION TARIFS --- */}
            <section id="tarifs" className={`py-40 bg-white/5 reveal ${reveals[3].isVisible ? 'visible' : ''}`} ref={reveals[3].ref}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-24 reveal-item">
                        <h2 className="text-5xl font-black tracking-tighter mb-4">Tarifs. <span className="text-slate-600">Simples.</span></h2>
                        <p className="text-slate-400 font-medium italic">Payez pour ce que vous gérez réellement.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, i) => (
                            <div
                                key={i}
                                className={`p-10 rounded-[3rem] flex flex-col group transform reveal-item ${plan.highlighted
                                    ? 'bg-blue-600 text-white shadow-[0_20px_50px_rgba(59,130,246,0.3)] scale-105 z-10 border-2 border-blue-400 ring-4 ring-blue-400/20 hover:border-white/40 hover:shadow-blue-600/50'
                                    : 'bg-white/5 border border-white/10 hover:border-blue-500/80 hover:bg-white/[0.07] hover:shadow-[0_30px_60px_-12px_rgba(59,130,246,0.25)]'
                                    }`}
                                style={{ transitionDelay: `${i * 150}ms` }}
                            >
                                <div className="mb-10">
                                    <div className={`text-xs font-black uppercase tracking-widest mb-4 transition-colors ${plan.highlighted ? 'text-blue-200' : 'text-slate-500 group-hover:text-blue-400'}`}>{plan.name}</div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                                        <span className="text-sm font-bold opacity-50">F/mois</span>
                                    </div>
                                </div>
                                <ul className="space-y-5 mb-12 flex-grow">
                                    {plan.features.map((f, idx) => (
                                        <li key={idx} className="flex items-center gap-4 text-sm font-bold group-hover:translate-x-2 transition-transform duration-300" style={{ transitionDelay: `${idx * 50}ms` }}>
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${plan.highlighted ? 'bg-white/20' : 'bg-blue-600/10 group-hover:bg-blue-600/20'}`}>
                                                <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-blue-500'}`} />
                                            </div>
                                            <span className="group-hover:text-white transition-colors">{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="relative group">
                                    <Link to="/register" className={`w-full py-5 rounded-2xl font-black text-center transition-all block ${plan.highlighted ? 'bg-white text-blue-600 hover:scale-[1.02] shadow-xl' : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20'}`}>
                                        {plan.cta}
                                    </Link>
                                    {plan.highlighted && (
                                        <div className="absolute -bottom-2 -left-2 bg-yellow-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded italic animate-pulse">Populaire</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- APPEL FINAL --- */}
            <section className={`py-40 px-6 reveal ${reveals[5].isVisible ? 'visible' : ''}`} ref={reveals[5].ref}>
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[4rem] p-12 lg:p-24 text-center relative overflow-hidden group shadow-3xl reveal-item">
                    <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-10"></div>
                    <div className="relative z-10 space-y-12">
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs font-black text-white uppercase tracking-widest">Rejoignez le Top 1% des agences</span>
                        </div>
                        <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-none transition-transform duration-700 group-hover:scale-[1.02]">
                            L'immobilier <br /> du futur est là.
                        </h2>
                        <p className="text-xl text-blue-100 max-w-xl mx-auto font-medium">Rejoignez l'élite des agences digitales du Sénégal. Aucun engagement.</p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link to="/register" className="bg-white text-blue-600 px-12 py-6 rounded-[2rem] font-black text-xl hover:scale-105 transition-all shadow-2xl">Démarrer Gratuitement</Link>
                            <div className="text-blue-100/50 text-xs font-bold uppercase tracking-widest animate-pulse">Plus que {countdown} minutes avant la fin de l'offre</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PIED DE PAGE --- */}
            <footer className="py-20 bg-black/50 border-t border-white/5 text-slate-500">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-16 mb-20">
                        <div className="col-span-2 space-y-8">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Building className="text-white w-4 h-4" />
                                </div>
                                <span className="text-xl font-black tracking-tight text-white uppercase italic">NoorImmo</span>
                            </div>
                            <p className="font-medium max-w-xs leading-relaxed">Logiciel de gestion leader pour les agences immobilières modernes en Afrique de l'Ouest.</p>
                        </div>
                        {['Produit', 'Entreprise', 'Support'].map(cat => (
                            <div key={cat} className="space-y-6">
                                <h4 className="text-white font-black uppercase tracking-widest text-xs">{cat}</h4>
                                <ul className="space-y-4 text-sm font-bold">
                                    {cat === 'Produit' && navLinks.map(l => <li key={l.label}><a href={l.href} className="hover:text-blue-500 transition-colors">{l.label}</a></li>)}
                                    {cat === 'Entreprise' && ['À propos', 'Blog'].map(l => <li key={l}><a href="#" className="hover:text-blue-500 transition-colors">{l}</a></li>)}
                                    {cat === 'Support' && ['WhatsApp', 'Contact'].map(l => <li key={l}><a href="#" className="hover:text-blue-500 transition-colors">{l}</a></li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
                        <span>&copy; 2025 Noor Immobilier Technologies SN.</span>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                            <a href="#" className="hover:text-white transition-colors">Conditions</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
