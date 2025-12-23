import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import { featureService } from '../../services/featureService';

export default function FeaturesManagementPage() {
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingFeature, setEditingFeature] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        nom: '',
        description: '',
        module: '',
        icone: '',
        route: '',
        actif: true,
        ordre: 0
    });

    useEffect(() => {
        loadFeatures();
    }, []);

    const loadFeatures = async () => {
        try {
            setLoading(true);
            const response = await featureService.getAllFeatures();
            if (response.success) {
                setFeatures(response.data || []);
            }
        } catch (error) {
            console.error('Error loading features:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingFeature) {
                await featureService.updateFeature(editingFeature.id, formData);
            } else {
                await featureService.createFeature(formData);
            }
            loadFeatures();
            resetForm();
        } catch (error) {
            console.error('Error saving feature:', error);
            alert('Erreur lors de la sauvegarde de la fonctionnalité');
        }
    };

    const handleEdit = (feature) => {
        setEditingFeature(feature);
        setFormData({
            code: feature.code,
            nom: feature.nom,
            description: feature.description || '',
            module: feature.module || '',
            icone: feature.icone || '',
            route: feature.route || '',
            actif: feature.actif,
            ordre: feature.ordre
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette fonctionnalité ?')) {
            return;
        }
        try {
            await featureService.deleteFeature(id);
            loadFeatures();
        } catch (error) {
            console.error('Error deleting feature:', error);
            alert('Erreur lors de la suppression. Cette fonctionnalité est peut-être associée à des plans.');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            nom: '',
            description: '',
            module: '',
            icone: '',
            route: '',
            actif: true,
            ordre: 0
        });
        setEditingFeature(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Fonctionnalités</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={20} />
                    Nouvelle Fonctionnalité
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold">
                                    {editingFeature ? 'Modifier la Fonctionnalité' : 'Nouvelle Fonctionnalité'}
                                </h2>
                                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="ex: gestion_biens"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nom <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.nom}
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="ex: Gestion des Biens"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows="3"
                                        placeholder="Description de la fonctionnalité"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
                                        <input
                                            type="text"
                                            value={formData.module}
                                            onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="ex: biens"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Icône (Lucide)</label>
                                        <input
                                            type="text"
                                            value={formData.icone}
                                            onChange={(e) => setFormData({ ...formData, icone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="ex: Home"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
                                        <input
                                            type="text"
                                            value={formData.route}
                                            onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="ex: /biens"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                                        <input
                                            type="number"
                                            value={formData.ordre}
                                            onChange={(e) => setFormData({ ...formData, ordre: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="actif"
                                        checked={formData.actif}
                                        onChange={(e) => setFormData({ ...formData, actif: e.target.checked })}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="actif" className="ml-2 text-sm font-medium text-gray-700">
                                        Actif
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Save size={20} />
                                        {editingFeature ? 'Mettre à jour' : 'Créer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Features List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ordre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Module
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Route
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Statut
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {features.map((feature) => (
                            <tr key={feature.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <GripVertical size={16} className="inline" /> {feature.ordre}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">{feature.code}</code>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {feature.nom}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {feature.module || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {feature.route || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${feature.actif
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}
                                    >
                                        {feature.actif ? 'Actif' : 'Inactif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleEdit(feature)}
                                        className="text-blue-600 hover:text-blue-900 mr-3"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(feature.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {features.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        Aucune fonctionnalité trouvée. Créez-en une pour commencer.
                    </div>
                )}
            </div>
        </div>
    );
}
