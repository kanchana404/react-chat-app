import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity, TextInput, FlatList, Image, Alert } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ChatStackParamList } from "../HomeScreenTabs/ChatsScreen";
import { RootStackParamList } from "../../../App";
import { Chat } from "../../socket/chat";
import { useChatList } from "../../socket/useChatList";
import { useWebSocket } from "../../socket/WebSocketProvider";
import { useFriendList } from "../../socket/useFriendList";
import { useStoredUser } from "../../hooks/useStoredUser";
import { UserStorage } from "../../util/UserStorage";
import { ALERT_TYPE, Toast } from "react-native-alert-notification";
import { useColorScheme } from "nativewind";
import { useTheme } from "../../theme/themeProvider";

type HomeScreenProps = NativeStackNavigationProp<ChatStackParamList, "HomeScreen">
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>
export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenProps>();
    const rootNavigation = useNavigation<RootNavigationProp>();
    const [search, setSearch] = useState("");
    const chats = useChatList();
    const { sendMessage, isConnected } = useWebSocket();
    const { storedUser, userId, clearUser } = useStoredUser();
    const { friends, loading: friendsLoading, error: friendsError, refreshFriends } = useFriendList(userId);
    const { colorScheme } = useColorScheme();
    const { preference, setPreference } = useTheme();
    
    // Debug logging
    console.log('HomeScreen - storedUser:', storedUser);
    console.log('HomeScreen - userId:', userId);

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await clearUser();
                            Toast.show({
                                type: ALERT_TYPE.SUCCESS,
                                title: "Signed Out",
                                textBody: "You have been signed out successfully",
                            });
                            rootNavigation.replace("LoginScreen");
                        } catch (error) {
                            console.error("Sign out error:", error);
                            Toast.show({
                                type: ALERT_TYPE.DANGER,
                                title: "Error",
                                textBody: "Failed to sign out. Please try again.",
                            });
                        }
                    }
                }
            ]
        );
    };

    const handleReverifyPhone = () => {
        rootNavigation.navigate("PhoneReverifyScreen");
    };

    const handleThemeToggle = () => {
        const getCurrentThemeText = () => {
            switch (preference) {
                case "light": return "Light Theme ✓";
                case "dark": return "Dark Theme ✓";
                case "system": return "System Theme ✓";
                default: return "System Theme ✓";
            }
        };

        Alert.alert(
            "Theme Options",
            `Current: ${getCurrentThemeText()}\n\nChoose your preferred theme:`,
            [
                {
                    text: preference === "light" ? "Light Theme ✓" : "Light Theme",
                    onPress: () => {
                        setPreference("light");
                        Toast.show({
                            type: ALERT_TYPE.SUCCESS,
                            title: "Theme Changed",
                            textBody: "Switched to Light Theme",
                        });
                    }
                },
                {
                    text: preference === "dark" ? "Dark Theme ✓" : "Dark Theme",
                    onPress: () => {
                        setPreference("dark");
                        Toast.show({
                            type: ALERT_TYPE.SUCCESS,
                            title: "Theme Changed",
                            textBody: "Switched to Dark Theme",
                        });
                    }
                },
                {
                    text: preference === "system" ? "System Theme ✓" : "System Theme",
                    onPress: () => {
                        setPreference("system");
                        Toast.show({
                            type: ALERT_TYPE.SUCCESS,
                            title: "Theme Changed",
                            textBody: "Switched to System Theme",
                        });
                    }
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };

    const showMenu = () => {
        Alert.alert(
            "Options",
            "Choose an option",
            [
                {
                    text: "Theme Settings",
                    onPress: handleThemeToggle
                },
                {
                    text: "Re-verify Phone",
                    onPress: handleReverifyPhone
                },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: handleSignOut
                },
                {
                    text: "Cancel",
                    style: "cancel"
                }
            ]
        );
    };
    

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Kaidenz Chat",
            headerTitleStyle: { 
                fontWeight: "bold",
                color: "#000000"
            },
            headerStyle: {
                backgroundColor: "#FFCB74"
            },
            headerTintColor: "#000000",
            headerRight: () => (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {/* Connection Status Indicator */}
                    <View style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: 4, 
                        backgroundColor: isConnected ? "#10B981" : "#EF4444" 
                    }} />
                    <TouchableOpacity style={{ marginRight: 8 }}>
                        <Ionicons name="camera-outline" size={24} color="#000000" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={showMenu}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#000000" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    // Refresh chat list when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            console.log("HomeScreen focused - requesting chat list");
            sendMessage({ type: "get_chat_list" });
        }, [sendMessage])
    );

    const filteredChats = chats.filter((chat) =>
        chat.friendName.toLowerCase().includes(search.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }: { item: Chat }) => (
        <TouchableOpacity
            onPress={() => rootNavigation.navigate("SingleChatScreen", {
                chatId: item.id,
                friendName: item.friendName,
                lastSeenTime: item.lastTimeStamp,
                profileImage: item.profileImage
            })}
        >
            <View className={`flex-row items-center p-4 border-b ${colorScheme === 'dark' ? 'border-gray-700 bg-secondary-bg' : 'border-gray-200 bg-white'}`}>
                {/* Avatar */}
                <Image
                    source={{ uri: item.profileImage }}
                    className={`h-14 w-14 rounded-full border ${colorScheme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
                />

                {/* Name + Message */}
                <View className="ml-4 flex-1">
                    <View className="flex-row justify-between items-center">
                        <Text className={`font-semibold text-base ${colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800'}`}>{item.friendName}</Text>
                        <Text className={`text-xs ${colorScheme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{item.lastTimeStamp}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mt-1">
                        <View className="flex-1 flex-row items-center">
                            {item.files && item.files !== "FILE:" && item.files !== "" ? (
                                <View className="flex-row items-center flex-1">
                                    <Ionicons 
                                        name="image" 
                                        size={16} 
                                        color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text
                                        className={`${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-500'} flex-1`}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        📷 Photo
                                    </Text>
                                </View>
                            ) : (
                                <Text
                                    className={`${colorScheme === 'dark' ? 'text-gray-300' : 'text-gray-500'} flex-1`}
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                >
                                    {item.lastMessage}
                                </Text>
                            )}
                        </View>
                        {item.unreadCount > 0 && (
                            <View className="bg-gold-accent rounded-full w-5 h-5 items-center justify-center ml-2">
                                <Text className="text-black text-xs font-bold">{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

        </TouchableOpacity>
    );

    return (
        <SafeAreaView className={`flex-1 ${colorScheme === 'dark' ? 'bg-primary-bg' : 'bg-white'}`}>
            <View className={`items-center flex-row mx-2 ${colorScheme === 'dark' ? 'bg-secondary-bg' : 'bg-gray-100'} rounded-full px-6 h-14`}>
                <Ionicons name="search" size={20} color={colorScheme === 'dark' ? '#f6f6f6' : '#000000'} />
                <TextInput
                    className={`flex-1 ${colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800'} ml-2`}
                    placeholder="Search"
                    placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Friends Section */}
            {friends.length > 0 && (
                <View className="mt-4 mx-2">
                    <Text className="text-lg font-bold text-gray-800 dark:text-primary-text mb-2">Friends ({friends.length})</Text>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={friends}
                        keyExtractor={item => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity className="items-center mr-4">
                                <Image
                                    source={{ uri: item.profileImage }}
                                    className="h-16 w-16 rounded-full border border-gray-300 dark:border-gray-600"
                                />
                                <Text className="text-sm font-medium text-gray-800 dark:text-primary-text mt-1 text-center" numberOfLines={1}>
                                    {item.firstName} {item.lastName}
                                </Text>
                                <Text className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.status === 'ONLINE' ? '🟢 Online' : '⚫ Offline'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* Loading Friends */}
            {friendsLoading && (
                <View className="mt-4 mx-2">
                    <Text className="text-gray-500 dark:text-gray-400">Loading friends...</Text>
                </View>
            )}

            {/* Friends Error - Only show real errors, not empty list errors */}
            {friendsError && friendsError !== "User ID is required" && (
                <View className="mt-4 mx-2">
                    <Text className="text-red-500 dark:text-red-400">Error loading friends: {friendsError}</Text>
                </View>
            )}

            {/* Empty State - When no chats exist */}
            {chats.length === 0 && !friendsLoading && (
                <View className="flex-1 justify-center items-center px-8 -mt-20">
                    <Ionicons name="chatbubbles-outline" size={80} color="#9CA3AF" />
                    <Text className="text-xl font-bold text-gray-700 dark:text-primary-text mt-4">No conversations yet</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">Start chatting with your contacts</Text>
                    <TouchableOpacity
                        className="mt-6 bg-blue-600 dark:bg-gold-accent px-6 py-3 rounded-xl"
                        onPress={() => navigation.navigate("NewChatScreen")}
                    >
                        <Text className="text-white dark:text-black font-bold text-base">Start Conversation</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Chat List */}
            {chats.length > 0 && (
                <FlatList
                    className="mt-4"
                    data={filteredChats}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                />
            )}

            {/* chat button */}
            <View className="absolute bottom-10 right-6 h-16 w-16 bg-gold-accent rounded-full justify-center items-center shadow-lg">
                <TouchableOpacity
                    className="h-16 w-16 rounded-full justify-center items-center"
                    activeOpacity={1}
                    onPress={() => navigation.navigate("NewChatScreen")}
                >
                    <Ionicons name="chatbox-ellipses" size={32} color="black" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}