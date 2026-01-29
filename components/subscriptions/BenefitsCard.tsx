import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface BenefitsCardProps {
  onExplore: () => void;
}

export const BenefitsCard = ({ onExplore }: BenefitsCardProps) => {
  const benefits = [
    {
      icon: "water",
      title: "Daily Car Wash",
      desc: "Expert cleaning every morning",
    },
    {
      icon: "sparkles",
      title: "Monthly Polishing",
      desc: "Keep your car looking showroom new",
    },
    {
      icon: "shield-checkmark",
      title: "Premium Care",
      desc: "Eco-friendly products & towels",
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={styles.card}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="car-sport" size={28} color="#0F172A" />
            </View>
            <View>
              <Text style={styles.title}>Premium Car Care</Text>
              <Text style={styles.subtitle}>
                Daily service at your doorstep
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.benefitsList}>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <View style={styles.benefitIconBox}>
                  <Ionicons
                    name={benefit.icon as any}
                    size={18}
                    color="#0F172A"
                  />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={onExplore}
            activeOpacity={0.9}
          >
            <Text style={styles.btnText}>View Plans</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
    backgroundColor: "#FFF",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 20,
  },
  benefitsList: {
    gap: 16,
    marginBottom: 24,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  benefitIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 1,
  },
  benefitDesc: {
    fontSize: 12,
    color: "#64748B",
  },
  exploreBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
