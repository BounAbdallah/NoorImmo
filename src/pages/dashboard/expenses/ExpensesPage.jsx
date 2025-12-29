import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Receipt, MoreVertical, Trash2, Edit2, AlertCircle, FileText, CheckCircle, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { depenseService } from '../../../services/depenseService';
import { bailleurService } from '../../../services/bailleurService';
import { structureService } from '../../../services/structureService';
import { propertyService } from '../../../services/propertyService';
import { useAuth } from '../../../context/AuthContext';
import ExpenseModal from './ExpenseModal';
import PeriodicReportModal from './PeriodicReportModal';
import Swal from 'sweetalert2';

export default function ExpensesPage() {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total_paid: 0, total_pending: 0, count: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);
    const [filters, setFilters] = useState({
        bailleur_id: '',
        immeuble_id: '',
        mois: '',
        annee: new Date().getFullYear(),
        page: 1
    });

    const [bailleurs, setBailleurs] = useState([]);
    const [immeubles, setImmeubles] = useState([]);

    const months = [
        { id: 1, name: 'Janvier' }, { id: 2, name: 'Février' }, { id: 3, name: 'Mars' },
        { id: 4, name: 'Avril' }, { id: 5, name: 'Mai' }, { id: 6, name: 'Juin' },
        { id: 7, name: 'Juillet' }, { id: 8, name: 'Août' }, { id: 9, name: 'Septembre' },
        { id: 10, name: 'Octobre' }, { id: 11, name: 'Novembre' }, { id: 12, name: 'Décembre' }
    ];

    useEffect(() => {
        loadData();
        loadInitialData();
    }, [filters]);

    const loadInitialData = async () => {
        try {
            const params = user?.agence_id ? { agence_id: user.agence_id } : {};
            const [bRes, iRes] = await Promise.all([
                bailleurService.getAll(params),
                structureService.getAllBuildings()
            ]);
            setBailleurs(bRes.data?.data || bRes.data || []);
            setImmeubles(iRes.data?.data || iRes.data || []);
        } catch (error) {
            console.error("Error loading selection data", error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await depenseService.getExpenses(filters);
            if (res.success) {
                setNotes(res.data.data);

                // Stats from current page notes
                const paid = res.data.data.filter(n => n.statut === 'paye').reduce((acc, curr) => acc + parseFloat(curr.total_montant), 0);
                const pending = res.data.data.filter(n => n.statut === 'en_attente').reduce((acc, curr) => acc + parseFloat(curr.total_montant), 0);

                setStats({
                    total_paid: paid,
                    total_pending: pending,
                    count: res.data.total
                });
            }
        } catch (error) {
            console.error("Error loading expense notes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Supprimer cette note ?',
            text: "Toutes les dépenses associées seront également supprimées.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                await depenseService.deleteExpense(id);
                Swal.fire('Supprimé !', 'La note a été supprimée.', 'success');
                loadData();
            } catch (error) {
                Swal.fire('Erreur', 'Impossible de supprimer la note.', 'error');
            }
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paye': return 'bg-green-100 text-green-800';
            case 'en_attente': return 'bg-yellow-100 text-yellow-800';
            case 'annule': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notes de Dépenses</h1>
                    <p className="text-gray-500 text-sm">Gérez les notes de dépenses groupées par immeuble et par mois.</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <button
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition font-bold shadow-sm"
                    >
                        <FileText className="w-5 h-5 text-primary-600" />
                        Rapport Périodique
                    </button>
                    <button
                        onClick={() => { setSelectedNote(null); setIsModalOpen(true); }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition font-bold shadow-lg shadow-primary-200"
                    >
                        <Plus className="w-5 h-5" />
                        Enregistrer une dépense
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Payé (Page)</p>
                            <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats.total_paid)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">En Attente (Page)</p>
                            <p className="text-2xl font-bold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(stats.total_pending)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total des Notes</p>
                            <p className="text-2xl font-bold">{stats.count}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Immeuble</label>
                    <select
                        className="w-full rounded-xl border-gray-200 text-sm focus:ring-primary-500 focus:border-primary-500"
                        value={filters.immeuble_id}
                        onChange={(e) => setFilters({ ...filters, immeuble_id: e.target.value })}
                    >
                        <option value="">Tous les immeubles</option>
                        {Array.isArray(immeubles) && immeubles.map(i => (
                            <option key={i.id} value={i.id}>{i.nom}</option>
                        ))}
                    </select>
                </div>
                <div className="w-40">
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Mois</label>
                    <select
                        className="w-full rounded-xl border-gray-200 text-sm focus:ring-primary-500 focus:border-primary-500"
                        value={filters.mois}
                        onChange={(e) => setFilters({ ...filters, mois: e.target.value })}
                    >
                        <option value="">Tous les mois</option>
                        {months.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
                <div className="w-32">
                    <label className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">Année</label>
                    <input
                        type="number"
                        className="w-full rounded-xl border-gray-200 text-sm"
                        value={filters.annee}
                        onChange={(e) => setFilters({ ...filters, annee: e.target.value })}
                    />
                </div>
                <button
                    onClick={() => setFilters({ bailleur_id: '', immeuble_id: '', mois: '', annee: new Date().getFullYear(), page: 1 })}
                    className="p-2.5 text-gray-500 hover:text-red-600 bg-gray-50 rounded-xl transition"
                    title="Réinitialiser"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">N° Note</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Période</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Immeuble / Bailleur</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Dépenses</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Montant Total</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse"><td colSpan="7" className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-full"></div></td></tr>
                                ))
                            ) : notes.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <FileText className="w-12 h-12 text-gray-200 mb-4" />
                                        <p>Aucune note trouvée.</p>
                                    </div>
                                </td></tr>
                            ) : (
                                notes.map((note) => (
                                    <tr key={note.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 font-bold text-sm text-gray-900">{note.numero}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {months.find(m => m.id === note.mois)?.name} {note.annee}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium text-gray-900">{note.immeuble?.nom || 'Global'}</span>
                                                <span className="text-xs text-gray-500">{note.bailleur?.user?.nom} {note.bailleur?.user?.prenom}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {note.depenses?.length || 0} lignes
                                        </td>
                                        <td className="px-6 py-4 font-bold text-sm">
                                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(note.total_montant)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(note.statut)}`}>
                                                {note.statut === 'paye' ? 'Réglée' : note.statut === 'en_attente' ? 'En attente' : 'Annulée'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const blob = await depenseService.downloadExpensePDF(note.id);
                                                            const url = window.URL.createObjectURL(blob);
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', `note_depense_${note.numero}.pdf`);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                            window.URL.revokeObjectURL(url);
                                                        } catch (error) {
                                                            Swal.fire('Erreur', 'Impossible de générer le PDF', 'error');
                                                        }
                                                    }}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                                    title="Télécharger la Note"
                                                >
                                                    <FileText className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedNote(note); setIsModalOpen(true); }}
                                                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                                    title="Modifier"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(note.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <ExpenseModal
                    isOpen={isModalOpen}
                    expense={selectedNote}
                    onClose={() => { setIsModalOpen(false); setSelectedNote(null); }}
                    onSuccess={() => { setIsModalOpen(false); setSelectedNote(null); loadData(); }}
                    bailleurs={bailleurs}
                    immeubles={immeubles}
                />
            )}
            {isReportModalOpen && (
                <PeriodicReportModal
                    isOpen={isReportModalOpen}
                    onClose={() => setIsReportModalOpen(false)}
                    bailleurs={bailleurs}
                />
            )}
        </div>
    );
}
