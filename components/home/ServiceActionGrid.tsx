import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ServiceActionGridProps {
  isLoggedIn: boolean;
  hasActiveSubscription?: boolean;
}

export const ServiceActionGrid = ({
  isLoggedIn,
  hasActiveSubscription,
}: ServiceActionGridProps) => {
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.guestButton}
          activeOpacity={0.9}
          onPress={() =>
            router.push("/(tabs)/home/book-doorstep/enter-location")
          }
        >
          <Text style={styles.guestButtonText}>Book a Wash</Text>
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Book Service - Square Card */}
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push("/(tabs)/home/book-doorstep/enter-location")}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={28} color="#0284C7" />
        </View>
        <View>
          <Text style={styles.title}>Book Service</Text>
          <Text style={styles.subtitle}>One-time wash</Text>
        </View>
      </TouchableOpacity>

      {/* Add-ons OR Buy Subscription */}
      {hasActiveSubscription ? (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => router.push("/subscription/addons")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="add-circle-outline" size={28} color="#CA8A04" />
          </View>
          <View>
            <Text style={styles.title}>Add-ons</Text>
            <Text style={styles.subtitle}>For next visit</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.9}
          onPress={() => router.push("/(tabs)/subscriptions")}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="star-outline" size={28} color="#16A34A" />
          </View>
          <View>
            <Text style={styles.title}>Buy Plan</Text>
            <Text style={styles.subtitle}>Get Daily Washes</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    justifyContent: "space-between",
    height: 120,
    shadowColor: "#000",
    shadowRadius: 10,
    elevation: 3,
  },
  guestButton: {
    backgroundColor: "#1C1C1C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50, // Capsule shape
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#C8F000",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 10,
    width: "100%",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
});
