import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
} from "../../store/api/vehicleApi";
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
} from "../../store/api/subscriptionApi";

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

const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Two Wheeler"];

const getVehicleIconName = (type: string) => {
  switch (type?.toLowerCase()) {
    case "hatchback":
      return "car-hatchback";
    case "sedan":
      return "car-side";
    case "suv":
      return "car-estate";
    case "two wheeler":
    case "bike":
      return "motorbike";
    default:
      return "car";
  }
};

export default function SubscriptionConfigureScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams();
  const { data: plans } = useGetPlansQuery();
  const { data: cars, isLoading: isLoadingCars } = useGetVehiclesQuery();
  const { data: subscriptions } = useGetMySubscriptionQuery();

  const [createVehicle, { isLoading: isAddingCar }] =
    useCreateVehicleMutation();

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(
    null,
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [startDate] = useState(new Date());

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
      // Logic if needed
    }
  }, [availableCars.length, selectedVehicleId]);

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
      }).unwrap();

      setShowAddCarModal(false);
      setNewCarNo("");
      setNewCarType("SEDAN");

      setNewCarType("SEDAN");

      const createdVehicle = result?.data || result;
      if (createdVehicle?._id) {
        setSelectedVehicleId(createdVehicle._id);
      }
      Alert.alert("Success", "Vehicle added successfully!");
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message || "Failed to add vehicle");
    }
  };

  const handleContinue = () => {
    if (!selectedVehicleId || !selectedTimeSlot) {
      Alert.alert("Missing Details", "Please select a vehicle and time slot.");
      return;
    }

    if (!selectedPlan) return;

    router.push({
      pathname: "/subscription/summary",
      params: {
        planId: selectedPlan._id,
        vehicleId: selectedVehicleId,
        timeSlot: selectedTimeSlot,
        startDate: startDate.toISOString(),
        isAutoPay: "true",
      },
    });
  };

  if (!selectedPlan) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#84c95c" />
      </View>
    );
  }

  return (
    <ScreenWrapper style={styles.container} backgroundColor={Colors.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
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
                <MaterialCommunityIcons
                  name={getVehicleIconName(car.vehicleType) as any}
                  size={46}
                  color={
                    selectedVehicleId === car._id
                      ? Colors.black
                      : Colors.textSecondary
                  }
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
              <Ionicons
                name="add-circle-outline"
                size={28}
                color={Colors.primary}
              />
              <Text style={[styles.optionText, { color: Colors.primary }]}>
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
          <Ionicons name="calendar" size={20} color={Colors.textSecondary} />
          <Text style={styles.dateText}>
            Valid for 30 days starting {new Date().toLocaleDateString()}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handleContinue}>
          <Text style={styles.payBtnText}>Continue to Summary</Text>
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    color: Colors.text,
  },
  content: { padding: 20 },
  planSummary: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  planName: { fontSize: 18, fontWeight: "bold", color: Colors.success },
  planPrice: { fontSize: 16, color: Colors.success, marginTop: 4 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 12,
    color: Colors.text,
  },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  optionCard: {
    width: "48%",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    marginBottom: 8,
  },
  addCarCard: {
    borderColor: Colors.primary,
    borderStyle: "dashed",
    justifyContent: "center",
  },
  selectedOption: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectedText: { color: Colors.black },
  optionText: {
    marginTop: 8,
    fontWeight: "600",
    textAlign: "center",
    fontSize: 12,
    color: Colors.text,
  },
  subText: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  emptyText: { color: Colors.textSecondary, fontStyle: "italic" },
  optionsList: { gap: 10 },
  timeSlotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  timeSlotChip: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: "45%",
    alignItems: "center",
  },
  selectedTimeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  selectedTimeText: {
    color: Colors.black,
  },
  slotText: { fontSize: 14, fontWeight: "500" },
  dateCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
  },
  dateText: { fontSize: 14, color: Colors.text },
  footer: {
    padding: 20,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  payBtn: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  payBtnText: { color: Colors.black, fontSize: 16, fontWeight: "bold" },
  disabledBtn: { opacity: 0.7 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.text,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: Colors.background,
    color: Colors.text,
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
    backgroundColor: Colors.background,
  },
  selectedTypeChip: {
    backgroundColor: Colors.primary,
  },
  typeText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
  selectedTypeText: { color: Colors.black },

  modalActions: {
    flexDirection: "row",
    gap: 16,
  },
  cancelBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 12,
    alignItems: "center",
  },
  saveBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: { fontWeight: "600", color: Colors.text },
  saveBtnText: { fontWeight: "600", color: Colors.black },
});
