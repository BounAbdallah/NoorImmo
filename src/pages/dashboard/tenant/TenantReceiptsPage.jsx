import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { quittanceService } from '../../../services/quittanceService';
import { Download, Eye, FileText, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function TenantReceiptsPage() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReceipts();
    }, []);

    const loadReceipts = async () => {
        try {
            const res = await quittanceService.getReceipts();
            if (res.data) {
                const data = res.data.data || res.data;
                setReceipts(data);
            }
        } catch (error) {
            console.error("Failed to load receipts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id) => {
        try {
            await quittanceService.downloadReceipt(id);
        } catch (error) {
            console.error("Failed to download receipt", error);
        }
    };

    const handleView = async (id) => {
        try {
            await quittanceService.viewReceipt(id);
        } catch (error) {
            console.error("Failed to view receipt", error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Chargement...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mes Quittances</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-green-600" />
                        Historique des Quittances
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {receipts.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">Aucune quittance disponible.</p>
                            <p className="text-sm text-gray-400 mt-2">
                                Les quittances apparaîtront ici après vos paiements.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Numéro
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date d'émission
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Période
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Montant
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {receipts.map((receipt) => (
                                        <tr key={receipt.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <FileText className="h-5 w-5 text-green-500 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {receipt.numero_quittance}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1" />
                                                    {new Date(receipt.date_emission).toLocaleDateString('fr-FR')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {receipt.periode_debut && receipt.periode_fin ? (
                                                    `${new Date(receipt.periode_debut).toLocaleDateString('fr-FR')} - ${new Date(receipt.periode_fin).toLocaleDateString('fr-FR')}`
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                                                {new Intl.NumberFormat('fr-FR').format(receipt.montant)} F
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleView(receipt.id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        Voir
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownload(receipt.id)}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        Télécharger
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">À propos des quittances</p>
                        <p>
                            Les quittances sont des preuves de paiement de votre loyer. Conservez-les précieusement,
                            elles peuvent vous être demandées pour justifier de vos paiements.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
