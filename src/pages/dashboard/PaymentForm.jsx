import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { leaseService } from '../../services/leaseService';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Label } from '../../components/ui/Label';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import Swal from 'sweetalert2';

export default function PaymentForm() {
    const { user, hasPermission } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!hasPermission('paiements.create')) {
            Swal.fire({
                icon: 'error',
                title: 'Accès refusé',
                text: "Vous n'avez pas la permission d'enregistrer un paiement.",
                timer: 3000,
                showConfirmButton: false
            });
            navigate('/payments');
        }
    }, [hasPermission, navigate]);
    const searchParams = new URLSearchParams(location.search);
    const prefillBailId = searchParams.get('bail_id');
    const prefillMontant = searchParams.get('montant');
    const prefillPeriodeDebut = searchParams.get('periode_debut');
    const prefillPeriodeFin = searchParams.get('periode_fin');

    const [leases, setLeases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedLease, setSelectedLease] = useState(null);
    const [isLocked, setIsLocked] = useState(false); // Lock fields when coming from unpaid page

    const [formData, setFormData] = useState({
        bail_id: prefillBailId || '',
        montant: prefillMontant || '',
        date_paiement: new Date().toISOString().split('T')[0],
        mode_paiement: 'especes',
        reference_transaction: '',
        periode_debut: prefillPeriodeDebut || '',
        periode_fin: prefillPeriodeFin || '',
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // If bail_id is prefilled from URL, lock the form and load lease details
        if (prefillBailId && leases.length > 0) {
            const lease = leases.find(l => l.id == prefillBailId);
            if (lease) {
                setSelectedLease(lease);
                setFormData(prev => ({
                    ...prev,
                    bail_id: prefillBailId,
                    montant: prefillMontant || prev.montant,
                    periode_debut: prefillPeriodeDebut || prev.periode_debut,
                    periode_fin: prefillPeriodeFin || prev.periode_fin,
                }));
                setIsLocked(true); // Lock all fields except montant
            }
        }
    }, [prefillBailId, prefillMontant, prefillPeriodeDebut, prefillPeriodeFin, leases]);

    const loadData = async () => {
        try {
            const response = await leaseService.getAllLeases();
            if (response.success) {
                // Filter only active leases
                const activeLeases = (response.data.data || []).filter(l => l.statut === 'actif');
                setLeases(activeLeases);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger les baux.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };

            // Auto-fill amount if lease is selected
            if (name === 'bail_id') {
                const selectedLease = leases.find(l => l.id == value);
                if (selectedLease) {
                    newData.montant = selectedLease.loyer_mensuel;
                }
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        // console.log('🔵 handleSubmit called');
        e.preventDefault();
        // console.log('🔵 preventDefault executed');
        // console.log('🔵 Form data:', formData);
        setSubmitting(true);

        try {
            // console.log('🔵 Calling paymentService.recordPayment...');
            const response = await paymentService.recordPayment(formData);
            // console.log('🔵 Response:', response);
            if (response.success) {
                Swal.fire('Succès', 'Paiement enregistré avec succès', 'success');
                // console.log('🔵 Navigating to /payments');
                navigate('/payments');
            }
        } catch (error) {
            // console.error('🔴 Error:', error);
            Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de l\'enregistrement.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-12 text-center">Chargement...</div>;

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Enregistrer un Paiement</h1>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Détails du paiement</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Display lease info when locked */}
                        {isLocked && selectedLease && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <h3 className="font-semibold text-blue-900 mb-2">Informations du Bail</h3>
                                <dl className="grid grid-cols-2 gap-2 text-sm">
                                    <dt className="text-gray-600">Bien :</dt>
                                    <dd className="font-medium">{selectedLease.bien?.reference || 'N/A'}</dd>

                                    <dt className="text-gray-600">Locataire :</dt>
                                    <dd className="font-medium">
                                        {selectedLease.locataire?.user?.prenom} {selectedLease.locataire?.user?.nom}
                                    </dd>

                                    <dt className="text-gray-600">Téléphone :</dt>
                                    <dd className="font-medium">{selectedLease.locataire?.user?.telephone}</dd>

                                    <dt className="text-gray-600">Loyer mensuel :</dt>
                                    <dd className="font-medium text-green-600">
                                        {parseFloat(selectedLease.loyer_mensuel).toLocaleString()} F
                                    </dd>
                                </dl>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="bail_id">Bail / Locataire</Label>
                            <select
                                id="bail_id"
                                name="bail_id"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                value={formData.bail_id}
                                onChange={handleChange}
                                disabled={isLocked}
                                required
                            >
                                <option value="">Sélectionner un bail...</option>
                                {leases.map(lease => (
                                    <option key={lease.id} value={lease.id}>
                                        {lease.bien?.reference} - {lease.locataire?.user?.prenom} {lease.locataire?.user?.nom}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="montant">Montant (FCFA)</Label>
                            <Input
                                type="number"
                                id="montant"
                                name="montant"
                                value={formData.montant}
                                onChange={handleChange}
                                required
                                placeholder="Montant à payer"
                            />
                            {selectedLease && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Loyer mensuel : {parseFloat(selectedLease.loyer_mensuel).toLocaleString()} F
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="date_paiement">Date de paiement</Label>
                            <Input
                                type="date"
                                id="date_paiement"
                                name="date_paiement"
                                value={formData.date_paiement}
                                onChange={handleChange}
                                disabled={isLocked}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="mode_paiement">Moyen de paiement</Label>
                            <select
                                id="mode_paiement"
                                name="mode_paiement"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                                value={formData.mode_paiement}
                                onChange={handleChange}
                                required
                            >
                                <option value="especes">Espèces</option>
                                <option value="cheque">Chèque</option>
                                <option value="virement">Virement Bancaire</option>
                                <option value="mobile_money">Mobile Money (Wave/OM)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="periode_debut">Période (Début)</Label>
                                <Input
                                    type="date"
                                    id="periode_debut"
                                    name="periode_debut"
                                    value={formData.periode_debut}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="periode_fin">Période (Fin)</Label>
                                <Input
                                    type="date"
                                    id="periode_fin"
                                    name="periode_fin"
                                    value={formData.periode_fin}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end space-x-4">
                        <Button type="button" variant="outline" onClick={() => navigate('/payments')}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={submitting}>
                            Enregistrer
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
