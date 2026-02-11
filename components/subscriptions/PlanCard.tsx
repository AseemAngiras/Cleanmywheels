import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
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
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={Colors.primary}
            />
            <Text style={styles.featureText} numberOfLines={1}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.selectBtn}>
        <Text style={styles.selectBtnText}>Select</Text>
        <Ionicons name="chevron-forward" size={14} color={Colors.black} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  popularBorder: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: "rgba(200, 240, 0, 0.1)",
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    alignSelf: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  popularText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.black,
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
    color: Colors.text,
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
    color: Colors.textSecondary,
    marginRight: 2,
  },
  price: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
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
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  selectBtn: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  selectBtnText: {
    color: Colors.black,
    fontSize: 12,
    fontWeight: "700",
  },
});
