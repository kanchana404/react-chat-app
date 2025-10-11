import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../../App";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import React, { useLayoutEffect, useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSingleChat } from "../../socket/UseSIngleChat";
import { Chat } from "../../socket/chat";
import { useSendChat } from "../../socket/UseSendChats";
import { useWebSocket } from "../../socket/WebSocketProvider";
import { formatChatTime } from "../../util/DateFormatter";
import { useColorScheme } from "nativewind";
import { resetUnreadCount } from "../../socket/useChatList";
import * as ImagePicker from "expo-image-picker";
import { uploadImageToCloudinary } from "../../api/CloudinaryService";

type Message = {
    id: number;
    text: string;
    sender: "me" | "friend";
    time: string;
    status?: "sent" | "delivered" | "read";
};

type GroupedMessage = {
    type: 'message';
    data: Chat;
} | {
    type: 'dateSeparator';
    data: string;
};

const dummyMessage: Message[] = [
    { id: 1, text: "Hi", sender: "friend", time: "10.56 AM" },
    { id: 2, text: "HELLO", sender: "friend", time: "10.58 AM" },
    {
        id: 3,
        text: "Hey , kohomada",
        sender: "me",
        time: "11.56 AM",
        status: "read",
    },
];

type SingleChatScreenProps = NativeStackScreenProps<
    RootStackParamList,
    "SingleChatScreen"
>;

export default function SingleChatScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, "SingleChatScreen">>();
    const route = useRoute<SingleChatScreenProps['route']>();
    const { chatId, friendName, profileImage, lastSeenTime } = route.params;
    const sendChat = useSendChat();
    const messages = useSingleChat(chatId);
    const { userId, isConnected, sendMessage } = useWebSocket();
    const { colorScheme } = useColorScheme();

    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const flatListRef = useRef<FlatList>(null);

    // Mark messages as read when screen is focused
    useFocusEffect(
        React.useCallback(() => {
            console.log("SingleChatScreen focused - marking messages as read");
            // Send mark_messages_read request to backend
            if (chatId) {
                console.log("Sending mark_messages_read for friendId:", chatId);
                sendMessage({ type: "mark_messages_read", friendId: chatId });
            }
            // Request updated chat list after marking as read
            setTimeout(() => {
                console.log("Requesting updated chat list after marking as read");
                sendMessage({ type: "get_chat_list" });
            }, 1000); // Increased delay to ensure backend processes the read request
        }, [chatId, sendMessage])
    );

    // Frontend workaround: Force unread count to 0 when chat is opened
    // This is needed because backend is not properly handling mark_messages_read
    useEffect(() => {
        if (chatId) {
            console.log("Frontend workaround: Resetting unread count for chat:", chatId);
            resetUnreadCount(chatId);
        }
    }, [chatId]);

    // Function to group messages by date
    const groupMessagesByDate = (messages: Chat[]): GroupedMessage[] => {
        if (messages.length === 0) return [];

        const grouped: GroupedMessage[] = [];
        let currentDate = '';

        // Process messages in chronological order (oldest first)
        // Since FlatList is normal, newest will appear at bottom
        messages.forEach((message, index) => {
            const messageDate = new Date(message.createdAt).toDateString();
            
            // Add date separator if this is a new date
            if (messageDate !== currentDate) {
                currentDate = messageDate;
                const today = new Date().toDateString();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayString = yesterday.toDateString();

                let dateLabel = '';
                if (messageDate === today) {
                    dateLabel = 'Today';
                } else if (messageDate === yesterdayString) {
                    dateLabel = 'Yesterday';
                } else {
                    dateLabel = new Date(message.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }

                grouped.push({
                    type: 'dateSeparator',
                    data: dateLabel
                });
            }

            // Add the message
            grouped.push({
                type: 'message',
                data: message
            });
        });

        return grouped;
    };

    const groupedMessages = groupMessagesByDate(messages);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (groupedMessages.length > 0 && flatListRef.current) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [groupedMessages.length]);
    
    // Debug: Log message order
    console.log("=== MESSAGE DEBUG ===");
    console.log("Raw messages count:", messages.length);
    messages.forEach((msg, index) => {
        console.log(`Message ${index}: ${msg.message} - ${new Date(msg.createdAt).toLocaleTimeString()}`);
    });
    console.log("Grouped messages count:", groupedMessages.length);
    console.log("===================");

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "",
            headerStyle: {
                backgroundColor: "#FFCB74"
            },
            headerTintColor: "#000000",
            headerLeft: () => (
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-3"
                    >
                        <Ionicons name="arrow-back" size={24} color="#000000" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: profileImage }}
                        className="h-14 w-14 rounded-full border-2 border-gray-600 p-1"
                    />
                    <View className="space-y-2">
                        <Text className="font-bold text-2xl text-black">{friendName}</Text>
                        <Text className="italic text-xs font-bold text-gray-600">
                            Last seen {lastSeenTime}
                        </Text>
                    </View>
                </View>
            ),
            headerRight: () => (
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {/* Connection Status Indicator */}
                    <View style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: 4, 
                        backgroundColor: isConnected ? "#10B981" : "#EF4444" 
                    }} />
                    <Text style={{ fontSize: 12, color: isConnected ? "#10B981" : "#EF4444" }}>
                        {isConnected ? "Connected" : "Disconnected"}
                    </Text>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-vertical" size={24} color="#000000"></Ionicons>
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, profileImage, friendName, lastSeenTime]);

    const renderItem = ({ item }: { item: GroupedMessage }) => {
        if (item.type === 'dateSeparator') {
            return (
                <View className="flex-row items-center mb-2 mx-4">
                    <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                    <Text className="mx-3 text-gray-500 dark:text-gray-400 text-sm font-medium bg-white dark:bg-secondary-bg px-3 py-1 rounded-full">
                        {item.data}
                    </Text>
                    <View className="flex-1 h-px bg-gray-300 dark:bg-gray-600" />
                </View>
            );
        }

        // Render message
        const message = item.data;
        const isMe = message.from.id === userId; // Check if message is from current user
        const isImageMessage = message.imageUrl || message.messageType === 'image';
        
        return (
            <View
                className={`my-1 px-4 py-3 max-w-[75%] 
    ${isMe
                        ? `self-end bg-gold-accent rounded-tl-xl rounded-bl-xl rounded-br-xl`
                        : `rounded-tr-xl rounded-bl-xl rounded-br-xl self-start ${colorScheme === 'dark' ? 'bg-secondary-bg' : 'bg-gray-200'}`
                    } `}
            >
                {isImageMessage && message.imageUrl ? (
                    <View className="mb-2">
                        <Image
                            source={{ uri: message.imageUrl }}
                            className="rounded-lg"
                            resizeMode="cover"
                            style={{ 
                                height: 400, 
                                width: '200%',
                                minHeight: 400,
                                maxHeight: 500,
                                marginLeft: -50,
                                marginRight: -50,
                                alignSelf: 'center'
                            }}
                        />
                        {message.message && message.message.trim() !== '' && (
                            <Text className={`${isMe ? 'text-black' : (colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800')} text-base leading-5 mt-2`}>
                                {message.message}
                            </Text>
                        )}
                        {(!message.message || message.message.trim() === '') && (
                            <Text className={`${isMe ? 'text-black' : (colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800')} text-sm italic mt-1`}>
                                📷 Photo
                            </Text>
                        )}
                    </View>
                ) : (
                    <Text className={`${isMe ? 'text-black' : (colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800')} text-base leading-5`}>
                        {message.message}
                    </Text>
                )}
                <View className="flex-row justify-end items-center mt-1">
                    <Text className={`${isMe ? 'text-black' : (colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800')} text-xs opacity-80 mr-1`}>
                        {formatChatTime(message.createdAt)}
                    </Text>
                    {isMe && (
                        <View className="flex-row items-center">
                            {message.status === "READ" ? (
                                // Blue double tick for read
                                <Ionicons
                                    name="checkmark-done-sharp"
                                    size={14}
                                    color="#0284c7"
                                />
                            ) : message.status === "DELIVERED" ? (
                                // Dark gray double tick for delivered on gold background
                                <Ionicons
                                    name="checkmark-done-sharp"
                                    size={14}
                                    color="#374151"
                                />
                            ) : (
                                // Dark gray single tick for sent on gold background
                                <Ionicons
                                    name="checkmark"
                                    size={14}
                                    color="#374151"
                                />
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    const handleSendChat = () => {
        if (!input.trim()) {
            return;
        }
        const messageText = input.trim();
        // Send to server - backend will handle the response
        sendChat(chatId, messageText);
        setInput("");
    }

    // Image picker functions
    const pickImageFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsEditing: false, // Allow full-size images without cropping
                quality: 0.9, // Higher quality
                allowsMultipleSelection: false,
            });

            if (!result.canceled && result.assets[0]) {
                await handleImageUpload(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image from gallery:', error);
            Alert.alert('Error', 'Failed to pick image from gallery');
        }
    };

    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: 'images',
                allowsEditing: false, // Allow full-size images without cropping
                quality: 0.9, // Higher quality
            });

            if (!result.canceled && result.assets[0]) {
                await handleImageUpload(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleImageUpload = async (imageUri: string) => {
        try {
            setIsUploading(true);
            console.log('Starting image upload:', imageUri);
            
            const cloudinaryUrl = await uploadImageToCloudinary(imageUri);
            console.log('Image uploaded to Cloudinary successfully:', cloudinaryUrl);
            
            // Send image message
            sendChat(chatId, '', cloudinaryUrl, 'image');
            console.log('Image message sent via WebSocket');
            
        } catch (error) {
            console.error('Error uploading image:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            Alert.alert('Upload Failed', `Failed to upload image: ${errorMessage}`);
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <SafeAreaView
            className={`flex-1 ${colorScheme === 'dark' ? 'bg-primary-bg' : 'bg-white'}`}
            edges={["right", "bottom", "left"]}
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={colorScheme === 'dark' ? '#111111' : '#ffffff'} />

                <FlatList
                    ref={flatListRef}
                    data={groupedMessages}
                    renderItem={renderItem}
                    className="flex-1 px-3"
                    keyExtractor={(item, index) => 
                        item.type === 'dateSeparator' 
                            ? `date-${item.data}-${index}` 
                            : `message-${item.data.id}-${index}`
                    }
                    contentContainerStyle={{ paddingBottom: 80 }}
                    showsVerticalScrollIndicator={false}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 0,
                        autoscrollToTopThreshold: 10
                    }}
                    onContentSizeChange={() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }}
                />

                {/* Typing Indicator */}
                {isTyping && (
                    <View className="px-4 py-2 bg-gray-100 dark:bg-secondary-bg">
                        <Text className="text-gray-600 dark:text-gray-300 text-sm italic">
                            {friendName} is typing...
                        </Text>
                    </View>
                )}

                <View className="flex-row items-end p-2 bg-white dark:bg-primary-bg">
                    {/* Camera Button */}
                    <TouchableOpacity
                        className="w-12 h-12 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 mr-2"
                        onPress={takePhoto}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <ActivityIndicator size="small" color="#666" />
                        ) : (
                            <Ionicons name="camera" size={20} color="#666" />
                        )}
                    </TouchableOpacity>

                    {/* Gallery Button */}
                    <TouchableOpacity
                        className="w-12 h-12 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 mr-2"
                        onPress={pickImageFromGallery}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <ActivityIndicator size="small" color="#666" />
                        ) : (
                            <Ionicons name="images" size={20} color="#666" />
                        )}
                    </TouchableOpacity>

                    <TextInput
                        value={input}
                        onChangeText={(text) => {
                            setInput(text);
                            // Simple typing indicator - you can enhance this with WebSocket
                            if (text.length > 0 && !isTyping) {
                                setIsTyping(true);
                                setTimeout(() => setIsTyping(false), 2000);
                            }
                        }}
                        multiline
                        placeholder="Type a message"
                        placeholderTextColor={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'}
                        className={`flex-1 min-h-14 max-h-32 h-auto px-5 py-2 ${colorScheme === 'dark' ? 'bg-secondary-bg' : 'bg-gray-200'} rounded-3xl text-base ${colorScheme === 'dark' ? 'text-primary-text' : 'text-gray-800'}`}
                    />
                    <TouchableOpacity
                        className={`w-14 h-14 items-center justify-center rounded-full ${
                            input.trim().length > 0 
                                ? 'bg-gold-accent'
                                : (colorScheme === 'dark' ? 'bg-gray-600' : 'bg-gray-400')
                        }`}
                        onPress={handleSendChat}
                        disabled={input.trim().length === 0}
                    >
                        <Ionicons 
                            name="send" 
                            size={24} 
                            color={
                                input.trim().length > 0 
                                    ? 'black'
                                    : 'white'
                            } 
                        />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
