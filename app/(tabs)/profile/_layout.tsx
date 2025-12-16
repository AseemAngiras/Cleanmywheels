


import { Stack } from 'expo-router'

export default function ProfileLayout() {
  return (
    <Stack>
        <Stack.Screen name='index' options={{title: "Profile"}}/>
        <Stack.Screen name='vehicles' options={{title: "My vehicles"}}/>
        <Stack.Screen name='edit-profile' options={{title: "Edit profile"}}/>
    </Stack>
  )
}
