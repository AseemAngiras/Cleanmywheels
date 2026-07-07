

import { Stack } from 'expo-router'
import React from 'react'
import { Colors } from '@/constants/Colors'

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      contentStyle: { backgroundColor: Colors.background }
    }}>
      <Stack.Screen name='index' />
      <Stack.Screen name="book-service" />
      <Stack.Screen name="book-doorstep" />
    </Stack>
  )
}
