import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";
import React, { createContext, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { Appearance } from "react-native";

export type ThemeOption = "light" | "dark" | "system";
const THEME_KEY = "@app_color_scheme";

type ThemeContextType = {
    preference: ThemeOption;
    applied: "light" | "dark";
    setPreference: (themeOption: ThemeOption) => Promise<void>;
};

type ThemeProviderProps = {
    children: React.ReactNode;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { colorScheme, setColorScheme } = useColorScheme();
    const [preference, setPreferenceState] = useState<ThemeOption>("system");
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_KEY);
                if (savedTheme === "light" || savedTheme === "dark") {
                    setPreferenceState(savedTheme);
                    setColorScheme(savedTheme);
                } else {
                    setPreferenceState("system");
                    setColorScheme(Appearance.getColorScheme() ?? "light");
                }
            } catch (error) {
                console.log("Error loading theme preference:", error);
            } finally {
                setIsReady(true);
            }
        })();
    }, [setColorScheme]);

    const setPreference = async (themeOption: ThemeOption) => {
        try {
            if (themeOption === "system") {
                await AsyncStorage.removeItem(THEME_KEY);
                setPreferenceState("system");
                setColorScheme(Appearance.getColorScheme() ?? "light");
            } else {
                await AsyncStorage.setItem(THEME_KEY, themeOption);
                setPreferenceState(themeOption);
                setColorScheme(themeOption);
            }
        } catch (error) {
            console.log("Error saving theme preference:", error);
        }
    };

    if (!isReady) {
        return <ActivityIndicator style={{ flex: 1 }} />;
    }

    return (
        <ThemeContext.Provider
            value={{
                preference,
                applied: colorScheme ?? "light",
                setPreference,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}
export function useTheme() {
    const context = React.useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}