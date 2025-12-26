import React, { useEffect, useState } from 'react';
import PermissionGuard from '../../../components/auth/PermissionGuard';
import { useParams, useNavigate } from 'react-router-dom';
import { incidentService } from '../../../services/incidentService';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { ArrowLeft, CheckCircle, User, X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

// Get backend base URL for images
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000';

// Helper function to get full image URL
const getImageUrl = (path) => {
    if (!path) return '';
    // If path already includes http, return as is
    if (path.startsWith('http')) return path;
    // Otherwise, prepend the backend URL
    return `${API_BASE_URL}${path}`;
};

export default function IncidentDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [incident, setIncident] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resolving, setResolving] = useState(false);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        loadIncident();
    }, [id]);

    const loadIncident = async () => {
        try {
            const response = await incidentService.getOne(id);
            setIncident(response.data);
        } catch (error) {
            console.error('🔴 Error loading incident:', error);
            Swal.fire('Erreur', 'Incident introuvable', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        const { value: notes } = await Swal.fire({
            title: 'Résolution',
            input: 'textarea',
            inputLabel: 'Notes de résolution',
            inputPlaceholder: 'Expliquez comment le problème a été résolu...',
            showCancelButton: true
        });

        if (notes) {
            setResolving(true);
            try {
                await incidentService.resolve(id, notes);
                Swal.fire('Succès', 'Incident marqué comme résolu', 'success');
                loadIncident();
            } catch (error) {
                console.error(error);
                Swal.fire('Erreur', 'Impossible de résoudre l\'incident', 'error');
            } finally {
                setResolving(false);
            }
        }
    };

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextImage = () => {
        if (incident.images && currentImageIndex < incident.images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        }
    };

    const previousImage = () => {
        if (currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') previousImage();
    };

    useEffect(() => {
        if (lightboxOpen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [lightboxOpen, currentImageIndex]);

    if (loading) return <div className="p-8 text-center">Chargement...</div>;
    if (!incident) return null;

    const images = incident.images || [];
    const hasImages = images.length > 0;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate('/incidents')} className="pl-0">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux incidents
            </Button>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            #{incident.id} - {incident.titre}
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            Signalé le {new Date(incident.created_at).toLocaleDateString()} pour {incident.bail?.bien?.nom}
                        </p>
                    </div>
                    <span className={`px-2 py-1 text-sm rounded-full ${incident.statut === 'resolu' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {incident.statut}
                    </span>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{incident.description}</dd>
                        </div>

                        {/* Images Section */}
                        {hasImages && (
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500 mb-3">
                                    Photos de l'incident ({images.length})
                                </dt>
                                <dd className="mt-1">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {images.map((imageUrl, index) => (
                                            <div
                                                key={index}
                                                className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 hover:border-primary-500 transition-all"
                                                onClick={() => openLightbox(index)}
                                            >
                                                <img
                                                    src={getImageUrl(imageUrl)}
                                                    alt={`Incident photo ${index + 1}`}
                                                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </dd>
                            </div>
                        )}

                        {incident.resolution_notes && (
                            <div className="sm:col-span-2 bg-green-50 p-4 rounded-md">
                                <dt className="text-sm font-medium text-green-800">Notes de résolution</dt>
                                <dd className="mt-1 text-sm text-green-700">{incident.resolution_notes}</dd>
                            </div>
                        )}

                        {incident.technicien && (
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Technicien assigné</dt>
                                <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                    <User className="h-4 w-4 mr-2 text-gray-400" />
                                    {incident.technicien.prenom} {incident.technicien.nom}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
                    {incident.statut !== 'resolu' && incident.statut !== 'ferme' && (
                        <PermissionGuard permission="incidents.edit">
                            <Button onClick={handleResolve} isLoading={resolving}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marquer comme résolu
                            </Button>
                        </PermissionGuard>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && hasImages && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
                    {/* Close Button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    {/* Previous Button */}
                    {currentImageIndex > 0 && (
                        <button
                            onClick={previousImage}
                            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
                        >
                            <ChevronLeft className="h-12 w-12" />
                        </button>
                    )}

                    {/* Image */}
                    <div className="max-w-5xl max-h-full flex flex-col items-center">
                        <img
                            src={getImageUrl(images[currentImageIndex])}
                            alt={`Incident photo ${currentImageIndex + 1}`}
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                        <p className="text-white mt-4 text-sm">
                            Image {currentImageIndex + 1} sur {images.length}
                        </p>
                    </div>

                    {/* Next Button */}
                    {currentImageIndex < images.length - 1 && (
                        <button
                            onClick={nextImage}
                            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
                        >
                            <ChevronRight className="h-12 w-12" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
