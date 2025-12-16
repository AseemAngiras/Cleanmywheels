

import { router } from 'expo-router'
import React from 'react'
import { Button, Text, View } from 'react-native'

export default function ProfileScreen() {
  return (
    <View style={{padding: 60}}>
        <Text style={{fontSize: 22, marginBottom: 50}} >John doe 91
        </Text>
            <Button
            title='Edit-profile'
            onPress={() => router.push("/profile/edit-profile")}
            />
            <Button
            title='My vehicles'
            onPress={() => router.push("/profile/vehicles")}
            />
    </View>
  )
}
