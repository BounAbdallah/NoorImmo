import React, { useEffect, useState, useCallback } from 'react';
import { notificationService } from '../../services/notificationService';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bell, Check, CheckCheck, Trash2, FileText, CreditCard, AlertTriangle, Info, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Swal from 'sweetalert2';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [filterLue, setFilterLue] = useState('');
    const [filterType, setFilterType] = useState('');

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                ...(filterLue && { lue: filterLue }),
                ...(filterType && { type: filterType }),
            };
            const response = await notificationService.getAll(params);
            if (response.success) {
                setNotifications(response.data.data || []);
                setCurrentPage(response.data.current_page);
                setTotalPages(response.data.last_page);
                setTotalItems(response.data.total);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger les notifications', 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filterLue, filterType]);

    useEffect(() => {
        loadNotifications();
    }, [loadNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
            Swal.fire('Succès', 'Toutes les notifications marquées comme lues', 'success');
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Supprimer?',
            text: 'Cette notification sera supprimée définitivement.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Supprimer',
            cancelButtonText: 'Annuler'
        });

        if (result.isConfirmed) {
            try {
                await notificationService.delete(id);
                setNotifications(prev => prev.filter(n => n.id !== id));
            } catch (error) {
                console.error(error);
            }
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'bail_expire':
            case 'bail_expiration_7j':
            case 'bail_expiration_30j':
                return <FileText className="h-6 w-6 text-orange-500" />;
            case 'paiement':
            case 'paiement_retard':
            case 'paiement_partiel':
                return <CreditCard className="h-6 w-6 text-green-500" />;
            case 'incident':
                return <AlertTriangle className="h-6 w-6 text-red-500" />;
            default:
                return <Info className="h-6 w-6 text-blue-500" />;
        }
    };

    const getTypeBadge = (type) => {
        const typeLabels = {
            'bail_expire': 'Bail expiré',
            'bail_expiration_7j': 'Expiration 7j',
            'bail_expiration_30j': 'Expiration 30j',
            'paiement': 'Paiement',
            'paiement_retard': 'Loyer en retard',
            'paiement_partiel': 'Paiement partiel',
            'incident': 'Incident',
            'systeme': 'Système',
            'email': 'Email',
            'sms': 'SMS',
            'whatsapp': 'WhatsApp'
        };
        return (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {typeLabels[type] || type}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500">Gérez vos alertes et notifications</p>
                </div>
                <Button onClick={handleMarkAllAsRead} variant="outline">
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Tout marquer comme lu
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <select
                            value={filterLue}
                            onChange={(e) => { setFilterLue(e.target.value); setCurrentPage(1); }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Toutes</option>
                            <option value="false">Non lues</option>
                            <option value="true">Lues</option>
                        </select>
                        <select
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Tous les types</option>
                            <option value="bail_expire">Bail expiré</option>
                            <option value="bail_expiration_7j">Expiration 7 jours</option>
                            <option value="bail_expiration_30j">Expiration 30 jours</option>
                            <option value="paiement_retard">Loyer en retard</option>
                            <option value="paiement_partiel">Paiement partiel</option>
                            <option value="incident">Incident</option>
                            <option value="systeme">Système</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List */}
            <Card>
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <CardContent className="p-12 text-center">
                        <Bell className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Aucune notification</h3>
                        <p className="text-gray-500">Vous n'avez pas de notification pour le moment.</p>
                    </CardContent>
                ) : (
                    <>
                        <div className="px-6 py-3 bg-gray-50 border-b text-sm text-gray-500">
                            {totalItems} notification(s) trouvée(s)
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {notifications.map((notification) => (
                                <li
                                    key={notification.id}
                                    className={`px-6 py-4 hover:bg-gray-50 transition-colors ${!notification.lue ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`text-base font-medium ${!notification.lue ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notification.titre}
                                                </h4>
                                                {getTypeBadge(notification.type)}
                                                {!notification.lue && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span>
                                                    {format(new Date(notification.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                                                </span>
                                                <span>
                                                    ({formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })})
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 flex items-center gap-2">
                                            <Link
                                                to={`/notifications/${notification.id}`}
                                                className="px-3 py-1 text-sm text-primary-600 hover:text-primary-800 border border-primary-300 rounded-md hover:bg-primary-50 flex items-center gap-1"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Détails
                                            </Link>
                                            {!notification.lue && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full"
                                                    title="Marquer comme lu"
                                                >
                                                    <Check className="h-5 w-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(notification.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 py-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Précédent
                                </Button>
                                <span className="text-sm text-gray-500">
                                    Page {currentPage} sur {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Suivant
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
}
