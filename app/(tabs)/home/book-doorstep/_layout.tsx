
import { Stack, useNavigation } from 'expo-router';
import React from 'react';

export default function BookDoorstepLayout() {
    const navigation = useNavigation();

    // Hide default tab bar
    // Tab bar logic handled in local root layout

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="enter-location" />
            <Stack.Screen name="select-service" />
            <Stack.Screen name="select-slot" />
            <Stack.Screen name="shops-list" />
            <Stack.Screen name="booking-summary" />
            <Stack.Screen name="order-confirmation" />
        </Stack>
    );
}
