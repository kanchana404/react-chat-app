import React, { useState, useEffect } from 'react';
import { WebSocketProvider } from '../socket/WebSocketProvider';
import { UserStorage } from '../util/UserStorage';

interface DynamicWebSocketProviderProps {
    children: React.ReactNode;
}

export const DynamicWebSocketProvider: React.FC<DynamicWebSocketProviderProps> = ({ children }) => {
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserId();
    }, []);

    const loadUserId = async () => {
        try {
            console.log('DynamicWebSocketProvider: Loading user ID...');
            const user = await UserStorage.getStoredUser();
            console.log('DynamicWebSocketProvider: Retrieved user:', user);
            
            if (user && user.id) {
                console.log('DynamicWebSocketProvider: Setting userId to:', user.id);
                setUserId(user.id);
            } else {
                console.log('DynamicWebSocketProvider: No user found or invalid user ID');
            }
        } catch (error) {
            console.error('DynamicWebSocketProvider: Error loading user ID:', error);
        } finally {
            setLoading(false);
        }
    };

    // If no user is logged in or still loading, provide WebSocket with userId 0 (no-op)
    if (loading || !userId) {
        return (
            <WebSocketProvider userId={0}>
                {children}
            </WebSocketProvider>
        );
    }

    // If user is logged in, provide WebSocket with their userId
    return (
        <WebSocketProvider userId={userId}>
            {children}
        </WebSocketProvider>
    );
};
