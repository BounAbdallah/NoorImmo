import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await api.get('/auth/user');
                    setUser(response.data.data);
                } catch (error) {
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        setUser(user);
        return user;
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.success && response.data.data.token) {
            const { token, user } = response.data.data;
            localStorage.setItem('token', token);
            setUser(user);
        }
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    const hasPermission = (module, action) => {
        if (!user) return false;

        // Admin and Agency Owners (who are not team members) usually have full access
        // But if we want strict owner vs member distinction check user_type
        if (user.user_type === 'admin') return true;

        // If user is an agency owner (type 'agence' and no specific restricted permissions set, OR explicitly check logic)
        // Usually, owners have all permissions. Team members have a 'permissions' object.
        // If user.permissions is null/undefined, and they are type 'agence', they are likely the owner.
        if (user.user_type === 'agence' && !user.permissions) return true;

        // Check granular permissions for team members
        if (user.permissions && user.permissions[module] && user.permissions[module][action]) {
            return true;
        }

        return false;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, hasPermission, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
