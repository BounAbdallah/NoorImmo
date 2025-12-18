import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function PortalLayout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Handle scroll effect for transparency
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Accueil', path: '/' },
        { name: 'Fonctionnalités', path: '/features' },
        { name: 'Tarifs', path: '/pricing' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-primary-100 selection:text-primary-900">
            {/* Navbar */}
            <nav
                className={cn(
                    "fixed w-full z-50 transition-all duration-300 border-b border-transparent",
                    scrolled ? "bg-white/90 backdrop-blur-md shadow-sm border-gray-200 py-2" : "bg-transparent py-4 text-gray-800"
                )}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl mr-2 shadow-lg">
                                N
                            </div>
                            <span className={cn("text-2xl font-bold tracking-tight", scrolled ? "text-gray-900" : "text-gray-900")}>
                                Noor<span className="text-primary-600">Immo</span>
                            </span>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex ml-10 space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={cn(
                                        "inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors hover:text-primary-600",
                                        location.pathname === link.path ? "text-primary-600 font-semibold" : "text-gray-600"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <Link
                                to="/register"
                                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all hover:shadow-md hover:-translate-y-0.5"
                            >
                                Commencer gratuitement
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="-mr-2 flex items-center md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none"
                            >
                                <span className="sr-only">Ouvrir le menu</span>
                                {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div className={cn("md:hidden absolute top-full left-0 w-full bg-white shadow-lg transition-all duration-300 ease-in-out border-b border-gray-100", isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none")}>
                    <div className="pt-2 pb-3 space-y-1 px-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMenuOpen(false)}
                                className={cn(
                                    "block px-3 py-3 rounded-md text-base font-medium transition-colors",
                                    location.pathname === link.path ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>
                    <div className="pt-4 pb-6 border-t border-gray-200 px-4 space-y-3">
                        <Link to="/login" className="block w-full text-center px-4 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                            Se connecter
                        </Link>
                        <Link to="/register" className="block w-full text-center px-4 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700">
                            Créer un compte
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow pt-16">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center text-white mb-4">
                                <div className="w-8 h-8 bg-primary-500 rounded flex items-center justify-center font-bold mr-2">N</div>
                                <span className="text-xl font-bold">Noor Immo</span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-400 mb-4">
                                La première plateforme digitalisée pour la gestion immobilière et le suivi de construction au Sénégal. Transparence, Sécurité et Simplicité.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
                                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
                                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
                                <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Produit</h3>
                            <ul className="space-y-3">
                                <li><Link to="/features" className="text-sm hover:text-primary-400 transition-colors">Fonctionnalités</Link></li>
                                <li><Link to="/pricing" className="text-sm hover:text-primary-400 transition-colors">Tarifs</Link></li>
                                <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Témoignages</a></li>
                                <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Roadmap</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Ressources</h3>
                            <ul className="space-y-3">
                                <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Centre d'aide</a></li>
                                <li><a href="#" className="text-sm hover:text-primary-400 transition-colors">Partenaires</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Inscription Newsletter</h3>
                            <p className="text-sm text-slate-400 mb-3">Recevez nos dernières actualités et conseils immobiliers.</p>
                            <form className="flex">
                                <input
                                    type="email"
                                    className="flex-1 min-w-0 px-4 py-2 text-sm text-gray-900 bg-white rounded-l-md border-0 focus:ring-2 focus:ring-primary-500"
                                    placeholder="Votre email"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Noor Immo. Fait avec passion à Dakar.</p>
                        <div className="flex space-x-6 mt-4 md:mt-0">
                            <a href="#" className="text-xs text-slate-500 hover:text-slate-300">Mentions Légales</a>
                            <a href="#" className="text-xs text-slate-500 hover:text-slate-300">Confidentialité</a>
                            <a href="#" className="text-xs text-slate-500 hover:text-slate-300">CGU</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
