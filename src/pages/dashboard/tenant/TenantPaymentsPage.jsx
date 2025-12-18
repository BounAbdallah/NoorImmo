import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { paymentService } from '../../../services/paymentService';
import { Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function TenantPaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAttendu: 0,
        totalPaye: 0,
        dette: 0
    });

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            const res = await paymentService.getPayments();
            if (res.data) {
                // Ensure data array format handle pagination
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

    const calculateStats = (data) => {
        let totalPaye = 0;
        let totalAttendu = 0;

        data.forEach(p => {
            totalPaye += parseFloat(p.montant);
            totalAttendu += parseFloat(p.montant_attendu || 0); // Assuming API returns this or we sum rents
        });

        // This is a simplified calculation based on fetched payments. 
        // Ideally backend provides summary stats.
        setStats({
            totalPaye,
            totalAttendu,
            dette: Math.max(0, totalAttendu - totalPaye) // Simplistic view
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            paye: 'bg-green-100 text-green-800',
            partiel: 'bg-yellow-100 text-yellow-800',
            en_retard: 'bg-red-100 text-red-800',
            impaye: 'bg-red-100 text-red-800',
            en_attente: 'bg-gray-100 text-gray-800'
        };

        const labels = {
            paye: 'Payé',
            partiel: 'Partiel',
            en_retard: 'En retard',
            impaye: 'Impayé',
            en_attente: 'En attente'
        };

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || styles.en_attente}`}>
                {labels[status] || status}
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

    if (loading) {
        return <div className="p-8 text-center">Chargement...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mes Paiements</h1>

            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-500">Total Payé</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">{stats.totalPaye.toLocaleString()} F</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-gray-500">Reste à Payer (Estimé)</p>
                        <p className="text-2xl font-bold text-red-600 mt-2">{stats.dette.toLocaleString()} F</p>
                    </CardContent>
                </Card> 
            </div> */}

            <Card>
                <CardHeader>
                    <CardTitle>Historique des Paiements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Aucun paiement trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(payment.date_paiement).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payment.periode_debut ?
                                                    `${new Date(payment.periode_debut).toLocaleDateString()} - ${new Date(payment.periode_fin).toLocaleDateString()}`
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Intl.NumberFormat('fr-FR').format(payment.montant)} F
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                                {payment.mode_paiement?.replace('_', ' ')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(payment.statut)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {payment.statut === 'paye' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadQuittance(payment.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Download className="h-4 w-4 mr-1" /> Quittance
                                                    </Button>
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
        </div>
    );
}
