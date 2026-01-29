import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export const WhyChooseUs = () => {
  const features = [
    {
      icon: "shield-checkmark",
      title: "Trusted Partners",
      desc: "Verified & trained professionals",
      color: "#4F46E5",
      bg: "#EEF2FF",
    },
    {
      icon: "leaf",
      title: "Eco-Friendly",
      desc: "Waterless cleaning solutions",
      color: "#16A34A",
      bg: "#F0FDF4",
    },
    {
      icon: "time",
      title: "On Time",
      desc: "Punctual service guarantee",
      color: "#D97706",
      bg: "#FFFBEB",
    },
    {
      icon: "wallet",
      title: "Best Prices",
      desc: "Affordable subscription plans",
      color: "#0891B2",
      bg: "#ECFEFF",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Why Choose Us?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {features.map((item, index) => (
          <View key={index} style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginHorizontal: 20,
    marginBottom: 16,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    width: 140,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    alignItems: "flex-start",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  desc: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 14,
  },
});
