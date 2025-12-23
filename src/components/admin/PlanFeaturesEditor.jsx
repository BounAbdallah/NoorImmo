import React, { useState, useEffect } from 'react';
import { Check, X, Save } from 'lucide-react';
import { featureService } from '../../services/featureService';

export default function PlanFeaturesEditor({ plan, onClose, onSave }) {
    const [allFeatures, setAllFeatures] = useState([]);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [plan]);

    const loadData = async () => {
        try {
            setLoading(true);
            // Load all features
            const featuresResponse = await featureService.getAllFeatures();
            if (featuresResponse.success) {
                setAllFeatures(featuresResponse.data || []);
            }

            // Load plan's current features
            const planFeaturesResponse = await featureService.getPlanFeatures(plan.id);
            if (planFeaturesResponse.success) {
                const featureIds = (planFeaturesResponse.data || []).map(f => f.id);
                setSelectedFeatures(featureIds);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFeature = (featureId) => {
        setSelectedFeatures(prev => {
            if (prev.includes(featureId)) {
                return prev.filter(id => id !== featureId);
            } else {
                return [...prev, featureId];
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await featureService.updatePlanFeatures(plan.id, selectedFeatures);
            onSave && onSave();
            onClose();
        } catch (error) {
            console.error('Error saving plan features:', error);
            alert('Erreur lors de la sauvegarde des fonctionnalités');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    <div className="text-center">Chargement...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Gérer les Fonctionnalités
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Plan : <span className="font-semibold">{plan.nom}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Features List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-3">
                        {allFeatures.map((feature) => {
                            const isSelected = selectedFeatures.includes(feature.id);
                            return (
                                <div
                                    key={feature.id}
                                    onClick={() => toggleFeature(feature.id)}
                                    className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }
                  `}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Checkbox */}
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div
                                                className={`
                          w-5 h-5 rounded border-2 flex items-center justify-center
                          ${isSelected
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'border-gray-300'
                                                    }
                        `}
                                            >
                                                {isSelected && <Check size={14} className="text-white" />}
                                            </div>
                                        </div>

                                        {/* Feature Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {feature.nom}
                                                </h3>
                                                <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                    {feature.code}
                                                </code>
                                                {!feature.actif && (
                                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                                                        Inactif
                                                    </span>
                                                )}
                                            </div>
                                            {feature.description && (
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {feature.description}
                                                </p>
                                            )}
                                            <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                {feature.module && (
                                                    <span>Module: <code>{feature.module}</code></span>
                                                )}
                                                {feature.route && (
                                                    <span>Route: <code>{feature.route}</code></span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {allFeatures.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Aucune fonctionnalité disponible
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold">{selectedFeatures.length}</span> fonctionnalité(s) sélectionnée(s)
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                <Save size={18} />
                                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
