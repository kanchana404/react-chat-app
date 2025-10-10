import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RootStackParamList } from "../../../App";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useSingleChat } from "../../socket/UseSIngleChat";
import { Chat } from "../../socket/chat";
import { useSendChat } from "../../socket/UseSendChats";
import { useWebSocket } from "../../socket/WebSocketProvider";
import { formatChatTime } from "../../util/DateFormatter";

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
    const sendMessage = useSendChat();
    const messages = useSingleChat(chatId);
    const { userId } = useWebSocket();

    const [input, setInput] = useState("");

    // Function to group messages by date
    const groupMessagesByDate = (messages: Chat[]): GroupedMessage[] => {
        if (messages.length === 0) return [];

        const grouped: GroupedMessage[] = [];
        let currentDate = '';

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

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "",
            headerLeft: () => (
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-3"
                    >
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: profileImage }}
                        className="h-14 w-14 rounded-full border-2 border-gray-400 p-1"
                    />
                    <View className="space-y-2">
                        <Text className="font-bold text-2xl">{friendName}</Text>
                        <Text className="italic text-xs font-bold text-gray-500">
                            Last seen {lastSeenTime}
                        </Text>
                    </View>
                </View>
            ),
            headerRight: () => (
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={24} color="black"></Ionicons>
                </TouchableOpacity>
            ),
        });
    }, [navigation, profileImage, friendName, lastSeenTime]);

    const renderItem = ({ item }: { item: GroupedMessage }) => {
        if (item.type === 'dateSeparator') {
            return (
                <View className="flex-row items-center my-4 mx-4">
                    <View className="flex-1 h-px bg-gray-300" />
                    <Text className="mx-3 text-gray-500 text-sm font-medium bg-white px-3 py-1 rounded-full">
                        {item.data}
                    </Text>
                    <View className="flex-1 h-px bg-gray-300" />
                </View>
            );
        }

        // Render message
        const message = item.data;
        const isMe = message.from.id === userId; // Check if message is from current user
        return (
            <View
                className={`my-1 px-3 py-3 max-w-[75%] 
    ${isMe
                        ? `self-end bg-green-900 rounded-tl-xl rounded-bl-xl rounded-br-xl`
                        : `rounded-tr-xl rounded-bl-xl rounded-br-xl ro self-start bg-gray-700`
                    } `}
            >
                <Text className={`text-white text-base`}>{message.message}</Text>
                <View className="flex-row justify-end items-center mt-1">
                    <Text className={`text-white italic text-xs me-2`}>
                        {formatChatTime(message.createdAt)}
                    </Text>
                    {isMe && (
                        <Ionicons
                            name={
                                message.status === "READ"
                                    ? "checkmark-done-sharp"
                                    : message.status === "DELIVERED"
                                        ? "checkmark-done-sharp"
                                        : "checkmark"
                            }
                            size={16}
                            color={message.status === "READ" ? "#0284c7" : "#9ca3af"}
                        />
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
        sendMessage(chatId, messageText);
        setInput("");
    }


    return (
        <SafeAreaView
            className="flex-1 bg-white"
            edges={["right", "bottom", "left"]}
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === "android" ? "padding" : "height"}

            >
                <StatusBar hidden={false} />

                <FlatList
                    data={groupedMessages}
                    renderItem={renderItem}
                    className="flex-1 px-3"
                    keyExtractor={(item, index) => 
                        item.type === 'dateSeparator' 
                            ? `date-${item.data}-${index}` 
                            : `message-${item.data.id}-${index}`
                    }
                    inverted
                    contentContainerStyle={{ paddingBottom: 60 }}
                />

                <View className="flex-row items-end p-2 bg-white">
                    <TextInput
                        value={input}
                        onChangeText={(text) => setInput(text)}
                        multiline
                        placeholder="Type a message"
                        className="flex-1 min-h-14 max-h-32 h-auto px-5 py-2 bg-gray-200 rounded-3xl text-base"
                    />
                    <TouchableOpacity
                        className="bg-green-600 w-14 h-14 items-center justify-center rounded-full"
                        onPress={handleSendChat}
                    >
                        <Ionicons name="send" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
