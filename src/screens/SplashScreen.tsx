import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image, TouchableOpacity } from "react-native";
import Animated, {
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    useAnimatedStyle,
} from "react-native-reanimated";
import CircleShape from "../components/CircleShape";
import { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { useStoredUser } from "../hooks/useStoredUser";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";

type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "SplashScreen"
>;

export default function SplashScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { storedUser, isLoggedIn } = useStoredUser();
    const [showOptions, setShowOptions] = useState(false);
    const { colorScheme } = useColorScheme();

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        //logo boom
        scale.value = withRepeat(
            withSequence(
                withTiming(1.1, { duration: 1200 }),
                withTiming(1, { duration: 1200 })
            ),
            -1,
            true
        );

        // Check if user is already logged in
        if (isLoggedIn && storedUser) {
            const timer = setTimeout(() => {
                navigation.replace("HomeTabs");
            }, 2000);
            return () => clearTimeout(timer);
        }

        // Show options after animation
        const timer = setTimeout(() => {
            setShowOptions(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [isLoggedIn, storedUser]);

    const fadeOutStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));


    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <SafeAreaView className={`flex-1 ${colorScheme === 'dark' ? 'bg-primary-bg' : 'bg-white'}`}>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} backgroundColor={colorScheme === 'dark' ? '#111111' : '#ffffff'} />

            <Animated.View
                className="flex-1 items-center justify-center w-full h-full"
                style={fadeOutStyle}
            >
                <Animated.View style={animatedStyle}>
                    <Image
                        source={require("../assets/logo.png")}
                        className="w-[220px] h-[220px]"
                        resizeMode="contain"
                    />
                </Animated.View>

                <CircleShape width={300} height={300} borderRadius={150} fillColor="#E0E7FF" top={-150} left={-110} />
                <CircleShape width={200} height={200} borderRadius={100} fillColor="#C7D2FE" bottom={-100} right={-110} />
                <CircleShape width={150} height={150} borderRadius={75} fillColor="#A5B4FC" top={50} right={-90} />
                <CircleShape width={100} height={100} borderRadius={100} fillColor="#818CF8" bottom={50} left={-50} />

                {/* Welcome Options */}
                {showOptions && (
                    <View className="absolute bottom-20 w-full px-8">
                        <View className="bg-secondary-bg/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                            <Text className="text-2xl font-bold text-primary-text text-center mb-2">
                                Welcome to Kaidenz Chat
                            </Text>
                            <Text className="text-gray-300 text-center mb-6">
                                Choose an option to continue
                            </Text>
                            
                            <View className="space-y-3">
                                <TouchableOpacity
                                    className="bg-gold-accent py-4 px-6 rounded-xl"
                                    onPress={() => navigation.replace("PhoneLoginScreen")}
                                >
                                    <Text className="text-black font-bold text-lg text-center">
                                        Login
                                    </Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity
                                    className="bg-gray-700 py-4 px-6 rounded-xl"
                                    onPress={() => navigation.replace("SignUpScreen")}
                                >
                                    <Text className="text-primary-text font-semibold text-lg text-center">
                                        Create Account
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}

                <View className="absolute bottom-5 w-full items-center">
                    <Text className="text-base font-semibold text-primary-text mb-1">
                        Powered By: {process.env.EXPO_PUBLIC_APP_OWNER}
                    </Text>
                    <Text className="text-sm font-medium text-gray-400">
                        Version: {process.env.EXPO_PUBLIC_APP_VERSION}
                    </Text>
                </View>
            </Animated.View>
        </SafeAreaView>
    );
}
