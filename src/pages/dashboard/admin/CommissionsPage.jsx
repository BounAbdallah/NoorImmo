import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { DollarSign, Search, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommissionsPage() {
    const navigate = useNavigate();
    const [commissions, setCommissions] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadData();
    }, [page, search]);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await adminService.getCommissions({ page, search });
            if (response.success) {
                setCommissions(response.data.commissions.data);
                setTotalPages(response.data.commissions.last_page);
                setTotalRevenue(response.data.total_revenue);
            }
        } catch (error) {
            console.error("Error loading commissions", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="p-2">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900">Suivi des Commissions</h1>
                    <p className="text-gray-500">Revenus générés par les transactions sur la plateforme</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50 border-emerald-100">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-emerald-800">Total Commissions</p>
                            <p className="text-3xl font-bold text-emerald-900 mt-2">
                                {new Intl.NumberFormat('fr-FR').format(totalRevenue)} FCFA
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-full">
                            <DollarSign className="h-8 w-8 text-emerald-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Historique</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Rechercher une agence..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agence</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant Com.</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {commissions.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {item.paiement_loyer?.bail?.agence?.raison_sociale || 'Agence inconnue'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Loyer #{item.paiement_loyer_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-emerald-600">
                                            +{new Intl.NumberFormat('fr-FR').format(item.montant_plateforme)} F
                                        </td>
                                    </tr>
                                ))}
                                {commissions.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Aucune commission enregistrée.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                        <Button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            variant="outline"
                            size="sm"
                        >
                            Précédent
                        </Button>
                        <span className="text-sm text-gray-600">Page {page} sur {totalPages}</span>
                        <Button
                            disabled={page === totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            variant="outline"
                            size="sm"
                        >
                            Suivant
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
