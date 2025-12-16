
import { router } from 'expo-router'
import React from 'react'
import { Button, StyleSheet, Text, View } from 'react-native'

export default function ServicesScreen() {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Car wash services</Text>
            <Button 
            title='Available Services'
            onPress={() => router.push("/bookings/available-services")}
            />
            <Button 
            title='Book a service'
            onPress={() => router.push("/bookings/booking")}
            />
            <Button 
            title='Service history'
            onPress={() => router.push("/bookings/service-history")}
            />
    </View>
  )
}

const styles = StyleSheet.create({
    container : {flex: 1, justifyContent: 'center', alignItems : 'center', padding: 20},
    title : {fontSize: 22, margin: 20}
})
