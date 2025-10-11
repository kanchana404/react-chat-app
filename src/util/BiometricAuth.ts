import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: string;
}

export class BiometricAuth {
  private static readonly BIOMETRIC_KEY = 'biometric_enabled';
  private static readonly USER_LOCK_KEY = 'user_lock_enabled';

  // Check if biometric authentication is available (simplified)
  static async isAvailable(): Promise<boolean> {
    try {
      // For now, we'll simulate biometric availability
      // In a real app, you would check device capabilities
      return true;
    } catch (error) {
      console.log('Biometric availability check failed:', error);
      return false;
    }
  }

  // Get available biometric types (simplified)
  static async getAvailableBiometricTypes(): Promise<string[]> {
    try {
      // Simulate biometric types based on platform
      return ['Fingerprint', 'Face ID'];
    } catch (error) {
      console.log('Error getting biometric types:', error);
      return [];
    }
  }

  // Authenticate with biometrics (simplified with Alert)
  static async authenticate(reason: string = 'Authenticate to access the app'): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device'
        };
      }

      // Simulate biometric authentication with Alert
      return new Promise((resolve) => {
        Alert.alert(
          'Biometric Authentication',
          reason,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve({
                success: false,
                error: 'Authentication cancelled'
              })
            },
            {
              text: 'Authenticate',
              onPress: () => resolve({
                success: true,
                biometricType: 'Fingerprint'
              })
            }
          ]
        );
      });
    } catch (error) {
      console.log('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  // Enable biometric authentication for user
  static async enableBiometric(userId: number): Promise<boolean> {
    try {
      const result = await this.authenticate('Enable biometric authentication for your account');
      if (result.success) {
        await AsyncStorage.setItem(this.BIOMETRIC_KEY, userId.toString());
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error enabling biometric:', error);
      return false;
    }
  }

  // Disable biometric authentication
  static async disableBiometric(userId: number): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.BIOMETRIC_KEY);
      return true;
    } catch (error) {
      console.log('Error disabling biometric:', error);
      return false;
    }
  }

  // Check if biometric is enabled for user
  static async isBiometricEnabled(userId: number): Promise<boolean> {
    try {
      const storedUserId = await AsyncStorage.getItem(this.BIOMETRIC_KEY);
      return storedUserId === userId.toString();
    } catch (error) {
      console.log('Error checking biometric status:', error);
      return false;
    }
  }

  // Enable user lock (PIN/Pattern)
  static async enableUserLock(userId: number, lockType: 'PIN' | 'PATTERN'): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.USER_LOCK_KEY, JSON.stringify({
        userId: userId,
        type: lockType,
        enabled: true
      }));
      return true;
    } catch (error) {
      console.log('Error enabling user lock:', error);
      return false;
    }
  }

  // Disable user lock
  static async disableUserLock(userId: number): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.USER_LOCK_KEY);
      return true;
    } catch (error) {
      console.log('Error disabling user lock:', error);
      return false;
    }
  }

  // Check if user lock is enabled
  static async isUserLockEnabled(userId: number): Promise<{ enabled: boolean; type?: string }> {
    try {
      const lockData = await AsyncStorage.getItem(this.USER_LOCK_KEY);
      if (lockData) {
        const parsed = JSON.parse(lockData);
        return {
          enabled: parsed.userId === userId && parsed.enabled,
          type: parsed.type
        };
      }
      return { enabled: false };
    } catch (error) {
      console.log('Error checking user lock status:', error);
      return { enabled: false };
    }
  }

  // Get authentication methods for user
  static async getAvailableAuthMethods(userId: number): Promise<{
    biometric: boolean;
    userLock: { enabled: boolean; type?: string };
    biometricAvailable: boolean;
  }> {
    try {
      const [biometricEnabled, userLock, biometricAvailable] = await Promise.all([
        this.isBiometricEnabled(userId),
        this.isUserLockEnabled(userId),
        this.isAvailable()
      ]);

      return {
        biometric: biometricEnabled,
        userLock,
        biometricAvailable
      };
    } catch (error) {
      console.log('Error getting auth methods:', error);
      return {
        biometric: false,
        userLock: { enabled: false },
        biometricAvailable: false
      };
    }
  }
}
