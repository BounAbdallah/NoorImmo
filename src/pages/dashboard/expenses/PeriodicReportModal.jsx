import React, { useState, useEffect } from 'react';
import { X, Calendar, Download, Loader2, FileText } from 'lucide-react';
import { depenseService } from '../../../services/depenseService';
import Swal from 'sweetalert2';

export default function PeriodicReportModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [bailleurs, setBailleurs] = useState([]);
    const [formData, setFormData] = useState({
        bailleur_id: '',
        start_month: new Date().getMonth() + 1,
        start_year: new Date().getFullYear(),
        end_month: new Date().getMonth() + 1,
        end_year: new Date().getFullYear(),
    });

    useEffect(() => {
        if (isOpen) {
            depenseService.getBailleursWithExpenses()
                .then(res => setBailleurs(res.data || []))
                .catch(() => {});
        }
    }, [isOpen]);

    const months = [
        { id: 1, name: 'Janvier' }, { id: 2, name: 'Février' }, { id: 3, name: 'Mars' },
        { id: 4, name: 'Avril' }, { id: 5, name: 'Mai' }, { id: 6, name: 'Juin' },
        { id: 7, name: 'Juillet' }, { id: 8, name: 'Août' }, { id: 9, name: 'Septembre' },
        { id: 10, name: 'Octobre' }, { id: 11, name: 'Novembre' }, { id: 12, name: 'Décembre' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const blob = await depenseService.downloadPeriodicReport(formData);
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Rapport_Depenses_${formData.start_month}_${formData.start_year}_au_${formData.end_month}_${formData.end_year}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            Swal.fire('Succès', 'Le rapport a été généré avec succès.', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de générer le rapport pour cette période.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Rapport Périodique</h2>
                            <p className="text-sm text-gray-500">Générez un récapitulatif des dépenses.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition border border-transparent hover:border-gray-200">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bailleur</label>
                        <select
                            required
                            className="w-full rounded-xl border-gray-200 py-3"
                            value={formData.bailleur_id}
                            onChange={(e) => setFormData({ ...formData, bailleur_id: e.target.value })}
                        >
                            <option value="">Sélectionner un bailleur</option>
                            {bailleurs.filter(b => b.user).map(b => (
                                <option key={b.id} value={b.id}>{b.user.prenom} {b.user.nom}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Début</label>
                            <select
                                className="w-full rounded-xl border-gray-200 py-3"
                                value={formData.start_month}
                                onChange={(e) => setFormData({ ...formData, start_month: e.target.value })}
                            >
                                {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <select
                                className="w-full rounded-xl border-gray-200 py-3"
                                value={formData.start_year}
                                onChange={(e) => setFormData({ ...formData, start_year: e.target.value })}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Fin</label>
                            <select
                                className="w-full rounded-xl border-gray-200 py-3"
                                value={formData.end_month}
                                onChange={(e) => setFormData({ ...formData, end_month: e.target.value })}
                            >
                                {months.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <select
                                className="w-full rounded-xl border-gray-200 py-3"
                                value={formData.end_year}
                                onChange={(e) => setFormData({ ...formData, end_year: e.target.value })}
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.bailleur_id}
                            className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-bold shadow-lg shadow-primary-200 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Génération...</> : <><Download className="w-5 h-5" /> Télécharger rapport</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
