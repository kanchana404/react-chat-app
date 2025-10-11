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
import { RootStackParamList } from "../../App";
import { useStoredUser } from "../hooks/useStoredUser";
import { sendOTP, reverifyPhone } from "../api/UserService";

type PhoneReverifyScreenProps = NativeStackNavigationProp<RootStackParamList, "PhoneReverifyScreen">;

export default function PhoneReverifyScreen() {
    const navigation = useNavigation<PhoneReverifyScreenProps>();
    const { storedUser, userId } = useStoredUser();
    
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [otpExpiry, setOtpExpiry] = useState(300); // 5 minutes in seconds
    
    const inputRefs = useRef<TextInput[]>([]);

    useEffect(() => {
        if (!userId || !storedUser) {
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
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (value: string) => {
        const cleanValue = value.replace(/\D/g, '').slice(0, 6);
        const newOtp = Array(6).fill('');
        for (let i = 0; i < cleanValue.length; i++) {
            newOtp[i] = cleanValue[i];
        }
        setOtp(newOtp);
        
        // Focus the last filled input
        const lastFilledIndex = cleanValue.length - 1;
        if (lastFilledIndex >= 0 && lastFilledIndex < 5) {
            inputRefs.current[lastFilledIndex + 1]?.focus();
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            const clipboardContent = await Clipboard.getString();
            if (clipboardContent) {
                handleOtpPaste(clipboardContent);
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Pasted",
                    textBody: "OTP pasted from clipboard",
                });
            }
        } catch (error) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Error",
                textBody: "Failed to read clipboard",
            });
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handleResendOTP = async () => {
        if (!storedUser) return;

        setResendLoading(true);
        setResendCooldown(60); // 60 seconds cooldown

        try {
            const response = await sendOTP(storedUser.countryCode, storedUser.contactNo);
            
            if (response.status) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "OTP Sent",
                    textBody: "New OTP has been sent to your phone",
                });
                setOtpExpiry(300); // Reset timer
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Error",
                    textBody: response.message || "Failed to send OTP",
                });
            }
        } catch (error) {
            console.error("Resend OTP error:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Network Error",
                textBody: "Failed to send OTP. Please try again.",
            });
        } finally {
            setResendLoading(false);
        }
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
            console.log('PhoneReverifyScreen - Re-verifying phone for userId:', userId, 'otp:', otpString);
            const response = await reverifyPhone(userId!, otpString);
            console.log('PhoneReverifyScreen - reverifyPhone response:', response);
            
            if (response.status) {
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Phone Re-verified",
                    textBody: "Your phone number has been re-verified successfully",
                });
                navigation.goBack();
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Verification Failed",
                    textBody: response.message || "Invalid OTP. Please try again.",
                });
            }
        } catch (error) {
            console.error("Verify OTP error:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Network Error",
                textBody: "Failed to verify OTP. Please check your connection and try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertNotificationRoot>
            <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100">
                <StatusBar hidden />
                <KeyboardAvoidingView
                    className="flex-1 justify-between"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={100}
                >
                    <View className="flex-1 justify-center items-center px-8">
                        <Text className="text-slate-700 font-bold text-2xl text-center leading-7">
                            Re-verify Phone Number
                        </Text>
                        <Text className="text-slate-500 text-sm text-center mt-2 px-4">
                            Enter the OTP sent to {storedUser?.countryCode} {storedUser?.contactNo}
                        </Text>

                        {/* OTP Input */}
                        <View className="flex-row justify-center mt-8 mb-6">
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => {
                                        if (ref) inputRefs.current[index] = ref;
                                    }}
                                    className="w-12 h-12 mx-2 text-center text-xl font-bold border border-slate-300 rounded-lg bg-white"
                                    value={digit}
                                    onChangeText={(value) => handleOtpChange(value, index)}
                                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {/* Timer */}
                        {otpExpiry > 0 && (
                            <Text className="text-slate-500 text-sm mb-4">
                                OTP expires in {formatTime(otpExpiry)}
                            </Text>
                        )}

                        {/* Paste Button */}
                        <TouchableOpacity
                            onPress={handlePasteFromClipboard}
                            className="mb-6 px-4 py-2 bg-slate-200 rounded-lg"
                        >
                            <Text className="text-slate-600 font-medium">Paste from Clipboard</Text>
                        </TouchableOpacity>

                        {/* Resend Button */}
                        <TouchableOpacity
                            onPress={handleResendOTP}
                            disabled={resendLoading || resendCooldown > 0}
                            className="mb-6"
                        >
                            <Text className={`text-center ${resendLoading || resendCooldown > 0 ? 'text-slate-400' : 'text-blue-600 font-medium'}`}>
                                {resendLoading ? "Sending..." : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Bottom Button */}
                    <View className="px-8 pb-8">
                        <TouchableOpacity
                            className="w-full h-14 bg-blue-600 justify-center items-center rounded-xl shadow-lg active:bg-blue-700"
                            onPress={handleVerifyOTP}
                            disabled={loading}
                        >
                            {loading ? (
                                <Text className="text-white font-bold text-lg">Verifying...</Text>
                            ) : (
                                <Text className="text-white font-bold text-lg">Verify Phone</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
}
