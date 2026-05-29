import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
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

    const login = async (loginIdentifier, password) => {
        const response = await api.post('/auth/login', { login: loginIdentifier, password });
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
            navigate('/login', { replace: true });
        }
    };

    const hasPermission = (module, action) => {
        if (!user) return false;

        // Super Admin has access to everything
        if (user.user_type === 'admin') return true;

        // Agency Owner (not a team member) has access to all features in their subscription plan
        if (user.user_type === 'agence' && !user.is_team_member) {
            // Check if the feature is in the agency's subscription plan
            if (user.plan_features && Array.isArray(user.plan_features)) {
                return user.plan_features.some(feature =>
                    feature.module === module && feature.action === action
                );
            }
            // If no plan_features loaded, grant access (fallback for compatibility)
            return true;
        }

        // Team members have granular permissions
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
