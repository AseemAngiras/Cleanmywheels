import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import SocketManager from "../components/SocketManager";
import { persistor, store } from "../store/index";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Colors } from "@/constants/Colors";

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

  if (!appIsReady) {
    return <LoadingView />;
  }

  // ... (imports)

  // ...

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingView />} persistor={persistor}>
        <SafeAreaProvider>
          <View style={{ flex: 1, backgroundColor: Colors.background }}>
            <SocketManager />
            <View style={{ flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
              </Stack>
            </View>
          </View>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
