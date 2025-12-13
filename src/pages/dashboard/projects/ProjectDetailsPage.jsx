import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../../services/projectService';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { BadgeCheck, Lock, Unlock, AlertTriangle, Upload, Eye, CheckCircle, XCircle, ArrowLeft, Plus, Users } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../../context/AuthContext';

export default function ProjectDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            setError(null);
            const response = await projectService.getOne(id);
            setProject(response.data.data);
        } catch (err) {
            console.error("Failed to load project", err);
            const backendMsg = err.response?.data?.message || err.message;
            setError(backendMsg);
            // Dump trace to console for potential screenshot
            if (err.response?.data?.trace) {
                console.error("Backend Trace:", err.response.data.trace);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async (etapeId, montant) => {
        // Demo implementation calling backend
        if (!confirm("Confirmer le dépôt des fonds pour cette étape ?")) return;

        try {
            await projectService.depositFunds({
                projet_construction_id: project.id,
                etape_id: etapeId,
                entrepreneur_id: project.paiements_escrow?.[0]?.entrepreneur_id || 1, // Fallback for MVP if no entrepreneur assigned yet
                montant: montant,
                description: "Dépôt initial pour étape"
            });
            alert("Fonds déposés avec succès !");
            loadProject();
        } catch (e) {
            alert("Erreur dépôt: " + e.message);
        }
    };

    const handleGenerateLink = async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Générer lien d\'invitation',
            html:
                '<label class="block text-left text-sm font-medium text-gray-700 mb-1">Rôle</label>' +
                '<select id="swal-role" class="swal2-input" style="margin: 0 0 1rem 0; width: 100%;">' +
                '<option value="entrepreneur">Entrepreneur</option>' +
                '<option value="agence">Agence</option>' +
                '</select>' +
                '<div style="text-align: left; margin-top: 10px; display: flex; align-items: center;">' +
                '<input type="checkbox" id="swal-perm-validate" style="margin-right: 8px;"> <label for="swal-perm-validate">Autoriser validation (Débloquer fonds)</label>' +
                '</div>',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Générer Lien',
            cancelButtonText: 'Annuler',
            preConfirm: () => {
                return {
                    role: document.getElementById('swal-role').value,
                    canValidate: document.getElementById('swal-perm-validate').checked
                }
            }
        });

        if (formValues) {
            try {
                const response = await projectService.createInvitation(project.id, {
                    role: formValues.role,
                    permissions: { validate_step: formValues.canValidate }
                });

                const inviteUrl = window.location.origin + response.data.link;

                await Swal.fire({
                    title: 'Lien généré !',
                    text: 'Partagez ce lien avec l\'intervenant :',
                    input: 'text',
                    inputValue: inviteUrl,
                    showCancelButton: true,
                    confirmButtonText: 'Copier',
                    cancelButtonText: 'Fermer'
                }).then((result) => {
                    if (result.isConfirmed) {
                        navigator.clipboard.writeText(inviteUrl);
                        Swal.fire({
                            icon: 'success',
                            title: 'Copié !',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000
                        });
                    }
                });
            } catch (e) {
                Swal.fire('Erreur', e.message || 'Impossible de générer le lien', 'error');
            }
        }
    };

    const handleValidateProof = async (paiementId) => {
        if (!confirm("Valider les travaux et LIBÉRER les fonds ? Cette action est irréversible.")) return;

        try {
            await projectService.releaseFunds(paiementId);
            alert("Fonds libérés avec succès !");
            loadProject();
        } catch (e) {
            alert("Erreur libération: " + e.message);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement du chantier...</div>;
    if (!project) return <div className="p-8 text-center text-red-500">Projet introuvable</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <Button variant="ghost" onClick={() => navigate('/projects')} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
            </Button>

            {/* Header Projet */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{project.titre}</h1>
                        <p className="text-gray-500 flex items-center mt-1">
                            <span className="mr-4">{project.adresse}</span>
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-medium">
                                {project.statut}
                            </span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Budget Total</p>
                        <p className="text-2xl font-bold text-primary-600">{new Intl.NumberFormat('fr-FR').format(project.budget_total)} CFA</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Avancement global</span>
                        <span className="font-bold">{project.pourcentage_avancement}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-primary-600 h-3 rounded-full transition-all"
                            style={{ width: `${project.pourcentage_avancement}% ` }}
                        />
                    </div>
                </div>
            </div>

            {/* Etapes & Escrow */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Timeline (Left 2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Étapes du Chantier</h2>
                        {user?.user_type === 'bailleur' && (
                            <Button size="sm" onClick={() => navigate(`/ projects / ${id} /steps/new`)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter étape
                            </Button>
                        )}
                    </div>

                    {/* Si pas d'étapes */}
                    {(!project.chantier || !project.chantier.etapes || project.chantier.etapes.length === 0) && (
                        <Card className="border-dashed">
                            <CardContent className="py-8 text-center">
                                <p className="text-gray-500">Aucune étape définie pour ce chantier.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Liste des étapes */}
                    {project.chantier?.etapes?.map((etape) => (
                        <Card key={etape.id} className="relative overflow-hidden">
                            {/* Status Stripe */}
                            <div className={`absolute left - 0 top - 0 bottom - 0 w - 1 ${etape.statut === 'terminee' ? 'bg-green-500' : 'bg-gray-300'} `} />

                            <CardContent className="p-5 pl-7">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{etape.nom}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{etape.description}</p>

                                        <div className="flex items-center space-x-4 text-sm">
                                            <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(etape.budget_prevu)} CFA</span>
                                            <span className={`px - 2 py - 0.5 rounded text - xs ${etape.statut === 'terminee' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} `}>
                                                {etape.statut || 'En attente'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions Role-Based */}
                                    <div className="flex flex-col space-y-2">
                                        {/* Bailleur: Deposit if not paid */}
                                        {user?.user_type === 'bailleur' && (
                                            <Button size="sm" variant="outline" onClick={() => handleDeposit(etape.id, etape.budget_prevu)}>
                                                <Lock className="h-3 w-3 mr-2" />
                                                Séquestrer
                                            </Button>
                                        )}

                                        {/* Entrepreneur: Add Proof */}
                                        <div className="flex space-x-2">
                                            <Button size="sm" variant="ghost" onClick={() => navigate(`/ projects / ${id} /steps/${etape.id} `)}>
                                                <Eye className="h-3 w-3 mr-2" />
                                                Voir preuves
                                            </Button>
                                            {(user?.user_type === 'entrepreneur' || user?.user_type === 'agence') && (
                                                <Button size="sm" variant="ghost" onClick={() => navigate(`/ projects / ${id} /steps/${etape.id} /proofs/new`)}>
                                                    <Upload className="h-3 w-3 mr-2" />
                                                    Ajouter preuve
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Sidebar Finance & Partners (Right 1/3) */}
                <div className="space-y-4">
                    {/* Partners Section */}
                    <Card>
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="text-base">Intervenants</CardTitle>
                            {user?.user_type === 'bailleur' && (
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={handleGenerateLink}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {project.parties_prenantes?.length > 0 ? (
                                    project.parties_prenantes.map((pp) => (
                                        <div key={pp.id} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center">
                                                <div className="bg-gray-100 p-1.5 rounded-full mr-2">
                                                    <Users className="h-3 w-3 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{pp.user?.name || pp.email}</p>
                                                    <p className="text-xs text-gray-500 capitalize">{pp.role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-400 italic">Aucun intervenant externe</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {user?.user_type === 'bailleur' && (
                        <Card className="bg-blue-50 border-blue-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-blue-900">Portefeuille Virtuel</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-blue-700">10.000.000 CFA</p>
                                <p className="text-xs text-blue-600 mt-1">Disponible pour séquestre</p>
                                <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Recharger</Button>
                            </CardContent>
                        </Card>
                    )}

                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mt-6">Historique Paiements</h3>
                    <div className="space-y-3">
                        {project.paiements_escrow?.length > 0 ? project.paiements_escrow.map(payment => (
                            <Card key={payment.id}>
                                <CardContent className="p-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-medium text-sm">{payment.etape?.nom || 'Paiement'}</span>
                                        <span className="font-bold text-sm">{new Intl.NumberFormat('fr-FR').format(payment.montant)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className={payment.statut === 'bloque' ? 'text-orange-600 flex items-center' : 'text-green-600 flex items-center'}>
                                            {payment.statut === 'bloque' ? <Lock className="h-3 w-3 mr-1" /> : <Unlock className="h-3 w-3 mr-1" />}
                                            {payment.statut}
                                        </span>
                                        <span>{new Date(payment.date_creation).toLocaleDateString()}</span>
                                    </div>

                                    {/* Bailleur or Authorized Agency: Validation Button */}
                                    {payment.statut === 'bloque' && (user?.user_type === 'bailleur' || project.parties_prenantes?.find(p => p.user_id === user?.id)?.permissions?.validate_step) && (
                                        <Button
                                            size="sm"
                                            className="w-full mt-2 bg-green-600 hover:bg-green-700 h-7 text-xs"
                                            onClick={() => handleValidateProof(payment.id)}
                                        >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Valider & Libérer
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )) : (
                            <p className="text-xs text-gray-400 text-center italic">Aucun paiement effectué</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
