import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { RootStackParamList } from '../../App';
import { UserStorage, StoredUser } from '../util/UserStorage';
import { BiometricAuth } from '../util/BiometricAuth';
import { useColorScheme } from 'nativewind';

type LoginScreenProps = NativeStackNavigationProp<RootStackParamList, 'LoginScreen'>;

export default function LoginScreen() {
    const navigation = useNavigation<LoginScreenProps>();
    const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const { colorScheme } = useColorScheme();

    useEffect(() => {
        checkStoredUser();
        checkBiometricAvailability();
    }, []);

    const checkStoredUser = async () => {
        try {
            const user = await UserStorage.getStoredUser();
            const isLoggedIn = await UserStorage.isUserLoggedIn();
            
            if (user && isLoggedIn) {
                // User is already logged in, go to home
                navigation.replace('HomeTabs');
                return;
            }
            
            setStoredUser(user);
        } catch (error) {
            console.log('Error checking stored user:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkBiometricAvailability = async () => {
        try {
            const available = await BiometricAuth.isAvailable();
            setBiometricAvailable(available);
            
            if (available && storedUser) {
                const enabled = await BiometricAuth.isBiometricEnabled(storedUser.id);
                setBiometricEnabled(enabled);
            }
        } catch (error) {
            console.log('Error checking biometric availability:', error);
        }
    };

    const handleBiometricLogin = async () => {
        if (!storedUser) return;

        try {
            const result = await BiometricAuth.authenticate('Unlock with biometric authentication');
            
            if (result.success) {
                // Create session
                await UserStorage.createSession(storedUser.id, 'biometric');
                
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Welcome Back',
                    textBody: `Hello ${storedUser.firstName}!`,
                });
                
                navigation.replace('HomeTabs');
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Biometric Failed',
                    textBody: result.error || 'Biometric authentication failed',
                });
            }
        } catch (error) {
            console.log('Biometric login error:', error);
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error',
                textBody: 'Biometric authentication failed',
            });
        }
    };

    const handlePinLogin = () => {
        if (!storedUser) return;
        navigation.navigate('LockScreen', {
            userId: storedUser.id,
            lockType: 'PIN',
            isSetup: false,
        });
    };

    const handlePatternLogin = () => {
        if (!storedUser) return;
        navigation.navigate('LockScreen', {
            userId: storedUser.id,
            lockType: 'PATTERN',
            isSetup: false,
        });
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout? This will clear all your data.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await UserStorage.clearAllUserData();
                        setStoredUser(null);
                        Toast.show({
                            type: ALERT_TYPE.SUCCESS,
                            title: 'Logged Out',
                            textBody: 'You have been logged out successfully',
                        });
                    },
                },
            ]
        );
    };

    const handleSignUp = () => {
        navigation.replace('SignUpScreen');
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-primary-bg justify-center items-center">
                <Text className="text-gray-600 dark:text-primary-text">Loading...</Text>
            </SafeAreaView>
        );
    }

    if (!storedUser) {
        // No stored user, show sign up option
        return (
            <AlertNotificationRoot>
                <SafeAreaView className="flex-1 bg-white dark:bg-primary-bg">
                    <StatusBar style="light" backgroundColor="#111111" />
                    
                    <View className="flex-1 justify-center items-center px-8">
                        <View className="items-center mb-8">
                            <Text className="text-3xl font-bold text-gray-800 dark:text-primary-text mb-4">
                                Welcome to Kaidenz Chat
                            </Text>
                            <Text className="text-gray-600 dark:text-gray-300 text-center text-lg">
                                Create your account to start chatting with friends
                            </Text>
                        </View>

                        <TouchableOpacity
                            className="w-full bg-gold-accent py-4 px-8 rounded-lg mb-4"
                            onPress={handleSignUp}
                        >
                            <Text className="text-black font-semibold text-lg text-center">
                                Create Account
                            </Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </AlertNotificationRoot>
        );
    }

    return (
        <AlertNotificationRoot>
            <SafeAreaView className="flex-1 bg-white dark:bg-primary-bg">
                <StatusBar style="light" backgroundColor="#111111" />
                
                <View className="flex-1 justify-center px-8">
                    {/* User Profile */}
                    <View className="items-center mb-8">
                        <Image
                            source={{ uri: storedUser.profileImage }}
                            className="h-24 w-24 rounded-full border-4 border-gold-accent mb-4"
                        />
                        <Text className="text-2xl font-bold text-gray-800 dark:text-primary-text">
                            Welcome back, {storedUser.firstName}!
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-300 text-center">
                            Choose your preferred login method
                        </Text>
                    </View>

                    {/* Login Options */}
                    <View className="space-y-4">
                        {/* Biometric Login */}
                        {biometricAvailable && biometricEnabled && (
                            <TouchableOpacity
                                className="w-full bg-green-600 dark:bg-gold-accent py-4 px-8 rounded-lg"
                                onPress={handleBiometricLogin}
                            >
                                <Text className="text-white dark:text-black font-semibold text-lg text-center">
                                    🔐 Use Biometric Authentication
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* PIN Login */}
                        <TouchableOpacity
                            className="w-full bg-gold-accent py-4 px-8 rounded-lg"
                            onPress={handlePinLogin}
                        >
                            <Text className="text-black font-semibold text-lg text-center">
                                🔢 Use PIN
                            </Text>
                        </TouchableOpacity>

                        {/* Pattern Login */}
                        <TouchableOpacity
                            className="w-full bg-gold-accent py-4 px-8 rounded-lg"
                            onPress={handlePatternLogin}
                        >
                            <Text className="text-black font-semibold text-lg text-center">
                                📱 Use Pattern
                            </Text>
                        </TouchableOpacity>

                        {/* Logout */}
                        <TouchableOpacity
                            className="w-full bg-red-100 dark:bg-red-900 py-4 px-8 rounded-lg"
                            onPress={handleLogout}
                        >
                            <Text className="text-red-600 dark:text-red-400 font-semibold text-lg text-center">
                                Logout
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* User Info */}
                    <View className="mt-8 bg-gray-50 dark:bg-secondary-bg rounded-lg p-4">
                        <Text className="text-sm text-gray-600 dark:text-gray-300 text-center">
                            Account: {storedUser.countryCode} {storedUser.contactNo}
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-300 text-center">
                            Registered: {new Date(storedUser.registeredAt).toLocaleDateString()}
                        </Text>
                        <Text className="text-sm text-gray-600 dark:text-gray-300 text-center">
                            Last Login: {new Date(storedUser.lastLoginAt).toLocaleDateString()}
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
}
