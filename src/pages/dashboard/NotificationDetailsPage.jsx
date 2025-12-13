import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Bell, FileText, AlertTriangle, CreditCard, Home, User, Calendar, MapPin, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Swal from 'sweetalert2';

export default function NotificationDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const [related, setRelated] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotification();
    }, [id]);

    const loadNotification = async () => {
        try {
            const response = await notificationService.getOne(id);
            if (response.success) {
                setNotification(response.data);
                setRelated(response.related || {});
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Notification introuvable', 'error');
            navigate('/notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
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
                Swal.fire('Supprimée', 'Notification supprimée', 'success');
                navigate('/notifications');
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
                return <FileText className="h-8 w-8 text-orange-500" />;
            case 'paiement':
            case 'paiement_retard':
            case 'paiement_partiel':
                return <CreditCard className="h-8 w-8 text-green-500" />;
            case 'incident':
                return <AlertTriangle className="h-8 w-8 text-red-500" />;
            default:
                return <Bell className="h-8 w-8 text-blue-500" />;
        }
    };

    const getTypeLabel = (type) => {
        const typeLabels = {
            'bail_expire': 'Bail expiré',
            'bail_expiration_7j': 'Expiration dans 7 jours',
            'bail_expiration_30j': 'Expiration dans 30 jours',
            'paiement': 'Paiement',
            'paiement_retard': 'Loyer en retard',
            'paiement_partiel': 'Paiement partiel',
            'incident': 'Incident',
            'systeme': 'Système',
            'email': 'Email',
            'sms': 'SMS',
            'whatsapp': 'WhatsApp'
        };
        return typeLabels[type] || type;
    };

    const getRelatedLink = () => {
        const metadata = notification?.metadata || {};
        if (metadata.incident_id) return `/incidents/${metadata.incident_id}`;
        if (metadata.bail_id) return `/leases/${metadata.bail_id}`;
        if (metadata.bien_id) return `/biens/${metadata.bien_id}`;
        return null;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
            </div>
        );
    }

    if (!notification) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <Button variant="ghost" onClick={() => navigate('/notifications')} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux notifications
            </Button>

            {/* Main Notification Card */}
            <Card>
                <CardHeader className="border-b bg-gray-50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div>
                                <CardTitle className="text-xl">{notification.titre}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                                        {getTypeLabel(notification.type)}
                                    </span>
                                    {notification.lue ? (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Lu
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                            Non lu
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" onClick={handleDelete} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {/* Message */}
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Message</h3>
                        <p className="text-gray-900 text-lg">{notification.message}</p>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Reçue le: {format(new Date(notification.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                        </div>
                        {notification.metadata?.loyer_attendu && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                                <span>Loyer attendu: {parseFloat(notification.metadata.loyer_attendu).toLocaleString()} FCFA</span>
                            </div>
                        )}
                    </div>

                    {/* Action Button */}
                    {getRelatedLink() && (
                        <div className="mb-6">
                            <Link to={getRelatedLink()}>
                                <Button className="w-full md:w-auto">
                                    Voir les détails complets →
                                </Button>
                            </Link>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Related Data Cards */}
            {related.bail && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary-600" />
                            Informations sur le bail
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Home className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Bien</p>
                                        <Link to={`/biens/${related.bail.bien?.id}`} className="text-primary-600 hover:underline font-medium">
                                            {related.bail.bien?.reference || related.bail.bien?.nom}
                                        </Link>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Adresse</p>
                                        <p className="text-gray-900">{related.bail.bien?.adresse}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Locataire</p>
                                        <p className="text-gray-900 font-medium">
                                            {related.bail.locataire?.user?.prenom} {related.bail.locataire?.user?.nom}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Loyer mensuel</p>
                                        <p className="text-gray-900 font-bold">{parseFloat(related.bail.loyer_mensuel).toLocaleString()} FCFA</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Période du bail</p>
                                    <p className="text-gray-900">
                                        {format(new Date(related.bail.date_debut), 'dd/MM/yyyy')} - {format(new Date(related.bail.date_fin), 'dd/MM/yyyy')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-500">Statut du bail</p>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${related.bail.statut === 'actif' ? 'bg-green-100 text-green-800' :
                                            related.bail.statut === 'expire' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {related.bail.statut}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {related.incident && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            Informations sur l'incident
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Titre</p>
                                <p className="text-gray-900 font-medium">{related.incident.titre}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Catégorie</p>
                                <p className="text-gray-900 capitalize">{related.incident.categorie}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Priorité</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${related.incident.priorite === 'urgente' ? 'bg-red-100 text-red-800' :
                                        related.incident.priorite === 'haute' ? 'bg-orange-100 text-orange-800' :
                                            related.incident.priorite === 'moyenne' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {related.incident.priorite}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Statut</p>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${related.incident.statut === 'resolu' ? 'bg-green-100 text-green-800' :
                                        related.incident.statut === 'en_cours' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {related.incident.statut}
                                </span>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="text-gray-900">{related.incident.description}</p>
                            </div>
                            {related.incident.locataire && (
                                <div>
                                    <p className="text-sm text-gray-500">Signalé par</p>
                                    <p className="text-gray-900">
                                        {related.incident.locataire.user?.prenom} {related.incident.locataire.user?.nom}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {related.bien && !related.bail && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Home className="h-5 w-5 text-primary-600" />
                            Informations sur le bien
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Référence</p>
                                <Link to={`/biens/${related.bien.id}`} className="text-primary-600 hover:underline font-medium">
                                    {related.bien.reference}
                                </Link>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Type</p>
                                <p className="text-gray-900 capitalize">{related.bien.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Adresse</p>
                                <p className="text-gray-900">{related.bien.adresse}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Loyer</p>
                                <p className="text-gray-900 font-bold">{parseFloat(related.bien.loyer_mensuel).toLocaleString()} FCFA</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
