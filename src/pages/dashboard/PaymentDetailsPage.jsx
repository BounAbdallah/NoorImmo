import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, User, Home, Calendar, FileText, Download, DollarSign, CreditCard, MapPin, Building } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function PaymentDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPayment();
    }, [id]);

    const loadPayment = async () => {
        try {
            const response = await paymentService.getPaymentById(id);
            if (response.success) {
                setPayment(response.data);
            }
        } catch (error) {
            console.error("Error loading payment", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReceipt = async () => {
        try {
            await paymentService.downloadReceipt(id);
        } catch (error) {
            console.error("Error downloading receipt", error);
        }
    };

    if (loading) {
        return <div className="p-12 text-center">Chargement...</div>;
    }

    if (!payment) {
        return <div className="p-12 text-center">Paiement introuvable</div>;
    }

    const statusColors = {
        'paye': 'bg-green-100 text-green-800',
        'partiel': 'bg-yellow-100 text-yellow-800',
        'impaye': 'bg-red-100 text-red-800'
    };

    const statusLabels = {
        'paye': 'Payé',
        'partiel': 'Partiel',
        'impaye': 'Impayé'
    };

    const modeLabels = {
        'especes': 'Espèces',
        'cheque': 'Chèque',
        'virement': 'Virement',
        'mobile_money': 'Mobile Money'
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/payments')} className="pl-0">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour aux paiements
                </Button>
                {payment.quittance && (
                    <Button onClick={handleDownloadReceipt}>
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger la quittance
                    </Button>
                )}
            </div>

            {/* Payment Info Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                            <CreditCard className="h-5 w-5 mr-2 text-primary-600" />
                            Détails du Paiement
                        </CardTitle>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[payment.statut] || 'bg-gray-100 text-gray-800'}`}>
                            {statusLabels[payment.statut] || payment.statut}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Montant</dt>
                            <dd className="mt-1 text-2xl font-bold text-gray-900">{Number(payment.montant).toLocaleString()} FCFA</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Date de paiement</dt>
                            <dd className="mt-1 text-lg text-gray-900">
                                {payment.date_paiement ? format(new Date(payment.date_paiement), 'dd MMMM yyyy', { locale: fr }) : '-'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Mode de paiement</dt>
                            <dd className="mt-1 text-gray-900">{modeLabels[payment.mode_paiement] || payment.mode_paiement}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Référence</dt>
                            <dd className="mt-1 text-gray-900">{payment.reference_transaction || 'N/A'}</dd>
                        </div>
                        {payment.periode_debut && payment.periode_fin && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Période couverte</dt>
                                <dd className="mt-1 text-gray-900">
                                    Du {format(new Date(payment.periode_debut), 'dd/MM/yyyy')} au {format(new Date(payment.periode_fin), 'dd/MM/yyyy')}
                                </dd>
                            </div>
                        )}
                    </dl>
                </CardContent>
            </Card>

            {/* Receipt Info */}
            {payment.quittance && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-primary-600" />
                            Quittance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Numéro</dt>
                                <dd className="mt-1 text-gray-900 font-mono">{payment.quittance.numero}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Date d'émission</dt>
                                <dd className="mt-1 text-gray-900">
                                    {format(new Date(payment.quittance.date_emission), 'dd MMMM yyyy', { locale: fr })}
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            )}

            {/* Ventilation Info */}
            {payment.ventilation && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
                            Répartition
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Commission Agence</dt>
                                <dd className="mt-1 text-lg font-semibold text-indigo-600">
                                    {Number(payment.ventilation.montant_agence).toLocaleString()} F
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Part Bailleur</dt>
                                <dd className="mt-1 text-lg font-semibold text-green-600">
                                    {Number(payment.ventilation.montant_bailleur).toLocaleString()} F
                                </dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>
            )}

            {/* Lease and Property Info */}
            {payment.bail && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Home className="h-5 w-5 mr-2 text-primary-600" />
                            Informations du Bail
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Tenant */}
                        {payment.bail.locataire && (
                            <div className="flex items-start">
                                <User className="h-5 w-5 mr-3 mt-0.5 text-gray-400" />
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Locataire</dt>
                                    <dd className="mt-1 text-gray-900">
                                        {payment.bail.locataire.user?.prenom} {payment.bail.locataire.user?.nom}
                                    </dd>
                                </div>
                            </div>
                        )}

                        {/* Property */}
                        {payment.bail.bien && (
                            <div className="flex items-start">
                                <Building className="h-5 w-5 mr-3 mt-0.5 text-gray-400" />
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Bien</dt>
                                    <dd className="mt-1 text-gray-900">
                                        <Link to={`/biens/${payment.bail.bien.id}`} className="text-primary-600 hover:underline">
                                            {payment.bail.bien.nom || payment.bail.bien.reference}
                                        </Link>
                                    </dd>
                                    <dd className="text-sm text-gray-500">
                                        {payment.bail.bien.type} - {payment.bail.bien.adresse}
                                    </dd>
                                </div>
                            </div>
                        )}

                        {/* Lease Period */}
                        <div className="flex items-start">
                            <Calendar className="h-5 w-5 mr-3 mt-0.5 text-gray-400" />
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Période du bail</dt>
                                <dd className="mt-1 text-gray-900">
                                    Du {format(new Date(payment.bail.date_debut), 'dd/MM/yyyy')} au {format(new Date(payment.bail.date_fin), 'dd/MM/yyyy')}
                                </dd>
                            </div>
                        </div>

                        {/* Monthly Rent */}
                        <div className="flex items-start">
                            <DollarSign className="h-5 w-5 mr-3 mt-0.5 text-gray-400" />
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Loyer mensuel</dt>
                                <dd className="mt-1 text-lg font-semibold text-gray-900">
                                    {Number(payment.bail.loyer_mensuel).toLocaleString()} FCFA
                                </dd>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link to={`/leases/${payment.bail.id}`}>
                                <Button variant="outline" className="w-full">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Voir le bail complet
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
