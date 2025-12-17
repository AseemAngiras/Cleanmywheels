

import { Stack } from 'expo-router'
import React from 'react'

export default function MyCarsLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name='index' options={{title: "My Cars"}}/>
    </Stack>
  )
}
