import { View, Text, TouchableOpacity, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/themeProvider";
import { useColorScheme } from "nativewind";

export default function SettingScreen() {
    const { preference, setPreference } = useTheme();
    const { colorScheme } = useColorScheme();

    const themeOptions = [
        { key: 'light', label: 'Light', icon: 'sunny' },
        { key: 'dark', label: 'Dark', icon: 'moon' },
        { key: 'system', label: 'System', icon: 'phone-portrait' }
    ] as const;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-primary-bg">
            <View className="px-6 py-4">
                <Text className="text-2xl font-bold text-gray-800 dark:text-primary-text mb-6">
                    Settings
                </Text>

                {/* Theme Selection */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-gray-700 dark:text-primary-text mb-4">
                        Theme
                    </Text>
                    
                    {themeOptions.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
                                preference === option.key 
                                    ? 'bg-gold-accent dark:bg-gold-accent' 
                                    : 'bg-gray-100 dark:bg-secondary-bg'
                            }`}
                            onPress={() => setPreference(option.key)}
                        >
                            <View className="flex-row items-center">
                                <Ionicons 
                                    name={option.icon as any} 
                                    size={24} 
                                    color={preference === option.key ? '#000000' : (colorScheme === 'dark' ? '#f6f6f6' : '#1f2937')} 
                                />
                                <Text className={`ml-3 text-base font-medium ${
                                    preference === option.key 
                                        ? 'text-black' 
                                        : 'text-gray-700 dark:text-primary-text'
                                }`}>
                                    {option.label}
                                </Text>
                            </View>
                            
                            {preference === option.key && (
                                <Ionicons 
                                    name="checkmark" 
                                    size={20} 
                                    color="#000000" 
                                />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Other Settings */}
                <View className="mb-8">
                    <Text className="text-lg font-semibold text-gray-700 dark:text-primary-text mb-4">
                        App Settings
                    </Text>
                    
                    <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-100 dark:bg-secondary-bg rounded-xl mb-2">
                        <View className="flex-row items-center">
                            <Ionicons 
                                name="notifications" 
                                size={24} 
                                color={colorScheme === 'dark' ? '#f6f6f6' : '#1f2937'} 
                            />
                            <Text className="ml-3 text-base font-medium text-gray-700 dark:text-primary-text">
                                Notifications
                            </Text>
                        </View>
                        <Ionicons 
                            name="chevron-forward" 
                            size={20} 
                            color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                        />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-100 dark:bg-secondary-bg rounded-xl mb-2">
                        <View className="flex-row items-center">
                            <Ionicons 
                                name="shield-checkmark" 
                                size={24} 
                                color={colorScheme === 'dark' ? '#f6f6f6' : '#1f2937'} 
                            />
                            <Text className="ml-3 text-base font-medium text-gray-700 dark:text-primary-text">
                                Privacy & Security
                            </Text>
                        </View>
                        <Ionicons 
                            name="chevron-forward" 
                            size={20} 
                            color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                        />
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-100 dark:bg-secondary-bg rounded-xl">
                        <View className="flex-row items-center">
                            <Ionicons 
                                name="help-circle" 
                                size={24} 
                                color={colorScheme === 'dark' ? '#f6f6f6' : '#1f2937'} 
                            />
                            <Text className="ml-3 text-base font-medium text-gray-700 dark:text-primary-text">
                                Help & Support
                            </Text>
                        </View>
                        <Ionicons 
                            name="chevron-forward" 
                            size={20} 
                            color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}