import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming React Router is used
import { projectService } from '../../../services/projectService';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Plus, Building, MapPin, Calendar } from 'lucide-react';

export default function ProjectListPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const response = await projectService.getAll();
            setProjects(response.data.data.data); // Adjust based on API pagination response structure
        } catch (error) {
            console.error("Failed to load projects", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'en_cours': return 'bg-blue-100 text-blue-800';
            case 'termine': return 'bg-green-100 text-green-800';
            case 'suspendu': return 'bg-orange-100 text-orange-800';
            case 'annule': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mes Projets de Construction</h1>
                    <p className="text-gray-500">Gérez vos chantiers et suivez leur avancement</p>
                </div>
                <Button onClick={() => navigate('/projects/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau Projet
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Aucun projet</h3>
                        <p className="text-gray-500 mb-6">Commencez par créer votre premier projet immobilier.</p>
                        <Button onClick={() => navigate('/projects/create')}>
                            <Plus className="h-4 w-4 mr-2" />
                            Créer un projet
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/projects/${project.id}`)}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{project.titre}</CardTitle>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(project.statut)}`}>
                                        {project.statut.replace('_', ' ')}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                        {project.adresse}
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        Début: {new Date(project.date_debut).toLocaleDateString()}
                                    </div>
                                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                        <span className="font-medium text-gray-900">Progression</span>
                                        <span className="text-primary-600 font-bold">{project.pourcentage_avancement}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full transition-all"
                                            style={{ width: `${project.pourcentage_avancement}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
