

import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>Welcome to Washing appp</Text>
        <Text>Book your wash quickly</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {flex: 1, alignItems: "center", justifyContent: "center"},
    title : {fontSize: 20, fontWeight: "bold"},
})