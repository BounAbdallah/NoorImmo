import React, { useState } from 'react';
import { X, Edit2, Save, User, Building, Phone, MapPin, Calendar, CreditCard, Mail } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

export default function AgencyProfileModal({ agency, onClose, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nom: agency.user?.nom || '',
        prenom: agency.user?.prenom || '',
        telephone: agency.user?.telephone || '',
        cin: agency.user?.cin || '',
        date_naissance: agency.user?.date_naissance || '',
        lieu_naissance: agency.user?.lieu_naissance || '',
        raison_sociale: agency.raison_sociale || '',
        ninea: agency.ninea || '',
        adresse: agency.adresse || '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await api.put(`/admin/agencies/${agency.id}/profile`, formData);

            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Succès!',
                    text: 'Informations mises à jour avec succès',
                    confirmButtonColor: '#2563eb'
                });
                onUpdate(response.data.data);
                setIsEditing(false);
            }
        } catch (error) {
            console.error('Error updating agency:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.response?.data?.message || 'Erreur lors de la mise à jour',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form data
        setFormData({
            nom: agency.user?.nom || '',
            prenom: agency.user?.prenom || '',
            telephone: agency.user?.telephone || '',
            cin: agency.user?.cin || '',
            date_naissance: agency.user?.date_naissance || '',
            lieu_naissance: agency.user?.lieu_naissance || '',
            raison_sociale: agency.raison_sociale || '',
            ninea: agency.ninea || '',
            adresse: agency.adresse || '',
        });
        setIsEditing(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Profil de l'Agence</h2>
                    <div className="flex gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                <Edit2 size={16} /> Modifier
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Informations Utilisateur */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                            <User size={20} className="text-blue-600" /> Informations Personnelles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField
                                label="Nom"
                                value={formData.nom}
                                isEditing={isEditing}
                                onChange={(v) => setFormData({ ...formData, nom: v })}
                                icon={<User size={16} />}
                            />
                            <InfoField
                                label="Prénom"
                                value={formData.prenom}
                                isEditing={isEditing}
                                onChange={(v) => setFormData({ ...formData, prenom: v })}
                                icon={<User size={16} />}
                            />
                            <InfoField
                                label="Email"
                                value={agency.user?.email}
                                isEditing={false}
                                disabled
                                icon={<Mail size={16} />}
                            />
                            <InfoField
                                label="Téléphone"
                                value={formData.telephone}
                                isEditing={isEditing}
                                onChange={(v) => setFormData({ ...formData, telephone: v })}
                                icon={<Phone size={16} />}
                            />
                            <InfoField
                                label="CIN"
                                value={formData.cin}
                                isEditing={isEditing}
                                onChange={(v) => setFormData({ ...formData, cin: v })}
                                icon={<CreditCard size={16} />}
                            />
                            <InfoField
                                label="Date de naissance"
                                value={formData.date_naissance}
                                type="date"
                                isEditing={isEditing}
                                onChange={(v) => setFormData({ ...formData, date_naissance: v })}
                                icon={<Calendar size={16} />}
                            />
                            <InfoField
                                label="Lieu de naissance"
                                value={formData.lieu_naissance}
                                isEditing={isEditing}
                                onChange={(v) => setFormData({ ...formData, lieu_naissance: v })}
                                icon={<MapPin size={16} />}
                                className="md:col-span-2"
                            />
                        </div>
                    </section>

                    {/* Informations Agence */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                            <Building size={20} className="text-blue-600" /> Informations Agence
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoField
                                label="Raison Sociale"
                                value={formData.raison_sociale}
                                isEditing={isEditing}
                                onChange={(v) => setFormData({ ...formData, raison_sociale: v })}
                                icon={<Building size={16} />}
                            />
                            <InfoField
                                label="NINEA"
                                value={formData.ninea}
                                isEditing={isEditing}
                                onChange={(v) => setFormData({ ...formData, ninea: v })}
                                icon={<CreditCard size={16} />}
                            />
                            <InfoField
                                label="Adresse"
                                value={formData.adresse}
                                isEditing={isEditing}
                                onChange={(v) => setFormData({ ...formData, adresse: v })}
                                icon={<MapPin size={16} />}
                                className="md:col-span-2"
                                multiline
                            />
                        </div>
                    </section>

                    {/* Action Buttons */}
                    {isEditing && (
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                disabled={loading}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                <Save size={16} />
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

function InfoField({ label, value, isEditing, onChange, disabled, type = 'text', className = '', icon, multiline = false }) {
    if (isEditing && !disabled) {
        return (
            <div className={className}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {icon}
                        </div>
                    )}
                    {multiline ? (
                        <textarea
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${icon ? 'pl-10' : ''
                                }`}
                            rows={3}
                        />
                    ) : (
                        <input
                            type={type}
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${icon ? 'pl-10' : ''
                                }`}
                        />
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
            <div className="flex items-center gap-2 text-gray-900">
                {icon && <span className="text-gray-400">{icon}</span>}
                <p className={disabled ? 'text-gray-500' : ''}>{value || '-'}</p>
            </div>
        </div>
    );
}
