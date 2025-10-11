import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatsScreen from "./HomeScreenTabs/ChatsScreen";
import StatusScreen from "./HomeScreenTabs/StatusScreen";
import CallsScreen from "./HomeScreenTabs/CallsScreen";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";

const Tabs = createBottomTabNavigator();

export default function HomeTabs() {
  const { colorScheme } = useColorScheme();
  
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName = "chatbubble-ellipses";
          if (route.name === "Chats") iconName = "chatbubble-ellipses";
          else if (route.name === "Status") iconName = "time";
          else if (route.name === "Calls") iconName = "call";
          return <Ionicons name={iconName as any} size={28} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 16, fontweight: '808' },
        tabBarActiveTintColor: "#FFCB74",
        tabBarInactiveTintColor: colorScheme === 'dark' ? "#9ca3af" : "#6b7280",
        tabBarStyle: {
          height: 90,
          backgroundColor: colorScheme === 'dark' ? "#2f2f2f" : "#ffffff",
          paddingTop: 1
        }
      })}
    >
      <Tabs.Screen
        name="Chats"
        component={ChatsScreen}
        options={{ headerShown: false }}
      />
      <Tabs.Screen name="Status" component={StatusScreen} />
      <Tabs.Screen name="Calls" component={CallsScreen} />
    </Tabs.Navigator>
  );
}
