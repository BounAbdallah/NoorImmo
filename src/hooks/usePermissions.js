import { useAuth } from '../context/AuthContext';

export function usePermissions() {
    const { user } = useAuth();

    const can = (module, action) => {
        // Agency owners and admins have all permissions
        if (!user) return false;
        if (user.user_type === 'admin') return true;
        if (user.agence && !user.agence_id) return true; // Owner

        // Check team member permissions
        const permissions = user.permissions || {};
        return permissions[module]?.[action] === true;
    };

    const canView = (module) => can(module, 'view');
    const canCreate = (module) => can(module, 'create');
    const canEdit = (module) => can(module, 'edit');
    const canDelete = (module) => can(module, 'delete');

    const hasAnyPermission = (module) => {
        return canView(module) || canCreate(module) || canEdit(module) || canDelete(module);
    };

    return {
        can,
        canView,
        canCreate,
        canEdit,
        canDelete,
        hasAnyPermission
    };
}
