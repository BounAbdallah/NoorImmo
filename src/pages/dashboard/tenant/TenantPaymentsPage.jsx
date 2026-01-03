import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { paymentService } from '../../../services/paymentService';
import { Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import Swal from 'sweetalert2';

export default function TenantPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timelineLoading, setTimelineLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAttendu: 0,
        totalPaye: 0,
        dette: 0
    });

    useEffect(() => {
        loadPayments();
        loadTimeline();
    }, []);

    const loadPayments = async () => {
        try {
            const res = await paymentService.getPayments();
            if (res.data) {
                const data = res.data.data || res.data;
                setPayments(data);
                calculateStats(data);
            }
        } catch (error) {
            console.error("Failed to load payments", error);
        } finally {
            setLoading(false);
        }
    };

    const loadTimeline = async () => {
        try {
            const paymentsRes = await paymentService.getPayments();
            const firstPayment = paymentsRes.data?.data?.[0] || paymentsRes.data?.[0];

            if (firstPayment?.bail_id) {
                const res = await paymentService.getLeaseTimeline(firstPayment.bail_id);
                if (res.success) {
                    setTimeline(res.data);
                }
            }
        } catch (error) {
            console.error("Failed to load timeline", error);
        } finally {
            setTimelineLoading(false);
        }
    };

    const calculateStats = (data) => {
        let totalPaye = 0;
        let totalAttendu = 0;

        data.forEach(p => {
            totalPaye += parseFloat(p.montant);
            totalAttendu += parseFloat(p.montant_attendu || 0);
        });

        setStats({
            totalPaye,
            totalAttendu,
            dette: Math.max(0, totalAttendu - totalPaye)
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            paye: 'bg-green-100 text-green-800',
            partiel: 'bg-yellow-100 text-yellow-800',
            en_retard: 'bg-red-100 text-red-800',
            impaye: 'bg-red-100 text-red-800',
            non_echu: 'bg-blue-50 text-blue-600',
            en_attente: 'bg-gray-100 text-gray-800'
        };

        const labels = {
            paye: 'Payé',
            partiel: 'Partiel',
            en_retard: 'En retard',
            impaye: 'Impayé',
            non_echu: 'À venir',
            en_attente: 'En attente'
        };

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles.en_attente}`}>
                {labels[status] || (status === 'impaye' ? 'Non payé' : status)}
            </span>
        );
    };

    const handleDownloadQuittance = async (id) => {
        try {
            await paymentService.downloadReceipt(id);
        } catch (error) {
            console.error("Failed to download quittance", error);
        }
    };

    const handleWavePayment = async (bailId, montant, month, year) => {
        if (!bailId || !montant) return;

        const fees = Math.ceil(montant * 0.015);
        const total = parseInt(montant) + fees;

        const result = await Swal.fire({
            title: 'Confirmer le paiement',
            html: `
                <div class="text-left">
                    <p>Montant Loyer: <b>${montant.toLocaleString()} FCFA</b></p>
                    <p>Mois concerné: <b>${month}/${year}</b></p>
                    <p>Frais (1.5%): <b>${fees.toLocaleString()} FCFA</b></p>
                    <hr class="my-2"/>
                    <p class="text-lg">Total à payer: <b class="text-blue-600">${total.toLocaleString()} FCFA</b></p>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Payer avec Wave',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#1b9df0' // Wave Blue
        });

        if (!result.isConfirmed) return;

        try {
            const response = await paymentService.initiateWavePayment(bailId, montant, month, year);
            if (response.success && response.checkout_url) {
                window.location.href = response.checkout_url;
            } else {
                alert('Erreur: Impossible d\'initier le paiement Wave.');
            }
        } catch (error) {
            console.error('Wave Payment Error:', error);
            alert('Une erreur est survenue lors du paiement Wave.');
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Chargement...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Suivi des Paiements</h1>
            </div>

            {/* Timeline View */}
            <Card className="border-t-4 border-t-blue-600">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        Échéancier du Bail
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Année</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Accès Quittance</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {timelineLoading ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Chargement de l'échéancier...</td></tr>
                                ) : timeline.length === 0 ? (
                                    <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">Aucun historique de bail trouvé.</td></tr>
                                ) : (
                                    timeline.map((item, idx) => (
                                        <tr key={idx} className={item.status === 'impaye' ? 'bg-red-50/30' : ''}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                                {item.month}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.year}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {item.status === 'paye' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDownloadQuittance(item.payment_id)}
                                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Télécharger
                                                    </Button>
                                                ) : (
                                                    <div className="flex justify-end gap-2">
                                                        {(item.status === 'impaye' || item.status === 'en_retard' || item.status === 'partiel' || item.status === 'non_echu') ? (
                                                            <Button
                                                                size="sm"
                                                                className="bg-blue-500 hover:bg-blue-600 text-white"
                                                                onClick={() => {
                                                                    const [year, month] = (item.date || '').split('-');
                                                                    handleWavePayment(
                                                                        item.lease_id || payments[0]?.bail_id,
                                                                        item.amount || item.reste || (stats.dette > 0 ? stats.dette : 0),
                                                                        month, // Pass month
                                                                        year   // Pass year
                                                                    );
                                                                }}
                                                                title="Payer avec Wave"
                                                            >
                                                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Wave_logo_Logotype_Emblem.png/600px-Wave_logo_Logotype_Emblem.png" alt="Wave" className="h-4 w-4 mr-1 brightness-0 invert" />
                                                                Payer
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                disabled
                                                                className="text-gray-400 cursor-not-allowed"
                                                            >
                                                                Indisponible
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Détails des Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Paiement</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Aucune transaction enregistrée.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(payment.date_paiement).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {new Intl.NumberFormat('fr-FR').format(payment.montant)} F
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {payment.mode_paiement?.replace('_', ' ') || 'Virement'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(payment.statut)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
