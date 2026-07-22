import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, Calendar, FileText } from 'lucide-react';
import { depenseService } from '../../../services/depenseService';
import Swal from 'sweetalert2';

export default function ExpenseModal({ isOpen, onClose, expense, onSuccess, bailleurs, immeubles, biens = [] }) {
    const [loading, setLoading] = useState(false);
    const [typeLiaison, setTypeLiaison] = useState('immeuble'); // 'immeuble' | 'bien'
    const [formData, setFormData] = useState({
        mois: new Date().getMonth() + 1,
        annee: new Date().getFullYear(),
        bailleur_id: '',
        immeuble_id: '',
        bien_id: '',
        search_immeuble: '',
        search_bien: '',
        statut: 'paye',
        description: '',
        depenses: [
            { titre: '', montant: '', categorie: 'autre', description: '', date_depense: new Date().toISOString().split('T')[0] }
        ]
    });

    useEffect(() => {
        if (expense) {
            const isBien = !!expense.bien_id;
            setTypeLiaison(isBien ? 'bien' : 'immeuble');
            setFormData({
                mois: expense.mois,
                annee: expense.annee,
                bailleur_id: expense.bailleur_id,
                immeuble_id: expense.immeuble_id || '',
                bien_id: expense.bien_id || '',
                search_immeuble: expense.immeuble ? `${expense.immeuble.nom} (${expense.immeuble.bailleur?.user?.nom})` : '',
                search_bien: expense.bien ? `${expense.bien.reference} - ${expense.bien.adresse}` : '',
                statut: expense.statut || 'paye',
                description: expense.description || '',
                depenses: expense.depenses.map(d => ({
                    titre: d.titre,
                    montant: d.montant,
                    categorie: d.categorie,
                    description: d.description || '',
                    date_depense: d.date_depense.split('T')[0]
                }))
            });
        } else {
            setTypeLiaison('immeuble');
            setFormData({
                mois: new Date().getMonth() + 1,
                annee: new Date().getFullYear(),
                bailleur_id: '',
                immeuble_id: '',
                bien_id: '',
                search_immeuble: '',
                search_bien: '',
                statut: 'paye',
                description: '',
                depenses: [
                    { titre: '', montant: '', categorie: 'autre', description: '', date_depense: new Date().toISOString().split('T')[0] }
                ]
            });
        }
    }, [expense, isOpen]);

    const categories = [
        { id: 'electricite', name: 'Électricité' },
        { id: 'eau', name: 'Eau' },
        { id: 'gardiennage', name: 'Gardiennage' },
        { id: 'entretien', name: 'Entretien' },
        { id: 'reparation', name: 'Réparation' },
        { id: 'autre', name: 'Autre' }
    ];

    const months = [
        { id: 1, name: 'Janvier' }, { id: 2, name: 'Février' }, { id: 3, name: 'Mars' },
        { id: 4, name: 'Avril' }, { id: 5, name: 'Mai' }, { id: 6, name: 'Juin' },
        { id: 7, name: 'Juillet' }, { id: 8, name: 'Août' }, { id: 9, name: 'Septembre' },
        { id: 10, name: 'Octobre' }, { id: 11, name: 'Novembre' }, { id: 12, name: 'Décembre' }
    ];

    const addItem = () => {
        setFormData({
            ...formData,
            depenses: [...formData.depenses, { titre: '', montant: '', categorie: 'autre', description: '', date_depense: new Date().toISOString().split('T')[0] }]
        });
    };

    const removeItem = (index) => {
        if (formData.depenses.length > 1) {
            const newItems = [...formData.depenses];
            newItems.splice(index, 1);
            setFormData({ ...formData, depenses: newItems });
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.depenses];
        newItems[index][field] = value;
        setFormData({ ...formData, depenses: newItems });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Prepare submit data, cleaning up search fields
        const submitData = { ...formData };
        if (typeLiaison === 'immeuble') {
            submitData.bien_id = null;
        } else {
            submitData.immeuble_id = null;
        }
        delete submitData.search_immeuble;
        delete submitData.search_bien;

        if (!submitData.immeuble_id && !submitData.bien_id) {
            return Swal.fire('Erreur', 'Veuillez sélectionner un immeuble ou un bien valide.', 'error');
        }

        setLoading(true);

        try {
            if (expense?.id) {
                await depenseService.updateExpense(expense.id, submitData);
                Swal.fire('Succès', 'Note de dépense mise à jour avec succès.', 'success');
            } else {
                await depenseService.createExpense(submitData);
                Swal.fire('Succès', 'Note de dépense enregistrée avec succès.', 'success');
            }
            onSuccess();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement.';
            Swal.fire('Erreur', msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const totalMontant = formData.depenses.reduce((acc, curr) => acc + (parseFloat(curr.montant) || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in duration-300 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 text-primary-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{expense ? 'Modifier la Note' : 'Nouvelle Note de Dépenses'}</h2>
                            <p className="text-sm text-gray-500">{expense ? 'Modifiez les détails de cette note.' : 'Regroupez plusieurs dépenses pour une période donnée.'}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-white rounded-full transition border border-transparent hover:border-gray-200">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Header Info */}
                    <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50 mb-6 space-y-6">
                        
                        <div className="flex gap-4 border-b border-blue-100 pb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="typeLiaison" 
                                    value="immeuble" 
                                    checked={typeLiaison === 'immeuble'} 
                                    onChange={() => setTypeLiaison('immeuble')}
                                    className="text-primary-600"
                                />
                                <span className="font-bold text-sm">Par Immeuble</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="typeLiaison" 
                                    value="bien" 
                                    checked={typeLiaison === 'bien'} 
                                    onChange={() => setTypeLiaison('bien')}
                                    className="text-primary-600"
                                />
                                <span className="font-bold text-sm">Par Bien (Indépendant)</span>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-2">
                                {typeLiaison === 'immeuble' ? (
                                    <>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Immeuble Concerné (Recherche)</label>
                                        <input
                                            list="immeubles-list"
                                            required={typeLiaison === 'immeuble'}
                                            placeholder="Rechercher un immeuble..."
                                            className="w-full rounded-xl border-gray-200 py-3 focus:ring-primary-500 focus:border-primary-500"
                                            value={formData.search_immeuble}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const selected = immeubles.find(i => val.includes(i.nom));
                                                if (selected) {
                                                    setFormData({ ...formData, search_immeuble: val, immeuble_id: selected.id, bailleur_id: selected.bailleur_id });
                                                } else {
                                                    setFormData({ ...formData, search_immeuble: val, immeuble_id: '' });
                                                }
                                            }}
                                        />
                                        <datalist id="immeubles-list">
                                            {immeubles.map(i => (
                                                <option key={i.id} value={`${i.nom} - ${i.bailleur?.user?.nom || 'Sans bailleur'}`} />
                                            ))}
                                        </datalist>
                                    </>
                                ) : (
                                    <>
                                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bien Concerné (Recherche)</label>
                                        <input
                                            list="biens-list"
                                            required={typeLiaison === 'bien'}
                                            placeholder="Rechercher un bien..."
                                            className="w-full rounded-xl border-gray-200 py-3 focus:ring-primary-500 focus:border-primary-500"
                                            value={formData.search_bien}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const selected = biens.find(b => val.includes(b.reference));
                                                if (selected) {
                                                    setFormData({ ...formData, search_bien: val, bien_id: selected.id, bailleur_id: selected.bailleur_id });
                                                } else {
                                                    setFormData({ ...formData, search_bien: val, bien_id: '' });
                                                }
                                            }}
                                        />
                                        <datalist id="biens-list">
                                            {biens.map(b => (
                                                <option key={b.id} value={`${b.reference} - ${b.adresse || 'Sans adresse'}`} />
                                            ))}
                                        </datalist>
                                    </>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Mois</label>
                                <select
                                    required
                                className="w-full rounded-xl border-gray-200 py-3"
                                value={formData.mois}
                                onChange={(e) => setFormData({ ...formData, mois: e.target.value })}
                            >
                                {months.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Année</label>
                            <input
                                required
                                type="number"
                                className="w-full rounded-xl border-gray-200 py-3"
                                value={formData.annee}
                                onChange={(e) => setFormData({ ...formData, annee: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Statut</label>
                            <select
                                required
                                className="w-full rounded-xl border-gray-200 py-3"
                                value={formData.statut}
                                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                            >
                                <option value="paye">Payée</option>
                                <option value="en_attente">En attente</option>
                                <option value="annule">Annulée</option>
                            </select>
                        </div>
                    </div>
                    </div>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-primary-600" />
                                Lignes de Dépenses
                            </h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                <Plus className="w-4 h-4" /> Ajouter une ligne
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.depenses.map((item, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm relative group">
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Désignation *</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="ex: Facture Eau Janvier"
                                            className="w-full rounded-lg border-gray-200 text-sm py-2"
                                            value={item.titre}
                                            onChange={(e) => updateItem(index, 'titre', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Catégorie</label>
                                        <select
                                            className="w-full rounded-lg border-gray-200 text-sm py-2"
                                            value={item.categorie}
                                            onChange={(e) => updateItem(index, 'categorie', e.target.value)}
                                        >
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Montant *</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full rounded-lg border-gray-200 text-sm py-2 px-2"
                                            value={item.montant}
                                            onChange={(e) => updateItem(index, 'montant', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-3">
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Date</label>
                                        <input
                                            required
                                            type="date"
                                            className="w-full rounded-lg border-gray-200 text-sm py-2"
                                            value={item.date_depense}
                                            onChange={(e) => updateItem(index, 'date_depense', e.target.value)}
                                        />
                                    </div>
                                    <div className="md:col-span-1 flex items-end justify-center pb-1">
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-30"
                                            disabled={formData.depenses.length === 1}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 font-medium">TOTAL :</span>
                        <span className="text-2xl font-black text-gray-900">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(totalMontant)}
                        </span>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 md:flex-none px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-bold"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || (typeLiaison === 'immeuble' ? !formData.immeuble_id : !formData.bien_id)}
                            className="flex-1 md:flex-none px-12 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition font-bold shadow-lg shadow-primary-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement...</> : (expense ? 'Mettre à jour' : 'Valider la Note')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

