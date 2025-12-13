import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../../../services/projectService';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { ArrowLeft, Upload, MapPin } from 'lucide-react';

export default function AddProofPage() {
    const { id, stepId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        type: 'photo',
        latitude: 14.475,
        longitude: -17.026
    });

    const [project, setProject] = useState(null);
    React.useEffect(() => {
        projectService.getOne(id).then(res => setProject(res.data.data));
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!project?.chantier) return;
        if (!file) return alert("Veuillez sélectionner un fichier");

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('etape_id', stepId);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('fichier', file);
            formDataToSend.append('latitude', formData.latitude);
            formDataToSend.append('longitude', formData.longitude);

            await projectService.uploadProof(formDataToSend);
            alert("Preuve certifiée et ajoutée !");
            navigate(`/projects/${id}`);
        } catch (error) {
            console.error(error);
            alert("Erreur upload: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => navigate(`/projects/${id}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au projet
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle>Ajouter une Preuve Visuelle</CardTitle>
                    <p className="text-sm text-green-600 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        Géolocalisation activée (Précision: 5m)
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div className="space-y-2">
                            <Label>Type de preuve</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="photo">Photo</option>
                                <option value="video">Vidéo</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Fichier</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setFile(e.target.files[0])}
                                    accept="image/*,video/*"
                                />
                                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                {file ? (
                                    <p className="text-sm font-medium text-green-600">{file.name}</p>
                                ) : (
                                    <p className="text-sm text-gray-500">Cliquez pour ajouter une photo/vidéo</p>
                                )}
                            </div>
                        </div>

                        <Button type="submit" className="w-full" isLoading={loading}>
                            Certifier & Envoyer
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
