import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function PlanFormModal({ isOpen, onClose, onSubmit, plan = null }) {
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        prix_mensuel: '',
        prix_annuel: '',
        limite_utilisateurs: '',
        limite_biens: '',
        fonctionnalites: [],
        actif: true
    });
    const [newFeature, setNewFeature] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (plan) {
            setFormData({
                nom: plan.nom || '',
                description: plan.description || '',
                prix_mensuel: plan.prix_mensuel || '',
                prix_annuel: plan.prix_annuel || '',
                limite_utilisateurs: plan.limite_utilisateurs || '',
                limite_biens: plan.limite_biens || '',
                fonctionnalites: Array.isArray(plan.fonctionnalites) ? plan.fonctionnalites : [],
                actif: plan.actif !== undefined ? plan.actif : true
            });
        } else {
            // Reset form for new plan
            setFormData({
                nom: '',
                description: '',
                prix_mensuel: '',
                prix_annuel: '',
                limite_utilisateurs: '',
                limite_biens: '',
                fonctionnalites: [],
                actif: true
            });
        }
        setErrors({});
    }, [plan, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData(prev => ({
                ...prev,
                fonctionnalites: [...prev.fonctionnalites, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            fonctionnalites: prev.fonctionnalites.filter((_, i) => i !== index)
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
        if (!formData.description.trim()) newErrors.description = 'La description est requise';
        if (!formData.prix_mensuel || formData.prix_mensuel < 0) newErrors.prix_mensuel = 'Prix mensuel invalide';
        if (formData.limite_utilisateurs === '' || formData.limite_utilisateurs < -1) newErrors.limite_utilisateurs = 'Limite invalide (-1 pour illimité)';
        if (formData.limite_biens === '' || formData.limite_biens < -1) newErrors.limite_biens = 'Limite invalide (-1 pour illimité)';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {plan ? 'Modifier le plan' : 'Nouveau plan'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Nom */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom du plan *
                            </label>
                            <input
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nom ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Ex: Starter, Pro, Enterprise"
                            />
                            {errors.nom && <p className="text-red-500 text-sm mt-1">{errors.nom}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Description du plan"
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>

                        {/* Prix */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prix mensuel (XOF) *
                                </label>
                                <input
                                    type="number"
                                    name="prix_mensuel"
                                    value={formData.prix_mensuel}
                                    onChange={handleChange}
                                    min="0"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.prix_mensuel ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="0"
                                />
                                {errors.prix_mensuel && <p className="text-red-500 text-sm mt-1">{errors.prix_mensuel}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Prix annuel (XOF)
                                </label>
                                <input
                                    type="number"
                                    name="prix_annuel"
                                    value={formData.prix_annuel}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        {/* Limites */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Limite utilisateurs *
                                </label>
                                <input
                                    type="number"
                                    name="limite_utilisateurs"
                                    value={formData.limite_utilisateurs}
                                    onChange={handleChange}
                                    min="-1"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.limite_utilisateurs ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="-1 pour illimité"
                                />
                                {errors.limite_utilisateurs && <p className="text-red-500 text-sm mt-1">{errors.limite_utilisateurs}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Limite biens *
                                </label>
                                <input
                                    type="number"
                                    name="limite_biens"
                                    value={formData.limite_biens}
                                    onChange={handleChange}
                                    min="-1"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.limite_biens ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="-1 pour illimité"
                                />
                                {errors.limite_biens && <p className="text-red-500 text-sm mt-1">{errors.limite_biens}</p>}
                            </div>
                        </div>

                        {/* Fonctionnalités */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fonctionnalités
                            </label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ajouter une fonctionnalité"
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {formData.fonctionnalites.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                        <span className="flex-1 text-sm">{feature}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actif */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="actif"
                                checked={formData.actif}
                                onChange={handleChange}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm font-medium text-gray-700">
                                Plan actif
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {plan ? 'Mettre à jour' : 'Créer'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
