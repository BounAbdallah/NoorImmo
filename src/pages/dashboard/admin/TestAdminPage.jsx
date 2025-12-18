import React, { useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';

export default function TestAdminPage() {
    const { user } = useAuth();

    useEffect(() => {
        // console.log('Current user:', user);
        // console.log('User type:', user?.user_type);
        // console.log('Is admin?:', user?.user_type === 'admin');
    }, [user]);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Test Admin Access</h1>
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="font-semibold mb-2">User Information:</h2>
                <pre className="bg-gray-100 p-4 rounded">
                    {JSON.stringify(user, null, 2)}
                </pre>
                <div className="mt-4">
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>User Type:</strong> {user?.user_type}</p>
                    <p><strong>Is Admin:</strong> {user?.user_type === 'admin' ? 'YES ✅' : 'NO ❌'}</p>
                </div>
            </div>
        </div>
    );
}
