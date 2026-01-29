import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface NextServiceWidgetProps {
  date: string;
  vehicleNo: string;
}

export const NextServiceWidget = ({
  date,
  vehicleNo,
}: NextServiceWidgetProps) => {
  const router = useRouter();
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={0.95}
        onPress={() => router.push("/(tabs)/subscriptions")}
      >
        <View style={styles.leftContent}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-sharp" size={18} color="#1C1C1C" />
          </View>
          <View>
            <Text style={styles.date}>{formattedDate}</Text>
            <Text style={styles.label}>Registration no.</Text>
          </View>
        </View>

        <View style={styles.rightContent}>
          <View style={styles.progressBarBg}>
            <View style={styles.progressBarFill} />
          </View>
          <View style={styles.details}>
            <Text style={styles.serviceTitle}>Next Service</Text>
            <Text style={styles.vehicleNo}>{vehicleNo}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  container: {
    backgroundColor: "#1C1C1C",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  leftContent: {
    gap: 10,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  date: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 0,
  },
  label: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  rightContent: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 70,
    paddingTop: 4,
  },
  progressBarBg: {
    width: 100,
    height: 4,
    backgroundColor: "#333",
    borderRadius: 2,
  },
  progressBarFill: {
    width: "60%",
    height: "100%",
    backgroundColor: "#F59E0B",
    borderRadius: 2,
  },
  details: {
    alignItems: "flex-end",
  },
  serviceTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  vehicleNo: {
    color: "#C8F000",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
