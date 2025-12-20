// ```javascript
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { planService } from '../../services/planService';
import {
    Building2, Menu, X, ArrowRight, Check,
    Home, Users, FileText, Bell, BarChart3,
    Shield, Clock, Smartphone, ChevronDown, Mail, Star
} from 'lucide-react';

export default function LandingPage() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);
    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const response = await planService.getAllPlans();
                if (response.success && Array.isArray(response.data)) {
                    setPlans(response.data.slice(0, 3));
                }
            } catch (error) {
                console.error('Error loading plans:', error);
            }
        };
        loadPlans();
    }, []);

    const features = [
        {
            icon: Home,
            title: "Gestion des Biens",
            description: "Centralisez tous vos biens immobiliers en un seul endroit avec photos, documents et détails."
        },
        {
            icon: Users,
            title: "Suivi des Locataires",
            description: "Gérez vos locataires, leurs baux et leurs informations de contact facilement."
        },
        {
            icon: FileText,
            title: "Gestion des Loyers",
            description: "Suivez les paiements, générez des quittances et gérez les impayés automatiquement."
        },
        {
            icon: Bell,
            title: "Notifications Automatiques",
            description: "Recevez des alertes pour les échéances, paiements et événements importants."
        },
        {
            icon: BarChart3,
            title: "Tableau de Bord",
            description: "Visualisez vos performances avec des statistiques et graphiques en temps réel."
        },
        {
            icon: Shield,
            title: "Sécurité des Données",
            description: "Vos données sont protégées avec un chiffrement de niveau bancaire."
        }
    ];

    const benefits = [
        {
            title: "Gain de Temps",
            description: "Automatisez les tâches répétitives et concentrez-vous sur l'essentiel."
        },
        {
            title: "Réduction des Erreurs",
            description: "Éliminez les erreurs de saisie manuelle avec notre système intelligent."
        },
        {
            title: "Accessibilité 24/7",
            description: "Accédez à vos données depuis n'importe où, à tout moment."
        },
        {
            title: "Support Dédié",
            description: "Notre équipe est là pour vous accompagner dans votre gestion."
        }
    ];

    const faqs = [
        {
            question: "Qu'est-ce que Noor Immo ?",
            answer: "Noor Immo est une plateforme complète de gestion immobilière qui vous permet de gérer vos biens, locataires, loyers et documents en un seul endroit."
        },
        {
            question: "Comment puis-je commencer ?",
            answer: "Inscrivez-vous gratuitement, choisissez votre plan et commencez à ajouter vos biens immobiliers. Notre interface intuitive vous guide à chaque étape."
        },
        {
            question: "Mes données sont-elles sécurisées ?",
            answer: "Oui, vos données sont protégées et stockées de manière sécurisée. Nous prenons la confidentialité de vos informations très au sérieux."
        },
        {
            question: "Puis-je gérer plusieurs agences ?",
            answer: "Oui, notre système permet la gestion multi-agences avec des permissions et accès personnalisés."
        },
        {
            question: "Y a-t-il une période d'essai ?",
            answer: "Oui, nous offrons une période d'essai pour que vous puissiez découvrir toutes les fonctionnalités de la plateforme."
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className={`fixed w - full z - 50 transition - all duration - 300 ${ scrolled ? 'bg-white shadow-md' : 'bg-transparent' } `}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <Building2 className={`h - 8 w - 8 ${ scrolled ? 'text-blue-600' : 'text-white' } `} />
                            <span className={`text - xl font - bold ${ scrolled ? 'text-gray-900' : 'text-white' } `}>
                                Noor Immo
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className={`${ scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200' } transition - colors`}>
                                Fonctionnalités
                            </a>
                            <Link to="/pricing" className={`${ scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200' } transition - colors`}>
                                Tarifs
                            </Link>
                            <a href="#faq" className={`${ scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200' } transition - colors`}>
                                FAQ
                            </a>
                            <Link to="/contact" className={`${ scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200' } transition - colors`}>
                                Contact
                            </Link>
                            <Link to="/login" className={`${ scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-blue-200' } transition - colors`}>
                                Connexion
                            </Link>
                            <Link to="/register" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Commencer
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden"
                        >
                            {mobileMenuOpen ? (
                                <X className={`h - 6 w - 6 ${ scrolled ? 'text-gray-900' : 'text-white' } `} />
                            ) : (
                                <Menu className={`h - 6 w - 6 ${ scrolled ? 'text-gray-900' : 'text-white' } `} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <a href="#features" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                                Fonctionnalités
                            </a>
                            <Link to="/pricing" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                                Tarifs
                            </Link>
                            <a href="#faq" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                                FAQ
                            </a>
                            <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                                Contact
                            </Link>
                            <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md">
                                Connexion
                            </Link>
                            <Link to="/register" className="block px-3 py-2 bg-blue-600 text-white rounded-md text-center">
                                Commencer
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white pt-32 pb-20 overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            Simplifiez la Gestion de<br />Votre Patrimoine Immobilier
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                            Noor Immo vous aide à gérer vos biens, locataires et loyers en toute simplicité avec une plateforme moderne et intuitive.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Commencer Gratuitement
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                            <Link
                                to="/pricing"
                                className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 bg-opacity-20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all border-2 border-white border-opacity-20"
                            >
                                Voir les Tarifs
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem & Solution */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Les Défis de la Gestion Immobilière
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    "Paperasse et documents éparpillés",
                                    "Suivi manuel des paiements de loyer",
                                    "Difficulté à gérer plusieurs biens",
                                    "Manque de visibilité sur les performances",
                                    "Communication difficile avec les locataires"
                                ].map((problem, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-red-100 flex items-center justify-center mt-1">
                                            <X className="h-4 w-4 text-red-600" />
                                        </div>
                                        <span className="ml-3 text-gray-700">{problem}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Notre Solution
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    "Centralisation de tous vos documents",
                                    "Suivi automatique des loyers et quittances",
                                    "Gestion multi-biens simplifiée",
                                    "Tableau de bord analytique complet",
                                    "Notifications et rappels automatiques"
                                ].map((solution, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-1">
                                            <Check className="h-4 w-4 text-green-600" />
                                        </div>
                                        <span className="ml-3 text-gray-700">{solution}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Fonctionnalités Complètes
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Tout ce dont vous avez besoin pour gérer efficacement votre patrimoine immobilier
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all hover:border-blue-300"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 bg-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Pourquoi Choisir Noor Immo ?
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="text-center">
                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {benefit.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Questions Fréquentes
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900">{faq.question}</span>
                                    <ChevronDown
                                        className={`h - 5 w - 5 text - gray - 500 transition - transform ${ openFaq === index ? 'transform rotate-180' : '' } `}
                                    />
                                </button>
                                {openFaq === index && (
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                        <p className="text-gray-600">{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Prêt à Simplifier Votre Gestion Immobilière ?
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        Rejoignez Noor Immo aujourd'hui et découvrez une nouvelle façon de gérer vos biens
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Commencer Maintenant
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link
                            to="/contact"
                            className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 bg-opacity-20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-opacity-30 transition-all border-2 border-white border-opacity-20"
                        >
                            <Mail className="mr-2 h-5 w-5" />
                            Nous Contacter
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <Building2 className="h-8 w-8 text-blue-500" />
                                <span className="text-xl font-bold text-white">Noor Immo</span>
                            </div>
                            <p className="text-sm">
                                La solution complète pour la gestion de votre patrimoine immobilier.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Produit</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                                <li><Link to="/pricing" className="hover:text-white transition-colors">Tarifs</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-4">Légal</h3>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Conditions</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                        <p>&copy; {new Date().getFullYear()} Noor Immo. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
