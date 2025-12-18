

import { Stack } from 'expo-router'
import React from 'react'

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='select-service' options={{ headerShown: false }} />
      <Stack.Screen name='vehicle-details' options={{ headerShown: false }} />
      <Stack.Screen name='shops-list' options={{ headerShown: false }} />
      <Stack.Screen name='select-slot' options={{ headerShown: false }} />
      <Stack.Screen name='scanner' options={{ headerShown: false }} />
      <Stack.Screen name='booking-summary' options={{ headerShown: false }} />
      <Stack.Screen name='payment' options={{ headerShown: false }} />
      <Stack.Screen name='order-confirmation' options={{ headerShown: false }} />
    </Stack>
  )
}
