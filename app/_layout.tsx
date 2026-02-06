import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { persistor, store } from "../store/index";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";

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

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingView />} persistor={persistor}>
        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, paddingTop: 40 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </View>
        </View>
      </PersistGate>
    </Provider>
  );
}
