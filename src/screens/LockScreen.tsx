import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar,
    Vibration,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { ALERT_TYPE, AlertNotificationRoot, Toast } from 'react-native-alert-notification';
import { RootStackParamList } from '../../App';
import { BiometricAuth } from '../util/BiometricAuth';
import { useUserRegistration } from '../components/UserContext';

type LockScreenProps = NativeStackNavigationProp<RootStackParamList, 'LockScreen'>;

interface LockScreenParams {
    userId: number;
    lockType: 'PIN' | 'PATTERN';
    isSetup?: boolean;
}

export default function LockScreen() {
    const navigation = useNavigation<LockScreenProps>();
    const { userData } = useUserRegistration();
    
    const [pin, setPin] = useState<string[]>(['', '', '', '']);
    const [pattern, setPattern] = useState<number[]>([]);
    const [attempts, setAttempts] = useState(0);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [lockType, setLockType] = useState<'PIN' | 'PATTERN'>('PIN');
    const [isSetup, setIsSetup] = useState(false);

    useEffect(() => {
        // Check if biometric is available
        BiometricAuth.isAvailable().then(setIsBiometricAvailable);
    }, []);

    const handlePinPress = (digit: string) => {
        if (pin.includes('')) {
            const newPin = [...pin];
            const emptyIndex = newPin.findIndex(d => d === '');
            newPin[emptyIndex] = digit;
            setPin(newPin);

            // Check if PIN is complete
            if (!newPin.includes('')) {
                if (isSetup) {
                    // Setup mode - store PIN
                    handleSetupComplete(newPin.join(''));
                } else {
                    // Login mode - verify PIN
                    handleLogin(newPin.join(''));
                }
            }
        }
    };

    const handlePinDelete = () => {
        const newPin = [...pin];
        const lastFilledIndex = newPin.findIndex((d, i) => d !== '' && (i === newPin.length - 1 || newPin[i + 1] === ''));
        if (lastFilledIndex !== -1) {
            newPin[lastFilledIndex] = '';
            setPin(newPin);
        }
    };

    const handlePatternPress = (index: number) => {
        if (!pattern.includes(index)) {
            const newPattern = [...pattern, index];
            setPattern(newPattern);
            
            // Check if pattern is complete (minimum 4 points)
            if (newPattern.length >= 4) {
                if (isSetup) {
                    // Setup mode - store pattern
                    handleSetupComplete(newPattern.join(','));
                } else {
                    // Login mode - verify pattern
                    handleLogin(newPattern.join(','));
                }
            }
        }
    };

    const handleSetupComplete = async (lockValue: string) => {
        try {
            // Store the lock value securely
            await BiometricAuth.enableUserLock(userData.userId!, lockType);
            
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Lock Enabled',
                textBody: `${lockType} lock has been enabled for your account`,
            });
            
            navigation.replace('HomeTabs');
        } catch (error) {
            console.log('Error setting up lock:', error);
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: 'Setup Failed',
                textBody: 'Failed to enable lock. Please try again.',
            });
        }
    };

    const handleLogin = async (lockValue: string) => {
        try {
            // In a real app, you would verify the lock value
            // For now, we'll just simulate success
            await new Promise(resolve => setTimeout(resolve, 500));
            
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Unlocked',
                textBody: 'Welcome back!',
            });
            
            navigation.replace('HomeTabs');
        } catch (error) {
            console.log('Login failed:', error);
            setAttempts(attempts + 1);
            
            if (attempts >= 2) {
                Alert.alert(
                    'Too Many Attempts',
                    'Please try again later or use biometric authentication.',
                    [{ text: 'OK' }]
                );
            } else {
                Vibration.vibrate(200);
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: 'Incorrect',
                    textBody: `Please try again. ${2 - attempts} attempts remaining.`,
                });
            }
            
            // Reset input
            setPin(['', '', '', '']);
            setPattern([]);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            const result = await BiometricAuth.authenticate('Unlock with biometric authentication');
            
            if (result.success) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: 'Unlocked',
                    textBody: `Welcome back! (${result.biometricType})`,
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

    const renderPinInput = () => (
        <View className="items-center mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
                {isSetup ? 'Set up your PIN' : 'Enter your PIN'}
            </Text>
            
            {/* PIN Dots */}
            <View className="flex-row space-x-4 mb-8">
                {pin.map((digit, index) => (
                    <View
                        key={index}
                        className={`w-4 h-4 rounded-full border-2 ${
                            digit ? 'bg-blue-600 border-blue-600' : 'border-gray-400'
                        }`}
                    />
                ))}
            </View>

            {/* Number Pad */}
            <View className="w-64">
                {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'del']].map((row, rowIndex) => (
                    <View key={rowIndex} className="flex-row justify-center mb-4">
                        {row.map((item, colIndex) => (
                            <TouchableOpacity
                                key={colIndex}
                                className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mx-2"
                                onPress={() => {
                                    if (item === 'del') {
                                        handlePinDelete();
                                    } else if (item) {
                                        handlePinPress(item);
                                    }
                                }}
                            >
                                <Text className="text-xl font-semibold text-gray-800">
                                    {item === 'del' ? '⌫' : item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </View>
        </View>
    );

    const renderPatternInput = () => (
        <View className="items-center mb-8">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
                {isSetup ? 'Set up your pattern' : 'Draw your pattern'}
            </Text>
            
            {/* Pattern Grid */}
            <View className="w-64 h-64 mb-8">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                    <TouchableOpacity
                        key={index}
                        className={`absolute w-16 h-16 rounded-full border-2 ${
                            pattern.includes(index)
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-400 bg-white'
                        }`}
                        style={{
                            left: (index % 3) * 80 + 16,
                            top: Math.floor(index / 3) * 80 + 16,
                        }}
                        onPress={() => handlePatternPress(index)}
                    />
                ))}
            </View>

            {/* Reset Pattern Button */}
            {pattern.length > 0 && (
                <TouchableOpacity
                    className="bg-red-100 px-4 py-2 rounded-lg"
                    onPress={() => setPattern([])}
                >
                    <Text className="text-red-600 font-semibold">Reset Pattern</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <AlertNotificationRoot>
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar hidden={true} />
                
                <View className="flex-1 justify-center px-8">
                    {/* Header */}
                    <View className="items-center mb-8">
                        <Text className="text-2xl font-bold text-gray-800 mb-2">
                            {isSetup ? 'Secure Your Account' : 'Welcome Back'}
                        </Text>
                        <Text className="text-gray-600 text-center">
                            {isSetup 
                                ? 'Set up an additional security method for your account'
                                : 'Use your security method to unlock the app'
                            }
                        </Text>
                    </View>

                    {/* Lock Input */}
                    {lockType === 'PIN' ? renderPinInput() : renderPatternInput()}

                    {/* Biometric Button */}
                    {isBiometricAvailable && (
                        <TouchableOpacity
                            className="bg-blue-600 py-4 px-8 rounded-lg mb-4"
                            onPress={handleBiometricLogin}
                        >
                            <Text className="text-white font-semibold text-lg text-center">
                                🔐 Use Biometric Authentication
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* Switch Lock Type */}
                    <TouchableOpacity
                        className="py-2"
                        onPress={() => {
                            setLockType(lockType === 'PIN' ? 'PATTERN' : 'PIN');
                            setPin(['', '', '', '']);
                            setPattern([]);
                        }}
                    >
                        <Text className="text-blue-600 font-semibold text-center">
                            Switch to {lockType === 'PIN' ? 'Pattern' : 'PIN'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
}
