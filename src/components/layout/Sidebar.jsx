import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building, Home, Users, Settings, LogOut, Wallet, FileText, CreditCard, AlertTriangle, ClipboardCheck, Bell, DollarSign, MessageSquare, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { cn } from '../../utils/cn';

export function Sidebar({ isOpen, onClose }) {
    const { logout, user } = useAuth();
    const { canView } = usePermissions();

    const allNavigation = [
        { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Mes Projets', href: '/projects', icon: Building, roles: ['bailleur', 'entrepreneur', 'admin'] },
        { name: 'Mes Bailleurs', href: '/bailleurs', icon: Users, roles: ['agence', 'admin'], module: 'bailleurs' },
        { name: 'Mes Immeubles', href: '/immeubles', icon: Building, roles: ['agence', 'bailleur', 'admin'], module: 'immeubles' },
        { name: 'Mes Biens', href: '/biens', icon: Home, roles: ['agence', 'bailleur', 'admin'], module: 'biens' },
        { name: 'Baux', href: '/leases', icon: FileText, roles: ['agence', 'bailleur', 'admin'], module: 'baux' },
        { name: 'Paiements', href: '/payments', icon: CreditCard, roles: ['agence', 'bailleur', 'admin'], module: 'paiements' },
        { name: 'Dettes Locataires', href: '/payments/unpaid', icon: AlertTriangle, roles: ['agence', 'bailleur', 'admin'], module: 'paiements' },
        { name: 'Incidents', href: '/incidents', icon: AlertTriangle, roles: ['agence', 'bailleur', 'locataire', 'admin'], module: 'incidents' },
        { name: 'États des Lieux', href: '/dashboard/inventory', icon: ClipboardCheck, roles: ['agence', 'admin'], module: 'etats_lieux' },
        { name: 'Locataires', href: '/tenants', icon: Users, roles: ['agence', 'bailleur', 'admin'], module: 'locataires' },

        // Tenant specific
        { name: 'Mes Paiements', href: '/my-payments', icon: CreditCard, roles: ['locataire'] },
        { name: 'Mon Bail', href: '/my-lease', icon: FileText, roles: ['locataire'] },

        { name: 'Notifications', href: '/notifications', icon: Bell },
        // { name: 'Portefeuille', href: '/wallet', icon: Wallet }, // Removed as requested
        { name: 'Paramètres Agence', href: '/agency/settings', icon: Settings, roles: ['agence'] },
        { name: 'Gestion d\'équipe', href: '/agency/team', icon: Users, roles: ['agence'], module: 'equipe' },
        { name: 'Paramètres', href: '/settings', icon: Settings },
    ];

    const adminNavigation = [
        { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Gestion Abonnements', href: '/admin/plans', icon: CreditCard },
        { name: 'Plans personnalisés', href: '/admin/custom-plan-requests', icon: Package, adminOnly: true },
        { name: 'Messages de contact', href: '/admin/contact-messages', icon: MessageSquare, adminOnly: true },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Paramètres', href: '/settings', icon: Settings },
    ];

    let navigation = [];
    if (user && user.user_type === 'admin') {
        navigation = adminNavigation;
    } else {
        navigation = allNavigation.filter(item => {
            // Check role-based access
            if (item.roles && (!user || !item.roles.includes(user.user_type))) {
                return false;
            }

            // Check permission-based access for team members
            if (item.module && user && user.agence_id) {
                return canView(item.module);
            }

            return true;
        });
    }

    const [counts, setCounts] = React.useState({ incidents: 0, payments: 0, notifications: 0 });

    React.useEffect(() => {
        if (user) {
            loadCounts();
            // Poll every 30 seconds
            const interval = setInterval(loadCounts, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const loadCounts = async () => {
        try {
            const { dashboardService } = await import('../../services/dashboardService');
            const res = await dashboardService.getSidebarCounts();
            if (res.data) setCounts(res.data);
        } catch (error) {
            console.error("Sidebar counts error", error);
        }
    };

    const getBadgeCount = (itemName) => {
        switch (itemName) {
            case 'Incidents': return counts.incidents;
            case 'Paiements': return counts.payments; // Agency/Landlord
            case 'Mes Paiements': return counts.payments; // Tenant
            case 'Notifications': return counts.notifications;
            default: return 0;
        }
    };

    const SidebarContent = () => (
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 h-full">
            <div className="flex flex-col items-center justify-center p-4 border-b border-gray-200 bg-gray-50/50">
                <img src="/logo.png" alt="Noor Immo" className="h-10 w-auto object-contain mb-2" />
                {user?.agence && (
                    <div className="text-center w-full">
                        {user.agence.logo_url && (
                            <img src={user.agence.logo_url} alt={user.agence.raison_sociale} className="h-12 w-12 object-cover rounded-full mx-auto mb-2 border border-gray-200" />
                        )}
                        <h2 className="text-sm font-bold text-gray-900 truncate px-2">{user.agence.raison_sociale}</h2>
                        <span className="text-xs text-black-500 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full inline-block mt-1">
                            {user.user_type === 'agence' && !user.permissions ? 'Propriétaire' : 'Membre Équipe'}
                        </span>
                    </div>
                )}
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-2 pb-4">
                <nav className="mt-2 flex-1 px-2 space-y-1">
                    {navigation.map((item) => {
                        const count = getBadgeCount(item.name);
                        return (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                end={item.href === '/'}
                                onClick={() => onClose && onClose()}
                                className={({ isActive }) =>
                                    cn(
                                        isActive
                                            ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent',
                                        'group flex items-center px-2 py-2 text-sm font-medium justify-between'
                                    )
                                }
                            >
                                <div className="flex items-center">
                                    <item.icon
                                        className={cn(
                                            'mr-3 flex-shrink-0 h-5 w-5',
                                            'text-gray-400 group-hover:text-gray-500'
                                        )}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </div>
                                {count > 0 && (
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        item.name === 'Incidents' ? "bg-red-100 text-red-800" :
                                            item.name === 'Notifications' ? "bg-blue-100 text-blue-800" :
                                                "bg-yellow-100 text-yellow-800"
                                    )}>
                                        {count}
                                    </span>
                                )}
                            </NavLink>
                        )
                    })}
                </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <button onClick={logout} className="flex-shrink-0 w-full group block">
                    <div className="flex items-center">
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex items-center">
                                <LogOut className="mr-2 h-4 w-4" />
                                Déconnexion
                            </p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-40 flex md:hidden ${isOpen ? '' : 'pointer-events-none'}`}>
                {/* Overlay */}
                <div
                    className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                ></div>

                {/* Sidebar */}
                <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transition-transform duration-300 ease-in-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    {/* Close button */}
                    <div className="absolute top-0 right-0 -mr-12 pt-2"></div>
                    <SidebarContent />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
                <SidebarContent />
            </div>
        </>
    );
}
