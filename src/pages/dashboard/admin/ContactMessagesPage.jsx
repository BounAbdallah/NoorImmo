import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building, Calendar, MessageSquare, Eye, CheckCircle, Clock, Archive, Trash2, Search, Filter } from 'lucide-react';
import { contactService } from '../../../services/contactService';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filters, setFilters] = useState({
        statut: '',
        search: ''
    });

    useEffect(() => {
        fetchMessages();
    }, [filters]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await contactService.getAllMessages(filters);
            // console.log('Contact messages response:', response);
            if (response.success) {
                // The API returns paginated data in response.data.data
                const messagesData = response.data.data || response.data || [];
                // console.log('Extracted messages:', messagesData);
                setMessages(messagesData);
            }
        } catch (error) {
            // console.error('Error fetching messages:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de charger les messages',
                confirmButtonColor: '#dc2626'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewMessage = async (message) => {
        try {
            const response = await contactService.getMessage(message.id);
            if (response.success) {
                setSelectedMessage(response.data);
                setShowModal(true);
                // Refresh list to update status
                fetchMessages();
            }
        } catch (error) {
            console.error('Error fetching message:', error);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const response = await contactService.updateMessage(id, { statut: newStatus });
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Statut mis à jour',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                fetchMessages();
                if (selectedMessage && selectedMessage.id === id) {
                    setSelectedMessage(response.data);
                }
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Impossible de mettre à jour le statut'
            });
        }
    };

    const getStatusBadge = (statut) => {
        const badges = {
            nouveau: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Nouveau', icon: Clock },
            lu: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Lu', icon: Eye },
            traite: { bg: 'bg-green-100', text: 'text-green-800', label: 'Traité', icon: CheckCircle },
            archive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Archivé', icon: Archive }
        };
        const badge = badges[statut] || badges.nouveau;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-3 h-3 mr-1" />
                {badge.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Messages de Contact</h1>
                    <p className="text-gray-600 mt-1">Gérez les messages reçus via le formulaire de contact</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email, sujet..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={filters.statut}
                            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tous les statuts</option>
                            <option value="nouveau">Nouveau</option>
                            <option value="lu">Lu</option>
                            <option value="traite">Traité</option>
                            <option value="archive">Archivé</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Chargement...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="p-8 text-center">
                        <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Aucun message trouvé</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sujet</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {messages.map((message) => (
                                    <tr key={message.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-semibold">
                                                        {message.prenom?.[0]}{message.nom?.[0]}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {message.prenom} {message.nom}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{message.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{message.sujet}</div>
                                            {message.entreprise && (
                                                <div className="text-sm text-gray-500">{message.entreprise}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {format(new Date(message.created_at), 'dd MMM yyyy', { locale: fr })}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {format(new Date(message.created_at), 'HH:mm')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(message.statut)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => handleViewMessage(message)}
                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                            >
                                                Voir détails
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Message Detail Modal */}
            {showModal && selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Détails du message</h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Contact Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-start space-x-3">
                                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedMessage.email}</p>
                                    </div>
                                </div>
                                {selectedMessage.telephone && (
                                    <div className="flex items-start space-x-3">
                                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Téléphone</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedMessage.telephone}</p>
                                        </div>
                                    </div>
                                )}
                                {selectedMessage.entreprise && (
                                    <div className="flex items-start space-x-3">
                                        <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-gray-500">Entreprise</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedMessage.entreprise}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-start space-x-3">
                                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {format(new Date(selectedMessage.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Sujet</h3>
                                <p className="text-lg font-semibold text-gray-900">{selectedMessage.sujet}</p>
                            </div>

                            {/* Message */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                                </div>
                            </div>

                            {/* Status Actions */}
                            <div className="border-t pt-6">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Changer le statut</h3>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedMessage.id, 'lu')}
                                        disabled={selectedMessage.statut === 'lu'}
                                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Marquer comme lu
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedMessage.id, 'traite')}
                                        disabled={selectedMessage.statut === 'traite'}
                                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Marquer comme traité
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedMessage.id, 'archive')}
                                        disabled={selectedMessage.statut === 'archive'}
                                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Archiver
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
