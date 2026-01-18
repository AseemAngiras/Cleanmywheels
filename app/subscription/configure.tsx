import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
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
  Modal,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
} from "../../store/api/vehicleApi";
import {
  useCreateSubscriptionMutation,
  useGetPlansQuery,
  useVerifySubscriptionMutation,
  useGetMySubscriptionQuery,
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

const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Other"];

export default function SubscriptionConfigureScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams();
  const { data: plans } = useGetPlansQuery();
  const { data: cars, isLoading: isLoadingCars } = useGetVehiclesQuery();
  const { data: subscriptions } = useGetMySubscriptionQuery();

  const [createVehicle, { isLoading: isAddingCar }] =
    useCreateVehicleMutation();

  const [createSubscription, { isLoading: isCreating }] =
    useCreateSubscriptionMutation();
  const [verifySubscription] = useVerifySubscriptionMutation();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date());

  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [newCarNo, setNewCarNo] = useState("");
  const [newCarType, setNewCarType] = useState("Sedan");

  const selectedPlan = plans?.find((p) => p._id === planId);

  const activeVehicleIds = new Set();

  if (subscriptions) {
    subscriptions.forEach((sub: any) => {
      const vId = sub.vehicle?._id || sub.vehicle;
      if (vId) activeVehicleIds.add(String(vId));
    });
  }

  const availableCars =
    cars?.filter((car: any) => !activeVehicleIds.has(String(car._id))) || [];

  useEffect(() => {
    if (availableCars.length > 0 && !selectedVehicleId) {
    }
  }, [availableCars.length]);

  const handleAddCar = async () => {
    if (!newCarNo.trim()) {
      Alert.alert("Invalid Input", "Please enter vehicle number");
      return;
    }

    try {
      const result = await createVehicle({
        vehicleNo: newCarNo.toUpperCase(),
        vehicleType: newCarType,
        isDefault: false,
        status: "active",
      }).unwrap();

      setShowAddCarModal(false);
      setNewCarNo("");
      setNewCarType("SEDAN");

      if (result?._id) {
        setSelectedVehicleId(result._id);
      }
      Alert.alert("Success", "Vehicle added successfully!");
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message || "Failed to add vehicle");
    }
  };

  const handlePayment = async () => {
    if (!selectedVehicleId || !selectedTimeSlot) {
      Alert.alert("Missing Details", "Please select a vehicle and time slot.");
      return;
    }

    if (!selectedPlan) return;

    try {
      const response = await createSubscription({
        planId: selectedPlan._id,
        vehicleId: selectedVehicleId,
        timeSlot: selectedTimeSlot,
        startDate: startDate.toISOString(),
      }).unwrap();

      const { subscriptionId, paymentLinkUrl, id: orderId } = response;

      if (paymentLinkUrl) {
        router.push({
          pathname: "/(tabs)/home/book-doorstep/payment-webview",
          params: {
            url: paymentLinkUrl,
            bookingId: subscriptionId,
            type: "SUBSCRIPTION",
          },
        } as any);
        return;
      }

      const options = {
        description: `Subscription for ${selectedPlan.name}`,
        image: "https://your-logo-url.png",
        currency: "INR",
        key: RAZORPAY_KEY,
        amount: response.amount,
        name: APP_NAME,
        order_id: orderId,
        theme: { color: "#84c95c" },
      };

      if (!NativeModules.RazorpayCheckout) {
        Alert.alert(
          "Error",
          "Native Payment Module Missing and no Web Link provided.",
        );
        return;
      }

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
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
        })
        .catch((error: any) => {
          // ...
          console.log(error);
        });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.data?.message || "Failed to initiate subscription",
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
            {availableCars.map((car) => (
              <TouchableOpacity
                key={car._id}
                style={[
                  styles.optionCard,
                  selectedVehicleId === car._id && styles.selectedOption,
                ]}
                onPress={() => setSelectedVehicleId(car._id)}
              >
                <Ionicons
                  name="car-sport"
                  size={24}
                  color={selectedVehicleId === car._id ? "#FFF" : "#666"}
                />
                <Text
                  style={[
                    styles.optionText,
                    selectedVehicleId === car._id && styles.selectedText,
                  ]}
                >
                  {car.vehicleType}
                </Text>
                <Text
                  style={[
                    styles.subText,
                    selectedVehicleId === car._id && styles.selectedText,
                  ]}
                >
                  {car.vehicleNo}
                </Text>
              </TouchableOpacity>
            ))}

            {/* ADD NEW CAR BUTTON */}
            <TouchableOpacity
              style={[styles.optionCard, styles.addCarCard]}
              onPress={() => setShowAddCarModal(true)}
            >
              <Ionicons name="add-circle-outline" size={28} color="#84c95c" />
              <Text style={[styles.optionText, { color: "#84c95c" }]}>
                Add New Car
              </Text>
            </TouchableOpacity>
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

      {/* ADD CAR MODAL */}
      <Modal visible={showAddCarModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Vehicle</Text>

            <Text style={styles.label}>Vehicle Number</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. MH01AB1234"
              value={newCarNo}
              onChangeText={setNewCarNo}
              autoCapitalize="characters"
            />

            <Text style={styles.label}>Vehicle Type</Text>
            <View style={styles.vehicleTypeGrid}>
              {VEHICLE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    newCarType === type && styles.selectedTypeChip,
                  ]}
                  onPress={() => setNewCarType(type)}
                >
                  <Text
                    style={[
                      styles.typeText,
                      newCarType === type && styles.selectedTypeText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowAddCarModal(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddCar}
                style={styles.saveBtn}
                disabled={isAddingCar}
              >
                {isAddingCar ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Vehicle</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  addCarCard: {
    borderColor: "#84c95c",
    borderStyle: "dashed",
    justifyContent: "center",
  },
  selectedOption: { backgroundColor: "#84c95c", borderColor: "#84c95c" },
  selectedText: { color: "#FFF" },
  optionText: {
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 12,
  },
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
  },
  vehicleTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  selectedTypeChip: {
    backgroundColor: "#84c95c",
  },
  typeText: { fontSize: 12, fontWeight: "600", color: "#666" },
  selectedTypeText: { color: "#FFF" },

  modalActions: {
    flexDirection: "row",
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#f0f0f0",
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { fontWeight: "600", color: "#333" },
  saveBtnText: { fontWeight: "600", color: "#FFF" },
});
