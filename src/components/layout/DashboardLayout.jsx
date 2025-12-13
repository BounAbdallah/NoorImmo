import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Menu } from 'lucide-react';
import { NotificationBell } from '../notifications/NotificationBell';

export default function DashboardLayout() {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay would go here (omitted for MVP simplicity, focusing on desktop sidebar first) */}

            {/* Sidebar Component */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">

                {/* Top Navbar */}
                <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center md:hidden">
                        {/* Mobile menu button placeholder */}
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <NotificationBell />

                            {/* User Info */}
                            <div className="flex items-center">
                                <div className="text-right mr-3">
                                    <p className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.user_type}</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                    {user?.prenom?.[0]}{user?.nom?.[0]}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
