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

type Message = {
    id: number;
    text: string;
    sender: "me" | "friend";
    time: string;
    status?: "sent" | "delivered" | "read";
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

    const [message, setMessage] = useState<Message[]>([
        { id: 1, text: "Hi", sender: "friend", time: "10.56 AM" },
        { id: 2, text: "HELLO", sender: "friend", time: "10.58 AM" },
        {
            id: 3,
            text: "Hey , kohomada",
            sender: "me",
            time: "11.56 AM",
            status: "read",
        },
    ]);


    const [input, setInput] = useState("");

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

    const renderItem = ({ item }: { item: Message }) => {
        const isMe = item.sender === "me";
        return (
            <View
                className={`my-1 px-3 py-3 max-w-[75%] 
    ${isMe
                        ? `self-end bg-green-900 rounded-tl-xl rounded-bl-xl rounded-br-xl`
                        : `rounded-tr-xl rounded-bl-xl rounded-br-xl ro self-start bg-gray-700`
                    } `}
            >
                <Text className={`text-white text-base`}>{item.text}</Text>
                <View className="flex-row justify-end items-center mt-1">
                    <Text className={`text-white italic text-xs me-2`}>{item.time}</Text>
                    {isMe && (
                        <Ionicons
                            name={
                                item.status === "read"
                                    ? "checkmark-done-sharp"
                                    : item.status === "delivered"
                                        ? "checkmark-done-sharp"
                                        : "checkmark"
                            }
                            size={16}
                            color={item.status === "read" ? "#0284c7" : "#9ca3af"}
                        />
                    )}
                </View>
            </View>
        );
    };

    const sendMessage = () => {
        if (input.trim()) {
            const newMsg: Message = {
                id: Date.now(),
                text: input,
                sender: "me",
                time: Date.now().toString(),
                status: "sent",
            };
            setMessage([newMsg, ...message]);
            setInput("");
        }

        return !input.trim();
    };

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
                    data={message}
                    renderItem={renderItem}
                    className="flex-1 px-3"
                    keyExtractor={(item) => item.id.toString()}
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
                        onPress={sendMessage}
                    >
                        <Ionicons name="send" size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
