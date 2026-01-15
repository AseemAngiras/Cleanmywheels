import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  NativeModules,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import {
  useCreateSubscriptionMutation,
  useGetPlansQuery,
  useVerifySubscriptionMutation,
} from "../../store/api/subscriptionApi";

const APP_NAME = "CleanMyWheels";
const RAZORPAY_KEY = "rzp_test_1234567890"; // REPLACE WITH ENV VAR

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const { data: plans, isLoading, error } = useGetPlansQuery();
  const [createSubscription, { isLoading: isCreating }] =
    useCreateSubscriptionMutation();
  const [verifySubscription] = useVerifySubscriptionMutation();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const handleSubscribe = (plan: any) => {
    router.push({
      pathname: "/subscription/configure",
      params: { planId: plan._id },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#84c95c" />
      </View>
    );
  }

  if (error) {
    console.error("Plans Load Error:", error);
    const errorMessage =
      (error as any)?.data?.message ||
      (error as any)?.error ||
      JSON.stringify(error);

    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load plans.</Text>
        <Text
          style={{
            marginBottom: 20,
            marginHorizontal: 20,
            textAlign: "center",
            color: "#666",
          }}
        >
          {errorMessage}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.btnSecondary}
        >
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        }}
        style={styles.heroHeader}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <SafeAreaView>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Premium Plans</Text>
          </View>
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Upgrade to Premium</Text>
            <Text style={styles.heroSubtitle}>
              Get unlimited washes and exclusive perks.
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {plans?.map((plan) => (
          <View key={plan._id} style={styles.planCard}>
            {/* Highlight Banner */}
            <View style={styles.popularBanner}>
              <Text style={styles.popularText}>MOST POPULAR</Text>
            </View>

            <View style={styles.planHeader}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                ₹{plan.price}
                <Text style={styles.planPeriod}>
                  {" "}
                  / {plan.durationDays} days
                </Text>
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.featuresList}>
              {plan.features?.map((feature, idx) => (
                <View key={idx} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#84c95c" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.subscribeBtn, isCreating && styles.disabledBtn]}
              onPress={() => handleSubscribe(plan)}
              disabled={isCreating}
            >
              {isCreating && selectedPlanId === plan._id ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.subscribeBtnText}>Subscribe Now</Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", marginBottom: 10 },
  heroHeader: { height: 260, width: "100%" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  backBtn: { padding: 8 },
  headerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  heroContent: { paddingHorizontal: 24, marginTop: 40 },
  heroTitle: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSubtitle: { color: "#EEE", fontSize: 16, lineHeight: 22 },
  scrollContent: { padding: 20, paddingBottom: 50, marginTop: -40 },
  planCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  popularBanner: {
    position: "absolute",
    top: 20,
    right: -30,
    backgroundColor: "#FFD700",
    paddingVertical: 5,
    paddingHorizontal: 30,
    transform: [{ rotate: "45deg" }],
    zIndex: 1,
  },
  popularText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  planHeader: { marginBottom: 16 },
  planName: { fontSize: 20, fontWeight: "600", color: "#333", marginBottom: 8 },
  planPrice: { fontSize: 36, fontWeight: "bold", color: "#1a1a1a" },
  planPeriod: { fontSize: 16, color: "#666", fontWeight: "400" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 16 },
  featuresList: { marginBottom: 24 },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: { marginLeft: 12, fontSize: 15, color: "#444" },
  subscribeBtn: {
    backgroundColor: "#1a1a1a",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  disabledBtn: { opacity: 0.7 },
  subscribeBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  btnSecondary: {
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
  },
});
