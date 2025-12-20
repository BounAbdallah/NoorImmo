import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { useNavigate } from 'react-router-dom';
import { teamService } from '../../../services/teamService';
import { agenceService } from '../../../services/agenceService';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Plus, Trash2, Mail, User, Shield, Edit } from 'lucide-react';
import { PermissionsEditor } from '../../../components/permissions/PermissionsEditor';
import Swal from 'sweetalert2';

export default function TeamPage() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', permissions: {} });
    const [editingMember, setEditingMember] = useState(null);
    const [editPermissions, setEditPermissions] = useState({});
    const [agence, setAgence] = useState(null);

    const { hasPermission } = useAuth();
    const navigate = useNavigate(); // Assume useNavigate is imported or add it

    useEffect(() => {
        // if (!hasPermission('team.read')) { ... }
        // Actually, let's allow read but restrict actions. Or strict check?
        // Let's assume team page is "team.read" access.
        if (!hasPermission('team.read')) {
            Swal.fire({
                icon: 'error',
                title: 'Accès refusé',
                text: "Vous n'avez pas la permission de gérer l'équipe.",
                timer: 3000,
                showConfirmButton: false
            });
            navigate('/dashboard');
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [teamRes, agenceRes] = await Promise.all([
                teamService.getTeamMembers(),
                agenceService.getProfile()
            ]);

            if (teamRes.success) setMembers(teamRes.data);
            if (agenceRes.success) setAgence(agenceRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        setInviteLoading(true);
        try {
            await teamService.inviteMember(formData);
            setFormData({ nom: '', prenom: '', email: '', permissions: {} });
            await fetchData(); // Refresh list
            Swal.fire({
                icon: 'success',
                title: 'Invitation envoyée !',
                text: 'Le membre a été invité avec succès.',
                timer: 3000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Invite error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.response?.data?.message || "Erreur lors de l'invitation"
            });
        } finally {
            setInviteLoading(false);
        }
    };

    const handleRemove = async (id) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: 'Voulez-vous vraiment supprimer ce membre ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
        });

        if (!result.isConfirmed) return;

        try {
            await teamService.removeMember(id);
            await fetchData();
            Swal.fire({
                icon: 'success',
                title: 'Supprimé !',
                text: 'Le membre a été supprimé avec succès.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Remove error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.response?.data?.message || "Erreur lors de la suppression"
            });
        }
    };

    const handleEditPermissions = (member) => {
        setEditingMember(member);
        setEditPermissions(member.permissions || {});
    };

    const handleSavePermissions = async () => {
        try {
            await teamService.updateMemberPermissions(editingMember.id, editPermissions);
            setEditingMember(null);
            setEditPermissions({});
            await fetchData();
            Swal.fire({
                icon: 'success',
                title: 'Permissions mises à jour !',
                text: 'Les permissions ont été modifiées avec succès.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Update permissions error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.response?.data?.message || "Erreur lors de la mise à jour"
            });
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    const limit = agence?.abonnement?.plan?.limite_utilisateurs || 1;
    const count = members.length; // Includes owner usually, or just team members? Backend index returns all associated users.
    // Assuming backend 'index' returns all users including owner if they have agence_id. 
    // Wait, owner has agence_id? 
    // In migration: users table has agence_id.
    // In TeamController index: $request->user()->agence->equipe. 
    // Agence->equipe is hasMany User. 
    // So yes, it returns all users with that agence_id. 
    // Owner is usually created with agence_id too? 
    // Let's check logic. 
    // AuthController register: 
    // $agence = Agence::create([...]);
    // $user->agence()->save($agence);
    // It doesn't set agence_id on the user explicitly in register for the owner, 
    // BUT User model has `agence()` hasOne relation.
    // The `equipe` relation is `hasMany` on Agence. 
    // User migration: `agence_id` nullable.
    // If owner doesn't have `agence_id` set, they won't show up in `equipe` if `equipe` relies on `agence_id` foreign key.
    // Let's check Agence model `equipe`.
    // return $this->hasMany(User::class); -> looks for agence_id on users table.

    // If owner doesn't have agence_id, they are not in equipe count. 
    // BUT owner counts towards limit. 
    // TeamController store: 
    // $currentUsersCount = $agence->equipe()->count() + 1; // +1 for the owner if they are not in equipe?
    // This implies owner might not be in equipe.
    // If owner is not in equipe, then members list shows only invited members.

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion d'équipe</h1>
                    <p className="text-gray-500">Gérez les accès à votre agence</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                    Utilisateurs : {count} / {limit} (Plan {agence?.abonnement?.plan?.nom || 'Gratuit'})
                </div>
            </div>

            <div className="space-y-6">
                {/* Invite Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PermissionGuard permission="team.create" fallback={
                        <Card>
                            <CardContent className="py-8 text-center text-gray-500">
                                <Shield className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                <p>Vous n'avez pas la permission d'inviter des membres.</p>
                            </CardContent>
                        </Card>
                    }>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Informations du membre</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleInvite} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Prénom</Label>
                                            <Input
                                                type="text"
                                                value={formData.prenom}
                                                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                                placeholder="Prénom"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Nom</Label>
                                            <Input
                                                type="text"
                                                value={formData.nom}
                                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                                placeholder="Nom"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Adresse Email</Label>
                                        <Input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="collegue@agence.com"
                                            required
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={inviteLoading || count >= limit}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        {inviteLoading ? 'Envoi...' : 'Envoyer l\'invitation'}
                                    </Button>
                                    {count >= limit && (
                                        <p className="text-xs text-red-500 text-center">
                                            Limite atteinte. Mettez à jour votre plan pour ajouter plus de membres.
                                        </p>
                                    )}
                                </form>
                            </CardContent>
                        </Card>

                        <PermissionsEditor
                            permissions={formData.permissions}
                            onChange={(permissions) => setFormData({ ...formData, permissions })}
                            disabled={inviteLoading}
                        />
                    </PermissionGuard>
                </div>

                {/* Team List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg">Membres de l'équipe</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {members.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">Aucun membre dans l'équipe</p>
                            ) : (
                                members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center space-x-4">
                                            <div className="bg-primary-100 p-2 rounded-full">
                                                <User className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {member.prenom} {member.nom}
                                                    {member.id === agence?.user?.id && <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Propriétaire</span>}
                                                </p>
                                                <p className="text-sm text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {member.id !== agence?.user?.id && (
                                                <>
                                                    <PermissionGuard permission="team.edit">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEditPermissions(member)}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </PermissionGuard>
                                                    <PermissionGuard permission="team.delete">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemove(member.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </PermissionGuard>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Permissions Modal */}
                {editingMember && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold">
                                        Modifier les permissions - {editingMember.prenom} {editingMember.nom}
                                    </h2>
                                    <button
                                        onClick={() => setEditingMember(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <PermissionsEditor
                                    permissions={editPermissions}
                                    onChange={setEditPermissions}
                                />

                                <div className="flex gap-3 mt-6">
                                    <Button
                                        onClick={handleSavePermissions}
                                        className="flex-1"
                                    >
                                        Enregistrer
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setEditingMember(null)}
                                        className="flex-1"
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
