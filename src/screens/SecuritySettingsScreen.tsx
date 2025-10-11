import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { RootStackParamList } from '../../App';
import { BiometricAuth } from '../util/BiometricAuth';
import { useUserRegistration } from '../components/UserContext';

type SecuritySettingsProps = NativeStackNavigationProp<RootStackParamList, 'SecuritySettingsScreen'>;

export default function SecuritySettingsScreen() {
    const navigation = useNavigation<SecuritySettingsProps>();
    const { userData } = useUserRegistration();
    
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [userLockEnabled, setUserLockEnabled] = useState(false);
    const [lockType, setLockType] = useState<'PIN' | 'PATTERN'>('PIN');
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSecuritySettings();
    }, []);

    const loadSecuritySettings = async () => {
        if (!userData.userId) return;

        try {
            const authMethods = await BiometricAuth.getAvailableAuthMethods(userData.userId);
            
            setBiometricEnabled(authMethods.biometric);
            setUserLockEnabled(authMethods.userLock.enabled);
            setLockType(authMethods.userLock.type as 'PIN' | 'PATTERN' || 'PIN');
            setBiometricAvailable(authMethods.biometricAvailable);
        } catch (error) {
            console.log('Error loading security settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricToggle = async (enabled: boolean) => {
        if (!userData.userId) return;

        try {
            if (enabled) {
                const success = await BiometricAuth.enableBiometric(userData.userId);
                if (success) {
                    setBiometricEnabled(true);
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'Biometric Enabled',
                        textBody: 'Biometric authentication has been enabled for your account',
                    });
                } else {
                    Toast.show({
                        type: ALERT_TYPE.WARNING,
                        title: 'Setup Failed',
                        textBody: 'Failed to enable biometric authentication',
                    });
                }
            } else {
                const success = await BiometricAuth.disableBiometric(userData.userId);
                if (success) {
                    setBiometricEnabled(false);
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: 'Biometric Disabled',
                        textBody: 'Biometric authentication has been disabled',
                    });
                }
            }
        } catch (error) {
            console.log('Error toggling biometric:', error);
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error',
                textBody: 'Failed to update biometric settings',
            });
        }
    };

    const handleUserLockToggle = async (enabled: boolean) => {
        if (!userData.userId) return;

        try {
            if (enabled) {
                // Navigate to lock setup screen
                navigation.navigate('LockScreen', {
                    userId: userData.userId,
                    lockType: lockType,
                    isSetup: true,
                });
            } else {
                Alert.alert(
                    'Disable User Lock',
                    'Are you sure you want to disable your user lock?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Disable',
                            style: 'destructive',
                            onPress: async () => {
                                const success = await BiometricAuth.disableUserLock(userData.userId);
                                if (success) {
                                    setUserLockEnabled(false);
                                    Toast.show({
                                        type: ALERT_TYPE.SUCCESS,
                                        title: 'User Lock Disabled',
                                        textBody: 'User lock has been disabled',
                                    });
                                }
                            },
                        },
                    ]
                );
            }
        } catch (error) {
            console.log('Error toggling user lock:', error);
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Error',
                textBody: 'Failed to update user lock settings',
            });
        }
    };

    const handleLockTypeChange = (type: 'PIN' | 'PATTERN') => {
        setLockType(type);
        if (userLockEnabled) {
            Alert.alert(
                'Change Lock Type',
                'You need to set up the new lock type. This will disable your current lock.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Change',
                        onPress: () => {
                            navigation.navigate('LockScreen', {
                                userId: userData.userId!,
                                lockType: type,
                                isSetup: true,
                            });
                        },
                    },
                ]
            );
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text className="text-gray-600">Loading security settings...</Text>
            </SafeAreaView>
        );
    }

    return (
        <AlertNotificationRoot>
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar hidden={true} />
                
                {/* Header */}
                <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text className="text-blue-600 font-semibold">← Back</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-gray-800">Security Settings</Text>
                    <View className="w-12" />
                </View>

                <ScrollView className="flex-1 px-4 py-6">
                    {/* Biometric Authentication */}
                    <View className="mb-8">
                        <Text className="text-xl font-bold text-gray-800 mb-4">
                            Biometric Authentication
                        </Text>
                        
                        <View className="bg-gray-50 rounded-lg p-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-gray-800">
                                        {biometricAvailable ? 'Fingerprint / Face ID' : 'Not Available'}
                                    </Text>
                                    <Text className="text-sm text-gray-600 mt-1">
                                        {biometricAvailable 
                                            ? 'Use your biometric data to unlock the app'
                                            : 'Biometric authentication is not available on this device'
                                        }
                                    </Text>
                                </View>
                                <Switch
                                    value={biometricEnabled}
                                    onValueChange={handleBiometricToggle}
                                    disabled={!biometricAvailable}
                                    trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                    thumbColor={biometricEnabled ? '#FFFFFF' : '#9CA3AF'}
                                />
                            </View>
                        </View>
                    </View>

                    {/* User Lock */}
                    <View className="mb-8">
                        <Text className="text-xl font-bold text-gray-800 mb-4">
                            User Lock
                        </Text>
                        
                        <View className="bg-gray-50 rounded-lg p-4 mb-4">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-lg font-semibold text-gray-800">
                                        PIN / Pattern Lock
                                    </Text>
                                    <Text className="text-sm text-gray-600 mt-1">
                                        Set up a PIN or pattern to secure your account
                                    </Text>
                                </View>
                                <Switch
                                    value={userLockEnabled}
                                    onValueChange={handleUserLockToggle}
                                    trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                    thumbColor={userLockEnabled ? '#FFFFFF' : '#9CA3AF'}
                                />
                            </View>
                        </View>

                        {/* Lock Type Selection */}
                        {userLockEnabled && (
                            <View className="bg-gray-50 rounded-lg p-4">
                                <Text className="text-lg font-semibold text-gray-800 mb-3">
                                    Lock Type
                                </Text>
                                
                                <View className="flex-row space-x-4">
                                    <TouchableOpacity
                                        className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                                            lockType === 'PIN' 
                                                ? 'border-blue-600 bg-blue-50' 
                                                : 'border-gray-300 bg-white'
                                        }`}
                                        onPress={() => handleLockTypeChange('PIN')}
                                    >
                                        <Text className={`text-center font-semibold ${
                                            lockType === 'PIN' ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                            PIN
                                        </Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        className={`flex-1 py-3 px-4 rounded-lg border-2 ${
                                            lockType === 'PATTERN' 
                                                ? 'border-blue-600 bg-blue-50' 
                                                : 'border-gray-300 bg-white'
                                        }`}
                                        onPress={() => handleLockTypeChange('PATTERN')}
                                    >
                                        <Text className={`text-center font-semibold ${
                                            lockType === 'PATTERN' ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                            Pattern
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Security Info */}
                    <View className="bg-blue-50 rounded-lg p-4">
                        <Text className="text-lg font-semibold text-blue-800 mb-2">
                            🔒 Security Information
                        </Text>
                        <Text className="text-sm text-blue-700">
                            • Biometric data is stored securely on your device{'\n'}
                            • User lock settings are encrypted locally{'\n'}
                            • You can use multiple security methods together{'\n'}
                            • All authentication is processed locally
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
}
