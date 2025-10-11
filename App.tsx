import "./global.css"
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//screens
import SplashScreen from "./src/screens/SplashScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ContactScreen from "./src/screens/ContactScreen";
import AvatarScreen from "./src/screens/AvatarScreen";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import SettingScreen from "./src/screens/chatScreenTabs/SettingScreen";
import HomeScreen from "./src/screens/chatScreenTabs/HomeScreen";
import HomeTabs from "./src/screens/HomeTabs";

import { NavigationContainer } from "@react-navigation/native";
import { ThemeProvider } from "./src/theme/themeProvider";
import { UserRegistrationProvider } from "./src/components/UserContext";
import { AlertNotificationRoot } from "react-native-alert-notification";
import { useColorScheme } from "nativewind";

import SingleChatScreen from "./src/screens/chatScreenTabs/SingleChatScreen";
import NewChatScreen from "./src/screens/chatScreenTabs/NewChatScreen";
import OTPVerificationScreen from "./src/screens/OTPVerificationScreen";
import PhoneReverifyScreen from "./src/screens/PhoneReverifyScreen";
import LoginScreen from "./src/screens/LoginScreen";
import PhoneLoginScreen from "./src/screens/PhoneLoginScreen";
import LockScreen from "./src/screens/LockScreen";
import SecuritySettingsScreen from "./src/screens/SecuritySettingsScreen";
import { DynamicWebSocketProvider } from "./src/components/DynamicWebSocketProvider";

export type RootStackParamList = {
  SplashScreen: undefined;
  SignUpScreen: undefined;
  ContactScreen: undefined;
  OTPVerificationScreen: {
    userId: number;
  };
  PhoneReverifyScreen: undefined;
  AvatarScreen: undefined;
  SignInScreen: undefined;
  LoginScreen: undefined;
  PhoneLoginScreen: undefined;
  LockScreen: {
    userId: number;
    lockType: 'PIN' | 'PATTERN';
    isSetup?: boolean;
  };
  SecuritySettingsScreen: undefined;
  HomeTabs: undefined;
  HomeScreen: undefined;
  SettingScreen: undefined;
  ProfileScreen: undefined;
  SingleChatScreen: {
    chatId: number;
    friendName: string;
    lastSeenTime: string;
    profileImage: string;
  };
  NewChatScreen: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
//this page has all the screens and navigation between them
//ChatScreenTabs has 3 tabs: Home, Status, Calls
//HomeScreen has 3 tabs in one page: Home,newChat,Settings

export default function App() {
  return (
    <AlertNotificationRoot>
      <DynamicWebSocketProvider>
        <ThemeProvider>
          <UserRegistrationProvider>
            <NavigationContainer>
              <Stack.Navigator 
                initialRouteName="SplashScreen" 
                screenOptions={{ 
                  headerShown: false,
                }}
              >
                <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ContactScreen" component={ContactScreen} options={{ headerShown: false }} />
                <Stack.Screen name="OTPVerificationScreen" component={OTPVerificationScreen} options={{ headerShown: false }} />
                <Stack.Screen name="PhoneReverifyScreen" component={PhoneReverifyScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AvatarScreen" component={AvatarScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SignInScreen" component={SignInScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SignUpScreen" component={SignUpScreen} options={{ headerShown: false }} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="PhoneLoginScreen" component={PhoneLoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="LockScreen" component={LockScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SecuritySettingsScreen" component={SecuritySettingsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SettingScreen" component={SettingScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: true }} />
                <Stack.Screen name="HomeTabs" component={HomeTabs} options={{ headerShown: false }} />
                <Stack.Screen name="NewChatScreen" component={NewChatScreen} options={{ headerShown: false }} />
                <Stack.Screen name="SingleChatScreen" component={SingleChatScreen} options={{ headerShown: true }} />
              </Stack.Navigator>
            </NavigationContainer>
          </UserRegistrationProvider>
        </ThemeProvider>
      </DynamicWebSocketProvider>
    </AlertNotificationRoot>
  );
}
