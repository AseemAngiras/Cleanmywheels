import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
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
} from "@/store/api/vehicleApi";
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
} from "@/store/api/subscriptionApi";

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
  const [selectedFrequency, setSelectedFrequency] = useState<string>("DAILY");
  const [startDate] = useState(new Date());

  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [newCarNo, setNewCarNo] = useState("");
  const [newCarType, setNewCarType] = useState("Sedan");

  const selectedPlan = plans?.find((p) => p._id === planId);

  const activeVehicleIds = new Set();

  if (subscriptions) {
    subscriptions.forEach((sub: any) => {
      if (sub.status === "active") {
        const vId = sub.vehicle?._id || sub.vehicle;
        if (vId) activeVehicleIds.add(String(vId));
      }
    });
  }

  const availableCars =
    cars?.filter((car: any) => !activeVehicleIds.has(String(car._id))) || [];

  useEffect(() => {
    if (availableCars.length > 0 && !selectedVehicleId) {
    }
  }, [availableCars.length, selectedVehicleId]);

  const handleAddCar = async () => {
    if (!newCarNo.trim()) {
      Alert.alert("Invalid Input", "Please enter vehicle number");
      return;
    }

    const cleanedNo = newCarNo.trim().replace(/\s+/g, "").toUpperCase();

    const isDuplicate = cars?.some((car: any) => {
      const existingNo = (car.vehicleNo || car.number || "")
        .trim()
        .replace(/\s+/g, "")
        .toUpperCase();
      const existingType = car.vehicleType || car.type;

      return existingNo === cleanedNo && existingType === newCarType;
    });

    if (isDuplicate) {
      Alert.alert(
        "Duplicate Vehicle",
        `A ${newCarType} with number ${cleanedNo} is already in your garage.`,
      );
      return;
    }

    try {
      const result = await createVehicle({
        vehicleNo: cleanedNo,
        vehicleType: newCarType,
        isDefault: false,
      }).unwrap();

      setShowAddCarModal(false);
      setNewCarNo("");
      setNewCarType("Sedan");

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
      pathname: "/subscription-flow/summary",
      params: {
        planId: selectedPlan._id,
        vehicleId: selectedVehicleId,
        timeSlot: selectedTimeSlot,
        startDate: startDate.toISOString(),
        isAutoPay: "true",
        frequencyType: selectedFrequency,
      },
    } as any);
  };

  if (!selectedPlan) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-6 bg-card border-b border-border/50">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text className="text-[20px] font-[700] color-text ml-4">
            Configure Plan
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
        >
          <View className="bg-primary/10 p-5 rounded-[24px] mb-8 border border-primary/20">
            <Text className="text-[18px] font-[800] color-primary mb-1">
              {selectedPlan.name}
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-[22px] font-[900] color-primary">
                ₹{Math.round(
                  selectedPlan.price *
                    (selectedPlan.frequencies?.find(
                      (f) => f.type === selectedFrequency,
                    )?.multiplier || 1),
                )}
              </Text>
              <Text className="text-[14px] font-[700] color-primary/60 ml-2 uppercase">
                /{" "}
                {selectedPlan.frequencies?.find(
                  (f) => f.type === selectedFrequency,
                )?.label || "Month"}
              </Text>
            </View>
          </View>

          <Text className="text-[18px] font-[700] color-text mb-4">
            Select Vehicle
          </Text>
          {isLoadingCars ? (
            <ActivityIndicator color={Colors.primary} className="my-5" />
          ) : (
            <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
              {availableCars.map((car: any) => (
                <TouchableOpacity
                  key={car._id}
                  className={`w-[48%] rounded-[24px] p-5 items-center border ${
                    selectedVehicleId === car._id
                      ? "bg-primary border-primary"
                      : "bg-card border-border"
                  }`}
                  onPress={() => setSelectedVehicleId(car._id)}
                >
                  <MaterialCommunityIcons
                    name={getVehicleIconName(car.vehicleType) as any}
                    size={42}
                    color={
                      selectedVehicleId === car._id
                        ? "#000"
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    className={`text-[14px] font-[700] mt-3 tracking-tight ${
                      selectedVehicleId === car._id ? "text-black" : "text-text"
                    }`}
                  >
                    {car.vehicleType}
                  </Text>
                  <Text
                    className={`text-[12px] font-[600] mt-1 ${
                      selectedVehicleId === car._id
                        ? "text-black/70"
                        : "text-textSecondary"
                    }`}
                  >
                    {car.vehicleNo}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                className="w-[48%] bg-card rounded-[24px] p-5 items-center border border-primary border-dashed justify-center "
                onPress={() => setShowAddCarModal(true)}
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Ionicons name="add" size={24} color={Colors.primary} />
                </View>
                <Text className="text-[13px] font-[700] color-primary text-center">
                  Add Vehicle
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <Text className="text-[18px] font-[700] color-text mb-4">
            Select Time Slot
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-3 mb-8">
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot}
                className={`w-[48%] py-4 rounded-[18px] items-center border ${
                  selectedTimeSlot === slot
                    ? "bg-primary border-primary"
                    : "bg-card border-border"
                }`}
                onPress={() => setSelectedTimeSlot(slot)}
              >
                <Text
                  className={`text-[13px] font-[700] ${
                    selectedTimeSlot === slot
                      ? "text-black"
                      : "text-textSecondary"
                  }`}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-[18px] font-[700] color-text mb-4">
            Duration
          </Text>
          <View className="flex-row items-center bg-card p-5 rounded-[24px] border border-border mb-10">
            <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-4">
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.primary}
              />
            </View>
            <Text className="text-[14px] color-textSecondary font-[500] flex-1">
              Valid for 30 days starting{" "}
              <Text className="color-text font-[700]">
                {new Date().toLocaleDateString("en-IN")}
              </Text>
            </Text>
          </View>

          <View className="h-10" />
        </ScrollView>

        <View className="p-10 bg-card border-t border-border/50 shadow-2xl">
          <TouchableOpacity
            className="bg-primary py-5 rounded-2xl items-center shadow-lg shadow-primary/30"
            onPress={handleContinue}
          >
            <Text className="color-black text-[16px] font-[800]">
              Continue to Summary
            </Text>
          </TouchableOpacity>
        </View>

        {/* ADD CAR MODAL */}
        <Modal visible={showAddCarModal} transparent animationType="fade">
          <View className="flex-1 bg-black/60 justify-center px-6">
            <View className="bg-card rounded-[32px] p-6 shadow-2xl border border-border">
              <Text className="text-[22px] font-[800] color-text mb-6 text-center">
                Add New Vehicle
              </Text>

              <Text className="text-[13px] font-[700] color-textSecondary mb-2 tracking-widest uppercase">
                Vehicle Number
              </Text>
              <TextInput
                className="bg-background border border-border rounded-2xl p-4 text-[16px] color-text mb-6"
                placeholder="MH01AB1234"
                placeholderTextColor={Colors.textSecondary}
                value={newCarNo}
                onChangeText={setNewCarNo}
                autoCapitalize="characters"
              />

              <Text className="text-[13px] font-[700] color-textSecondary mb-3 tracking-widest uppercase">
                Vehicle Type
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-8">
                {VEHICLE_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    className={`py-2.5 px-5 rounded-full border ${
                      newCarType === type
                        ? "bg-primary border-primary"
                        : "bg-background border-border"
                    }`}
                    onPress={() => setNewCarType(type)}
                  >
                    <Text
                      className={`text-[12px] font-[700] ${
                        newCarType === type
                          ? "text-black"
                          : "text-textSecondary"
                      }`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setShowAddCarModal(false)}
                  className="flex-1 py-4 bg-background border border-border rounded-2xl items-center"
                >
                  <Text className="text-[15px] font-[700] color-textSecondary">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddCar}
                  className="flex-1 py-4 bg-primary rounded-2xl items-center shadow-md shadow-primary/20"
                  disabled={isAddingCar}
                >
                  {isAddingCar ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-[15px] font-[700] color-black">
                      Save Vehicle
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}
