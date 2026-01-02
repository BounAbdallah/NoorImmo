import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { propertyService } from '../../../services/propertyService';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { ArrowLeft, MapPin, Tag, Home, Maximize, Calendar, User, Edit, Trash2, Building, FileText, Bed, Sofa, UtensilsCrossed, Bath, Toilet, Wind, Trees, Waves, Car, Package } from 'lucide-react';
import Swal from 'sweetalert2';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { structureService } from '../../../services/structureService';

export default function PropertyDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProperty();
    }, [id]);

    const loadProperty = async () => {
        try {
            const response = await propertyService.getOne(id);
            setProperty(response.data.data);
        } catch (error) {
            console.error("Failed to load property", error);
            alert("Erreur chargement: " + (error.response?.status === 404 ? "Bien non trouvé (404)" : error.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Chargement du bien...</div>;
    if (!property) return <div className="p-8 text-center text-red-500">Bien introuvable</div>;

    const getStatusInfo = (status) => {
        const statuses = {
            disponible: { color: 'bg-green-100 text-green-800', label: 'Disponible' },
            loue: { color: 'bg-blue-100 text-blue-800', label: 'Loué' },
            maintenance: { color: 'bg-orange-100 text-orange-800', label: 'Maintenance' },
            vendu: { color: 'bg-gray-100 text-gray-800', label: 'Vendu' },
        };
        return statuses[status] || statuses['disponible'];
    };

    const statusInfo = getStatusInfo(property.statut);

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <Button variant="ghost" onClick={() => navigate('/biens')} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la liste
            </Button>

            {/* Header / Hero */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="h-48 bg-gray-200 w-full flex items-center justify-center text-gray-400">
                    <Home className="h-16 w-16" />
                    {/* Placeholder for real image */}
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900">{property.reference}</h1>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${statusInfo.color}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                            <div className="flex items-center text-gray-500 mb-4">
                                <MapPin className="h-4 w-4 mr-2" />
                                {property.adresse}
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Loyer Mensuel</p>
                            <p className="text-2xl font-bold text-primary-600">
                                {new Intl.NumberFormat('fr-FR').format(property.loyer_mensuel)} CFA
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center text-gray-600">
                            <Home className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Type</p>
                                <p className="font-medium capitalize">{property.type}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Maximize className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Surface</p>
                                <p className="font-medium">{property.surface} m²</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Tag className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Pièces</p>
                                <p className="font-medium">{property.nombre_pieces}</p>
                            </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                            <div>
                                <p className="text-xs text-gray-500">Ajouté le</p>
                                <p className="font-medium">{new Date(property.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {property.immeuble && (
                            <div className="flex items-center text-gray-600">
                                <Building className="h-5 w-5 mr-3 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Immeuble</p>
                                    <p className="font-medium">
                                        <Link to={`/immeubles/${property.immeuble.id}`} className="text-primary-600 hover:underline">
                                            {property.immeuble.nom}
                                        </Link>
                                        {property.etage && <span className="text-gray-500 text-sm block">{property.etage.nom}</span>}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Information Détaillée */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 leading-relaxed">
                                {property.description || "Aucune description fournie pour ce bien."}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Composition Détaillée */}
                    {!['terrain', 'commerce'].includes(property.type) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Composition Détaillée</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {property.nombre_chambres > 0 && (
                                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                            <Bed className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{property.nombre_chambres}</p>
                                                <p className="text-xs text-gray-500">Chambre{property.nombre_chambres > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.nombre_salons > 0 && (
                                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                                            <Sofa className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{property.nombre_salons}</p>
                                                <p className="text-xs text-gray-500">Salon{property.nombre_salons > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.nombre_cuisines > 0 && (
                                        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                                            <UtensilsCrossed className="h-5 w-5 text-orange-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{property.nombre_cuisines}</p>
                                                <p className="text-xs text-gray-500">Cuisine{property.nombre_cuisines > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.nombre_salles_bain > 0 && (
                                        <div className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-lg">
                                            <Bath className="h-5 w-5 text-cyan-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{property.nombre_salles_bain}</p>
                                                <p className="text-xs text-gray-500">Salle{property.nombre_salles_bain > 1 ? 's' : ''} de bain</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.nombre_toilettes > 0 && (
                                        <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                                            <Toilet className="h-5 w-5 text-teal-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{property.nombre_toilettes}</p>
                                                <p className="text-xs text-gray-500">Toilette{property.nombre_toilettes > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.nombre_balcons > 0 && (
                                        <div className="flex items-center space-x-3 p-3 bg-sky-50 rounded-lg">
                                            <Home className="h-5 w-5 text-sky-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{property.nombre_balcons}</p>
                                                <p className="text-xs text-gray-500">Balcon{property.nombre_balcons > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.nombre_terrasses > 0 && (
                                        <div className="flex items-center space-x-3 p-3 bg-amber-50 rounded-lg">
                                            <Home className="h-5 w-5 text-amber-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{property.nombre_terrasses}</p>
                                                <p className="text-xs text-gray-500">Terrasse{property.nombre_terrasses > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    )}
                                    {property.nombre_parkings > 0 && (
                                        <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                            <Car className="h-5 w-5 text-slate-600" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{property.nombre_parkings}</p>
                                                <p className="text-xs text-gray-500">Parking{property.nombre_parkings > 1 ? 's' : ''}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Équipements */}
                    {!['terrain'].includes(property.type) && (property.meuble || property.climatisation || property.jardin || property.piscine) && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Équipements</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {property.meuble && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            <Package className="h-4 w-4 mr-2" />
                                            Meublé
                                        </span>
                                    )}
                                    {property.climatisation && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            <Wind className="h-4 w-4 mr-2" />
                                            Climatisation
                                        </span>
                                    )}
                                    {property.jardin && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                            <Trees className="h-4 w-4 mr-2" />
                                            Jardin
                                        </span>
                                    )}
                                    {property.piscine && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800">
                                            <Waves className="h-4 w-4 mr-2" />
                                            Piscine
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle>Historique des Locataires</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {property.baux && property.baux.length > 0 ? (
                                <div className="space-y-4">
                                    {property.baux.map((bail) => (
                                        <div key={bail.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">
                                                    {bail.locataire?.user?.prenom} {bail.locataire?.user?.nom}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(bail.date_debut).toLocaleDateString()} - {new Date(bail.date_fin).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded-full mr-3 ${bail.statut === 'actif' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {bail.statut}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/leases/${bail.id}`)}
                                                className="h-8 w-8 p-0"
                                                title="Voir le contrat"
                                            >
                                                <FileText className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                                    Aucun historique de location.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions & Stats */}


                {/* Gestionnaire / Mandat */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <PermissionGuard module="biens" action="edit">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                    onClick={() => navigate(`/biens/${property.id}/edit`)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier le bien
                                </Button>
                            </PermissionGuard>

                            <PermissionGuard module="biens" action="delete">
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => {
                                        Swal.fire({
                                            title: 'Êtes-vous sûr ?',
                                            text: "Cette action est irréversible !",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#d33',
                                            cancelButtonColor: '#3085d6',
                                            confirmButtonText: 'Oui, supprimer',
                                            cancelButtonText: 'Annuler'
                                        }).then(async (result) => {
                                            if (result.isConfirmed) {
                                                try {
                                                    await propertyService.delete(property.id);
                                                    Swal.fire('Supprimé !', 'Le bien a été supprimé.', 'success');
                                                    navigate('/biens');
                                                } catch (error) {
                                                    Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression.', 'error');
                                                }
                                            }
                                        });
                                    }}
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                </Button>
                            </PermissionGuard>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Gestionnaire</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {property.bailleur?.user?.prenom} {property.bailleur?.user?.nom}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {property.bailleur ? (
                                            <>Bailleur {property.immeuble ? `(Immeuble: ${property.immeuble.nom})` : ''}</>
                                        ) : 'Propriétaire'}
                                    </p>
                                </div>
                            </div>

                            {/* Mandat Actions - Link to Building Mandate if available */}
                            {property.immeuble_id ? (
                                <div className="border-t pt-4 grid grid-cols-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                const blob = await structureService.viewMandat(property.immeuble_id);
                                                const url = window.URL.createObjectURL(blob);
                                                window.open(url, '_blank');
                                            } catch (e) {
                                                console.error(e);
                                                alert("Erreur lors de l'ouverture du mandat");
                                            }
                                        }}
                                        className="w-full text-xs"
                                    >
                                        Voir Mandat (Immeuble)
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={async () => {
                                            try {
                                                const blob = await structureService.downloadMandat(property.immeuble_id);
                                                const url = window.URL.createObjectURL(blob);
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', `Mandat_Immeuble_${property.immeuble.nom}.pdf`);
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                            } catch (e) {
                                                console.error(e);
                                                alert("Erreur lors du téléchargement");
                                            }
                                        }}
                                        className="w-full text-xs"
                                    >
                                        Télécharger
                                    </Button>
                                </div>
                            ) : (
                                <div className="border-t pt-4 text-center">
                                    <p className="text-xs text-gray-500 italic">
                                        Ce bien n'est pas lié à un immeuble. <br /> Pas de mandat de gérance disponible.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
