import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View, Image } from "react-native";
import Animated, {
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    useAnimatedStyle,
} from "react-native-reanimated";
import CircleShape from "../components/CircleShape";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "SplashScreen"
>;

export default function SplashScreen() {
    const navigation = useNavigation<NavigationProp>();

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

        //fadeout
        const timer = setTimeout(() => {
            opacity.value = withTiming(0, { duration: 500 });
            setTimeout(() => {
                navigation.replace("SignUpScreen");
            }, 500);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    const fadeOutStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));


    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-black">
            <StatusBar hidden={true} />

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

                <View className="absolute bottom-5 w-full items-center">
                    <Text className="text-base font-semibold text-black mb-1">
                        Powered By: {process.env.EXPO_PUBLIC_APP_OWNER}
                    </Text>
                    <Text className="text-sm font-medium text-gray-500">
                        Version: {process.env.EXPO_PUBLIC_APP_VERSION}
                    </Text>
                </View>
            </Animated.View>
        </SafeAreaView>


    );
}
