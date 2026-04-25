import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../../../constants/Colors';

export default function BookServiceLayout() {
    // Hide default tab bar
    // Tab bar logic handled in local root layout

    return (
        <Stack screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background }
        }}>
            <Stack.Screen name="select-service" />
            <Stack.Screen name="shops-list" />
            <Stack.Screen name="select-slot" />
            <Stack.Screen name="vehicle-details" />
            <Stack.Screen name="booking-summary" />
            <Stack.Screen name="payment" />
            <Stack.Screen name="order-confirmation" />
        </Stack>
    );
}
