import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { useAppSelector } from "../../store/hooks";
import {
  useCreateSubscriptionMutation,
  useGetPlansQuery,
  useVerifySubscriptionMutation,
} from "../../store/api/subscriptionApi";

const APP_NAME = "CleanMyWheels";
const RAZORPAY_KEY = process.env.RAZORPAY_KEY_ID || "";

const TIME_SLOTS = [
  "6 AM - 7 AM",
  "7 AM - 8 AM",
  "8 AM - 9 AM",
  "9 AM - 10 AM",
  "4 PM - 5 PM",
  "5 PM - 6 PM",
  "6 PM - 7 PM",
  "7 PM - 8 PM",
];

export default function SubscriptionConfigureScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams();
  const { data: plans } = useGetPlansQuery();
  const cars = useAppSelector((state) => state.user.cars);
  const isLoadingCars = false;

  const [createSubscription, { isLoading: isCreating }] =
    useCreateSubscriptionMutation();
  const [verifySubscription] = useVerifySubscriptionMutation();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date());

  const selectedPlan = plans?.find((p) => p._id === planId);

  const handlePayment = async () => {
    if (!selectedVehicleId || !selectedTimeSlot) {
      Alert.alert("Missing Details", "Please select a vehicle and time slot.");
      return;
    }

    if (!selectedPlan) return;

    try {
      // 1. Create Order
      const response = await createSubscription({
        planId: selectedPlan._id,
      }).unwrap();
      const { id: orderId, amount, currency } = response;

      // 2. Open Razorpay
      if (!NativeModules.RazorpayCheckout) {
        // Simulation Flow
        Alert.alert("Development Mode", "Simulate successful payment?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Simulate Pay",
            onPress: async () => {
              try {
                await verifySubscription({
                  razorpay_payment_id:
                    "pay_mock_" + Math.floor(Math.random() * 1000000),
                  razorpay_order_id: orderId,
                  razorpay_signature: "mock_signature_dev_bypass",
                  planId: selectedPlan._id,
                  vehicleId: selectedVehicleId,
                  timeSlot: selectedTimeSlot,
                  startDate: startDate.toISOString(),
                }).unwrap();

                Alert.alert("Success", "Welcome to Premium!", [
                  {
                    text: "OK",
                    onPress: () => router.replace("/(tabs)/profile"),
                  },
                ]);
              } catch (e: any) {
                Alert.alert("Simulation Error", e?.data?.message || "Failed");
              }
            },
          },
        ]);
        return;
      }

      const options = {
        description: `Subscription for ${selectedPlan.name}`,
        image: "https://your-logo-url.png",
        currency: currency || "INR",
        key: RAZORPAY_KEY,
        amount: amount,
        name: APP_NAME,
        order_id: orderId,
        theme: { color: "#84c95c" },
      };

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          try {
            await verifySubscription({
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              razorpay_signature: data.razorpay_signature,
              planId: selectedPlan._id,
              vehicleId: selectedVehicleId,
              timeSlot: selectedTimeSlot,
              startDate: startDate.toISOString(),
            }).unwrap();

            Alert.alert("Success", "Welcome to Premium!", [
              { text: "OK", onPress: () => router.replace("/(tabs)/profile") },
            ]);
          } catch (verifyErr) {
            console.error(verifyErr);
            Alert.alert("Error", "Payment verification failed.");
          }
        })
        .catch((error: any) => {
          if (error.code !== 0) {
            Alert.alert("Error", `Payment failed: ${error.description}`);
          }
        });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.data?.message || "Failed to initiate subscription"
      );
    }
  };

  if (!selectedPlan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#84c95c" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configure Subscription</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.planSummary}>
          <Text style={styles.planName}>{selectedPlan.name}</Text>
          <Text style={styles.planPrice}>₹{selectedPlan.price} / 30 days</Text>
        </View>

        <Text style={styles.sectionTitle}>Select Vehicle</Text>
        {isLoadingCars ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.optionsGrid}>
            {cars?.map((car) => (
              <TouchableOpacity
                key={car.id}
                style={[
                  styles.optionCard,
                  selectedVehicleId === car.id && styles.selectedOption,
                ]}
                onPress={() => setSelectedVehicleId(car.id)}
              >
                <Ionicons
                  name="car-sport"
                  size={24}
                  color={selectedVehicleId === car.id ? "#FFF" : "#666"}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedVehicleId === car.id && styles.selectedText,
                  ]}
                >
                  {car.name}
                </Text>
                <Text
                  style={[
                    styles.subText,
                    selectedVehicleId === car.id && styles.selectedText,
                  ]}
                >
                  {car.number}
                </Text>
              </TouchableOpacity>
            ))}
            {(!cars || cars.length === 0) && (
              <Text style={styles.emptyText}>
                No cars found. Please add a car in your profile.
              </Text>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Select Time Slot</Text>
        <View style={styles.timeSlotGrid}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeSlotChip,
                selectedTimeSlot === slot && styles.selectedTimeChip,
              ]}
              onPress={() => setSelectedTimeSlot(slot)}
            >
              <Text
                style={[
                  styles.timeSlotText,
                  selectedTimeSlot === slot && styles.selectedTimeText,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Start Date -  Simplified to "Starting Tomorrow" for MVP or static display for now to keep UI simple
            unless user needs a picker. User asked "month selection" - subscription implies 30 days from start.
            Let's clarify "Starts From: Tomorrow" */}
        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.dateCard}>
          <Ionicons name="calendar" size={20} color="#666" />
          <Text style={styles.dateText}>
            Valid for 30 days starting {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, isCreating && styles.disabledBtn]}
          onPress={handlePayment}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payBtnText}>
              Proceed to Pay ₹{selectedPlan.price}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 16 },
  content: { padding: 20 },
  planSummary: {
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  planName: { fontSize: 18, fontWeight: "bold", color: "#2e7d32" },
  planPrice: { fontSize: 16, color: "#1b5e20", marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 12,
    color: "#333",
  },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  optionCard: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedOption: { backgroundColor: "#84c95c", borderColor: "#84c95c" },
  selectedText: { color: "#FFF" },
  optionText: { marginTop: 8, fontWeight: "600", textAlign: "center" },
  subText: { fontSize: 12, color: "#666", marginTop: 4 },
  emptyText: { color: "#666", fontStyle: "italic" },
  optionsList: { gap: 10 },
  timeSlotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeSlotChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minWidth: "45%",
    alignItems: "center",
  },
  selectedTimeChip: {
    backgroundColor: "#84c95c",
    borderColor: "#84c95c",
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  selectedTimeText: {
    color: "#FFF",
  },
  slotText: { fontSize: 14, fontWeight: "500" },
  dateCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
  },
  dateText: { fontSize: 14, color: "#333" },
  footer: {
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  payBtn: {
    backgroundColor: "#1a1a1a",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  payBtnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  disabledBtn: { opacity: 0.7 },
});
