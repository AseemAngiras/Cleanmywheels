"use client"

import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function ArrivalConfirmed() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="checkmark" size={20} color="#1E8E3E" />
        <Text style={styles.headerText}>Arrival confirmed</Text>
      </View>

      {/* Main content */}
      <Text style={styles.title}>
        The service center has been notified
      </Text>

      <Text style={styles.description}>
        Your arrival has been registered. A staff member will assist you shortly.
      </Text>

      <View style={styles.infoBox}>
        <Ionicons name="time-outline" size={18} color="#666" />
        <Text style={styles.infoText}>
          Please remain nearby in case the provider needs additional details.
        </Text>
      </View>

      {/* Footer actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.replace("/bookings")}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryText}>Back to bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 24,
    paddingTop: 80,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },

  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E8E3E",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    color: "#555",
    lineHeight: 22,
    marginBottom: 24,
  },

  infoBox: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#F7F7F7",
    padding: 14,
    borderRadius: 12,
  },

  infoText: {
    fontSize: 14,
    color: "#444",
    flex: 1,
    lineHeight: 20,
  },

  footer: {
    marginTop: "auto",
    paddingBottom: 40,
  },

  primaryButton: {
    backgroundColor: "#C8F000",
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 150,
  },

  primaryText: {
    fontSize: 19,
    fontWeight: "500",
  },
})
