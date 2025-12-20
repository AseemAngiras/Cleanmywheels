import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/index";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </Provider>
  );
}
