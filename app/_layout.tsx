import "react-native-gesture-handler";
import "../global.css";
import { Stack } from "expo-router";
import { ActivityIndicator, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import SocketManager from "../components/SocketManager";
import { persistor, store } from "../store/index";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import NotificationManager from "../components/NotificationManager";

import { AlertProvider } from "../components/providers/AlertProvider";

SplashScreen.preventAutoHideAsync();

const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View className="h-[60px] w-[90%] bg-[#181818] rounded-[12px] border-l-[6px] border-[#C8F000] flex-row items-center px-4 border border-[#333333] shadow-lg">
      <View className="flex-1">
        <Text className="text-white text-[14px] font-bold">{text1}</Text>
        {text2 ? <Text className="text-[#888888] text-[12px] mt-0.5">{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()} className="p-2">
        <Ionicons name="close" size={20} color="#888888" />
      </TouchableOpacity>
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View className="h-[60px] w-[90%] bg-[#181818] rounded-[12px] border-l-[6px] border-[#EF4444] flex-row items-center px-4 border border-[#333333] shadow-lg">
      <View className="flex-1">
        <Text className="text-white text-[14px] font-bold">{text1}</Text>
        {text2 ? <Text className="text-[#888888] text-[12px] mt-0.5">{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()} className="p-2">
        <Ionicons name="close" size={20} color="#888888" />
      </TouchableOpacity>
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View className="h-[60px] w-[90%] bg-[#181818] rounded-[12px] border-l-[6px] border-[#333333] flex-row items-center px-4 border border-[#333333] shadow-lg">
      <View className="flex-1">
        <Text className="text-white text-[14px] font-bold">{text1}</Text>
        {text2 ? <Text className="text-[#888888] text-[12px] mt-0.5">{text2}</Text> : null}
      </View>
      <TouchableOpacity onPress={() => Toast.hide()} className="p-2">
        <Ionicons name="close" size={20} color="#888888" />
      </TouchableOpacity>
    </View>
  ),
};

const LoadingView = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F3F4F7",
    }}
  >
    <ActivityIndicator size="large" color="#84c95c" />
  </View>
);

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({});

  useEffect(() => {
    async function prepare() {
      try {
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [fontsLoaded]);

  useEffect(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingView />} persistor={persistor}>
        <SafeAreaProvider>
          <AlertProvider>
            <View className="flex-1 bg-background">
              <SocketManager />
              <NotificationManager />
              <View className="flex-1">
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </View>
            </View>
            <Toast config={toastConfig} />
          </AlertProvider>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
