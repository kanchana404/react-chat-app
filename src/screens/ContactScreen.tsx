import { SafeAreaView } from "react-native-safe-area-context";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StatusBar,
    Text,
    TextInput,
    View,
} from "react-native";
import { useEffect, useState } from "react";
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import { RootStackParamList } from "../../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useUserRegistration } from "../components/UserContext";

import * as Validation from "../util/Validation";
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";

type ContactScreenProps = NativeStackNavigationProp<RootStackParamList, "ContactScreen">;

export default function ContactScreen() {
    const navigation = useNavigation<ContactScreenProps>();
    const [show, setShow] = useState(false);
    const [countryCode, setCountryCode] = useState<CountryCode>("LK");
    const [country, setCountry] = useState<Country | null>(null);

    const { userData, setUserData } = useUserRegistration();

    useEffect(() => {
        if (!userData.countryCode) {
            setUserData((prev) => ({
                ...prev,
                countryCode: "+94",
            }));
        }
    }, [userData.countryCode, setUserData]);

    return (
        <AlertNotificationRoot>
            <SafeAreaView className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100">
                <StatusBar hidden={true} />
                <KeyboardAvoidingView
                    className="flex-1 justify-between"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    keyboardVerticalOffset={100}
                >
                    {/* Header Section */}
                    <View className="flex-1 justify-center items-center px-8">
                        {/* Logo Container */}
                        <View className="mb-8">
                            <Image
                                source={require("../assets/contact.png")}
                                className="w-32 h-36"
                                resizeMode="contain"
                            />
                        </View>

                        {/* Title Section */}
                        <View className="mb-10 items-center">
                            <Text className="text-slate-700 font-bold text-xl text-center leading-7">
                                Verify Your Phone Number
                            </Text>
                            <Text className="text-slate-500 text-sm text-center mt-2 px-4">
                                We'll send you a verification code to confirm your identity
                            </Text>
                        </View>

                        {/* Country Picker Section */}
                        <View className="w-full mb-6">
                            <Text className="text-slate-600 font-semibold mb-3 text-base">
                                Select Country
                            </Text>
                            <Pressable
                                className="w-full h-14 bg-white border border-slate-200 rounded-xl justify-between items-center flex-row px-4 shadow-sm"
                                onPress={() => setShow(true)}
                            >
                                <CountryPicker
                                    countryCode={countryCode}
                                    withFilter
                                    withFlag
                                    withCountryNameButton
                                    visible={show}
                                    onClose={() => setShow(false)}
                                    onSelect={(selectedCountry) => {
                                        setCountryCode(selectedCountry.cca2);
                                        setCountry(selectedCountry);
                                        setUserData((prev) => ({
                                            ...prev,
                                            countryCode: `+${selectedCountry.callingCode[0]}`,
                                        }));
                                        setShow(false);
                                    }}
                                />
                                <AntDesign name="down" size={16} color="#64748b" />
                            </Pressable>
                        </View>

                        {/* Phone Input Section */}
                        <View className="w-full mb-8">
                            <Text className="text-slate-600 font-semibold mb-3 text-base">
                                Phone Number
                            </Text>
                            <View className="flex-row gap-3">
                                {/* Country Code Input */}
                                <View className="w-20 h-14 bg-white border border-slate-200 rounded-xl justify-center items-center shadow-sm">
                                    <TextInput
                                        className="text-slate-700 font-medium text-base text-center w-full"
                                        value={country?.callingCode?.[0] ? `+${country.callingCode[0]}` : "+94"}
                                        editable={false}
                                    />
                                </View>

                                {/* Phone Number Input */}
                                <View className="flex-1 h-14 bg-white border border-slate-200 rounded-xl justify-center shadow-sm">
                                    <TextInput
                                        className="text-slate-700 font-medium text-base px-4 w-full h-full"
                                        placeholder="Enter phone number"
                                        placeholderTextColor="#94a3b8"
                                        inputMode="tel"
                                        value={userData.contactNo || ""}
                                        onChangeText={(text) => {
                                            setUserData((prev) => ({ ...prev, contactNo: text }));
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Bottom Button Section */}
                    <View className="px-8 pb-8">
                        <Pressable
                            className="w-full h-14 bg-blue-600 justify-center items-center rounded-xl shadow-lg active:bg-green-700"
                            onPress={() => {
                                const validCountryCode = Validation.validateCountryCode(userData.countryCode);
                                const validContactNo = Validation.validatePhoneNo(userData.contactNo);

                                // console.log(userData.contactNo)
                                // console.log(userData.countryCode)
                                // console.log(validCountryCode)
                                // console.log(validContactNo)

                                if (validCountryCode) {
                                    Toast.show({
                                        type: ALERT_TYPE.DANGER,
                                        title: "Invalid Country",
                                        textBody: validCountryCode,
                                    });
                                } else if (validContactNo) {
                                    Toast.show({
                                        type: ALERT_TYPE.DANGER,
                                        title: "Invalid Phone Number",
                                        textBody: validContactNo,
                                    });
                                } else {
                                    navigation.replace("AvatarScreen");
                                }
                            }}
                        >
                            <Text className="text-white font-bold text-lg">Continue</Text>
                        </Pressable>

                        {/* Terms Text */}
                        <Text className="text-slate-400 text-xs text-center mt-4 px-4">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </Text>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
}
