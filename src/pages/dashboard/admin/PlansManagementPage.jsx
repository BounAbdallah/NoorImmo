import React, { useEffect, useState } from 'react';
import { adminService } from '../../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Edit, Plus, Check, X, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

export default function PlansManagementPage() {
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState(null); // null = list mode, {} = create/edit mode

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const response = await adminService.getPlans();
            if (response.success) {
                setPlans(response.data);
            }
        } catch (error) {
            console.error("Error loading plans", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const response = await adminService.savePlan(editingPlan);
            if (response.success) {
                Swal.fire('Succès', 'Plan enregistré', 'success');
                setEditingPlan(null);
                loadPlans();
            }
        } catch (error) {
            Swal.fire('Erreur', 'Impossible d\'enregistrer le plan', 'error');
        }
    };

    if (loading) return <div className="p-12 text-center">Chargement...</div>;

    if (editingPlan) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                    <Button variant="ghost" onClick={() => setEditingPlan(null)}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold">{editingPlan.id ? 'Modifier le Plan' : 'Nouveau Plan'}</h1>
                </div>

                <Card>
                    <form onSubmit={handleSave}>
                        <CardContent className="space-y-4 pt-6">
                            <div>
                                <Label>Nom du Plan</Label>
                                <Input
                                    value={editingPlan.nom || ''}
                                    onChange={e => setEditingPlan({ ...editingPlan, nom: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Input
                                    value={editingPlan.description || ''}
                                    onChange={e => setEditingPlan({ ...editingPlan, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Prix Mensuel (FCFA)</Label>
                                    <Input
                                        type="number"
                                        value={editingPlan.prix_mensuel || ''}
                                        onChange={e => setEditingPlan({ ...editingPlan, prix_mensuel: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="flex items-center mt-6">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 text-primary-600"
                                            checked={editingPlan.actif !== false}
                                            onChange={e => setEditingPlan({ ...editingPlan, actif: e.target.checked })}
                                        />
                                        <span className="text-gray-700">Plan Actif</span>
                                    </label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Limite Biens (0 = illimité)</Label>
                                    <Input
                                        type="number"
                                        value={editingPlan.limite_biens || ''}
                                        onChange={e => setEditingPlan({ ...editingPlan, limite_biens: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Limite Utilisateurs</Label>
                                    <Input
                                        type="number"
                                        value={editingPlan.limite_utilisateurs || ''}
                                        onChange={e => setEditingPlan({ ...editingPlan, limite_utilisateurs: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <Button type="button" variant="outline" onClick={() => setEditingPlan(null)}>
                                    Annuler
                                </Button>
                                <Button type="submit">
                                    Enregistrer
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/dashboard')} className="p-2">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Abonnements</h1>
                </div>
                <Button onClick={() => setEditingPlan({})}>
                    <Plus className="h-4 w-4 mr-2" /> Nouveau Plan
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card key={plan.id} className={!plan.actif ? 'opacity-70' : ''}>
                        <CardHeader className="flex flex-row justify-between items-start pb-2">
                            <CardTitle className="text-xl font-bold text-primary-700">{plan.nom}</CardTitle>
                            {plan.actif ?
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Actif</span> :
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Inactif</span>
                            }
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-gray-900 mb-4">
                                {new Intl.NumberFormat('fr-FR').format(plan.prix_mensuel)} <span className="text-sm text-gray-500 font-normal">FCFA / mois</span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <div className="flex justify-between">
                                    <span>Biens:</span>
                                    <span className="font-semibold">{plan.limite_biens === 0 ? 'Illimité' : plan.limite_biens}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Utilisateurs:</span>
                                    <span className="font-semibold">{plan.limite_utilisateurs}</span>
                                </div>
                            </div>
                            <Button className="w-full" variant="outline" onClick={() => setEditingPlan(plan)}>
                                <Edit className="h-4 w-4 mr-2" /> Modifier
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
