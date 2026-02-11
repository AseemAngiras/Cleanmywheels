import { Colors } from "@/constants/Colors";
import { Stack } from "expo-router";
import React from "react";

export default function MyCarsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: "My Cars" }} />
    </Stack>
  );
}
