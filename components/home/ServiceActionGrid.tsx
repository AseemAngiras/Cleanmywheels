import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface ServiceActionGridProps {
  isLoggedIn: boolean;
  hasActiveSubscription?: boolean;
}

export const ServiceActionGrid = ({
  isLoggedIn,
  hasActiveSubscription,
}: ServiceActionGridProps) => {
  const router = useRouter();

  const handleBookPress = () => {
    router.push("/(tabs)/home/book-doorstep/enter-location");
  };

  const handleSubPress = () => {
    if (hasActiveSubscription) {
      router.push("/subscription/addons");
    } else {
      router.push("/(tabs)/subscriptions");
    }
  };

  return (
    <View style={styles.container}>
      {/* Primary: Book Wash */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handleBookPress}
        style={[styles.touchable, styles.primaryCard]}
      >
        <LinearGradient
          colors={["#1A1A1A", "#111111"]}
          style={styles.cardContent}
        >
          <View style={styles.textContainer}>
            <Text style={styles.label}>DISPATCH</Text>
            <Text style={styles.title}>BOOK A{"\n"}WASH</Text>
          </View>

          <View style={styles.actionButton}>
            <Ionicons name="flash" size={24} color="#000" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Secondary: Subscription - Only if logged in */}
      {isLoggedIn && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSubPress}
          style={[styles.touchable, styles.secondaryCard]}
        >
          <LinearGradient
            colors={["#1A1A1A", "#111111"]}
            style={styles.cardContent}
          >
            <View style={styles.textContainer}>
              <Text style={styles.label}>
                {hasActiveSubscription ? "UPGRADE" : "MEMBERSHIP"}
              </Text>
              <Text style={styles.titleSmall}>
                {hasActiveSubscription ? "ADD-ONS" : "BUY PLAN"}
              </Text>
            </View>

            <View style={[styles.actionButton, styles.secondaryBtn]}>
              <Ionicons
                name={hasActiveSubscription ? "add" : "star"}
                size={20}
                color="#000"
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 20,
    flexDirection: "row",
    gap: 12,
  },
  touchable: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    height: 140,
  },
  primaryCard: {
    flex: 1.2,
  },
  secondaryCard: {
    flex: 0.8,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#333",
    justifyContent: "space-between",
  },
  textContainer: {},
  label: {
    color: "#C8F000",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  titleSmall: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#C8F000",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    shadowColor: "#C8F000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  secondaryBtn: {
    backgroundColor: "#FFF",
    shadowColor: "#FFF",
  },
});
