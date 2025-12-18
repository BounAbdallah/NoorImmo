import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customPlanService } from '../../services/customPlanService';
import { Check, ArrowLeft, Send } from 'lucide-react';
import Swal from 'sweetalert2';

const AVAILABLE_FEATURES = [
    'Gestion des biens',
    'Gestion des locataires',
    'Gestion des bailleurs',
    'Gestion des baux',
    'Suivi des paiements',
    'Gestion des incidents',
    'États des lieux',
    'Génération de documents',
    'Tableau de bord analytique',
    'Notifications automatiques',
    'Gestion d\'équipe',
    'API access',
    'Support prioritaire',
    'Formation personnalisée',
    'Intégration comptable',
    'Application mobile'
];

export default function CustomPlanRequestPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        entreprise: '',
        nombre_biens: '',
        nombre_utilisateurs: '',
        fonctionnalites_souhaitees: [],
        besoins_specifiques: '',
        budget_mensuel: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFeatureToggle = (feature) => {
        setFormData(prev => ({
            ...prev,
            fonctionnalites_souhaitees: prev.fonctionnalites_souhaitees.includes(feature)
                ? prev.fonctionnalites_souhaitees.filter(f => f !== feature)
                : [...prev.fonctionnalites_souhaitees, feature]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.fonctionnalites_souhaitees.length === 0) {
            Swal.fire('Attention', 'Veuillez sélectionner au moins une fonctionnalité', 'warning');
            return;
        }

        setLoading(true);
        try {
            const response = await customPlanService.submitRequest(formData);
            if (response.success) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Demande envoyée !',
                    html: `
                        <p>Merci ${formData.prenom} ${formData.nom} !</p>
                        <p>Votre demande de plan personnalisé a été envoyée avec succès.</p>
                        <p class="text-sm text-gray-600 mt-2">Notre équipe vous contactera sous 24-48h pour finaliser votre offre.</p>
                    `,
                    confirmButtonText: 'Retour à l\'accueil'
                });
                navigate('/');
            }
        } catch (error) {
            Swal.fire('Erreur', error.response?.data?.message || 'Une erreur est survenue', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                </button>

                <div className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-slate-900 mb-3">
                        Plan Sur Mesure
                    </h1>
                    <p className="text-lg text-slate-600">
                        Créons ensemble le plan parfait pour votre entreprise
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
                    {/* Personal Information */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm font-bold">1</span>
                            Vos informations
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Prénom *</label>
                                <input
                                    type="text"
                                    name="prenom"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nom *</label>
                                <input
                                    type="text"
                                    name="nom"
                                    value={formData.nom}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Téléphone</label>
                                <input
                                    type="tel"
                                    name="telephone"
                                    value={formData.telephone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Entreprise</label>
                                <input
                                    type="text"
                                    name="entreprise"
                                    value={formData.entreprise}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Needs */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm font-bold">2</span>
                            Vos besoins
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre de biens à gérer *</label>
                                <input
                                    type="number"
                                    name="nombre_biens"
                                    value={formData.nombre_biens}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre d'utilisateurs *</label>
                                <input
                                    type="number"
                                    name="nombre_utilisateurs"
                                    value={formData.nombre_utilisateurs}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Budget mensuel estimé (FCFA)</label>
                                <input
                                    type="number"
                                    name="budget_mensuel"
                                    value={formData.budget_mensuel}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm font-bold">3</span>
                            Fonctionnalités souhaitées *
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {AVAILABLE_FEATURES.map((feature) => (
                                <button
                                    key={feature}
                                    type="button"
                                    onClick={() => handleFeatureToggle(feature)}
                                    className={`p-4 rounded-lg border-2 text-left transition-all ${formData.fonctionnalites_souhaitees.includes(feature)
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-slate-900">{feature}</span>
                                        {formData.fonctionnalites_souhaitees.includes(feature) && (
                                            <Check className="w-5 h-5 text-primary-600" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <p className="text-sm text-slate-500 mt-3">
                            {formData.fonctionnalites_souhaitees.length} fonctionnalité(s) sélectionnée(s)
                        </p>
                    </div>

                    {/* Specific Needs */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                            <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center mr-3 text-sm font-bold">4</span>
                            Besoins spécifiques
                        </h2>
                        <textarea
                            name="besoins_specifiques"
                            value={formData.besoins_specifiques}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Décrivez vos besoins particuliers, intégrations souhaitées, ou toute autre information utile..."
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5 mr-2" />
                                    Envoyer ma demande
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
