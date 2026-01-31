import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const SavingsCard = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>With subscription you save monthly:</Text>
      <View style={styles.row}>
        <View style={styles.item}>
          <View style={[styles.iconBox, { backgroundColor: "#ECFCCB" }]}>
            <Ionicons name="time" size={18} color="#4D7C0F" />
          </View>
          <View>
            <Text style={styles.value}>4 hrs</Text>
            {/* <Text style={styles.label}>Time Saved</Text> */}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <View style={[styles.iconBox, { backgroundColor: "#FEF9C3" }]}>
            <Ionicons name="wallet" size={18} color="#A16207" />
          </View>
          <View>
            <Text style={styles.value}>₹1,200</Text>
            {/* <Text style={styles.label}>Money Saved</Text> */}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 16,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  item: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },
  label: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
});
