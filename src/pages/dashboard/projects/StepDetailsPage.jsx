import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../../services/projectService';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent } from '../../../components/ui/Card';
import { ArrowLeft, Video, Image as ImageIcon, MapPin, CheckCircle, Clock } from 'lucide-react';

export default function StepDetailsPage() {
    const { id, stepId } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStep();
    }, [id, stepId]);

    const loadStep = async () => {
        try {
            const response = await projectService.getOne(id);
            const project = response.data.data;
            const foundStep = project.chantier.etapes.find(e => e.id == stepId);
            setStep(foundStep);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Chargement...</div>;
    if (!step) return <div className="p-8 text-center text-red-500">Étape introuvable</div>;

    const preuves = step.preuves_visuelles || [];

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <Button variant="ghost" onClick={() => navigate(`/projects/${id}`)} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au projet
            </Button>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{step.nom}</h1>
                <p className="text-gray-500 mb-4">{step.description}</p>
                <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${step.statut === 'terminee' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {step.statut}
                    </span>
                    <span className="text-sm font-medium text-gray-700">{new Intl.NumberFormat('fr-FR').format(step.budget_prevu)} CFA</span>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Preuves & Médias ({preuves.length})</h2>

                {preuves.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                        Aucune preuve ajoutée pour le moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {preuves.map((preuve) => (
                            <Card key={preuve.id} className="overflow-hidden">
                                <div className="aspect-video bg-gray-100 relative group">
                                    {preuve.type === 'video' ? (
                                        <video src={preuve.url_fichier} className="w-full h-full object-cover" controls />
                                    ) : (
                                        <img src={preuve.url_fichier} alt="Preuve" className="w-full h-full object-cover" />
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded capitalize flex items-center">
                                        {preuve.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <ImageIcon className="h-3 w-3 mr-1" />}
                                        {preuve.type}
                                    </div>
                                </div>
                                <CardContent className="p-3 bg-white">
                                    <div className="flex justify-between items-start text-xs text-gray-500 mb-2">
                                        <span className="flex items-center">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {new Date(preuve.created_at).toLocaleDateString()}
                                        </span>
                                        {preuve.validee ? (
                                            <span className="text-green-600 flex items-center font-medium">
                                                <CheckCircle className="h-3 w-3 mr-1" /> Validée
                                            </span>
                                        ) : (
                                            <span className="text-yellow-600 font-medium">En attente</span>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
