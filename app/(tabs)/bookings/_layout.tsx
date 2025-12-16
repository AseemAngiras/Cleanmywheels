import { Stack } from "expo-router";

export default function ServicesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Services" }} />
      <Stack.Screen name="available-services" options={{ title: "Available Services" }} />
      <Stack.Screen name="booking" options={{ title: "Book a Service" }} />
      <Stack.Screen name="service-history" options={{ title: "Service History" }} />
    </Stack>
  );
}
