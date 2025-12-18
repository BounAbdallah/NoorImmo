import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { leaseService } from '../../../services/leaseService';
import { Download, FileText, Home, Calendar, User } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function TenantLeasePage() {
    const [lease, setLease] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLease();
    }, []);

    const loadLease = async () => {
        try {
            const res = await leaseService.getAllLeases(); // Controller is filtered to return tenant's lease(s)

            // Assuming the filter returns an array, we take the first active one or just the first one
            const leases = res.data.data || res.data;
            if (leases && leases.length > 0) {
                // Ideally backend returns details for index too, or we fetch detail for ID
                // For now assuming index returns enough info or we fetch detail if needed
                // If index doesn't return full relation details we might need to fetch show(leases[0].id)
                // Let's safe bet fetch details of first lease
                const leaseId = leases[0].id; // Assuming we want the most recent/relevant
                const details = await leaseService.getLease(leaseId);
                setLease(details.data);
            }
        } catch (error) {
            console.error("Failed to load lease", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadContract = async () => {
        if (!lease) return;
        try {
            await leaseService.downloadContract(lease.id);
        } catch (error) {
            console.error("Failed to download contract", error);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Chargement...</div>;
    }

    if (!lease) {
        return (
            <div className="max-w-7xl mx-auto space-y-6 p-8">
                <h1 className="text-2xl font-bold text-gray-900">Mon Bail</h1>
                <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Aucun bail actif trouvé.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Mon Bail</h1>
                <Button onClick={handleDownloadContract}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le Contrat
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Property Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Home className="h-5 w-5 mr-2 text-blue-600" />
                            Le Bien Loué
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Référence</p>
                            <p className="text-gray-900 font-medium">{lease.bien?.reference}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Adresse</p>
                            <p className="text-gray-900">{lease.bien?.adresse}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Type</p>
                            <p className="text-gray-900 capitalize">{lease.bien?.type_bien}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Lease Terms */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <FileText className="h-5 w-5 mr-2 text-green-600" />
                            Termes du Contrat
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Loyer Mensuel</p>
                                <p className="text-xl font-bold text-blue-600">
                                    {new Intl.NumberFormat('fr-FR').format(lease.loyer_mensuel)} F
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Caution</p>
                                <p className="text-gray-900 font-medium">
                                    {new Intl.NumberFormat('fr-FR').format(lease.caution)} F
                                </p>
                            </div>
                        </div>
                        <div className="border-t pt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" /> Date début
                                </p>
                                <p className="text-gray-900">{new Date(lease.date_debut).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" /> Date fin
                                </p>
                                <p className="text-gray-900">
                                    {lease.date_fin ? new Date(lease.date_fin).toLocaleDateString() : 'Indéterminée'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Agency/Landlord Contact */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <User className="h-5 w-5 mr-2 text-purple-600" />
                            {lease.agence ? 'Agence Gestionnaire' : 'Bailleur'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center space-x-4">
                        {lease.agence ? (
                            <>
                                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {(lease.agence.raison_sociale || lease.agence.user?.nom || '?').charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{lease.agence.raison_sociale || `${lease.agence.user?.prenom} ${lease.agence.user?.nom}`}</p>
                                    <p className="text-gray-500">{lease.agence.user?.email}</p>
                                    <p className="text-gray-500">{lease.agence.user?.telephone}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">
                                    {lease.bien?.bailleur?.user?.nom?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{lease.bien?.bailleur?.user?.prenom} {lease.bien?.bailleur?.user?.nom}</p>
                                    <p className="text-gray-500">{lease.bien?.bailleur?.user?.email}</p>
                                    <p className="text-gray-500">{lease.bien?.bailleur?.user?.telephone}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
