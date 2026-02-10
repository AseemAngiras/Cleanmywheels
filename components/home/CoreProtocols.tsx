import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const CoreProtocols = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>CORE PROTOCOLS</Text>
      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#C8F000" />
          </View>
          <Text style={styles.cardTitle}>VERIFIED</Text>
          <Text style={styles.cardDesc}>Elite trained professionals.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="leaf" size={24} color="#C8F000" />
          </View>
          <Text style={styles.cardTitle}>WATERLESS</Text>
          <Text style={styles.cardDesc}>Eco-tech solutions.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 1,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    width: "100%",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#333",
    minHeight: 140,
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 16,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    fontStyle: "italic",
    marginBottom: 4,
  },
  cardDesc: {
    color: "#888",
    fontSize: 12,
    fontWeight: "500",
  },
});
