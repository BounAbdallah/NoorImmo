import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../../services/inventoryService';
import { leaseService } from '../../../services/leaseService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../../components/ui/Card';
import { Label } from '../../../components/ui/Label';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Trash2, PlusCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function InventoryForm() {
    const navigate = useNavigate();
    const [leases, setLeases] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Initial State Structure
    const [formData, setFormData] = useState({
        bail_id: '',
        type: 'entrant',
        date_etat_des_lieux: new Date().toISOString().split('T')[0],
        observations: '',
    });

    // Dedicated state for Complex nested data
    const [meters, setMeters] = useState({
        electricite: { numero: '', index: '' },
        eau: { numero: '', index: '' },
        internet: { numero: '', index: '' }
    });

    const [keys, setKeys] = useState({
        entree: { nombre: 0, commentaire: '' },
        cave: { nombre: 0, commentaire: '' },
        parking: { nombre: 0, commentaire: '' },
        immeuble: { nombre: 0, commentaire: '' },
        boite: { nombre: 0, commentaire: '' },
        portail: { nombre: 0, commentaire: '' }
    });

    const [rooms, setRooms] = useState([
        {
            id: 1,
            nom: 'Séjour',
            elements: [
                { nom: 'Porte', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                { nom: 'Murs', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                { nom: 'Sol', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                { nom: 'Plafond', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                { nom: 'Fenêtres', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' }
            ]
        }
    ]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const response = await leaseService.getAllLeases();
            if (response.success) {
                setLeases(response.data.data || []);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', 'Impossible de charger les baux.', 'error');
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto-configure rooms if bail_id changes
        if (name === 'bail_id') {
            const selectedLease = leases.find(l => l.id == value);
            if (selectedLease && selectedLease.bien && selectedLease.bien.nombre_pieces) {
                const roomCount = selectedLease.bien.nombre_pieces;

                // Confirm with user before overwriting if rooms already exist (and aren't just the default one)
                const isDefault = rooms.length === 1 && rooms[0].nom === 'Séjour';

                if (isDefault || rooms.length === 0) {
                    generateRooms(roomCount);
                } else {
                    Swal.fire({
                        title: 'Configuration des pièces',
                        text: `Ce bien comporte ${roomCount} pièces. Voulez-vous générer les pièces automatiquement ? (Cela remplacera la configuration actuelle)`,
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Oui, générer',
                        cancelButtonText: 'Non, garder ma configuration'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            generateRooms(roomCount);
                        }
                    });
                }
            }
        }
    };

    const generateRooms = (count) => {
        const newRooms = [];
        for (let i = 1; i <= count; i++) {
            newRooms.push({
                id: Date.now() + i,
                nom: `Pièce ${i}`,
                elements: [
                    { nom: 'Porte', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                    { nom: 'Murs', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                    { nom: 'Sol', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                    { nom: 'Plafond', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                    { nom: 'Fenêtres', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                    { nom: 'Prises', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' }
                ]
            });
        }
        setRooms(newRooms);
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `${count} pièces configurées`,
            showConfirmButton: false,
            timer: 3000
        });
    };

    // Meters Listeners
    const handleMeterChange = (type, field, value) => {
        setMeters(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

    // Keys Listeners
    const handleKeyChange = (type, field, value) => {
        setKeys(prev => ({
            ...prev,
            [type]: { ...prev[type], [field]: value }
        }));
    };

    // Room Management
    const addRoom = () => {
        setRooms(prev => [...prev, {
            id: Date.now(),
            nom: 'Nouvelle pièce',
            elements: [
                { nom: 'Porte', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                { nom: 'Murs', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' },
                { nom: 'Sol', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' }
            ]
        }]);
    };

    const removeRoom = (index) => {
        setRooms(prev => prev.filter((_, i) => i !== index));
    };

    const handleRoomNameChange = (index, value) => {
        const newRooms = [...rooms];
        newRooms[index].nom = value;
        setRooms(newRooms);
    };

    const handleElementChange = (roomIndex, elementIndex, field, value) => {
        const newRooms = [...rooms];
        newRooms[roomIndex].elements[elementIndex][field] = value;
        setRooms(newRooms);
    };

    const addElementToRoom = (roomIndex) => {
        const newRooms = [...rooms];
        newRooms[roomIndex].elements.push({ nom: 'Nouvel élément', etat_entree_note: '', etat_entree_commentaire: '', etat_sortie_note: '', etat_sortie_commentaire: '' });
        setRooms(newRooms);
    };

    const removeElementFromRoom = (roomIndex, elementIndex) => {
        const newRooms = [...rooms];
        newRooms[roomIndex].elements = newRooms[roomIndex].elements.filter((_, i) => i !== elementIndex);
        setRooms(newRooms);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            ...formData,
            content: {
                compteurs: meters,
                cles: keys,
                pieces: rooms
            }
        };

        try {
            const response = await inventoryService.create(payload);
            if (response.success) {
                Swal.fire('Succès', 'État des lieux enregistré', 'success');
                navigate('/dashboard/inventory');
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Erreur', error.response?.data?.message || 'Erreur lors de l\'enregistrement.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) return <div className="p-12 text-center">Chargement...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Nouvel État des Lieux</h1>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. General Info */}
                <Card>
                    <CardHeader><CardTitle>Informations Générales</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Type</Label>
                            <select name="type" className="form-select w-full border rounded p-2" value={formData.type} onChange={handleChange}>
                                <option value="entrant">Entrant</option>
                                <option value="sortant">Sortant</option>
                            </select>
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input type="date" name="date_etat_des_lieux" value={formData.date_etat_des_lieux} onChange={handleChange} required />
                        </div>
                        <div className="col-span-2">
                            <Label>Bail concerné</Label>
                            <select name="bail_id" className="form-select w-full border rounded p-2" value={formData.bail_id} onChange={handleChange} required>
                                <option value="">Sélectionner un bail...</option>
                                {leases.map(lease => (
                                    <option key={lease.id} value={lease.id}>
                                        {lease.bien?.nom} - {lease.locataire?.user?.prenom} {lease.locataire?.user?.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Meters */}
                <Card>
                    <CardHeader><CardTitle>Compteurs (Électricité, Eau, Internet)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {['electricite', 'eau', 'internet'].map(type => (
                            <div key={type} className="flex gap-4 items-center">
                                <span className="w-24 capitalize font-semibold">{type}</span>
                                <Input
                                    placeholder="Numéro Compteur"
                                    value={meters[type].numero}
                                    onChange={(e) => handleMeterChange(type, 'numero', e.target.value)}
                                />
                                <Input
                                    placeholder="Index / Relevé"
                                    value={meters[type].index}
                                    onChange={(e) => handleMeterChange(type, 'index', e.target.value)}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 3. Keys */}
                <Card>
                    <CardHeader><CardTitle>Remise des Clés</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {Object.keys(keys).map(keyType => (
                            <div key={keyType} className="grid grid-cols-12 gap-2 items-center">
                                <span className="col-span-3 capitalize text-sm font-medium">{keyType.replace('_', ' ')}</span>
                                <div className="col-span-2">
                                    <Input
                                        type="number"
                                        placeholder="Nombre"
                                        value={keys[keyType].nombre}
                                        onChange={(e) => handleKeyChange(keyType, 'nombre', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-7">
                                    <Input
                                        placeholder="Commentaires (ex: double, badge...)"
                                        value={keys[keyType].commentaire}
                                        onChange={(e) => handleKeyChange(keyType, 'commentaire', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* 4. Rooms */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">État des Pièces</h2>
                        <Button type="button" onClick={addRoom} variant="secondary" size="sm">
                            <PlusCircle className="w-4 h-4 mr-2" /> Ajouter une pièce
                        </Button>
                    </div>

                    {rooms.map((room, rIndex) => (
                        <Card key={room.id} className="border-l-4 border-l-primary-500">
                            <CardHeader className="flex flex-row items-center justify-between py-3">
                                <Input
                                    className="font-bold text-lg border-none focus:ring-0 max-w-xs"
                                    value={room.nom}
                                    onChange={(e) => handleRoomNameChange(rIndex, e.target.value)}
                                />
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeRoom(rIndex)} className="text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500">
                                            <th className="pb-2 w-1/4">Élément</th>
                                            <th className="pb-2 text-center w-16">Note (E)</th>
                                            <th className="pb-2">Commentaire Entrée</th>
                                            {formData.type === 'sortant' && (
                                                <>
                                                    <th className="pb-2 text-center w-16">Note (S)</th>
                                                    <th className="pb-2">Commentaire Sortie</th>
                                                </>
                                            )}
                                            <th className="pb-2 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {room.elements.map((el, elIndex) => (
                                            <tr key={elIndex}>
                                                <td className="py-2 pr-2">
                                                    <Input
                                                        value={el.nom}
                                                        onChange={(e) => handleElementChange(rIndex, elIndex, 'nom', e.target.value)}
                                                        className="h-8 text-sm"
                                                    />
                                                </td>
                                                <td className="py-2 px-1">
                                                    <select
                                                        className="w-full h-8 text-xs border rounded"
                                                        value={el.etat_entree_note}
                                                        onChange={(e) => handleElementChange(rIndex, elIndex, 'etat_entree_note', e.target.value)}
                                                    >
                                                        <option value="">-</option>
                                                        <option value="TB">TB</option>
                                                        <option value="B">B</option>
                                                        <option value="P">P</option>
                                                        <option value="M">M</option>
                                                    </select>
                                                </td>
                                                <td className="py-2 px-1">
                                                    <Input
                                                        value={el.etat_entree_commentaire}
                                                        onChange={(e) => handleElementChange(rIndex, elIndex, 'etat_entree_commentaire', e.target.value)}
                                                        className="h-8 text-sm"
                                                        placeholder="RAS"
                                                    />
                                                </td>
                                                {formData.type === 'sortant' && (
                                                    <>
                                                        <td className="py-2 px-1">
                                                            <select
                                                                className="w-full h-8 text-xs border rounded"
                                                                value={el.etat_sortie_note}
                                                                onChange={(e) => handleElementChange(rIndex, elIndex, 'etat_sortie_note', e.target.value)}
                                                            >
                                                                <option value="">-</option>
                                                                <option value="TB">TB</option>
                                                                <option value="B">B</option>
                                                                <option value="P">P</option>
                                                                <option value="M">M</option>
                                                            </select>
                                                        </td>
                                                        <td className="py-2 px-1">
                                                            <Input
                                                                value={el.etat_sortie_commentaire}
                                                                onChange={(e) => handleElementChange(rIndex, elIndex, 'etat_sortie_commentaire', e.target.value)}
                                                                className="h-8 text-sm"
                                                                placeholder="Dégâts..."
                                                            />
                                                        </td>
                                                    </>
                                                )}
                                                <td className="py-2 pl-2 text-center">
                                                    <button type="button" onClick={() => removeElementFromRoom(rIndex, elIndex)} className="text-gray-400 hover:text-red-500">
                                                        &times;
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <Button type="button" variant="ghost" size="sm" onClick={() => addElementToRoom(rIndex)} className="mt-2 text-primary-600">
                                    + Ajouter un élément
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* 5. Observations */}
                <Card>
                    <CardContent className="pt-6">
                        <Label>Observations Générales</Label>
                        <textarea
                            name="observations"
                            rows={4}
                            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-3"
                            value={formData.observations}
                            onChange={handleChange}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 py-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/dashboard/inventory')}>
                        Annuler
                    </Button>
                    <Button type="submit" isLoading={submitting}>
                        Enregistrer l'État des Lieux
                    </Button>
                </div>
            </form>
        </div>
    );
}
