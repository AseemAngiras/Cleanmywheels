import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import SocketManager from "../components/SocketManager";
import { persistor, store } from "../store/index";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import CustomSplashScreen from "../components/SplashScreen";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();

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
  const [isSplashAnimationFinished, setIsSplashAnimationFinished] =
    useState(false);

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

  const onLayoutRootView = async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  };

  if (!appIsReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingView />} persistor={persistor}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          {!isSplashAnimationFinished ? (
            <CustomSplashScreen
              onFinish={() => setIsSplashAnimationFinished(true)}
            />
          ) : (
            <>
              <SocketManager />
              <View style={{ flex: 1, paddingTop: 40 }}>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                </Stack>
              </View>
            </>
          )}
        </View>
      </PersistGate>
    </Provider>
  );
}
