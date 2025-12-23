import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { featureService } from '../services/featureService';

export function useFeatures() {
    const { user } = useAuth();
    const [features, setFeatures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadFeatures();
        } else {
            setFeatures([]);
            setLoading(false);
        }
    }, [user]);

    const loadFeatures = async () => {
        try {
            setLoading(true);
            const response = await featureService.getUserFeatures();
            if (response.success) {
                setFeatures(response.data || []);
            }
        } catch (error) {
            console.error('Error loading features:', error);
            setFeatures([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Check if user has a specific feature by code
     */
    const hasFeature = (code) => {
        if (!code) return false;
        if (user?.user_type === 'admin') return true;
        return features.some(f => f.code === code);
    };

    /**
     * Check if user can access a specific module
     */
    const canAccess = (module) => {
        if (!module) return true;
        if (user?.user_type === 'admin') return true;
        return features.some(f => f.module === module);
    };

    /**
     * Get feature by code
     */
    const getFeature = (code) => {
        return features.find(f => f.code === code);
    };

    return {
        features,
        loading,
        hasFeature,
        canAccess,
        getFeature,
        reload: loadFeatures
    };
}
