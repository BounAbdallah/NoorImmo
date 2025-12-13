import React, { useEffect, useState } from 'react';
import { walletService } from '../../services/walletService';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Wallet, ArrowUpRight, ArrowDownLeft, History } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WalletPage() {
    const [balance, setBalance] = useState(0);
    const [history, setHistory] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        try {
            const [balanceRes, historyRes, statsRes] = await Promise.all([
                walletService.getBalance(),
                walletService.getHistory(),
                walletService.getStats()
            ]);

            // Correctly access nested data.data structure from Laravel API Resource / Pagination
            const solde = balanceRes.data.data?.solde;
            setBalance(solde !== undefined ? solde : 0);

            // For paginated history, access response.data.data.data
            setHistory(historyRes.data.data?.data || []);

            // Set dynamic chart data
            setChartData(statsRes.data.data || []);
        } catch (error) {
            console.error("Failed to load wallet", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Mon Portefeuille</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Balance Card */}
                <Card className="md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Wallet className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xs font-medium bg-green-400/20 text-green-100 px-2 py-1 rounded uppercase">Actif</span>
                        </div>
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Solde disponible</p>
                            <h2 className="text-3xl font-bold mt-1">
                                {new Intl.NumberFormat('fr-FR').format(balance)} <span className="text-lg font-normal">CFA</span>
                            </h2>
                        </div>
                        <div className="mt-8 flex space-x-3">
                            <Button className="flex-1 bg-white text-blue-700 hover:bg-blue-50 border-none" onClick={() => alert("Simulation: Redirection vers module de paiement...")}>
                                <ArrowDownLeft className="h-4 w-4 mr-2" />
                                Recharger
                            </Button>
                            <Button className="flex-1 bg-blue-700 text-white hover:bg-blue-600 border border-blue-500" onClick={() => alert("virement vers compte bancaire initié !")}>
                                <ArrowUpRight className="h-4 w-4 mr-2" />
                                Retirer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats / Charts placeholder */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Évolution du Solde (6 derniers mois)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64">
                        <div className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorSolde" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`${value} CFA`, 'Solde']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="solde"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorSolde)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction History */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <History className="h-5 w-5 text-gray-500" />
                        <CardTitle className="text-lg">Historique des transactions</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Aucune transaction récente.</p>
                    ) : (
                        <div className="space-y-4">
                            {history.map((tx) => (
                                <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border-b last:border-0 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-full ${tx.type === 'debit' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {tx.type === 'debit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{tx.description || 'Transaction'}</p>
                                            <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${tx.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tx.type === 'debit' ? '-' : '+'}{new Intl.NumberFormat('fr-FR').format(tx.montant)} CFA
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
