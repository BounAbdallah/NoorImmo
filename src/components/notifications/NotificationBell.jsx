import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, AlertTriangle, FileText, CreditCard, Info, DollarSign } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        loadUnreadCount();
        // Refresh count every 60 seconds
        const interval = setInterval(loadUnreadCount, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadUnreadCount = async () => {
        try {
            const response = await notificationService.getUnreadCount();
            if (response.success) {
                setUnreadCount(response.count);
            }
        } catch (error) {
            console.error('Failed to load unread count', error);
        }
    };

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationService.getAll({ per_page: 10 });
            if (response.success) {
                setNotifications(response.data.data || []);
            }
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        if (!isOpen) {
            loadNotifications();
        }
        setIsOpen(!isOpen);
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, lue: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'bail_expire':
            case 'bail_expiration_7j':
            case 'bail_expiration_30j':
                return <FileText className="h-5 w-5 text-orange-500" />;
            case 'paiement':
                return <CreditCard className="h-5 w-5 text-green-500" />;
            case 'incident':
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            case 'commission_earned':
                return <DollarSign className="h-5 w-5 text-amber-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getNotificationLink = (notification) => {
        const metadata = notification.metadata || {};
        switch (notification.type) {
            case 'bail_expire':
            case 'bail_expiration_7j':
            case 'bail_expiration_30j':
                return metadata.bail_id ? `/leases/${metadata.bail_id}` : '/leases';
            case 'paiement':
                return metadata.paiement_id ? `/payments/${metadata.paiement_id}` : '/payments';
            case 'incident':
                return metadata.incident_id ? `/incidents/${metadata.incident_id}` : '/incidents';
            case 'commission_earned':
                return '/admin/dashboard';
            default:
                return null;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={handleToggle}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                                >
                                    <CheckCheck className="h-4 w-4" />
                                    Tout marquer lu
                                </button>
                            )}
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="flex-1 overflow-y-auto max-h-96">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                                <p>Aucune notification</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {notifications.map((notification) => {
                                    const link = getNotificationLink(notification);
                                    const content = (
                                        <div className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!notification.lue ? 'bg-blue-50' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium ${!notification.lue ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {notification.titre}
                                                    </p>
                                                    <p className="text-sm text-gray-500 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                                                    </p>
                                                </div>
                                                <div className="flex-shrink-0 flex items-center gap-1">
                                                    {!notification.lue && (
                                                        <button
                                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                                            className="p-1 text-gray-400 hover:text-green-600"
                                                            title="Marquer comme lu"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(notification.id); }}
                                                        className="p-1 text-gray-400 hover:text-red-600"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );

                                    return link ? (
                                        <li key={notification.id}>
                                            <Link to={link} onClick={() => { handleMarkAsRead(notification.id); setIsOpen(false); }}>
                                                {content}
                                            </Link>
                                        </li>
                                    ) : (
                                        <li key={notification.id}>{content}</li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t">
                        <Link
                            to="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
                        >
                            Voir toutes les notifications →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
