

import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

export default function MyCarsScreen() {
  return (
    <View style={styles.container}>
        <Text style={styles.title}>My cars Screen</Text>
        <Text>This section will show previously washed cars and their details</Text>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {flex: 1, alignItems: "center", justifyContent: "center"},
    title : {fontSize: 20, fontWeight: "bold"},
})

