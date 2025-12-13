import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { leaseService } from '../../services/leaseService';
import { paymentService } from '../../services/paymentService'; // Ensure this is imported
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, User, Home, Calendar, FileText, Download, CheckCircle, AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { format, differenceInMonths, addMonths, isBefore, isAfter, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import PaymentModal from '../../components/dashboard/PaymentModal';

export default function LeaseDetailsPage() {
    const { id } = useParams();
    const [lease, setLease] = useState(null);
    const [loading, setLoading] = useState(true);
    const [schedule, setSchedule] = useState([]);

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedMonthForPayment, setSelectedMonthForPayment] = useState(null);

    useEffect(() => {
        loadLease();
    }, [id]);

    const loadLease = async () => {
        try {
            const response = await leaseService.getLease(id);
            if (response.success) {
                const leaseData = response.data;
                setLease(leaseData);
                generateSchedule(leaseData);
            }
        } catch (error) {
            console.error("Error loading lease", error);
        } finally {
            setLoading(false);
        }
    };

    const generateSchedule = (leaseData) => {
        const startDate = parseISO(leaseData.date_debut);
        // If no end date or far future, calculate for 12 months from now or until valid end
        const endDate = leaseData.date_fin ? parseISO(leaseData.date_fin) : addMonths(new Date(), 12);

        // Ensure we don't generate too many rows if lease is very long (e.g. 99 years)
        // Cap at 2 years relative to today for display if needed, but user asked for "All months".
        // Let's stick to real dates but be careful.

        const months = [];
        let currentDate = startOfMonth(startDate);
        const today = new Date();
        const stopDate = endOfMonth(endDate);

        while (isBefore(currentDate, stopDate) || currentDate.getTime() === stopDate.getTime()) {
            // Find payment for this month
            // We assume a payment corresponds to a month if its 'date_paiement' or 'periode' matches.
            // But realistically, payments might just be date-based.
            // Let's look for payments overlapping this month or generated for this month.
            // Since API structure implies 'PaiementLoyer' are linked to lease.

            // Simplified matching: Check if any payment falls in this month/year or covers it.
            // Ideally we'd have a 'periode_debut' on payments. 
            // For now, let's try to match by date_paiement being inside the month (imperfect but a start)
            // OR if the backend linked specific period.


            // Find ALL payments for this month/period
            const monthPayments = leaseData.paiements_loyer?.filter(p => {
                const pDate = parseISO(p.date_paiement);
                // Ensure pDate is valid before checking
                if (isNaN(pDate)) return false;

                // Using date_paiement vs periode logic. 
                // Ideally backend provides 'periode_debut'.
                // If backend provides periode_debut (string YYYY-MM-DD), use that.
                if (p.periode_debut) {
                    const pStart = parseISO(p.periode_debut);
                    return pStart.getMonth() === currentDate.getMonth() && pStart.getFullYear() === currentDate.getFullYear();
                }

                // Fallback to date_paiement
                return pDate.getMonth() === currentDate.getMonth() && pDate.getFullYear() === currentDate.getFullYear();
            }) || [];

            let status = 'a_venir';
            let amountPaid = 0;

            if (monthPayments.length > 0) {
                // Calculate total amount paid for this period
                amountPaid = monthPayments.reduce((sum, p) => sum + parseFloat(p.montant), 0);

                // Determine status based on payments
                // If ANY payment is 'paye', check if total reaches expected
                const hasPayeStatus = monthPayments.some(p => p.statut === 'paye');
                const totalExpected = leaseData.loyer_mensuel;

                if (hasPayeStatus || amountPaid >= totalExpected) {
                    status = 'paye';
                } else if (amountPaid > 0) {
                    status = 'partiel';
                } else {
                    status = 'impaye';
                }
            } else {
                if (isBefore(endOfMonth(currentDate), today)) {
                    status = 'retard';
                } else {
                    status = 'a_venir';
                }
            }

            // Find a primary payment for receipt (prefer 'paye', then 'partiel', then any)
            const mainPayment = monthPayments.find(p => p.statut === 'paye')
                || monthPayments.find(p => p.statut === 'partiel')
                || monthPayments[0];

            months.push({
                date: new Date(currentDate),
                status: status,
                montant_du: leaseData.loyer_mensuel,
                montant_paye: amountPaid,
                paymentRefs: monthPayments, // Store all payments
                mainPayment: mainPayment // Store primary payment for actions
            });

            currentDate = addMonths(currentDate, 1);
        }

        setSchedule(months.reverse());
    };

    const handleOpenPayModal = (monthItem) => {
        setSelectedMonthForPayment({
            date: monthItem.date,
            periodStart: startOfMonth(monthItem.date),
            periodEnd: endOfMonth(monthItem.date)
        });
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = () => {
        // Reload lease data to update schedule
        loadLease();
    };

    const handleDownloadReceipt = async (paymentId) => {
        try {
            await paymentService.downloadReceipt(paymentId);
        } catch (error) {
            console.error("Error downloading receipt", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paye':
                return <span className="flex items-center text-green-600 font-medium"><CheckCircle className="w-4 h-4 mr-1" /> Payé</span>;
            case 'partiel':
                return <span className="flex items-center text-orange-500 font-medium"><AlertTriangle className="w-4 h-4 mr-1" /> Partiel</span>;
            case 'retard':
                return <span className="flex items-center text-red-600 font-medium"><AlertTriangle className="w-4 h-4 mr-1" /> Retard</span>;
            case 'impaye':
                return <span className="flex items-center text-red-600 font-medium"><AlertTriangle className="w-4 h-4 mr-1" /> Impayé</span>;
            default:
                return <span className="flex items-center text-gray-500"><Clock className="w-4 h-4 mr-1" /> À venir</span>;
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (!lease) return <div className="p-8 text-center">Bail introuvable.</div>;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex items-center space-x-4">
                <Link to="/leases" className="p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft className="h-6 w-6 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Détails du Bail</h1>
                    <p className="text-sm text-gray-500">Référence: {lease.id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Home className="mr-2 h-5 w-5 text-gray-400" />
                            Bien Loué
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Nom / Référence</p>
                                <p className="text-base font-semibold text-gray-900">{lease.bien?.nom || lease.bien?.reference}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Adresse</p>
                                <p className="text-gray-900">{lease.bien?.adresse}</p>
                            </div>
                            <div className="flex space-x-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Type</p>
                                    <p className="capitalize text-gray-900">{lease.bien?.type}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Surface</p>
                                    <p className="text-gray-900">{lease.bien?.surface} m²</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tenant Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <User className="mr-2 h-5 w-5 text-gray-400" />
                            Locataire
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Nom Complet</p>
                                <p className="text-base font-semibold text-gray-900">
                                    {lease.locataire?.user?.prenom} {lease.locataire?.user?.nom}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-gray-900">{lease.locataire?.user?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Téléphone</p>
                                <p className="text-gray-900">{lease.locataire?.user?.telephone || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contract Terms */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <FileText className="mr-2 h-5 w-5 text-gray-400" />
                        Termes du Contrat
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Début du bail</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {format(parseISO(lease.date_debut), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Fin du bail</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {format(parseISO(lease.date_fin), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Loyer Mensuel</p>
                            <p className="text-lg font-bold text-primary-600">
                                {new Intl.NumberFormat('fr-FR').format(lease.loyer_mensuel)} CFA
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Caution</p>
                            <p className="text-lg font-medium text-gray-900">
                                {new Intl.NumberFormat('fr-FR').format(lease.caution)} CFA
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Payment Schedule (Echéancier) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                        <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                        Echéancier & Historique des Paiements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mois</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Dû</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Payé</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {schedule.map((item, index) => (
                                    <tr key={index} className={item.status === 'retard' ? 'bg-red-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                            {format(item.date, 'MMMM yyyy', { locale: fr })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Intl.NumberFormat('fr-FR').format(item.montant_du)} CFA
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Intl.NumberFormat('fr-FR').format(item.montant_paye)} CFA
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            {item.status === 'paye' || item.status === 'partiel' ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-500 hover:text-gray-700"
                                                    onClick={() => item.mainPayment && handleDownloadReceipt(item.mainPayment.id)}
                                                    disabled={!item.mainPayment}
                                                >
                                                    <Download className="h-4 w-4 mr-1" /> Quittance
                                                </Button>
                                            ) : null}

                                            {item.status !== 'paye' && (
                                                <Button
                                                    size="sm"
                                                    className="bg-primary-600 hover:bg-primary-700 text-white"
                                                    onClick={() => handleOpenPayModal(item)}
                                                >
                                                    <CreditCard className="h-4 w-4 mr-1" /> Payer
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                lease={lease}
                defaultDate={selectedMonthForPayment?.date}
                defaultPeriodStart={selectedMonthForPayment?.periodStart}
                defaultPeriodEnd={selectedMonthForPayment?.periodEnd}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}
