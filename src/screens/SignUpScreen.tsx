import { StatusBar } from "expo-status-bar";
import { View, Text, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import { SafeAreaView } from "react-native-safe-area-context";

import React, { useState } from "react";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import { useNavigation } from "@react-navigation/native";
import { useUserRegistration } from "../components/UserContext";
import { FloatingLabelInput } from "react-native-floating-label-input";
import * as Validation from "../util/Validation";

type SignUpScreenProps = NativeStackNavigationProp<RootStackParamList, "SignUpScreen">;

export default function SignUpScreen() {
    const [isPressed, setIsPressed] = useState(false);
    const navigation = useNavigation<SignUpScreenProps>();

    const { userData, setUserData } = useUserRegistration();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");


    return (
        <AlertNotificationRoot>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1 bg-white dark:bg-black">
                <SafeAreaView className="flex-1">
                    <StatusBar hidden={true} />
                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={{
                            flexGrow: 1,
                            justifyContent: "center",
                            paddingHorizontal: 16,
                        }}>

                        {/* Header */}
                        <View className="mb-8 items-center">
                            <Text className="text-2xl font-bold text-center text-black dark:text-white">
                                Create Your Account And Start The Conversation Today
                            </Text>
                        </View>

                        {/* Sign Up Form */}
                        <View className="w-full">
                            <View className="mb-4">
                                <FloatingLabelInput
                                    label="First Name"
                                    value={userData.firstName}
                                    onChangeText={(text) => setUserData((previous) => ({ ...previous, firstName: text }))}
                                />
                            </View>

                            <View className="mb-4">
                                <FloatingLabelInput
                                    label="Last Name"
                                    value={userData.lastName}
                                    onChangeText={(text) => setUserData((previous) => ({ ...previous, lastName: text }))}
                                />
                            </View>

                            {/* Button */}
                            <TouchableOpacity
                                className={`w-full rounded-lg py-3 items-center ${isPressed ? "bg-blue-700" : "bg-blue-600"}`}
                                onPress={() => {
                                    let validateFirstName = Validation.validateFirstName(userData.firstName);
                                    let validateLastName = Validation.validateLastName(userData.lastName)

                                    if (validateFirstName) {
                                        Toast.show({
                                            type: ALERT_TYPE.WARNING,
                                            textBody: validateFirstName,
                                            autoClose: 2000,
                                        })
                                    } else if (validateLastName) {
                                        Toast.show({
                                            type: ALERT_TYPE.WARNING,
                                            textBody: validateLastName,
                                            autoClose: 2000,
                                        })
                                    } else {
                                        navigation.replace  ("ContactScreen");
                                    }

                                }}
                            >
                                <Text className="text-white font-semibold text-base">Sign Up</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Footer */}
                        <View className="w-full mt-6 items-center">
                            <Text className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                By signing up, you agree to our Terms of Service and Privacy Policy.
                            </Text>
                        </View>

                        <View className="w-full mt-4 items-center">
                            <Text className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{" "}
                                <Text className="text-blue-600">Sign In</Text>
                            </Text>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </AlertNotificationRoot>
    );
}
