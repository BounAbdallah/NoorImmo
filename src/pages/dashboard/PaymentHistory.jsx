import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Download, CreditCard, TrendingUp, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Search, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Advanced Filter State
    const [filterStatut, setFilterStatut] = useState('');
    const [filterSearch, setFilterSearch] = useState('');
    const [filterDateDebut, setFilterDateDebut] = useState('');
    const [filterDateFin, setFilterDateFin] = useState('');
    const [filterBienId, setFilterBienId] = useState('');
    const [filterLocataireId, setFilterLocataireId] = useState('');
    const [filterMontantMin, setFilterMontantMin] = useState('');
    const [filterMontantMax, setFilterMontantMax] = useState('');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Options for selects
    const [biens, setBiens] = useState([]);
    const [locataires, setLocataires] = useState([]);

    // Stats
    const [stats, setStats] = useState({
        totalPaye: 0,
        totalPartiel: 0,
        totalRetard: 0,
        count: 0,
        payeCount: 0,
        partielCount: 0,
        retardCount: 0,
        chartData: []
    });

    // Load property and tenant lists for dropdowns
    useEffect(() => {
        const loadFilterOptions = async () => {
            try {
                const [biensRes, locatairesRes] = await Promise.all([
                    fetch('http://localhost:8000/api/v1/biens', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Accept': 'application/json'
                        }
                    }).then(r => r.json()),
                    fetch('http://localhost:8000/api/v1/locataires', {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Accept': 'application/json'
                        }
                    }).then(r => r.json())
                ]);
                if (biensRes.success) setBiens(biensRes.data.data || biensRes.data || []);
                if (locatairesRes.success) setLocataires(locatairesRes.data.data || locatairesRes.data || []);
            } catch (e) { console.error('Error loading filter options:', e); }
        };
        loadFilterOptions();
    }, []);

    const loadPayments = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                ...(filterStatut && { statut: filterStatut }),
                ...(filterDateDebut && { date_debut: filterDateDebut }),
                ...(filterDateFin && { date_fin: filterDateFin }),
                ...(filterBienId && { bien_id: filterBienId }),
                ...(filterLocataireId && { locataire_id: filterLocataireId }),
                ...(filterMontantMin && { montant_min: filterMontantMin }),
                ...(filterMontantMax && { montant_max: filterMontantMax }),
            };
            const response = await paymentService.getPayments(params);
            if (response.success) {
                const data = response.data.data || [];
                setPayments(data);
                setCurrentPage(response.data.current_page);
                setTotalPages(response.data.last_page);
                setTotalItems(response.data.total);

                // Calculate stats from all payments (for chart we'd ideally have a separate endpoint)
                calculateStats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filterStatut, filterDateDebut, filterDateFin, filterBienId, filterLocataireId, filterMontantMin, filterMontantMax]);

    const calculateStats = (data) => {
        let totalPaye = 0, totalPartiel = 0, totalRetard = 0;
        let payeCount = 0, partielCount = 0, retardCount = 0;
        const monthlyData = {};

        data.forEach(p => {
            const montant = parseFloat(p.montant) || 0;

            if (p.statut === 'paye') {
                totalPaye += montant;
                payeCount++;
            } else if (p.statut === 'partiel') {
                totalPartiel += montant;
                partielCount++;
            } else {
                totalRetard += montant;
                retardCount++;
            }

            // Group by month for chart
            const month = p.date_paiement ? format(new Date(p.date_paiement), 'MMM yy', { locale: fr }) : 'N/A';
            if (!monthlyData[month]) monthlyData[month] = 0;
            monthlyData[month] += montant;
        });

        const chartData = Object.entries(monthlyData).map(([month, montant]) => ({ month, montant }));

        setStats({
            totalPaye,
            totalPartiel,
            totalRetard,
            count: data.length,
            payeCount,
            partielCount,
            retardCount,
            chartData
        });
    };

    useEffect(() => {
        loadPayments();
    }, [loadPayments]);

    const handleDownloadReceipt = async (id) => {
        try {
            await paymentService.downloadReceipt(id);
        } catch (error) {
            console.error("Error downloading receipt", error);
        }
    };

    const barChartData = {
        labels: stats.chartData.map(d => d.month),
        datasets: [{
            label: 'Montant encaissé (FCFA)',
            data: stats.chartData.map(d => d.montant),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderRadius: 6,
        }]
    };

    const doughnutChartData = {
        labels: ['Payé', 'Partiel', 'En retard'],
        datasets: [{
            data: [stats.payeCount, stats.partielCount, stats.retardCount],
            backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
        }]
    };

    const filteredPayments = filterSearch
        ? payments.filter(p =>
            p.bail?.bien?.reference?.toLowerCase().includes(filterSearch.toLowerCase()) ||
            p.bail?.locataire?.user?.nom?.toLowerCase().includes(filterSearch.toLowerCase()) ||
            p.bail?.locataire?.user?.prenom?.toLowerCase().includes(filterSearch.toLowerCase())
        )
        : payments;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Historique des Paiements</h1>
                    <p className="mt-1 text-sm text-gray-500">Suivi des encaissements de loyers et quittances.</p>
                </div>
                <Link
                    to="/payments/new"
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Enregistrer un paiement
                </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700">Total encaissé</p>
                                <p className="text-2xl font-bold text-green-900">
                                    {stats.totalPaye.toLocaleString()} <span className="text-sm font-normal">FCFA</span>
                                </p>
                            </div>
                            <CheckCircle className="h-10 w-10 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-yellow-700">Paiements partiels</p>
                                <p className="text-2xl font-bold text-yellow-900">
                                    {stats.partielCount}
                                </p>
                                <p className="text-xs text-yellow-600">{stats.totalPartiel.toLocaleString()} FCFA</p>
                            </div>
                            <CreditCard className="h-10 w-10 text-yellow-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-red-700">En retard</p>
                                <p className="text-2xl font-bold text-red-900">{stats.retardCount}</p>
                            </div>
                            <AlertTriangle className="h-10 w-10 text-red-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-blue-700">Total paiements</p>
                                <p className="text-2xl font-bold text-blue-900">{totalItems}</p>
                            </div>
                            <TrendingUp className="h-10 w-10 text-blue-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Encaissements par mois</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        {stats.chartData.length > 0 ? (
                            <Bar
                                data={barChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { y: { beginAtZero: true } }
                                }}
                            />
                        ) : (
                            <p className="text-center py-8 text-gray-500">Aucune donnée</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Répartition par statut</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex justify-center items-center">
                        {(stats.payeCount > 0 || stats.partielCount > 0 || stats.retardCount > 0) ? (
                            <Doughnut
                                data={doughnutChartData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom' } }
                                }}
                            />
                        ) : (
                            <p className="text-center text-gray-500">Aucune donnée</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4 space-y-4">
                    {/* Basic Filters Row */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par bien ou locataire..."
                                value={filterSearch}
                                onChange={(e) => setFilterSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <select
                            value={filterStatut}
                            onChange={(e) => { setFilterStatut(e.target.value); setCurrentPage(1); }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="paye">Payé</option>
                            <option value="partiel">Partiel</option>
                            <option value="en_retard">En retard</option>
                            <option value="impaye">Impayé</option>
                        </select>
                        <Button
                            variant="outline"
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            {showAdvancedFilters ? 'Masquer filtres' : 'Plus de filtres'}
                        </Button>
                    </div>

                    {/* Advanced Filters (Collapsible) */}
                    {showAdvancedFilters && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                            {/* Period Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Période du</label>
                                <input
                                    type="date"
                                    value={filterDateDebut}
                                    onChange={(e) => { setFilterDateDebut(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Au</label>
                                <input
                                    type="date"
                                    value={filterDateFin}
                                    onChange={(e) => { setFilterDateFin(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Bien Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bien</label>
                                <select
                                    value={filterBienId}
                                    onChange={(e) => { setFilterBienId(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Tous les biens</option>
                                    {biens.map(b => (
                                        <option key={b.id} value={b.id}>{b.reference || b.nom} - {b.adresse}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Locataire Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Locataire</label>
                                <select
                                    value={filterLocataireId}
                                    onChange={(e) => { setFilterLocataireId(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="">Tous les locataires</option>
                                    {locataires.map(l => (
                                        <option key={l.id} value={l.id}>{l.user?.prenom} {l.user?.nom}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount Range Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Montant min (FCFA)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={filterMontantMin}
                                    onChange={(e) => { setFilterMontantMin(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Montant max (FCFA)</label>
                                <input
                                    type="number"
                                    placeholder="1000000"
                                    value={filterMontantMax}
                                    onChange={(e) => { setFilterMontantMax(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            {/* Reset Filters Button */}
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setFilterStatut('');
                                        setFilterSearch('');
                                        setFilterDateDebut('');
                                        setFilterDateFin('');
                                        setFilterBienId('');
                                        setFilterLocataireId('');
                                        setFilterMontantMin('');
                                        setFilterMontantMax('');
                                        setCurrentPage(1);
                                    }}
                                    className="w-full"
                                >
                                    Réinitialiser
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-3 bg-gray-50 border-b text-sm text-gray-500">
                            {totalItems} paiement(s) trouvé(s)
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Locataire / Bien</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Montant</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Statut</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPayments.map((payment) => {
                                        const montantAttendu = payment.montant_attendu || payment.bail?.loyer_mensuel || 0;
                                        const montantPaye = parseFloat(payment.montant);
                                        const reste = montantAttendu - montantPaye;
                                        const isPartiel = payment.statut === 'partiel' || payment.statut === 'en_retard';

                                        return (
                                            <tr key={payment.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {format(new Date(payment.date_paiement || payment.created_at), 'dd MMM yyyy', { locale: fr })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link to={`/payments/${payment.id}`} className="text-sm font-medium text-primary-600 hover:underline">
                                                        {payment.bail?.bien?.reference || payment.bail?.bien?.nom || 'N/A'}
                                                    </Link>
                                                    <div className="text-sm text-gray-500">
                                                        {payment.bail?.locataire?.user?.prenom} {payment.bail?.locataire?.user?.nom}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {payment.periode_debut && payment.periode_fin
                                                        ? `${format(new Date(payment.periode_debut), 'MMM yy', { locale: fr })} - ${format(new Date(payment.periode_fin), 'MMM yy', { locale: fr })}`
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {montantPaye.toLocaleString()} FCFA
                                                    </span>
                                                    {isPartiel && (
                                                        <div className="text-xs text-gray-500">
                                                            / {montantAttendu.toLocaleString()} F
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {payment.statut === 'paye' && (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Payé</span>
                                                    )}
                                                    {payment.statut === 'partiel' && (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Partiel</span>
                                                    )}
                                                    {(payment.statut === 'en_retard' || payment.statut === 'impaye') && (
                                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Retard</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                    {payment.mode_paiement?.replace('_', ' ')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex justify-end items-center gap-2">
                                                        {isPartiel && (
                                                            <>
                                                                <button
                                                                    onClick={() => paymentService.viewDebtDocument(payment.id)}
                                                                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                                                                    title="Visualiser reconnaissance de dette"
                                                                >
                                                                    <FileText className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => paymentService.downloadDebtDocument(payment.id)}
                                                                    className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded"
                                                                    title="Télécharger reconnaissance de dette"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </button>
                                                                <Link
                                                                    to={`/payments/new?bail_id=${payment.bail_id}&montant=${reste}&periode_debut=${payment.periode_debut || ''}&periode_fin=${payment.periode_fin || ''}`}
                                                                    className="px-2 py-1 text-xs font-medium rounded text-white bg-orange-600 hover:bg-orange-700"
                                                                >
                                                                    Compléter
                                                                </Link>
                                                            </>
                                                        )}
                                                        {!isPartiel && (
                                                            <button
                                                                onClick={() => handleDownloadReceipt(payment.id)}
                                                                className="p-1 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded"
                                                                title="Télécharger quittance"
                                                            >
                                                                <Download className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredPayments.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                                Aucun paiement trouvé.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-4 py-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Précédent
                                </Button>
                                <span className="text-sm text-gray-500">
                                    Page {currentPage} sur {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Suivant
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
}
