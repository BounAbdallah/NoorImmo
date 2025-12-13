import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { DollarSign, AlertCircle, User, Home } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function UnpaidRentsPage() {
    const [unpaidRents, setUnpaidRents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDette: 0,
        nombreLocataires: 0
    });

    useEffect(() => {
        loadUnpaidRents();
    }, []);

    const loadUnpaidRents = async () => {
        try {
            const response = await paymentService.getUnpaidRents();
            if (response.success) {
                const debts = response.data;
                setUnpaidRents(debts);

                // Calculate stats
                const totalDette = debts.reduce((sum, item) => sum + parseFloat(item.dette), 0);
                setStats({
                    totalDette,
                    nombreLocataires: debts.length
                });
            }
        } catch (error) {
            console.error('Error loading unpaid rents:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-12 text-center">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <AlertCircle className="h-8 w-8 mr-3 text-red-600" />
                    Locataires avec Dettes
                </h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Dettes</CardTitle>
                        <DollarSign className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {stats.totalDette.toLocaleString()} FCFA
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nombre de Locataires</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.nombreLocataires}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            {unpaidRents.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Aucune dette en cours. Tous les loyers sont à jour ! 🎉</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Locataire
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bien
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Loyer Mensuel
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Montant Payé
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dette
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {unpaidRents.map((rent) => (
                                <tr key={rent.bail_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <User className="h-5 w-5 text-gray-400 mr-2" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {rent.locataire?.user?.prenom} {rent.locataire?.user?.nom}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {rent.locataire?.user?.telephone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Home className="h-5 w-5 text-gray-400 mr-2" />
                                            <div className="text-sm text-gray-900">
                                                {rent.bien?.nom || rent.bien?.reference}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {parseFloat(rent.loyer_mensuel).toLocaleString()} F
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        {parseFloat(rent.montant_paye).toLocaleString()} F
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            {parseFloat(rent.dette).toLocaleString()} F
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/payments/new?bail_id=${rent.bail_id}&montant=${rent.dette}&periode_debut=${rent.periode_debut || ''}&periode_fin=${rent.periode_fin || ''}`}>
                                            <Button size="sm">
                                                Enregistrer Paiement
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
