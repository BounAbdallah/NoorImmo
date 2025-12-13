import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Check, Shield, TrendingUp, Users, Home, Building,
    Layout, FileText, ArrowRight, Activity, Smartphone,
    PieChart, MessageSquare, Briefcase, Key, Menu, X, Star, Zap
} from 'lucide-react';

export default function LandingPage() {
    const [activeTab, setActiveTab] = useState('agence');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Scroll effect for navbar
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = {
        agence: [
            { title: 'Gestion de Parc Unifiée', desc: 'Centralisez la gestion de vos Immeubles, Biens et Locataires.', icon: Building },
            { title: 'Suivi des Impayés', desc: 'Identifiez instantanément les retards et suivez les paiements.', icon: Activity },
            { title: 'Gestion des Bailleurs', desc: 'Gérez vos propriétaires et leurs portefeuilles.', icon: Briefcase },
            { title: 'Tableau de Bord', desc: 'Vues statistiques précises sur les performances.', icon: PieChart },
        ],
        bailleur: [
            { title: 'Vue Portfolio', desc: 'Accédez à la liste complète de vos immeubles et biens.', icon: Building },
            { title: 'Suivi Financier', desc: 'Consultez l\'historique des paiements de loyers.', icon: TrendingUp },
            { title: 'Documents Numériques', desc: 'Visualisez les états des lieux et contrats.', icon: FileText },
            { title: 'Suivi des Incidents', desc: 'Soyez informé des demandes d\'intervention.', icon: MessageSquare },
        ],
        locataire: [
            { title: 'Signalement Incidents', desc: 'Déclarez facilement un problème technique.', icon: MessageSquare },
            { title: 'Suivi des Demandes', desc: 'Suivez l\'avancement de vos signalements.', icon: Activity },
            { title: 'Communication Agence', desc: 'Un canal direct avec votre gestionnaire.', icon: Users },
            { title: 'Espace Personnel', desc: 'Accès sécurisé à vos informations.', icon: Key },
        ]
    };

    return (
        <div className="bg-white overflow-hidden font-sans selection:bg-primary-100 selection:text-primary-900">

            {/* HERRO SECTION */}
            <div className="relative bg-slate-900 min-h-[90vh] flex items-center overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
                        alt="Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-primary-900/40" />
                    {/* Architectural Mesh */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>

                    {/* Animated Blobs */}
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
                </div>

                {/* Navbar */}
                <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-900/90 backdrop-blur-md border-b border-slate-700 py-4' : 'bg-transparent py-6'}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                        <div className="text-white font-bold text-2xl tracking-tighter flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <Building className="text-white h-5 w-5" />
                            </div>
                            <span>Noor<span className="text-primary-400">Immo</span>.</span>
                        </div>
                        <div className="hidden md:flex space-x-8 items-center">
                            <a href="#features" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Fonctionnalités</a>
                            <a href="#testimonials" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Témoignages</a>
                            <div className="h-6 w-px bg-slate-700 mx-2"></div>
                            <Link to="/login" className="text-white hover:text-primary-400 font-medium text-sm">Connexion</Link>
                            <Link to="/register" className="px-5 py-2.5 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-transform hover:scale-105 shadow-lg shadow-white/10 text-sm">
                                S'inscrire
                            </Link>
                        </div>
                        {/* Mobile menu button */}
                        <div className="flex items-center md:hidden">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden absolute top-20 left-4 right-4 bg-slate-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-700 z-50 space-y-4 animate-in slide-in-from-top-4">
                            <Link to="/login" className="block text-white font-medium text-center py-2">Connexion</Link>
                            <Link to="/register" className="block px-4 py-3 bg-primary-600 text-white rounded-xl font-bold text-center">S'inscrire</Link>
                        </div>
                    )}
                </nav>

                {/* Hero Content */}
                <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="lg:w-1/2 text-center lg:text-left">
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 text-primary-300 text-xs font-bold uppercase tracking-wider mb-8 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Zap className="w-3 h-3 mr-2 text-yellow-400 fill-yellow-400" />
                                La plateforme #1 au Sénégal
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                                L'immobilier <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-cyan-400 to-primary-400 bg-[length:200%_auto] animate-gradient">
                                    nouvelle génération.
                                </span>
                            </h1>
                            <p className="text-xl text-slate-300 max-w-xl leading-relaxed mx-auto lg:mx-0 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                Automatisez la gestion locative. Sécurisez les revenus. Simplifiez la vie des bailleurs et locataires. Tout cela, au même endroit.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                                <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-slate-900 bg-white hover:bg-slate-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:-translate-y-1">
                                    Commencer gratuitement
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm text-base font-medium rounded-xl text-white hover:bg-slate-700/50 transition-all">
                                    Nous contacter
                                </Link>
                            </div>
                        </div>

                        {/* Floating Morphing Dashboard Visual */}
                        <div className="lg:w-1/2 relative animate-in fade-in zoom-in duration-1000 delay-300">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 group perspective-1000">
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-cyan-500/20 mix-blend-overlay z-10 pointer-events-none"></div>
                                <img
                                    src="/images/dashboard_banner.png"
                                    alt="Interface Dashboard Batiyakaar"
                                    className="w-full rounded-2xl transform transition-transform duration-700 group-hover:scale-[1.02]"
                                />
                                {/* Floating Badges */}
                                <div className="absolute top-10 left-10 bg-slate-800/90 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce [animation-duration:3s]">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400">Loyer reçu</div>
                                        <div className="text-sm font-bold text-white">+ 150.000 FCFA</div>
                                    </div>
                                </div>
                                <div className="absolute bottom-10 right-10 bg-slate-800/90 backdrop-blur border border-slate-700 p-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce [animation-duration:4s]">
                                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-400">Nouveau contrat</div>
                                        <div className="text-sm font-bold text-white">Validé</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PARTNERS / TRUST STRIP */}
            <div className="border-y border-slate-100 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    {['Agence Immo', 'Sénégal Trust', 'Dakar Building', 'West Africa Prop'].map((p, i) => (
                        <div key={i} className="text-lg font-bold text-slate-400 flex items-center gap-2">
                            <Building className="w-5 h-5" /> {p}
                        </div>
                    ))}
                </div>
            </div>

            {/* KEY STATS (NEW) */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100 py-12">
                        {[
                            { label: 'Utilisateurs Actifs', value: '1,200+' },
                            { label: 'Biens Gérés', value: '5,000+' },
                            { label: 'Taux de Recouvrement', value: '98%' },
                            { label: 'Support Client', value: '24/7' },
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center px-4">
                                <div className="text-4xl font-extrabold text-slate-900 mb-2">{stat.value}</div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FEATURE TABS SECTION */}
            <div id="features" className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Fonctionnalités</span>
                        <h2 className="mt-2 text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6">
                            L'outil ultime pour<br />
                            <span className="text-slate-400">les Agences Immobilières.</span>
                        </h2>
                    </div>

                    {/* Styled Tabs */}
                    <div className="flex justify-center mb-16">
                        <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex relative cursor-default">
                            {['agence', 'bailleur', 'locataire'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => role === 'agence' && setActiveTab(role)}
                                    disabled={role !== 'agence'}
                                    className={`relative z-10 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 capitalize flex items-center gap-2 ${activeTab === role
                                        ? 'bg-white text-primary-600 shadow-xl scale-105 cursor-default'
                                        : 'text-slate-400 bg-transparent cursor-not-allowed opacity-70'
                                        }`}
                                >
                                    {role === 'agence' && <Briefcase className="w-4 h-4" />}
                                    {role === 'bailleur' && <Key className="w-4 h-4" />}
                                    {role === 'locataire' && <Home className="w-4 h-4" />}
                                    {role}
                                    {role !== 'agence' && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded text-[10px] uppercase tracking-wider font-extrabold">
                                            Bientôt
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features[activeTab].map((feature, idx) => (
                            <div key={idx} className="group bg-white p-8 rounded-3xl border border-slate-100 hover:border-primary-100 shadow-sm hover:shadow-2xl hover:shadow-primary-900/5 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500"></div>
                                <div className={`relative w-14 h-14 rounded-2xl mb-8 flex items-center justify-center bg-slate-50 text-slate-900 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300 shadow-inner`}>
                                    <feature.icon className="h-7 w-7" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h4>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* WORKFLOW SECTION (NEW) */}
            <div className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-primary-600 font-bold tracking-wider uppercase text-sm">Simplicité</span>
                        <h2 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                            Démarrez en moins de 5 minutes
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Hidden on Mobile) */}
                        <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-slate-200 -z-10"></div>

                        {[
                            { step: "01", title: "Créez votre compte", desc: "Inscrivez votre agence et configurez votre profil en quelques clics.", icon: Users },
                            { step: "02", title: "Importez vos données", desc: "Ajoutez vos immeubles, biens et locataires existants facilement.", icon: FileText },
                            { step: "03", title: "Automatisez tout", desc: "Laissez la plateforme gérer les quittances, relances et rapports.", icon: Zap }
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-slate-50 relative z-10">
                                    <s.icon className="w-10 h-10 text-primary-600" />
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
                                        {s.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                                <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MOBILE SECTION (NEW) */}
            <div className="py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 gap-12 items-center">
                        <div className="mb-12 lg:mb-0">
                            <h2 className="text-3xl font-extrabold text-slate-900 mb-6">
                                Votre agence,<br />
                                <span className="text-primary-600">partout avec vous.</span>
                            </h2>
                            <p className="text-lg text-slate-500 mb-8 leading-relaxed">
                                Ne soyez plus enchaîné à votre bureau. Accédez à vos dossiers,validez des paiements et répondez aux incidents depuis votre smartphone, où que vous soyez.
                            </p>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                                        <Smartphone className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">Interface Mobile First</div>
                                        <div className="text-sm text-slate-500">Optimisé pour iPhone et Android</div>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                                        <Zap className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">Notifications Temps Réel</div>
                                        <div className="text-sm text-slate-500">Soyez alerté instantanément</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative flex justify-center">
                            <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full"></div>
                            {/* Simple Mobile Mockup using CSS borders */}
                            <div className="relative w-64 h-[500px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl p-2 relative z-10">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                                    {/* Mock App Content */}
                                    <div className="bg-primary-600 h-32 p-6 text-white pt-12">
                                        <div className="text-sm opacity-80">Bonjour, Alioune</div>
                                        <div className="font-bold text-2xl">324.000 F</div>
                                        <div className="text-xs opacity-80">Encaissé ce mois</div>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <div className="bg-slate-100 h-20 rounded-xl"></div>
                                        <div className="bg-slate-100 h-20 rounded-xl"></div>
                                        <div className="bg-slate-100 h-20 rounded-xl"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COMPARISON TABLE (NEW) */}
            <div className="py-24 bg-slate-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Pourquoi changer ?</h2>
                        <p className="text-slate-500">Voyez la différence par vous-même.</p>
                    </div>
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                        <div className="grid grid-cols-3 bg-slate-900 text-white p-6 font-bold text-center">
                            <div className="text-left pl-4">Fonctionnalité</div>
                            <div className="text-slate-400 font-normal">Excel / Papier</div>
                            <div className="text-primary-400">NoorImmo</div>
                        </div>
                        {[
                            { label: "Génération de Quittances", old: "Manuelle (Lent)", new: "Automatique (Instantané)" },
                            { label: "Suivi des Impayés", old: "Difficile à voir", new: "Alertes automatiques" },
                            { label: "Historique Locataire", old: "Dossiers éparpillés", new: "Centralisé & Sécurisé" },
                            { label: "Rapports Financiers", old: "Calculs complexes", new: "Temps réel" },
                            { label: "Accès à distance", old: "Impossible", new: "100% Cloud" },
                        ].map((row, idx) => (
                            <div key={idx} className="grid grid-cols-3 p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors text-center items-center">
                                <div className="text-left font-bold text-slate-900 pl-4">{row.label}</div>
                                <div className="text-slate-500 text-sm">{row.old}</div>
                                <div className="text-primary-600 font-bold flex justify-center items-center gap-2">
                                    <Check className="w-4 h-4" /> {row.new}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECURITY & TRUST (NEW) */}
            <div className="bg-slate-900 py-20 border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-xs font-bold uppercase tracking-wider mb-6 border border-green-900/50">
                                <Shield className="w-3 h-3 mr-2" /> Sécurité Maximale
                            </div>
                            <h2 className="text-3xl font-extrabold text-white mb-6">
                                Vos données sont blindées.
                            </h2>
                            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                                Nous savons que la confidentialité de vos propriétaires et locataires est critique. C'est pourquoi nous utilisons les standards de sécurité bancaire.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Chiffrement SSL/TLS de bout en bout',
                                    'Sauvegardes quotidiennes automatiques',
                                    'Hébergement Cloud sécurisé et redondant',
                                    'Conformité aux normes de protection des données'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center text-slate-300">
                                        <Check className="w-5 h-5 mr-3 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-600/20 blur-3xl rounded-full"></div>
                            <div className="relative bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
                                <div className="flex items-center mb-6 border-b border-slate-700 pb-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="space-y-3 font-mono text-sm">
                                    <div className="flex justify-between text-slate-400">
                                        <span>Status du serveur</span>
                                        <span className="text-green-400">Opérationnel</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Dernière sauvegarde</span>
                                        <span className="text-blue-400">Il y a 10 min</span>
                                    </div>
                                    <div className="flex justify-between text-slate-400">
                                        <span>Chiffrement</span>
                                        <span className="text-purple-400">AES-256 Enabled</span>
                                    </div>
                                    <div className="mt-4 p-3 bg-slate-900/50 rounded text-xs text-slate-500">
                                        &gt; System check complete.<br />
                                        &gt; Data integrity verified.<br />
                                        &gt; All systems go.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ SECTION (NEW) */}
            <div className="py-24 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Questions Fréquentes</h2>
                        <p className="mt-4 text-slate-500">Tout ce que vous devez savoir avant de commencer.</p>
                    </div>
                    <div className="space-y-6">
                        {[
                            { q: "Est-ce difficile de migrer mes données ?", r: "Non, notre outil d'importation Excel vous permet d'ajouter tout votre parc en quelques minutes. Notre équipe support peut aussi le faire pour vous." },
                            { q: "Puis-je gérer plusieurs utilisateurs ?", r: "Absolument. Selon votre abonnement, vous pouvez ajouter des collaborateurs avec des droits d'accès spécifiques." },
                            { q: "Mes données sont-elles accessibles partout ?", r: "Oui, NoorImmo est une solution 100% cloud. Vous pouvez gérer votre agence depuis votre bureau, votre maison ou en déplacement sur mobile." },
                            { q: "Y a-t-il un engagement de durée ?", r: "Non, nos offres sont sans engagement. Vous pouvez arrêter à tout moment. Nous croyons à la qualité de notre service pour vous retenir." }
                        ].map((faq, i) => (
                            <div key={i} className="border border-slate-200 rounded-xl p-6 hover:border-primary-200 transition-colors bg-slate-50 hover:bg-white shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{faq.q}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{faq.r}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div id="testimonials" className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-3xl font-bold text-center mb-16">Ils ont transformé leur gestion</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: "Moussa Diop", role: "Gestionnaire Agence", text: "Un gain de temps phénoménal. Mes quittances partent toutes seules." },
                            { name: "Fatou Sow", role: "Propriétaire Bailleur", text: "Enfin je vois clair dans mes revenus locatifs. Transparence totale." },
                            { name: "Jean Gomis", role: "Locataire", text: "L'interface est super simple pour signaler un problème de plomberie." }
                        ].map((t, i) => (
                            <div key={i} className="bg-slate-800/50 backdrop-blur p-8 rounded-2xl border border-slate-700 hover:bg-slate-800 transition-colors">
                                <div className="flex text-yellow-400 mb-4 gap-1">
                                    {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                                </div>
                                <p className="text-slate-300 mb-6 italic">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-cyan-400 rounded-full flex items-center justify-center font-bold text-slate-900">
                                        {t.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold">{t.name}</div>
                                        <div className="text-sm text-slate-500">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* FINAL CTA */}
            <div className="relative py-24 bg-white overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 text-center">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-50 to-transparent blur-3xl -z-10"></div>
                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-8 tracking-tight">
                        Prêt à passer au <span className="text-primary-600">niveau supérieur</span> ?
                    </h2>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                        Rejoignez les agences modernes qui utilisent Bati Yakaar pour leur croissance.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-12 py-5 bg-slate-900 text-white rounded-full text-lg font-bold shadow-2xl hover:bg-primary-600 hover:scale-105 transition-all duration-300"
                    >
                        Créer un compte maintenant
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-2 md:col-span-1">
                            <span className="text-xl font-bold text-slate-900">Noor<span className="text-primary-600">Immo</span>.</span>
                            <p className="mt-4 text-sm text-slate-500">
                                La solution complète pour la gestion immobilière au Sénégal.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Produit</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-primary-600">Fonctionnalités</a></li>
                                <li><a href="#" className="hover:text-primary-600">Tarifs</a></li>
                                <li><a href="#" className="hover:text-primary-600">Témoignages</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Légal</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-primary-600">Confidentialité</a></li>
                                <li><a href="#" className="hover:text-primary-600">CGU</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>support@batimmo.sn</li>
                                <li>+221 33 000 00 00</li>
                                <li>Dakar, Sénégal</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} Noor Immo. Tous droits réservés.
                    </div>
                </div>
            </footer>
        </div>
    );
}
