

import { Stack } from 'expo-router'
import React from 'react'

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name="book-service" options={{ headerShown: false }} />
      <Stack.Screen name="book-doorstep" options={{ headerShown: false }} />
    </Stack>
  )
}
