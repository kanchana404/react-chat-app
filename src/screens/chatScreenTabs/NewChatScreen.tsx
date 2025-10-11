import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import { RootStackParamList } from "../../../App";
import { searchUserByPhone, addFriend } from "../../api/UserService";
import { useStoredUser } from "../../hooks/useStoredUser";
import { useFriendList } from "../../socket/useFriendList";
import CountryPicker, { Country, CountryCode } from "react-native-country-picker-modal";
import { useColorScheme } from "nativewind";

type NewChatScreenProps = NativeStackNavigationProp<RootStackParamList, "SingleChatScreen">;

interface SearchedUser {
    id: number;
    firstName: string;
    lastName: string;
    countryCode: string;
    contactNo: string;
    status: string;
    profileImage: string;
}

export default function NewChatScreen() {
    const navigation = useNavigation<NewChatScreenProps>();
    const { userId } = useStoredUser();
    const { refreshFriends } = useFriendList(userId);
    const { colorScheme } = useColorScheme();

    const [countryCode, setCountryCode] = useState<CountryCode>("LK");
    const [country, setCountry] = useState<Country | null>(null);
    const [contactNo, setContactNo] = useState("");
    const [searching, setSearching] = useState(false);
    const [adding, setAdding] = useState(false);
    const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null);
    const [showCountryPicker, setShowCountryPicker] = useState(false);

    const handleSearch = async () => {
        if (!contactNo.trim()) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Invalid Input",
                textBody: "Please enter a phone number",
            });
            return;
        }

        if (!userId) {
            Toast.show({
                type: ALERT_TYPE.WARNING,
                title: "Error",
                textBody: "User not logged in",
            });
            return;
        }

        const fullCountryCode = country?.callingCode?.[0] ? `+${country.callingCode[0]}` : "+94";

        setSearching(true);
        setSearchedUser(null);

        try {
            const response = await searchUserByPhone(fullCountryCode, contactNo, userId);
            
            if (response.status && response.user) {
                setSearchedUser(response.user);
                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "User Found",
                    textBody: response.message,
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Not Found",
                    textBody: response.message || "No user found with this number",
                });
            }
        } catch (error) {
            console.error("Search error:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Network Error",
                textBody: "Failed to search user. Please try again.",
            });
        } finally {
            setSearching(false);
        }
    };

    const handleAddAndChat = async () => {
        if (!searchedUser || !userId) return;

        setAdding(true);

        try {
            const response = await addFriend(userId, searchedUser.id);
            
            if (response.status) {
                // Refresh friend list
                refreshFriends();

                Toast.show({
                    type: ALERT_TYPE.SUCCESS,
                    title: "Success",
                    textBody: response.message,
                });

                // Navigate to SingleChatScreen
                navigation.navigate("SingleChatScreen", {
                    chatId: searchedUser.id,
                    friendName: `${searchedUser.firstName} ${searchedUser.lastName}`,
                    lastSeenTime: "Active now",
                    profileImage: searchedUser.profileImage,
                });
            } else {
                Toast.show({
                    type: ALERT_TYPE.DANGER,
                    title: "Error",
                    textBody: response.message || "Failed to add friend",
                });
            }
        } catch (error) {
            console.error("Add friend error:", error);
            Toast.show({
                type: ALERT_TYPE.DANGER,
                title: "Network Error",
                textBody: "Failed to add friend. Please try again.",
            });
        } finally {
            setAdding(false);
        }
    };

    return (
        <AlertNotificationRoot>
            <SafeAreaView className="flex-1 bg-white dark:bg-primary-bg">
                <KeyboardAvoidingView
                    className="flex-1"
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    {/* Header */}
                    <View className="flex-row items-center px-4 py-3 border-b border-gray-700 bg-gold-accent">
                        <TouchableOpacity onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={24} color="#000000" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold ml-4 text-black">New Conversation</Text>
                    </View>

                    {/* Search Section */}
                    <View className="px-6 py-4">
                        <Text className="text-gray-700 dark:text-primary-text font-semibold mb-3">
                            Enter Phone Number
                        </Text>

                        {/* Country Code & Phone Input */}
                        <View className="flex-row gap-3 mb-4">
                            {/* Country Code Picker */}
                            <TouchableOpacity
                                onPress={() => setShowCountryPicker(true)}
                                className="w-20 h-14 bg-gray-100 dark:bg-secondary-bg border border-gray-300 dark:border-gray-600 rounded-xl justify-center items-center"
                            >
                                <Text className="text-gray-700 dark:text-primary-text font-medium text-base">
                                    {country?.callingCode?.[0] ? `+${country.callingCode[0]}` : "+94"}
                                </Text>
                            </TouchableOpacity>

                            <CountryPicker
                                countryCode={countryCode}
                                withFilter
                                withFlag
                                withCallingCode
                                withEmoji
                                onSelect={(country) => {
                                    setCountry(country);
                                    setCountryCode(country.cca2);
                                }}
                                visible={showCountryPicker}
                                onClose={() => setShowCountryPicker(false)}
                            />

                            {/* Phone Number Input */}
                            <View className="flex-1 h-14 bg-gray-100 dark:bg-secondary-bg border border-gray-300 dark:border-gray-600 rounded-xl justify-center">
                                <TextInput
                                    className="text-gray-700 dark:text-primary-text font-medium text-base px-4 w-full h-full"
                                    placeholder="Phone number"
                                    placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#9CA3AF'}
                                    inputMode="tel"
                                    value={contactNo}
                                    onChangeText={setContactNo}
                                />
                            </View>
                        </View>

                        {/* Search Button */}
                        <TouchableOpacity
                            className="bg-gold-accent h-12 rounded-xl justify-center items-center"
                            onPress={handleSearch}
                            disabled={searching}
                        >
                            {searching ? (
                                <ActivityIndicator size="small" color="black" />
                            ) : (
                                <Text className="text-black font-bold text-base">Search</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Searched User Card */}
                    {searchedUser && (
                        <View className="mx-6 mt-4 p-4 bg-gray-50 dark:bg-secondary-bg border border-gray-200 dark:border-gray-700 rounded-xl">
                            <View className="flex-row items-center">
                                {/* Profile Image */}
                                <Image
                                    source={{ uri: `${process.env.EXPO_PUBLIC_APP_URL}${searchedUser.profileImage}` }}
                                    className="h-16 w-16 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                />

                                {/* User Info */}
                                <View className="ml-4 flex-1">
                                    <Text className="text-lg font-bold text-gray-800 dark:text-primary-text">
                                        {searchedUser.firstName} {searchedUser.lastName}
                                    </Text>
                                    <Text className="text-gray-500 dark:text-gray-400 mt-1">
                                        {searchedUser.countryCode} {searchedUser.contactNo}
                                    </Text>
                                    <View className="flex-row items-center mt-1">
                                        <View
                                            className={`h-2 w-2 rounded-full mr-2 ${
                                                searchedUser.status === "ONLINE" ? "bg-green-500" : "bg-gray-400"
                                            }`}
                                        />
                                        <Text className="text-sm text-gray-500 dark:text-gray-400">
                                            {searchedUser.status === "ONLINE" ? "Online" : "Offline"}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Add & Start Chat Button */}
                            <TouchableOpacity
                                className="mt-4 bg-gold-accent h-12 rounded-xl justify-center items-center"
                                onPress={handleAddAndChat}
                                disabled={adding}
                            >
                                {adding ? (
                                    <ActivityIndicator size="small" color="black" />
                                ) : (
                                    <View className="flex-row items-center">
                                        <Ionicons name="chatbox-ellipses" size={20} color="black" />
                                        <Text className="text-black font-bold text-base ml-2">
                                            Add & Start Chat
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Instructions */}
                    {!searchedUser && !searching && (
                        <View className="px-6 mt-8">
                            <View className="flex-row items-start mb-3">
                                <Ionicons name="information-circle-outline" size={24} color={colorScheme === 'dark' ? '#9ca3af' : '#6B7280'} />
                                <Text className="text-gray-600 dark:text-gray-400 ml-3 flex-1">
                                    Enter the phone number of the person you want to chat with
                                </Text>
                            </View>
                            <View className="flex-row items-start">
                                <Ionicons name="shield-checkmark-outline" size={24} color={colorScheme === 'dark' ? '#9ca3af' : '#6B7280'} />
                                <Text className="text-gray-600 dark:text-gray-400 ml-3 flex-1">
                                    They must have an account on this app to start chatting
                                </Text>
                            </View>
                        </View>
                    )}
                </KeyboardAvoidingView>
            </SafeAreaView>
        </AlertNotificationRoot>
    );
}
