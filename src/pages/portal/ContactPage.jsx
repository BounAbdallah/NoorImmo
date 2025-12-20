import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Loader, ArrowLeft } from 'lucide-react';
import { contactService } from '../../services/contactService';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';

// Logo component (reused for consistency)
const Logo = () => (
    <div className="flex items-center gap-3 select-none">
        <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-40"></div>
            {/* <div className="relative w-full h-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] rounded-xl border border-blue-500/30 flex items-center justify-center shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 text-white">
                    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M5 21V7L12 3L19 7V21" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M9 21V11L12 9.5L15 11V21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M12 14V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </div> */}
        </div>
        <div className="flex flex-col justify-center">
            <span className="text-xl font-black tracking-tighter text-white uppercase leading-none">
                Noor<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Immo</span>
            </span>
        </div>
    </div>
);

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
                    background: '#1e293b',
                    color: '#fff',
                    confirmButtonColor: '#2563eb'
                });

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
                background: '#1e293b',
                color: '#fff',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-blue-500 selection:text-white font-sans">

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-50 px-6 py-6 max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="hover:opacity-80 transition-opacity"><Logo /></Link>
                <Link to="/" className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
                </Link>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                        <MessageSquare className="w-3 h-3" /> Support & Commercial
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        Parlons de votre <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">projet.</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Une question sur nos tarifs ? Besoin d'une démo personnalisée ? Notre équipe est basée à Dakar et vous répond sous 24h.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Cards */}
                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Email</h3>
                            <p className="text-sm text-slate-400">contact@noorwebservices.com</p>
                            {/* <p className="text-sm text-slate-400">support@noor-immo.sn</p> */}
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-green-500/30 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Téléphone & WhatsApp</h3>
                            <p className="text-sm text-slate-400">+221 78 186 02 90</p>
                            <p className="text-sm text-slate-400">Lun-Ven, 9h-18h</p>
                        </div>

                        <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all group">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">Bureaux</h3>
                            <p className="text-sm text-slate-400">Khar Yallah, Front de terres . Villa 75</p>
                            <p className="text-sm text-slate-400">Dakar, Sénégal</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Prénom</label>
                                        <input
                                            type="text"
                                            name="prenom"
                                            required
                                            value={formData.prenom}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            placeholder="Votre prénom"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nom</label>
                                        <input
                                            type="text"
                                            name="nom"
                                            required
                                            value={formData.nom}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            placeholder="nom@entreprise.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Téléphone</label>
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={formData.telephone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                            placeholder="+221 77 000 00 00"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Entreprise</label>
                                    <input
                                        type="text"
                                        name="entreprise"
                                        value={formData.entreprise}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        placeholder="Nom de votre agence ou société"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Sujet</label>
                                    <input
                                        type="text"
                                        name="sujet"
                                        required
                                        value={formData.sujet}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                        placeholder="Demande de démo, Support, Partenariat..."
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Message</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:bg-white/[0.05] focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none"
                                        placeholder="Comment pouvons-nous vous aider ?"
                                        minLength={10}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="w-5 h-5 animate-spin" />
                                            <span>Envoi en cours...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            <span>Envoyer le message</span>
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