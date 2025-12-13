import React, { useState, useEffect } from 'react';
import { paymentService } from '../../services/paymentService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function PaymentModal({ isOpen, onClose, lease, defaultDate, defaultPeriodStart, defaultPeriodEnd, onSuccess }) {
    if (!isOpen) return null;

    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        bail_id: lease?.id || '',
        montant: lease?.loyer_mensuel || '',
        date_paiement: defaultDate ? defaultDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        mode_paiement: 'especes',
        periode_debut: defaultPeriodStart || '',
        periode_fin: defaultPeriodEnd || ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                bail_id: lease?.id || '',
                montant: lease?.loyer_mensuel || '',
                date_paiement: defaultDate ? defaultDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                mode_paiement: 'especes',
                periode_debut: defaultPeriodStart ? defaultPeriodStart.toISOString().split('T')[0] : '',
                periode_fin: defaultPeriodEnd ? defaultPeriodEnd.toISOString().split('T')[0] : ''
            });
        }
    }, [isOpen, lease, defaultDate, defaultPeriodStart, defaultPeriodEnd]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await paymentService.recordPayment(formData);
            if (response.success) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Paiement enregistré',
                    showConfirmButton: false,
                    timer: 3000
                });
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de l\'enregistrement.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900">Enregistrer un Paiement</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <Label>Locataire / Bien</Label>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                            {lease?.locataire?.user?.prenom} {lease?.locataire?.user?.nom} - {lease?.bien?.nom}
                        </div>
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
                        />
                    </div>

                    <div>
                        <Label htmlFor="date_paiement">Date de paiement</Label>
                        <Input
                            type="date"
                            id="date_paiement"
                            name="date_paiement"
                            value={formData.date_paiement}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="mode_paiement">Mode de paiement</Label>
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

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Annuler
                        </Button>
                        <Button type="submit" isLoading={submitting}>
                            Valider le Paiement
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
