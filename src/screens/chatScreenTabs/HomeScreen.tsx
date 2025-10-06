import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity, TextInput, FlatList, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ChatStackParamList } from "../HomeScreenTabs/ChatsScreen";
import { RootStackParamList } from "../../../App";

type HomeScreenProps = NativeStackNavigationProp<ChatStackParamList, "HomeScreen">
type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>
type ChatType = {
    id: number,
    name: string,
    lastMessage: string,
    time: string,
    profile: string

}
export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenProps>();
    const rootNavigation = useNavigation<RootNavigationProp>();
    const [search, setSearch] = useState("");
    const chats: ChatType[] = [
        {
            id: 1,
            name: "Alice Johnson",
            lastMessage: "Hey! How are you?",
            time: "09:15 AM",
            profile: `https://avatar.iran.liara.run/public/boy?username=Alice`
        },
        {
            id: 2,
            name: "Bob Smith",
            lastMessage: "Let's catch up later.",
            time: "10:30 AM",
            profile: "https://avatar.iran.liara.run/public/boy?username=Bob"
        },
        {
            id: 3,
            name: "Carol Lee",
            lastMessage: "Meeting at 2pm confirmed.",
            time: "11:45 AM",
            profile: "https://avatar.iran.liara.run/public/girl?username=Carol"
        },
        {
            id: 4,
            name: "David Kim",
            lastMessage: "Check out this photo! Test message to see how it looks in the chat preview. This is a longer message to test text truncation.",
            time: "12:20 PM",
            profile: "https://avatar.iran.liara.run/public/boy?username=David"
        },
        {
            id: 5,
            name: "Eva Brown",
            lastMessage: "See you soon!",
            time: "01:05 PM",
            profile: "https://avatar.iran.liara.run/public/girl?username=Eva"
        }
    ];

    useLayoutEffect(() => {
        navigation.setOptions({
            title: "Expo Chat App",
            headerTitleStyle: { fontWeight: "bold" },
            headerRight: () => (
                <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity style={{ marginRight: 8 }}>
                        <Ionicons name="camera-outline" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Ionicons name="ellipsis-vertical" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation]);

    const filteredChats = chats.filter((chat) =>
        chat.name.toLowerCase().includes(search.toLowerCase()) ||
        chat.lastMessage.toLowerCase().includes(search.toLowerCase())
    );

    const renderItem = ({ item }: { item: ChatType }) => (
        <TouchableOpacity
            onPress={() => rootNavigation.navigate("SingleChatScreen", {
                chatId: item.id,
                friendName: item.name,
                lastSeenTime: item.time,
                profileImage: item.profile
            })}
        >
            <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
                {/* Avatar */}
                <Image
                    source={{ uri: item.profile }}
                    className="h-14 w-14 rounded-full border border-gray-300"
                />

                {/* Name + Message */}
                <View className="ml-4 flex-1">
                    <View className="flex-row justify-between items-center">
                        <Text className="font-semibold text-base text-gray-800">{item.name}</Text>
                        <Text className="text-xs text-gray-500">{item.time}</Text>
                    </View>
                    <Text
                        className="text-gray-500 mt-1"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.lastMessage}
                    </Text>
                </View>
            </View>

        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1">
            <View className="items-center flex-row mx-2 bg-gray-300 rounded-full px-6 h-14">
                <Ionicons name="search" size={20} color="black" />
                <TextInput
                    className="flex-1 text-black-500 ml-2"
                    placeholder="Search"
                    placeholderTextColor={'black'}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <FlatList
                className="mt-4"
                data={filteredChats}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />

            {/* chat button */}
            <View className="absolute bottom-10 right-6 h-16 w-16 bg-white rounded-full justify-center items-center shadow-lg">
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