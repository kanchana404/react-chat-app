import { useState, useEffect } from 'react';
import { getFriendList } from '../api/UserService';

export interface Friend {
  id: number;
  firstName: string;
  lastName: string;
  countryCode: string;
  contactNo: string;
  status: string;
  profileImage: string;
}

export const useFriendList = (userId: number | null) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('useFriendList - userId:', userId);

  const loadFriends = async () => {
    console.log('useFriendList - loadFriends called with userId:', userId);
    if (!userId) {
      console.log('useFriendList - No userId, skipping loadFriends');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('useFriendList - Calling getFriendList with userId:', userId);
      const response = await getFriendList(userId);
      
      if (response.status) {
        setFriends(response.friends || []);
        console.log('Friends loaded:', response.friends?.length || 0);
      } else {
        setError(response.message || 'Failed to load friends');
        console.log('Error loading friends:', response.message);
      }
    } catch (err) {
      setError('Network error while loading friends');
      console.log('Network error loading friends:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useFriendList - useEffect triggered with userId:', userId);
    if (userId) {
      console.log('useFriendList - userId exists, calling loadFriends');
      loadFriends();
    } else {
      console.log('useFriendList - No userId, not calling loadFriends');
    }
  }, [userId]);

  const refreshFriends = () => {
    loadFriends();
  };

  return {
    friends,
    loading,
    error,
    refreshFriends,
  };
};
