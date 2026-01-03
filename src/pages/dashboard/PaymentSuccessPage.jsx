
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService'; // Assuming you have this service
import { CheckCircle, XCircle } from 'lucide-react';

const PaymentSuccessPage = () => {
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Finalisation du paiement en cours...');
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const confirmPayment = async () => {
            const params = new URLSearchParams(location.search);
            const ref = params.get('ref');
            const bailId = params.get('bail_id');
            const amount = params.get('amount');
            const waveId = params.get('id'); // Wave sometimes sends 'id'

            if (!bailId || !amount) {
                setStatus('error');
                setMessage('Données de paiement manquantes.');
                return;
            }

            try {
                // Call backend to confirm payment
                await paymentService.confirmWavePayment({
                    bail_id: bailId,
                    montant: amount,
                    reference_transaction: waveId || ref // Use Wave ID if available, else client ref
                });

                setStatus('success');
                setMessage('Paiement confirmé avec succès !');

                // Redirect after a short delay
                setTimeout(() => {
                    navigate('/my-payments');
                }, 3000);

            } catch (error) {
                console.error('Payment confirmation error:', error);
                setStatus('error');
                setMessage('Erreur lors de la confirmation du paiement. Veuillez contacter le support si vous avez été débité.');
            }
        };

        confirmPayment();
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
                {status === 'processing' && (
                    <div className="animate-pulse">
                        <div className="h-12 w-12 bg-blue-400 rounded-full mx-auto mb-4"></div>
                        <h2 className="text-xl font-bold text-gray-900">Vérification en cours...</h2>
                        <p className="text-gray-500 mt-2">Nous confirmons votre transaction auprès de Wave.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">Paiement Réussi !</h2>
                        <p className="text-gray-500 mt-2">{message}</p>
                        <p className="text-sm text-gray-400 mt-4">Redirection vers vos paiements...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">Erreur</h2>
                        <p className="text-red-500 mt-2">{message}</p>
                        <button
                            onClick={() => navigate('/my-payments')}
                            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Retour
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
