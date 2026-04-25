import { Stack } from "expo-router";
import React from "react";
import { Colors } from "../../../../constants/Colors";

export default function BookDoorstepLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background }
      }}
    >
      <Stack.Screen name="enter-location" />
      <Stack.Screen name="select-service" />
      <Stack.Screen name="select-slot" />
      <Stack.Screen name="booking-summary" />
      <Stack.Screen name="order-confirmation" />
    </Stack>
  );
}
