import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building, Home, Users, Settings, LogOut, Wallet, FileText, CreditCard, AlertTriangle, ClipboardCheck, Bell, DollarSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

export function Sidebar({ isOpen, onClose }) {
    const { logout, user } = useAuth();

    const allNavigation = [
        { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Mes Projets', href: '/projects', icon: Building, roles: ['bailleur', 'entrepreneur', 'admin'] },
        { name: 'Mes Bailleurs', href: '/bailleurs', icon: Users, roles: ['agence', 'admin'] },
        { name: 'Mes Immeubles', href: '/immeubles', icon: Building, roles: ['agence', 'bailleur', 'admin'] },
        { name: 'Mes Biens', href: '/biens', icon: Home, roles: ['agence', 'bailleur', 'admin'] },
        { name: 'Baux', href: '/leases', icon: FileText, roles: ['agence', 'bailleur', 'admin'] },
        { name: 'Paiements', href: '/payments', icon: CreditCard, roles: ['agence', 'bailleur', 'admin'] },
        { name: 'Dettes Locataires', href: '/payments/unpaid', icon: AlertTriangle, roles: ['agence', 'bailleur', 'admin'] },
        { name: 'Incidents', href: '/incidents', icon: AlertTriangle, roles: ['agence', 'bailleur', 'locataire', 'admin'] },
        { name: 'États des Lieux', href: '/dashboard/inventory', icon: ClipboardCheck, roles: ['agence', 'bailleur', 'admin'] },
        { name: 'Locataires', href: '/tenants', icon: Users, roles: ['agence', 'bailleur', 'admin'] },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Portefeuille', href: '/wallet', icon: Wallet },
        { name: 'Paramètres Agence', href: '/agency/settings', icon: Settings, roles: ['agence'] },
        { name: 'Paramètres', href: '/settings', icon: Settings },
    ];

    const adminNavigation = [
        { name: 'Tableau de bord', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Gestion Abonnements', href: '/admin/plans', icon: CreditCard },
        { name: 'Commissions', href: '/admin/commissions', icon: DollarSign },
        { name: 'Notifications', href: '/notifications', icon: Bell },
        { name: 'Paramètres', href: '/settings', icon: Settings },
    ];

    let navigation = [];
    if (user && user.user_type === 'admin') {
        navigation = adminNavigation;
    } else {
        navigation = allNavigation.filter(item => {
            if (!item.roles) return true;
            return user && item.roles.includes(user.user_type);
        });
    }

    const SidebarContent = () => (
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 h-full">
            <div className="flex items-center justify-center h-28 border-b border-gray-200">
                <img src="/logo.png" alt="Noor Immo" className="h-16 w-auto object-contain" />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {navigation.map((item) => (
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
                                    'group flex items-center px-2 py-2 text-sm font-medium'
                                )
                            }
                        >
                            <item.icon
                                className={cn(
                                    'mr-3 flex-shrink-0 h-5 w-5',
                                    'text-gray-400 group-hover:text-gray-500'
                                )}
                                aria-hidden="true"
                            />
                            {item.name}
                        </NavLink>
                    ))}
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
                />

                {/* Sidebar Drawer */}
                <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <SidebarContent />
                </div>

                <div className="flex-shrink-0 w-14">
                    {/* Force sidebar to shrink to fit close icon if needed, though usually overlay handles click */}
                </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0">
                <SidebarContent />
            </div>
        </>
    );
}
