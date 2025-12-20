import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * PermissionGuard
 * 
 * Renders its children only if the user has the specified permission.
 * 
 * Usage:
 * <PermissionGuard module="biens" action="create">
 *   <Button>Ajouter un bien</Button>
 * </PermissionGuard>
 * 
 * @param {string} module - The module name (e.g., 'biens', 'baux', 'locataires')
 * @param {string} action - The action name (e.g., 'view', 'create', 'edit', 'delete')
 * @param {React.ReactNode} children - The content to render if authorized
 * @param {React.ReactNode} fallback - Optional content to render if unauthorized
 */
const PermissionGuard = ({ permission, module, action, children, fallback = null }) => {
    // Check if permission is passed as "module.action" string
    let modulePassed, actionPassed;

    if (permission && permission.includes('.')) {
        [modulePassed, actionPassed] = permission.split('.');
    }

    const { hasPermission } = useAuth();

    // Support both single string "module.action" OR separate props module=".." action=".."
    // Note: The props in generic definition were module, action. 
    // But in my replaced usages I used permission="module.action".
    // I need to support both or standardize.

    // Let's check my usages. 
    // PaymentHistory: <PermissionGuard permission="paiements.create">
    // So I need to support 'permission' prop as "module.action".

    const canAccess = modulePassed && actionPassed
        ? hasPermission(modulePassed, actionPassed)
        : false;

    // Wait, let's verify usage in InventoryList.jsx
    // <PermissionGuard permission="etats_des_lieux.create">

    // But the current definition in PermissionGuard.jsx takes (module, action).
    // It DOES NOT take 'permission'. 
    let authorized = false;

    if (permission && permission.includes('.')) {
        const [mod, act] = permission.split('.');
        authorized = hasPermission(mod, act);
    } else if (module && action) {
        authorized = hasPermission(module, action);
    }

    if (authorized) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};

export default PermissionGuard;
