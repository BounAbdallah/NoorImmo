import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Building, User, MessageSquare, Loader } from 'lucide-react';
import { contactService } from '../../services/contactService';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';

export default function ContactPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        entreprise: '',
        sujet: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await contactService.sendMessage(formData);

            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Message envoyé !',
                    text: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
                    confirmButtonColor: '#2563eb'
                });

                // Reset form
                setFormData({
                    nom: '',
                    prenom: '',
                    email: '',
                    telephone: '',
                    entreprise: '',
                    sujet: '',
                    message: ''
                });

                navigate('/');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.response?.data?.message || 'Une erreur est survenue lors de l\'envoi du message.',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
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
                        <Link to="/pricing" className="text-sm font-medium text-slate-600 hover:text-blue-500 transition-colors">
                            Tarifs
                        </Link>
                        <Link to="/contact" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
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

            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white overflow-hidden mt-20">
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
                            Parlons de votre projet
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
                            Notre équipe d'experts est à votre écoute pour transformer vos idées en réalité
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                Réponse sous 24h
                            </div>
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                Support 7j/7
                            </div>
                            <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                Consultation gratuite
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Contact Cards */}
                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                                    <p className="text-gray-600">contact@noor-immo.com</p>
                                    <p className="text-gray-600">support@noor-immo.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <Phone className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Téléphone</h3>
                                    <p className="text-gray-600">+221 77 123 45 67</p>
                                    <p className="text-gray-600">+221 33 123 45 67</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                            <div className="flex items-start space-x-4">
                                <div className="bg-purple-100 p-3 rounded-lg">
                                    <MapPin className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-1">Adresse</h3>
                                    <p className="text-gray-600">
                                        Dakar, Sénégal<br />
                                        Plateau, Rue 123
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                            <h3 className="font-semibold mb-3 flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Horaires d'ouverture
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Lundi - Vendredi</span>
                                    <span className="font-medium">8h - 18h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Samedi</span>
                                    <span className="font-medium">9h - 13h</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Dimanche</span>
                                    <span className="font-medium">Fermé</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Envoyez-nous un message
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="prenom" className="block text-sm font-medium text-gray-700 mb-2">
                                            Prénom *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="prenom"
                                                name="prenom"
                                                required
                                                value={formData.prenom}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Votre prénom"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom *
                                        </label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                id="nom"
                                                name="nom"
                                                required
                                                value={formData.nom}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Votre nom"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Email & Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                required
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="votre@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                                            Téléphone
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                id="telephone"
                                                name="telephone"
                                                value={formData.telephone}
                                                onChange={handleChange}
                                                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="+221 77 123 45 67"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Company */}
                                <div>
                                    <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 mb-2">
                                        Entreprise
                                    </label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            id="entreprise"
                                            name="entreprise"
                                            value={formData.entreprise}
                                            onChange={handleChange}
                                            className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Nom de votre entreprise"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-2">
                                        Sujet *
                                    </label>
                                    <input
                                        type="text"
                                        id="sujet"
                                        name="sujet"
                                        required
                                        value={formData.sujet}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Objet de votre message"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows="6"
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                        placeholder="Décrivez votre demande en détail..."
                                        minLength="10"
                                    />
                                    <p className="mt-2 text-sm text-gray-500">
                                        Minimum 10 caractères
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Envoyer le message
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
