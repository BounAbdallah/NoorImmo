import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" state={{ from: location }} replace />;
};
