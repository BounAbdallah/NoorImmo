import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../../services/projectService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { ArrowLeft } from 'lucide-react';

export default function AddStepPage() {
    const { id } = useParams(); // Project ID
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        budget_prevu: '',
        date_debut_prevue: '',
        date_fin_prevue: '',
        ordre: 1
    });

    // We need to fetch project to get chantier_id. For now, assuming project loading logic or separate call.
    // Ideally, we pass chantier_id via URL or fetch project first.
    // Let's fetch project first to be safe and get correctly the chantier_id.
    const [project, setProject] = useState(null);

    React.useEffect(() => {
        projectService.getOne(id).then(res => setProject(res.data.data));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!project?.chantier) return alert("Erreur: chantier non trouvé");

        setLoading(true);
        try {
            await projectService.addStep({
                ...formData,
                chantier_id: project.chantier.id
            });
            navigate(`/projects/${id}`);
        } catch (error) {
            alert("Erreur création étape: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (!project) return <div className="p-8">Chargement...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate(`/projects/${id}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au projet
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Ajouter une étape au chantier</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nom de l'étape</Label>
                            <Input
                                value={formData.nom}
                                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                                placeholder="Ex: Fondations, Élévation RDC..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Budget Prévu (CFA)</Label>
                            <Input
                                type="number"
                                value={formData.budget_prevu}
                                onChange={e => setFormData({ ...formData, budget_prevu: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date Début Prévue</Label>
                                <Input
                                    type="date"
                                    value={formData.date_debut_prevue}
                                    onChange={e => setFormData({ ...formData, date_debut_prevue: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Date Fin Prévue</Label>
                                <Input
                                    type="date"
                                    value={formData.date_fin_prevue}
                                    onChange={e => setFormData({ ...formData, date_fin_prevue: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" isLoading={loading}>
                            Ajouter l'étape
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
