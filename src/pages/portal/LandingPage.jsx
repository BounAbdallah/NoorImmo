import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    Building, Menu, X, Shield, BarChart3, Users, Zap,
    ArrowUpRight, Play, Sparkles, Smartphone,
    FileCheck, CreditCard, Check, MousePointer2, Trophy, Award, Flame,
    FileText, BellRing, Printer, AlertTriangle, Lock, Star, HelpCircle, Quote,
    PieChart, Activity, Wifi, Layers, Headphones, GraduationCap, Database, MessageCircle,
    Globe, Server
} from 'lucide-react';
import { planService } from '../../services/planService';

// --- UTILITAIRES & HOOKS ---

// Hook pour l'animation d'apparition au scroll
function useReveal(threshold = 0.1) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [threshold]);
    return { ref, isVisible };
}

// --- COMPOSANTS UI ---

// Nouveau Logo Pro
const Logo = ({ className = "" }) => (
    <div className={`flex items-center gap-3 group cursor-pointer select-none ${className}`}>
        <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Effet de lueur arrière */}
            <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>

            {/* Conteneur principal de l'icône */}
           

            {/* Petit badge de notification (optionnel pour le look "app active") */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-black animate-pulse"></div>
        </div>

        <div className="flex flex-col justify-center">
            <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                Noor<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Immo</span>
            </span>
            <div className="flex items-center gap-1 mt-0.5">
                <div className="w-4 h-0.5 bg-blue-600 rounded-full"></div>
                <span className="text-[9px] font-bold text-slate-500 tracking-[0.25em] uppercase leading-none group-hover:text-blue-400 transition-colors">
                    Solutions
                </span>
            </div>
        </div>
    </div>
);

// Composant Bouton "Hotspot" (Point interactif)
const Hotspot = ({ top, left, title, desc, active, onClick }) => (
    <div className="absolute transition-all duration-300 z-30" style={{ top, left }}>
        <button
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-blue-500 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/10 hover:bg-blue-500/80 backdrop-blur-md border border-white/20'}`}
        >
            <span className={`absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-75 ${active ? 'hidden' : ''}`}></span>
            <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-white' : 'bg-blue-400'}`}></div>
        </button>

        {active && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-5 bg-[#0f172a]/95 backdrop-blur-xl border border-blue-500/30 rounded-2xl shadow-2xl z-50 animate-reveal origin-bottom">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">{title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">{desc}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-[#0f172a]/95"></div>
            </div>
        )}
    </div>
);

// Composant Icône de fonctionnalité
const FeatureIcon = ({ Icon, color = "blue" }) => (
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-${color}-500/10 group-hover:border-${color}-500/30 transition-all duration-500 shadow-lg`}>
        <Icon className={`w-8 h-8 text-white group-hover:text-${color}-400 transition-colors duration-300`} />
    </div>
);

// --- COMPOSANT PRINCIPAL ---

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [pricingPlans, setPricingPlans] = useState([]);
    const [activeHotspot, setActiveHotspot] = useState(0); // Activer le premier par défaut

    // Hooks d'animation
    // Hero threshold à 0 pour déclenchement immédiat
    const revealHero = useReveal(0);
    const revealFeatures = useReveal(0.05);
    const revealContracts = useReveal(0.1);
    const revealMobile = useReveal(0.1);
    const revealAnalytics = useReveal(0.1);
    const revealSupport = useReveal(0.1);
    const revealPricing = useReveal(0.1);
    const revealCTA = useReveal(0.1);
    const revealTestimonials = useReveal(0.1);
    const revealFAQ = useReveal(0.1);

    // Effet de scroll pour la navbar
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Chargement des plans
    useEffect(() => {
        const fetchPlans = async () => {
            const res = await planService.getAllPlans();
            if (res.success) {
                setPricingPlans(res.data.map((p, i) => {
                    let features = [];
                    try {
                        // Gestion robuste du parsing JSON
                        if (typeof p.fonctionnalites === 'string') {
                            features = JSON.parse(p.fonctionnalites);
                        } else if (Array.isArray(p.fonctionnalites)) {
                            features = p.fonctionnalites;
                        }
                    } catch (e) {
                        features = ["Fonctionnalités standards"];
                    }
                    return {
                        ...p,
                        priceFormatted: p.prix_mensuel.toLocaleString('fr-FR'),
                        featuresList: features,
                        isPopular: i === 1
                    };
                }));
            }
        };
        fetchPlans();
    }, []);

    // Rotation automatique des hotspots si l'utilisateur n'interagit pas
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveHotspot(prev => (prev === null || prev === 3) ? 0 : prev + 1);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const hotspots = [
        { title: "Suivi Retards", desc: "Identification instantanée des loyers en retard.", top: "20%", left: "80%" },
        { title: "Génération Contrats", desc: "Créez baux et mandats conformes en un clic.", top: "50%", left: "25%" },
        { title: "Quittance Express", desc: "Génération et téléchargement de la quittance PDF après paiement.", top: "75%", left: "60%" },
        { title: "Reconnaissance Dette", desc: "Génération automatique de la lettre de dette pour les impayés.", top: "40%", left: "55%" }
    ];

    const testimonials = [
        {
            name: "Abdoulaye Ndiaye",
            role: "Directeur Général",
            company: "Immo Excellence Dakar",
            quote: "NoorImmo a radicalement changé notre façon de travailler. La génération automatique des quittances nous fait gagner des jours entiers.",
            initial: "A"
        },
        {
            name: "Fatou Fall",
            role: "Gestionnaire",
            company: "Sunu Keur Immobilière",
            quote: "L'interface est incroyablement intuitive. La gestion de mes contrats est devenue un jeu d'enfant.",
            initial: "F"
        },
        {
            name: "Saliou Sow",
            role: "Propriétaire",
            company: "Résidences Horizon",
            quote: "La transparence offerte par les rapports automatiques a réduit nos échanges inutiles de 40%.",
            initial: "S"
        }
    ];

    const faqs = [
        { q: "Est-ce que mes données sont sécurisées ?", a: "Absolument. Nous utilisons un chiffrement de niveau bancaire et des sauvegardes quotidiennes automatiques." },
        { q: "Puis-je gérer plusieurs agences ?", a: "Oui, l'offre 'Empire' permet la gestion multi-agences avec une vue centralisée." },
        { q: "Comment fonctionne le suivi des retards ?", a: "Le système détecte les retards et vous notifie pour vous permettre de relancer le locataire." },
        { q: "Y a-t-il une période d'engagement ?", a: "Non, toutes nos offres sont sans engagement. Vous pouvez annuler à tout moment." }
    ];

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden" onClick={() => setActiveHotspot(null)}>

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-grid opacity-[0.15]"></div>
            </div>

            {/* --- NAVIGATION --- */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 py-4' : 'py-6 bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <Logo />

                    <div className="hidden md:flex items-center gap-8 bg-white/5 px-8 py-2.5 rounded-full border border-white/5 backdrop-blur-sm">
                        <a href="#fonctionnalites" className="text-sm font-medium hover:text-white transition-colors">Fonctionnalités</a>
                        <a href="#tarifs" className="text-sm font-medium hover:text-white transition-colors">Tarifs</a>
                        <Link to="/contact" className="text-sm font-medium hover:text-white transition-colors">Contact</Link>
                        <a href="#temoignages" className="text-sm font-medium hover:text-white transition-colors">Témoignages</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="hidden sm:block text-sm font-semibold hover:text-white transition-colors">Connexion</Link>
                        <Link to="/register" className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.15)] flex items-center gap-2">
                            Abonnements <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
                            <Menu />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center gap-8 p-6">
                    <button className="absolute top-6 right-6 text-white" onClick={() => setMobileMenuOpen(false)}>
                        <X className="w-8 h-8" />
                    </button>
                    <a href="#fonctionnalites" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">Fonctionnalités</a>
                    <a href="#tarifs" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">Tarifs</a>
                    <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="text-2xl font-bold">Contact</Link>
                    <Link to="/login" className="text-xl text-slate-400">Connexion</Link>
                    <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-full text-xl font-bold w-full text-center">S'inscrire</Link>
                </div>
            )}

            {/* --- HERO SECTION --- */}
            <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center z-10">
                <div ref={revealHero.ref} className="space-y-8">
                    <div className={`transition-all duration-1000 ease-out-expo delay-0 ${revealHero.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> Innovation Immobilière 2025
                        </div>
                    </div>

                    <h1 className={`text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white transition-all duration-1000 ease-out-expo delay-100 ${revealHero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        La Gestion Immobilière <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Simplifiée pour l'Afrique.</span>
                    </h1>

                    <p className={`text-lg text-slate-400 leading-relaxed max-w-lg transition-all duration-1000 ease-out-expo delay-200 ${revealHero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        Générez vos contrats, quittances et reconnaissances de dette automatiquement.
                        La plateforme tout-en-un pour les agences qui veulent grandir sans les tracas administratifs.
                    </p>

                    <div className={`flex flex-col sm:flex-row gap-4 pt-4 transition-all duration-1000 ease-out-expo delay-300 ${revealHero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all hover:-translate-y-1">
                            Commencer maintenant
                            <ArrowUpRight className="w-5 h-5" />
                        </Link>
                        <button className="px-8 py-4 rounded-xl font-bold border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-white">
                            <Play className="w-5 h-5 fill-current" /> Voir la démo
                        </button>
                    </div>

                    <div className={`pt-8 border-t border-white/5 flex items-center gap-8 transition-all duration-1000 ease-out-expo delay-500 ${revealHero.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <div>
                            <div className="text-2xl font-bold text-white">03+</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Agences</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">12+</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Biens gérés</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">99%</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">Satisfaction</div>
                        </div>
                    </div>
                </div>

                {/* Interactive Dashboard Preview */}
                <div className={`relative perspective-1000 lg:h-[600px] flex items-center transition-all duration-1000 ease-out-expo delay-300 ${revealHero.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>
                    <div className="relative w-full aspect-[4/3] bg-[#0f172a] rounded-2xl border border-white/10 shadow-2xl overflow-hidden transform transition-transform duration-700 ease-out-expo hover:rotate-0 rotate-y-[-5deg] rotate-x-[5deg] group">

                        {/* Mockup Header */}
                        <div className="h-12 border-b border-white/5 flex items-center px-4 gap-4 bg-white/[0.02]">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                            </div>
                            <div className="w-32 h-2 bg-white/10 rounded-full"></div>
                        </div>

                        {/* Mockup Content Layout */}
                        <div className="p-6 grid grid-cols-12 gap-6 h-[calc(100%-3rem)]">
                            {/* Sidebar */}
                            <div className="col-span-3 space-y-4 border-r border-white/5 pr-4">
                                <div className="h-8 w-full bg-blue-600/20 rounded-lg border border-blue-500/30"></div>
                                <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                                <div className="h-4 w-1/2 bg-white/5 rounded"></div>
                                <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                            </div>

                            {/* Main Content */}
                            <div className="col-span-9 space-y-6">
                                <div className="flex justify-between">
                                    <div className="h-8 w-1/3 bg-white/10 rounded-lg"></div>
                                    <div className="h-8 w-8 bg-blue-500 rounded-full"></div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-3">
                                        <div className="w-8 h-8 bg-green-500/20 rounded mb-2"></div>
                                        <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                                    </div>
                                    <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-3">
                                        <div className="w-8 h-8 bg-red-500/20 rounded mb-2"></div>
                                        <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                                    </div>
                                    <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-3">
                                        <div className="w-8 h-8 bg-blue-500/20 rounded mb-2"></div>
                                        <div className="h-2 w-1/2 bg-white/10 rounded"></div>
                                    </div>
                                </div>

                                <div className="h-40 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-center">
                                    <BarChart3 className="w-12 h-12 text-slate-700" />
                                </div>
                            </div>
                        </div>

                        {/* Hotspots Overlay */}
                        <div className="absolute inset-0">
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

                    {/* Floating Mobile Notification */}
                    <div className="absolute -bottom-10 -left-10 w-64 p-4 card-glass rounded-2xl shadow-xl animate-float border border-white/10 bg-[#050505]/90">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-white">Alerte Impayé</h4>
                                <p className="text-xs text-slate-400 mt-1">Loyer en retard de 5 jours. Lettre de relance générée.</p>
                                <div className="mt-2 flex gap-2">
                                    <span className="text-[10px] px-2 py-1 bg-white/10 rounded text-white">Télécharger</span>
                                    <span className="text-[10px] px-2 py-1 bg-blue-600 rounded text-white">Envoyer par Email</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section id="fonctionnalites" ref={revealFeatures.ref} className="py-32 px-6 max-w-7xl mx-auto">
                <div className={`text-center mb-20 transition-all duration-1000 ease-out-expo ${revealFeatures.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                    <h2 className="text-4xl lg:text-5xl font-extrabold mb-6">Tout pour gérer votre parc. <br /><span className="text-blue-500">Sans papier, sans erreur.</span></h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">Noor Immo centralise toutes vos opérations quotidiennes dans une interface unique, pensée pour les réalités du terrain.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Feature 1: Documents */}
                    <div className={`card-glass p-8 rounded-[2rem] group hover:bg-white/[0.05] hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 transition-all duration-1000 ease-out-expo delay-100 lg:col-span-2 relative overflow-hidden ${revealFeatures.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
                        <div className="relative z-10">
                            <div className="flex items-center gap-4 mb-6">
                                <FeatureIcon Icon={FileText} color="blue" />
                                <h3 className="text-2xl font-bold">Générateur de Documents</h3>
                            </div>
                            <p className="text-slate-400 mb-8 max-w-md">Plus besoin de Word ou Excel. Générez automatiquement des documents professionnels avec vos en-têtes.</p>

                            <ul className="grid sm:grid-cols-2 gap-4">
                                <li className="flex items-center gap-3 text-sm font-medium"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Contrats de bail</li>
                                <li className="flex items-center gap-3 text-sm font-medium"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Quittances de loyer</li>
                                <li className="flex items-center gap-3 text-sm font-medium"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Mandats de gérance</li>
                                <li className="flex items-center gap-3 text-sm font-medium"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>Reconnaissance de dette</li>
                            </ul>
                        </div>
                        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none"></div>
                        <Printer className="absolute -bottom-10 -right-10 w-64 h-64 text-white/[0.02] transform rotate-12" />
                    </div>

                    {/* Feature 2: Recouvrement */}
                    <div className={`card-glass p-8 rounded-[2rem] group hover:bg-white/[0.05] hover:border-red-500/30 hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2 transition-all duration-1000 ease-out-expo delay-200 flex flex-col justify-between ${revealFeatures.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
                        <div>
                            <div className="mb-6">
                                <FeatureIcon Icon={Shield} color="red" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Recouvrement & Impayés</h3>
                            <p className="text-slate-400 text-sm mb-6">Système d'alerte proactif pour identifier les impayés dès le premier jour.</p>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <span className="text-xs font-bold text-red-400">Retard détecté</span>
                                    <BellRing className="w-4 h-4 text-red-400 animate-pulse" />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                                    <span className="text-xs text-slate-400">Relance Email</span>
                                    <Check className="w-4 h-4 text-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature 3: Finance */}
                    <div className={`card-glass p-8 rounded-[2rem] group hover:bg-white/[0.05] hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-500/10 hover:-translate-y-2 transition-all duration-1000 ease-out-expo delay-300 ${revealFeatures.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
                        <div className="mb-6">
                            <FeatureIcon Icon={BarChart3} color="green" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Comptabilité Simplifiée</h3>
                        <p className="text-slate-400 text-sm">Suivi des encaissements, des charges et des commissions agence en temps réel.</p>
                    </div>

                    {/* Feature 4: Web Access (Replacement for Mobile First) */}
                    <div className={`lg:col-span-2 card-glass p-8 rounded-[2rem] group hover:bg-white/[0.05] hover:border-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 transition-all duration-1000 ease-out-expo delay-400 relative ${revealFeatures.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`}>
                        <div className="grid md:grid-cols-2 gap-8 items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <FeatureIcon Icon={Globe} color="purple" />
                                    <div className="px-3 py-1 bg-purple-500/20 rounded-full border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase">Cloud & Web</div>
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Accessible Partout</h3>
                                <p className="text-slate-400 mb-6">Connectez-vous à votre espace de gestion depuis n'importe quel ordinateur ou tablette avec une simple connexion internet.</p>
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">24/7</div>
                                        <div className="text-[10px] uppercase text-slate-500">Disponibilité</div>
                                    </div>
                                    <div className="w-px h-10 bg-white/10"></div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">100%</div>
                                        <div className="text-[10px] uppercase text-slate-500">Sécurisé</div>
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-48 bg-black/40 rounded-xl border border-white/10 overflow-hidden flex items-center justify-center group-hover:border-purple-500/30 transition-colors">
                                <div className="absolute inset-0 bg-grid opacity-20"></div>
                                <div className="text-center z-10">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                                        <Globe className="text-white font-bold" />
                                    </div>
                                    <div className="font-bold text-white">Espace Agence</div>
                                    <div className="text-xs text-slate-400">Accès via navigateur</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- NEW SECTION: CONTRACT GENERATION --- */}
            <section ref={revealContracts.ref} className={`py-32 relative overflow-hidden transition-all duration-1000 ease-out-expo ${revealContracts.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                                <FileCheck className="w-3 h-3" /> Conformité Juridique
                            </div>
                            <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight">
                                Vos contrats générés <br />
                                <span className="text-blue-500">automatiquement.</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Ne perdez plus de temps à rédiger. Noor Immo dispose d'une bibliothèque de modèles juridiques validés par des experts, qui se remplissent automatiquement avec les données de vos biens et locataires.
                            </p>

                            <div className="space-y-6">
                                <div className="flex gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shrink-0">
                                        <FileText className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Contrats de bail</h3>
                                        <p className="text-slate-400 text-sm">Génération instantanée de baux d'habitation ou commerciaux, avec toutes les clauses de sécurité nécessaires.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors shrink-0">
                                        <Shield className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Mandats de gérance</h3>
                                        <p className="text-slate-400 text-sm">Formalisez la relation avec vos propriétaires bailleurs grâce à des mandats clairs et professionnels.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 group">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">Reconnaissances de dette</h3>
                                        <p className="text-slate-400 text-sm">En cas d'impayé, le système génère et pré-remplit automatiquement la reconnaissance de dette pour le locataire.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Abstract visual decoration */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-[3rem] blur-3xl -z-10"></div>

                            <div className="card-glass p-8 rounded-[2rem] border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <Zap className="w-24 h-24 text-white/5" />
                                </div>

                                {/* Document Preview UI */}
                                <div className="bg-white rounded-xl p-8 shadow-2xl relative transform rotate-1 hover:rotate-0 transition-transform duration-500 text-slate-800">
                                    <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-4">
                                        <div>
                                            <div className="h-4 w-32 bg-slate-800 rounded mb-2"></div>
                                            <div className="h-2 w-24 bg-slate-400 rounded"></div>
                                        </div>
                                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                                            <Building className="w-6 h-6 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                                        <div className="h-4 w-full bg-slate-100 rounded"></div>
                                        <div className="h-4 w-full bg-slate-100 rounded"></div>
                                        <div className="h-4 w-5/6 bg-slate-100 rounded"></div>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Check className="w-4 h-4 text-blue-600" />
                                            <span className="text-xs font-bold text-blue-800 uppercase">Données synchronisées</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="h-2 bg-blue-200 rounded w-full"></div>
                                            <div className="h-2 bg-blue-200 rounded w-2/3"></div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                        <div className="text-xs font-bold text-slate-400 uppercase">Signature Électronique</div>
                                        <div className="w-32 h-8 bg-slate-100 rounded flex items-center justify-center text-xs font-script text-slate-600 italic">
                                            Signé numériquement
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 1: WEB EXPERIENCE (REPLACES MOBILE) --- */}
            <section ref={revealMobile.ref} className={`py-20 bg-white/[0.02] border-y border-white/5 transition-all duration-1000 ease-out-expo ${revealMobile.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full"></div>
                            {/* Browser Mockup instead of Phone */}
                            <div className="relative mx-auto bg-gray-900 border border-white/10 rounded-xl shadow-2xl h-[400px] w-full max-w-md overflow-hidden flex flex-col">
                                <div className="bg-gray-800 p-3 border-b border-white/5 flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                                    </div>
                                    <div className="flex-1 bg-black/20 h-6 rounded mx-4"></div>
                                </div>
                                <div className="p-6 bg-[#0f172a] flex-1">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-white text-lg font-bold">Tableau de Bord</h3>
                                        <div className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-bold">En ligne</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/5 p-4 rounded-lg">
                                            <div className="text-slate-400 text-xs mb-1">Loyers du mois</div>
                                            <div className="text-xl font-bold text-white">1.2M</div>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-lg">
                                            <div className="text-slate-400 text-xs mb-1">Taux recouvrement</div>
                                            <div className="text-xl font-bold text-green-400">92%</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 bg-white/5 rounded w-full"></div>
                                        <div className="h-2 bg-white/5 rounded w-3/4"></div>
                                        <div className="h-2 bg-white/5 rounded w-5/6"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider">
                                <Wifi className="w-3 h-3" /> Accessibilité Totale
                            </div>
                            <h2 className="text-4xl font-extrabold text-white">
                                Votre agence, <br />
                                <span className="text-purple-500">toujours accessible.</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Accédez à votre interface de gestion depuis n'importe quel ordinateur, tablette ou smartphone. Une simple connexion internet suffit pour gérer votre parc immobilier.
                            </p>
                            <ul className="space-y-4 pt-4">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center"><Check className="w-3 h-3 text-purple-400" /></div>
                                    <span className="text-slate-300">Interface Web 100% Responsive</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center"><Check className="w-3 h-3 text-purple-400" /></div>
                                    <span className="text-slate-300">Compatible Windows, Mac, Android, iOS</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center"><Check className="w-3 h-3 text-purple-400" /></div>
                                    <span className="text-slate-300">Mises à jour automatiques sans installation</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 2: ANALYTICS & REPORTING --- */}
            <section ref={revealAnalytics.ref} className={`py-24 transition-all duration-1000 ease-out-expo ${revealAnalytics.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                                <Activity className="w-3 h-3" /> Pilotage Stratégique
                            </div>
                            <h2 className="text-4xl font-extrabold text-white">
                                Analysez votre performance <br />
                                <span className="text-green-500">en temps réel.</span>
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Prenez des décisions éclairées grâce à des tableaux de bord financiers précis. Suivez la rentabilité de chaque bien et les performances de vos agents.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-6 pt-4">
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-colors">
                                    <PieChart className="w-8 h-8 text-green-500 mb-4" />
                                    <h4 className="font-bold text-white mb-2">Taux d'occupation</h4>
                                    <p className="text-sm text-slate-400">Visualisez les vacances locatives et optimisez vos revenus.</p>
                                </div>
                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-green-500/30 transition-colors">
                                    <Layers className="w-8 h-8 text-green-500 mb-4" />
                                    <h4 className="font-bold text-white mb-2">Rapports Bailleurs</h4>
                                    <p className="text-sm text-slate-400">Génération automatique des comptes rendus de gérance mensuels.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="card-glass p-8 rounded-[2rem] border-t border-white/10 relative overflow-hidden">
                                {/* Abstract Chart Visual */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end h-64 gap-4 px-4 pb-4 border-b border-white/10">
                                        <div className="w-full bg-green-500/20 rounded-t-lg h-[40%] relative group">
                                            <div className="absolute inset-x-0 bottom-0 bg-green-500/40 h-0 group-hover:h-full transition-all duration-500"></div>
                                        </div>
                                        <div className="w-full bg-green-500/20 rounded-t-lg h-[60%] relative group">
                                            <div className="absolute inset-x-0 bottom-0 bg-green-500/40 h-0 group-hover:h-full transition-all duration-500"></div>
                                        </div>
                                        <div className="w-full bg-green-500/20 rounded-t-lg h-[50%] relative group">
                                            <div className="absolute inset-x-0 bottom-0 bg-green-500/40 h-0 group-hover:h-full transition-all duration-500"></div>
                                        </div>
                                        <div className="w-full bg-green-500/20 rounded-t-lg h-[80%] relative group">
                                            <div className="absolute inset-x-0 bottom-0 bg-green-500/40 h-0 group-hover:h-full transition-all duration-500"></div>
                                        </div>
                                        <div className="w-full bg-green-500 rounded-t-lg h-[95%] shadow-[0_0_20px_rgba(34,197,94,0.4)]"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-500 px-4 font-bold uppercase tracking-wider">
                                        <span>Jan</span>
                                        <span>Fév</span>
                                        <span>Mar</span>
                                        <span>Avr</span>
                                        <span className="text-white">Mai</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- SECTION 3: REPLACEMENT - LOCAL SUPPORT --- */}
            <section ref={revealSupport.ref} className={`py-24 bg-white/[0.02] border-y border-white/5 transition-all duration-1000 ease-out-expo ${revealSupport.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-8">
                            <Headphones className="w-3 h-3" /> Service Client 5 Étoiles
                        </div>
                        <h2 className="text-4xl font-extrabold text-white mb-6">
                            On ne vous laisse <span className="text-yellow-500">jamais seul.</span>
                        </h2>
                        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                            Une technologie de pointe ne suffit pas. Profitez d'un accompagnement humain, local et disponible pour vous aider à digitaliser votre agence.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1: Support Local */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <MessageCircle className="w-24 h-24 text-yellow-500" />
                            </div>
                            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Headphones className="w-7 h-7 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Support Local & WhatsApp</h3>
                            <p className="text-slate-400 text-sm">Une question ? Notre équipe basée à Dakar vous répond en Français ou en Wolof en moins de 5 minutes.</p>
                        </div>

                        {/* Card 2: Formation */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <GraduationCap className="w-7 h-7 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Formation Incluse</h3>
                            <p className="text-slate-400 text-sm">Webinaires hebdomadaires et tutoriels vidéos pour former vos nouveaux agents gratuitement.</p>
                        </div>

                        {/* Card 3: Sécurité Données (Remplace Migration) */}
                        <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
                            <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Server className="w-7 h-7 text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Données Sécurisées</h3>
                            <p className="text-slate-400 text-sm">Sauvegardes automatiques et protection de vos données contrats sur le Cloud.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- TEMOIGNAGES --- */}
            <section id="temoignages" ref={revealTestimonials.ref} className={`py-24 relative overflow-hidden transition-all duration-1000 ease-out-expo ${revealTestimonials.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div className="absolute top-1/2 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold mb-4">Ils nous font confiance</h2>
                        <p className="text-slate-400">Découvrez comment Noor Immo transforme le quotidien des agences sénégalaises.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="card-glass p-8 rounded-3xl hover:bg-white/[0.05] transition-colors border-t border-white/10 relative">
                                <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5" />
                                <div className="mb-6 text-blue-500 flex gap-1">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current text-yellow-500" />)}
                                </div>
                                <p className="text-slate-300 mb-8 leading-relaxed italic">"{t.quote}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white text-lg shadow-inner">
                                        {t.initial}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">{t.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.role}</div>
                                        <div className="text-xs text-blue-400">{t.company}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PRICING --- */}
            <section id="tarifs" ref={revealPricing.ref} className={`py-20 bg-black/40 border-y border-white/5 transition-all duration-1000 ease-out-expo ${revealPricing.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Des tarifs transparents</h2>
                        <p className="text-slate-400">Choisissez l'offre adaptée à la taille de votre agence.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pricingPlans.map((plan, idx) => (
                            <div key={idx} className={`relative p-8 rounded-3xl border flex flex-col ${plan.isPopular ? 'bg-blue-900/10 border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/20'} transition-all duration-300`}>
                                {plan.isPopular && (
                                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                            <Flame className="w-3 h-3" /> Populaire
                                        </span>
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-2">{plan.nom}</h3>
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-extrabold text-white">{plan.priceFormatted}</span>
                                        <span className="text-slate-400 mb-1 font-medium text-sm">FCFA / mois</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.featuresList.map((feat, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-300">
                                            <div className="mt-0.5 w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                                                <Check className="w-2.5 h-2.5 text-blue-400" />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <Link to="/register" className={`w-full py-3 rounded-xl font-bold text-center transition-all ${plan.isPopular ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25' : 'bg-white text-black hover:bg-slate-200'}`}>
                                    Choisir ce plan
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- FAQ --- */}
            <section ref={revealFAQ.ref} className={`py-24 bg-white/[0.02] border-t border-white/5 transition-all duration-1000 ease-out-expo ${revealFAQ.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                            <HelpCircle className="w-8 h-8 text-blue-500" /> Questions Fréquentes
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section ref={revealCTA.ref} className={`py-32 px-6 relative z-10 transition-all duration-1000 ease-out-expo ${revealCTA.isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                {/* Glow effect behind the card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/20 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

                <div className="max-w-6xl mx-auto relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-[#0a0a0a] group">

                    {/* Animated Background Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-black to-indigo-900/20 opacity-80 group-hover:opacity-100 transition-opacity duration-700"></div>

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>

                    <div className="relative z-10 px-8 py-20 md:p-24 flex flex-col items-center text-center">

                        {/* Floating Badge */}
                        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg animate-float">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <span className="text-sm font-bold text-blue-200 tracking-wide">Places limitées pour l'offre de lancement</span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-[1.1]">
                            Votre agence mérite <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">le meilleur de la tech.</span>
                        </h2>

                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            Ne laissez pas la paperasse ralentir votre croissance. Rejoignez les leaders de l'immobilier au Sénégal et générez vos contrats en quelques clics.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                            <Link to="/register" className="group relative px-8 py-4 bg-white text-black rounded-2xl font-black text-lg hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                <span className="relative flex items-center gap-3">
                                    Voir l'abonnement
                                    <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                                </span>
                            </Link>

                            <Link to="/login" className="px-8 py-4 rounded-2xl font-bold text-white border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm">
                                Se connecter
                            </Link>
                        </div>

                        {/* Bottom Trust Info */}
                        <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-blue-500" />
                                <span>Pas de carte requise</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-blue-500" />
                                <span>Configuration en quelques clics</span>
                            </div>
                            <div className="hidden sm:block w-1 h-1 bg-slate-700 rounded-full"></div>
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-[#0a0a0a]"></div>
                                    ))}
                                </div>
                                <span>Rejoignez-nous</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-black py-16 border-t border-white/5 text-slate-500">
                <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2">
                        <Logo className="mb-6 scale-90 origin-left" />
                        <p className="max-w-xs mb-6">La première plateforme de gestion locative conçue spécifiquement pour les défis du marché immobilier ouest-africain.</p>
                        <div className="flex gap-4">
                            {/* Social Placeholders */}
                            <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center cursor-pointer"><Users className="w-4 h-4" /></div>
                            <div className="w-10 h-10 rounded-full bg-white/5 hover:bg-blue-600 hover:text-white transition-colors flex items-center justify-center cursor-pointer"><Smartphone className="w-4 h-4" /></div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Produit</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Fonctionnalités</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Tarifs</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Mises à jour</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Sécurité</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Légal</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Conditions Générales</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Confidentialité</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Mentions Légales</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-xs font-bold uppercase tracking-wider">
                    &copy; 2025 Noor Immobilier Technologies Sénégal. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}