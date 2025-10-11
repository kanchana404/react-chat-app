import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StatusBar,
    Clipboard,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import { useColorScheme } from "nativewind";
import { RootStackParamList } from "../../App";
import { useUserRegistration } from "../components/UserContext";
import { sendOTP, verifyOTP } from "../api/UserService";
import { UserStorage, StoredUser } from "../util/UserStorage";

type OTPVerificationScreenProps = NativeStackNavigationProp<RootStackParamList, "OTPVerificationScreen">;
type OTPVerificationRouteProp = RouteProp<RootStackParamList, "OTPVerificationScreen">;

export default function OTPVerificationScreen() {
    const navigation = useNavigation<OTPVerificationScreenProps>();
    const route = useRoute<OTPVerificationRouteProp>();
    const { userData, setUserData } = useUserRegistration();
    const { colorScheme } = useColorScheme();
    
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [otpExpiry, setOtpExpiry] = useState(300); // 5 minutes in seconds
    
    const inputRefs = useRef<TextInput[]>([]);

    const userId = route.params?.userId || userData.userId;

    useEffect(() => {
        console.log('OTPVerificationScreen - userId from route:', route.params?.userId);
        console.log('OTPVerificationScreen - userId from userData:', userData.userId);
        console.log('OTPVerificationScreen - final userId:', userId);
        
        if (!userId) {
            console.log('OTPVerificationScreen - No userId found, going back');
            navigation.goBack();
            return;
        }

        // Start OTP expiry timer
        const timer = setInterval(() => {
            setOtpExpiry((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [userId, navigation]);

    useEffect(() => {
        // Start resend cooldown timer
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(resendCooldown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) return; // Prevent multiple characters
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (value: string) => {
        // Remove any non-numeric characters
        const cleanValue = value.replace(/\D/g, '');
        
        if (cleanValue.length === 6) {
            const otpArray = cleanValue.split('');
            setOtp(otpArray);
            
            // Focus the last input
            inputRefs.current[5]?.focus();
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            const clipboardText = await Clipboard.getString();
            console.log('Pasted from clipboard:', clipboardText);
            
            // Remove any non-numeric characters
            const cleanValue = clipboardText.replace(/\D/g, '');
            
            if (cleanValue.length === 6) {
                const otpArray = cleanValue.split('');
                setOtp(otpArray);
                
                // Focus the last input
                inputRefs.current[5]?.focus();
                
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "OTP Pasted",
                    textBody: "6-digit OTP has been filled automatically",
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Invalid OTP",
                    textBody: "Clipboard doesn't contain a valid 6-digit OTP",
                });
            }
        } catch (error) {
            console.log('Error reading clipboard:', error);
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Paste Failed",
                textBody: "Could not read from clipboard",
            });
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleVerifyOTP = async () => {
        const otpString = otp.join("");
        
        if (otpString.length !== 6) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Invalid OTP",
                textBody: "Please enter all 6 digits",
            });
            return;
        }

        if (otpExpiry <= 0) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "OTP Expired",
                textBody: "Please request a new OTP",
            });
            return;
        }

        setLoading(true);

        try {
            console.log('OTPVerificationScreen - Verifying OTP for userId:', userId, 'otp:', otpString);
            const response = await verifyOTP(userId!, otpString);
            console.log('OTPVerificationScreen - verifyOTP response:', response);
            
            if (response.status) {
                // Store user data after successful verification
                const storedUser: StoredUser = {
                    id: userId!,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    countryCode: userData.countryCode,
                    contactNo: userData.contactNo,
                    status: 'ONLINE',
                    profileImage: `/profile-image/${userId}/profile1.png`,
                    isVerified: true,
                    registeredAt: new Date().toISOString(),
                    lastLoginAt: new Date().toISOString(),
                };

                // Store user data in AsyncStorage
                const userStored = await UserStorage.storeUser(storedUser);
                
                if (userStored) {
                    // Create user session
                    await UserStorage.createSession(userId!, 'password');
                    
                    // Clear registration data
                    await UserStorage.clearRegistrationData();
                    
                    Toast.show({
                        type: ALERT_TYPE.SUCCESS,
                        title: "Success",
                        textBody: response.message,
                    });
                    navigation.replace("HomeTabs");
                } else {
                    Toast.show({
                        type: ALERT_TYPE.WARNING,
                        title: "Storage Error",
                        textBody: "Account verified but failed to save user data",
                    });
                }
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Verification Failed",
                    textBody: response.message,
                });
            }
        } catch (error) {
            console.log(error);
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Network Error",
                textBody: "Please check your internet connection and try again",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendCooldown > 0) return;

        setResendLoading(true);

        try {
            const response = await sendOTP(userData.countryCode, userData.contactNo);
            
            if (response.status) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "OTP Sent",
                    textBody: "A new verification code has been sent to your phone",
                });
                setResendCooldown(60); // 60 seconds cooldown
                setOtpExpiry(300); // Reset 5-minute timer
                setOtp(["", "", "", "", "", ""]);
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Failed to Send",
                    textBody: response.message,
                });
            }
        } catch (error) {
            console.log(error);
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Network Error",
                textBody: "Please check your internet connection and try again",
            });
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <AlertNotificationRoot>
            <SafeAreaView className={`flex-1 ${colorScheme === 'dark' ? 'bg-primary-bg' : 'bg-white'}`}>
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={colorScheme === 'dark' ? '#111111' : '#ffffff'} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <View className="flex-1 justify-center px-8">
                        {/* Header */}
                        <View className="mb-8 items-center">
                            <Text className={`text-2xl font-bold text-center ${colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800'} mb-2`}>
                                Verify Your Phone Number
                            </Text>
                            <Text className={`${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center`}>
                                We sent a 6-digit code to
                            </Text>
                            <Text className={`${colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800'} font-semibold`}>
                                {userData.countryCode} {userData.contactNo}
                            </Text>
                        </View>

                        {/* OTP Input Fields */}
                        <View className="mb-6">
                            <View className="flex-row justify-center space-x-3">
                                {otp.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={(ref) => {
                                            if (ref) inputRefs.current[index] = ref;
                                        }}
                                        className={`w-12 h-12 border ${colorScheme === 'dark' ? 'border-gray-600 bg-secondary-bg' : 'border-gray-300 bg-white'} rounded-lg text-center text-lg font-bold ${colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800'}`}
                                        value={digit}
                                        onChangeText={(value) => handleOtpChange(value, index)}
                                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                        onTextInput={(event) => {
                                            // Handle paste functionality
                                            if (event.nativeEvent.text && event.nativeEvent.text.length > 1) {
                                                handleOtpPaste(event.nativeEvent.text);
                                            }
                                        }}
                                        keyboardType="numeric"
                                        maxLength={1}
                                        selectTextOnFocus
                                    />
                                ))}
                            </View>
                            
                            {/* Paste Button */}
                            <TouchableOpacity
                                className={`mt-4 py-2 px-4 ${colorScheme === 'dark' ? 'bg-gold-accent/20' : 'bg-gold-accent/20'} rounded-lg self-center`}
                                onPress={handlePasteFromClipboard}
                            >
                                <Text className={`${colorScheme === 'dark' ? 'text-gold-accent' : 'text-gold-accent'} font-semibold text-sm`}>
                                    📋 Paste from Clipboard
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Timer */}
                        {otpExpiry > 0 && (
                            <View className="mb-6 items-center">
                                <Text className={`${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    Code expires in {formatTime(otpExpiry)}
                                </Text>
                            </View>
                        )}

                        {/* Verify Button */}
                        <TouchableOpacity
                            className={`w-full py-4 rounded-lg items-center mb-4 ${
                                loading || otpExpiry <= 0
                                    ? (colorScheme === 'dark' ? 'bg-gray-600' : 'bg-gray-400')
                                    : 'bg-gold-accent'
                            }`}
                            onPress={handleVerifyOTP}
                            disabled={loading || otpExpiry <= 0}
                        >
                            <Text className={`${loading || otpExpiry <= 0 ? 'text-white' : 'text-black'} font-semibold text-lg`}>
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Text>
                        </TouchableOpacity>

                        {/* Resend Button */}
                        <TouchableOpacity
                            className={`w-full py-3 rounded-lg items-center ${
                                resendCooldown > 0 || resendLoading
                                    ? (colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')
                                    : `bg-transparent border ${colorScheme === 'dark' ? 'border-gold-accent' : 'border-gold-accent'}`
                            }`}
                            onPress={handleResendOTP}
                            disabled={resendCooldown > 0 || resendLoading}
                        >
                            <Text className={`font-semibold ${
                                resendCooldown > 0 || resendLoading
                                    ? (colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                                    : (colorScheme === 'dark' ? 'text-gold-accent' : 'text-gold-accent')
                            }`}>
                                {resendLoading
                                    ? "Sending..."
                                    : resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : "Resend OTP"}
                            </Text>
                        </TouchableOpacity>

                        {/* Back Button */}
                        <TouchableOpacity
                            className="w-full py-3 items-center mt-4"
                            onPress={() => navigation.goBack()}
                        >
                            <Text className={`${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Change phone number
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
}
