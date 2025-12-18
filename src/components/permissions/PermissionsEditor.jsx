import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Label } from '../ui/Label';
import { ChevronDown, ChevronRight, Lock } from 'lucide-react';

const MODULES = [
    { key: 'biens', label: 'Biens Immobiliers', description: 'Gestion des propriétés' },
    { key: 'immeubles', label: 'Immeubles', description: 'Gestion des immeubles' },
    { key: 'baux', label: 'Baux / Contrats', description: 'Gestion des contrats de location' },
    { key: 'paiements', label: 'Paiements', description: 'Gestion des paiements de loyers' },
    { key: 'incidents', label: 'Incidents', description: 'Gestion des incidents et maintenance' },
    { key: 'locataires', label: 'Locataires', description: 'Gestion des locataires' },
    { key: 'bailleurs', label: 'Bailleurs', description: 'Gestion des propriétaires' },
    { key: 'etats_lieux', label: 'États des Lieux', description: 'Gestion des états des lieux' },
    { key: 'equipe', label: 'Gestion d\'équipe', description: 'Gestion des membres de l\'équipe' },
    { key: 'rapports', label: 'Rapports', description: 'Accès aux rapports et statistiques' },
];

const ACTIONS = [
    { key: 'view', label: 'Voir', description: 'Consulter les données' },
    { key: 'create', label: 'Créer', description: 'Ajouter de nouveaux éléments' },
    { key: 'edit', label: 'Modifier', description: 'Modifier les éléments existants' },
    { key: 'delete', label: 'Supprimer', description: 'Supprimer des éléments' },
];

export function PermissionsEditor({ permissions = {}, onChange, disabled = false }) {
    const [expandedModules, setExpandedModules] = React.useState({});

    const toggleModule = (moduleKey) => {
        setExpandedModules(prev => ({
            ...prev,
            [moduleKey]: !prev[moduleKey]
        }));
    };

    const handlePermissionChange = (moduleKey, actionKey, value) => {
        const newPermissions = { ...permissions };

        if (!newPermissions[moduleKey]) {
            newPermissions[moduleKey] = {};
        }

        newPermissions[moduleKey][actionKey] = value;

        // If disabling 'view', disable all other actions
        if (actionKey === 'view' && !value) {
            newPermissions[moduleKey] = {
                view: false,
                create: false,
                edit: false,
                delete: false
            };
        }

        // If enabling any action, automatically enable 'view'
        if (actionKey !== 'view' && value) {
            newPermissions[moduleKey].view = true;
        }

        onChange(newPermissions);
    };

    const handleSelectAll = (moduleKey) => {
        const newPermissions = { ...permissions };
        newPermissions[moduleKey] = {
            view: true,
            create: true,
            edit: true,
            delete: true
        };
        onChange(newPermissions);
    };

    const handleDeselectAll = (moduleKey) => {
        const newPermissions = { ...permissions };
        newPermissions[moduleKey] = {
            view: false,
            create: false,
            edit: false,
            delete: false
        };
        onChange(newPermissions);
    };

    const isModuleFullyEnabled = (moduleKey) => {
        const modulePerms = permissions[moduleKey] || {};
        return ACTIONS.every(action => modulePerms[action.key]);
    };

    const hasAnyPermission = (moduleKey) => {
        const modulePerms = permissions[moduleKey] || {};
        return ACTIONS.some(action => modulePerms[action.key]);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Permissions
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                    Définissez les accès et actions autorisées pour ce membre
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {MODULES.map((module) => {
                        const isExpanded = expandedModules[module.key];
                        const modulePerms = permissions[module.key] || {};

                        return (
                            <div key={module.key} className="border rounded-lg">
                                {/* Module Header */}
                                <div
                                    className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                                    onClick={() => toggleModule(module.key)}
                                >
                                    <div className="flex items-center gap-2 flex-1">
                                        {isExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-gray-500" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        )}
                                        <div>
                                            <p className="font-medium text-sm">{module.label}</p>
                                            <p className="text-xs text-gray-500">{module.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {hasAnyPermission(module.key) && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                Actif
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Module Actions */}
                                {isExpanded && (
                                    <div className="border-t p-3 bg-gray-50">
                                        <div className="flex justify-end gap-2 mb-3">
                                            <button
                                                type="button"
                                                onClick={() => handleSelectAll(module.key)}
                                                disabled={disabled}
                                                className="text-xs text-primary-600 hover:text-primary-800 disabled:opacity-50"
                                            >
                                                Tout sélectionner
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeselectAll(module.key)}
                                                disabled={disabled}
                                                className="text-xs text-gray-600 hover:text-gray-800 disabled:opacity-50"
                                            >
                                                Tout désélectionner
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {ACTIONS.map((action) => (
                                                <label
                                                    key={action.key}
                                                    className="flex items-start gap-2 cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={modulePerms[action.key] || false}
                                                        onChange={(e) =>
                                                            handlePermissionChange(
                                                                module.key,
                                                                action.key,
                                                                e.target.checked
                                                            )
                                                        }
                                                        disabled={disabled}
                                                        className="mt-1"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">{action.label}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {action.description}
                                                        </p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
