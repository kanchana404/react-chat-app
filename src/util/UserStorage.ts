import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserRegistrationData } from '../components/UserContext';

export interface StoredUser {
  id: number;
  firstName: string;
  lastName: string;
  countryCode: string;
  contactNo: string;
  status: string;
  profileImage: string;
  isVerified: boolean;
  registeredAt: string;
  lastLoginAt: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  userId: number | null;
  loginMethod: 'biometric' | 'pin' | 'pattern' | 'password' | null;
  sessionToken: string | null;
  expiresAt: string | null;
}

export class UserStorage {
  private static readonly USER_KEY = 'stored_user';
  private static readonly SESSION_KEY = 'user_session';
  private static readonly REGISTRATION_KEY = 'user_registration';
  private static readonly LOGIN_HISTORY_KEY = 'login_history';

  // Store registered user data
  static async storeUser(userData: StoredUser): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      console.log('User data stored successfully:', userData.id);
      return true;
    } catch (error) {
      console.log('Error storing user data:', error);
      return false;
    }
  }

  // Get stored user data
  static async getStoredUser(): Promise<StoredUser | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.log('Error getting stored user:', error);
      return null;
    }
  }

  // Update user data
  static async updateUser(updates: Partial<StoredUser>): Promise<boolean> {
    try {
      const currentUser = await this.getStoredUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
        console.log('User data updated successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error updating user data:', error);
      return false;
    }
  }

  // Clear stored user data
  static async clearUser(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.USER_KEY);
      await AsyncStorage.removeItem(this.SESSION_KEY);
      console.log('User data cleared successfully');
      return true;
    } catch (error) {
      console.log('Error clearing user data:', error);
      return false;
    }
  }

  // Store user session
  static async storeSession(session: UserSession): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      console.log('Session stored successfully');
      return true;
    } catch (error) {
      console.log('Error storing session:', error);
      return false;
    }
  }

  // Get user session
  static async getSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Check if session is expired
        if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
          await this.clearSession();
          return null;
        }
        
        return session;
      }
      return null;
    } catch (error) {
      console.log('Error getting session:', error);
      return null;
    }
  }

  // Clear user session
  static async clearSession(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
      console.log('Session cleared successfully');
      return true;
    } catch (error) {
      console.log('Error clearing session:', error);
      return false;
    }
  }

  // Check if user is logged in
  static async isUserLoggedIn(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session?.isLoggedIn === true;
    } catch (error) {
      console.log('Error checking login status:', error);
      return false;
    }
  }

  // Store registration data temporarily
  static async storeRegistrationData(data: UserRegistrationData): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.REGISTRATION_KEY, JSON.stringify(data));
      console.log('Registration data stored temporarily');
      return true;
    } catch (error) {
      console.log('Error storing registration data:', error);
      return false;
    }
  }

  // Get registration data
  static async getRegistrationData(): Promise<UserRegistrationData | null> {
    try {
      const data = await AsyncStorage.getItem(this.REGISTRATION_KEY);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.log('Error getting registration data:', error);
      return null;
    }
  }

  // Clear registration data
  static async clearRegistrationData(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.REGISTRATION_KEY);
      console.log('Registration data cleared');
      return true;
    } catch (error) {
      console.log('Error clearing registration data:', error);
      return false;
    }
  }

  // Store login history
  static async addLoginHistory(loginData: {
    method: string;
    timestamp: string;
    success: boolean;
  }): Promise<boolean> {
    try {
      const history = await this.getLoginHistory();
      const newHistory = [loginData, ...(history || [])].slice(0, 10); // Keep last 10 logins
      await AsyncStorage.setItem(this.LOGIN_HISTORY_KEY, JSON.stringify(newHistory));
      return true;
    } catch (error) {
      console.log('Error storing login history:', error);
      return false;
    }
  }

  // Get login history
  static async getLoginHistory(): Promise<Array<{
    method: string;
    timestamp: string;
    success: boolean;
  }> | null> {
    try {
      const history = await AsyncStorage.getItem(this.LOGIN_HISTORY_KEY);
      if (history) {
        return JSON.parse(history);
      }
      return null;
    } catch (error) {
      console.log('Error getting login history:', error);
      return null;
    }
  }

  // Create user session after successful login
  static async createSession(
    userId: number, 
    loginMethod: 'biometric' | 'pin' | 'pattern' | 'password'
  ): Promise<boolean> {
    try {
      const session: UserSession = {
        isLoggedIn: true,
        userId: userId,
        loginMethod: loginMethod,
        sessionToken: this.generateSessionToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      await this.storeSession(session);
      await this.addLoginHistory({
        method: loginMethod,
        timestamp: new Date().toISOString(),
        success: true,
      });

      // Update last login time
      await this.updateUser({
        lastLoginAt: new Date().toISOString(),
      });

      console.log('Session created successfully for user:', userId);
      return true;
    } catch (error) {
      console.log('Error creating session:', error);
      return false;
    }
  }

  // Generate session token
  private static generateSessionToken(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Get all stored data (for debugging)
  static async getAllStoredData(): Promise<{
    user: StoredUser | null;
    session: UserSession | null;
    registration: UserRegistrationData | null;
    loginHistory: any[] | null;
  }> {
    try {
      const [user, session, registration, loginHistory] = await Promise.all([
        this.getStoredUser(),
        this.getSession(),
        this.getRegistrationData(),
        this.getLoginHistory(),
      ]);

      return {
        user,
        session,
        registration,
        loginHistory,
      };
    } catch (error) {
      console.log('Error getting all stored data:', error);
      return {
        user: null,
        session: null,
        registration: null,
        loginHistory: null,
      };
    }
  }

  // Clear all user data (logout)
  static async clearAllUserData(): Promise<boolean> {
    try {
      await Promise.all([
        this.clearUser(),
        this.clearSession(),
        this.clearRegistrationData(),
      ]);
      console.log('All user data cleared successfully');
      return true;
    } catch (error) {
      console.log('Error clearing all user data:', error);
      return false;
    }
  }
}
