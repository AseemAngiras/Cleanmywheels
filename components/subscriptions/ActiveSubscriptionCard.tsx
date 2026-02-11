import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ActiveSubscriptionCardProps {
  subscription: any;
}

export const ActiveSubscriptionCard = ({
  subscription,
}: ActiveSubscriptionCardProps) => {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const daysLeft = subscription.endDate
    ? Math.ceil(
        (new Date(subscription.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push(`/subscription/details/${subscription._id}` as any)
      }
      style={styles.container}
    >
      <LinearGradient
        colors={[Colors.card, Colors.card]}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.planName}>
                {subscription.plan?.name || "Premium Plan"}
              </Text>
              <Text style={styles.subId}>
                #{subscription._id.slice(-6).toUpperCase()}
              </Text>
            </View>
            <View style={styles.activeBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>ACTIVE</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>VEHICLE</Text>
              <Text style={styles.detailValue}>
                {subscription.vehicle?.vehicleType || "-"}
              </Text>
              <Text style={styles.detailSubValue}>
                {subscription.vehicle?.vehicleNo ||
                  subscription.vehicle?.number ||
                  "-"}
              </Text>
            </View>

            <View style={[styles.detailItem, { alignItems: "flex-end" }]}>
              <Text style={styles.detailLabel}>EXPIRES</Text>
              <Text style={styles.detailValue}>
                {formatDate(subscription.endDate)}
              </Text>
              <Text
                style={[
                  styles.detailSubValue,
                  { color: daysLeft < 5 ? "#EF4444" : "#64748B" },
                ]}
              >
                {daysLeft} days left
              </Text>
            </View>
          </View>

          <View style={styles.actionButton}>
            <Text style={styles.actionButtonText}>View Details</Text>
            <Ionicons name="arrow-forward" size={12} color={Colors.text} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  cardGradient: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  subId: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "monospace",
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(220, 252, 231, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#166534",
    marginRight: 6,
  },
  activeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#166534",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 2,
  },
  detailSubValue: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    backgroundColor: Colors.background,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
});
