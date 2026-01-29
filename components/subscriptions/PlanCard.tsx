import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PlanCardProps {
  plan: any;
  onSubscribe: (plan: any) => void;
  isPopular?: boolean;
}

export const PlanCard = ({
  plan,
  onSubscribe,
  isPopular = false,
}: PlanCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onSubscribe(plan)}
      style={[styles.container, isPopular && styles.popularBorder]}
    >
      {isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>BEST VALUE</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.planName}>{plan.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.price}>{plan.price}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.features}>
        {plan.features?.slice(0, 3).map((feature: string, idx: number) => (
          <View key={idx} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={14} color="#65A30D" />
            <Text style={styles.featureText} numberOfLines={1}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.selectBtn}>
        <Text style={styles.selectBtnText}>Select</Text>
        <Ionicons name="chevron-forward" size={14} color="#FFF" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  popularBorder: {
    borderColor: "#84CC16",
    borderWidth: 1.5,
    backgroundColor: "#F7FEE7",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    backgroundColor: "#84CC16",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  popularText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 0.5,
  },
  header: {
    alignItems: "center",
    marginBottom: 12,
    marginTop: 4,
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
  },
  currency: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    marginRight: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    width: "100%",
    marginBottom: 12,
  },
  features: {
    gap: 8,
    flex: 1,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    marginLeft: 6,
    color: "#475569",
    fontSize: 12,
    fontWeight: "500",
  },
  selectBtn: {
    marginTop: 16,
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  selectBtnText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
