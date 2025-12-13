import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../../services/projectService';
import Swal from 'sweetalert2';

export default function AcceptInvitePage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        const accept = async () => {
            try {
                const response = await projectService.acceptInvitation(token);
                await Swal.fire({
                    icon: 'success',
                    title: 'Félicitations !',
                    text: 'Vous avez rejoint le projet avec succès.',
                    confirmButtonText: 'Voir le projet'
                });
                navigate(`/projects/${response.data.projectId}`);
            } catch (e) {
                console.error(e);
                let msg = e.response?.data?.message || e.message;
                await Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: msg
                });
                navigate('/');
            } finally {
                setVerifying(false);
            }
        };

        accept();
    }, [token, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow text-center">
                {verifying ? (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold">Vérification de l'invitation...</h2>
                    </>
                ) : (
                    <p>Redirection...</p>
                )}
            </div>
        </div>
    );
}
