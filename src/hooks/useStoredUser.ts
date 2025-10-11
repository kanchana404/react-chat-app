import { useState, useEffect } from 'react';
import { UserStorage, StoredUser } from '../util/UserStorage';

export const useStoredUser = () => {
    const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadStoredUser();
    }, []);

    const loadStoredUser = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const user = await UserStorage.getStoredUser();
            console.log('useStoredUser - loaded user:', user);
            setStoredUser(user);
        } catch (err) {
            console.error('Error loading stored user:', err);
            setError(err instanceof Error ? err.message : 'Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        await loadStoredUser();
    };

    const clearUser = async () => {
        try {
            await UserStorage.clearUser();
            await UserStorage.clearSession();
            setStoredUser(null);
        } catch (err) {
            console.error('Error clearing user:', err);
            setError(err instanceof Error ? err.message : 'Failed to clear user data');
        }
    };

    return {
        storedUser,
        loading,
        error,
        refreshUser,
        clearUser,
        isLoggedIn: !!storedUser,
        userId: storedUser?.id || null
    };
};
