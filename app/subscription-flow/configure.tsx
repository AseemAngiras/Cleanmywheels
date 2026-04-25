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
  View,
  Modal,
} from "react-native";
import { InteractivePressable } from "@/components/ui/InteractivePressable";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
} from "@/store/api/vehicleApi";
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
  useGetAddonsQuery,
} from "@/store/api/subscriptionApi";
import { useAlert } from "@/components/providers/AlertProvider";

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

const getPriceKey = (type: string) => {
  switch (type?.toLowerCase()?.replace(/\s+/g, "")) {
    case "hatchback":
      return "hatchback";
    case "sedan":
      return "sedan";
    case "suv":
      return "suv";
    case "twowheeler":
    case "bike":
      return "twoWheeler";
    default:
      return "sedan";
  }
};

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
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [startDate] = useState(new Date());

  const {showAlert} = useAlert();
  const { data: addonsData } = useGetAddonsQuery();
  const addons = addonsData || [];

  const selectedPlan = plans?.find((p) => p._id === planId);

  const filteredAddons = addons.filter((addon: any) => {
    // 1. Check by ID (New Architecture)
    const addonId = addon._id || addon.id;
    if (
      selectedPlan?.includedServiceIds?.some(
        (id: string) => String(id) === String(addonId),
      )
    ) {
      return false;
    }

    // 2. Fallback to Name Matching (Compatibility)
    if (!selectedPlan?.features) return true;
    return !selectedPlan.features.some(
      (feature: string) =>
        feature.toLowerCase().trim() === addon.name.toLowerCase().trim() ||
        feature.toLowerCase().includes(addon.name.toLowerCase()) ||
        addon.name.toLowerCase().includes(feature.toLowerCase()),
    );
  });

  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [newCarNo, setNewCarNo] = useState("");
  const [newCarType, setNewCarType] = useState("Sedan");

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

  const selectedVehicle = availableCars.find(
    (c: any) => c._id === selectedVehicleId,
  );
  const priceKey = getPriceKey(selectedVehicle?.vehicleType || "Sedan") as
    | "hatchback"
    | "sedan"
    | "suv"
    | "twoWheeler";

  const basePrice =
    selectedPlan?.prices?.[priceKey as keyof typeof selectedPlan.prices]?.[
      selectedFrequency as any
    ] ||
    selectedPlan?.price ||
    0;

  const frequencyData = selectedPlan?.frequencies?.find(
    (f) => f.type === selectedFrequency,
  ) || {
    multiplier: 1,
    services:
      selectedFrequency === "DAILY"
        ? 30
        : selectedFrequency === "WEEKLY"
          ? 4
          : selectedFrequency === "BIWEEKLY"
            ? 8
            : 15,
  };

  const totalAddonsCost = selectedAddons.reduce((sum, a) => {
    const frequencyPrice = a.priceMatrix?.[selectedFrequency];
    if (frequencyPrice && frequencyPrice > 0) {
      return sum + frequencyPrice;
    }
    const perServicePrice = a.subscriptionPrice || a.price || 0;
    return sum + perServicePrice;
  }, 0);

  const currentTotalPrice = Math.round(basePrice + totalAddonsCost);

  useEffect(() => {
    if (availableCars.length > 0 && !selectedVehicleId) {
    }
  }, [availableCars.length, selectedVehicleId]);

  useEffect(() => {
    if (selectedAddons.length > 0) {
      const validAddons = selectedAddons.filter((addon) =>
        filteredAddons.some((fa) => fa._id === addon._id),
      );
      if (validAddons.length !== selectedAddons.length) {
        setSelectedAddons(validAddons);
      }
    }
  }, [selectedPlan?._id, filteredAddons, selectedAddons]);

  const handleAddCar = async () => {
    if (!newCarNo.trim()) {
      Alert.alert("Invalid Input", "Please enter vehicle number");
      return;
    }

    const cleanedNo = newCarNo.trim().replace(/\s+/g, " ").toUpperCase();
    
    const standardRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
    const bhRegex = /^[0-9]{2}\s?BH\s?[0-9]{4}\s?[A-Z]{2}$/;

    if (!standardRegex.test(cleanedNo.replace(/\s+/g, "")) && !bhRegex.test(cleanedNo)) {
      showAlert({
        title:"Invalid Vehicle Number",
        message:"Please enter a valid format (e.g., MH01AB1234 or 22 BH 1234 AA).",
      });
      return;
    }

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
        addons: JSON.stringify(selectedAddons),
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
          <InteractivePressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </InteractivePressable>
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
                ₹{currentTotalPrice}
              </Text>
              <Text className="text-[14px] font-[700] color-primary/60 ml-2 uppercase">
                / {frequencyData.services} Services
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
                <InteractivePressable
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
                </InteractivePressable>
              ))}

              <InteractivePressable
                className="w-[48%] bg-card rounded-[24px] p-5 items-center border border-primary border-dashed justify-center "
                onPress={() => setShowAddCarModal(true)}
              >
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mb-2">
                  <Ionicons name="add" size={24} color={Colors.primary} />
                </View>
                <Text className="text-[13px] font-[700] color-primary text-center">
                  Add Vehicle
                </Text>
              </InteractivePressable>
            </View>
          )}
          <Text className="text-[18px] font-[700] color-text mb-4">
            Select Frequency
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {selectedPlan.frequencies?.map((freq) => (
              <InteractivePressable
                key={freq.type}
                className={`w-[48%] py-4 px-2 rounded-[18px] items-center border ${
                  selectedFrequency === freq.type
                    ? "bg-primary border-primary"
                    : "bg-card border-border"
                }`}
                onPress={() => setSelectedFrequency(freq.type)}
              >
                <Text
                  className={`text-[13px] font-[800] ${
                    selectedFrequency === freq.type ? "text-black" : "text-text"
                  }`}
                >
                  {freq.label}
                </Text>
                <Text
                  className={`text-[15px] font-[600] mb-2 ${
                    selectedFrequency === freq.type
                      ? "text-black/60"
                      : "text-textSecondary"
                  }`}
                >
                  {freq.services} services/month
                </Text>
              </InteractivePressable>
            ))}
          </View>
          {selectedPlan?.includedServiceIds &&
            selectedPlan.includedServiceIds.length > 0 && (
              <View className="mb-6">
                <Text className="text-[18px] font-[700] color-text mb-4">
                  Included in your Plan
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {selectedPlan.includedServiceIds.map((id: string) => {
                    const addon = addons.find(
                      (a: any) => String(a._id || a.id) === String(id),
                    );
                    if (!addon) return null;
                    return (
                      <View
                        key={`included-${id}`}
                        className="bg-primary/10 border border-primary/20 px-3 py-2 rounded-full flex-row items-center"
                      >
                        <MaterialCommunityIcons
                          name={(addon.icon as any) || "check-circle"}
                          size={14}
                          color={Colors.primary}
                        />
                        <Text className="text-primary text-[12px] font-[700] ml-1">
                          {addon.name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          极
          {filteredAddons.length > 0 && (
            <>
              <Text className="text-[18px] font-[700] color-text mb-4">
                Add Subscription Add-ons
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-8"
                contentContainerStyle={{ gap: 12 }}
              >
                {filteredAddons.map((addon: any) => {
                  const isSelected = selectedAddons.some(
                    (a) => a._id === addon._id,
                  );
                  const freqPrice = addon.priceMatrix?.[selectedFrequency];
                  const displayPrice =
                    freqPrice && freqPrice > 0
                      ? freqPrice
                      : addon.subscriptionPrice || addon.price || 0;

                  return (
                    <InteractivePressable
                      key={addon._id}
                      className={`w-40 p-4 rounded-[24px] border ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "bg-card border-border"
                      }`}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedAddons(
                            selectedAddons.filter((a) => a._id !== addon._id),
                          );
                        } else {
                          setSelectedAddons([...selectedAddons, addon]);
                        }
                      }}
                    >
                      <View
                        className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${
                          isSelected ? "bg-black/10" : "bg-primary/10"
                        }`}
                      >
                        <MaterialCommunityIcons
                          name={(addon.icon as any) || "sparkles"}
                          size={20}
                          color={isSelected ? "#000" : Colors.primary}
                        />
                      </View>
                      <Text
                        className={`text-[13px] font-[800] mb-1 ${
                          isSelected ? "text-black" : "text-text"
                        }`}
                        numberOfLines={1}
                      >
                        {addon.name}
                      </Text>
                      <Text
                        className={`text-[14px] font-[900] ${
                          isSelected ? "text-black" : "text-primary"
                        }`}
                      >
                        ₹{displayPrice}
                      </Text>
                    </InteractivePressable>
                  );
                })}
              </ScrollView>
            </>
          )}
          <Text className="text-[18px] font-[700] color-text mb-4">
            Select Time Slot
          </Text>
          <View className="flex-row flex-wrap justify-between gap-y-3 mb-8">
            {TIME_SLOTS.map((slot) => (
              <InteractivePressable
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
              </InteractivePressable>
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

        <View className="p-8 bg-card border-t border-border/50 shadow-2xl flex-row items-center justify-between">
          <View>
            <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-widest mb-1">
              {selectedPlan.name}
            </Text>
            <Text className="text-[20px] font-[900] color-primary">
              ₹{currentTotalPrice}
            </Text>
          </View>
          <InteractivePressable
            className="bg-primary px-8 py-4 rounded-2xl items-center shadow-lg shadow-primary/30"
            onPress={handleContinue}
          >
            <Text className="color-black text-[16px] font-[800]">Continue</Text>
          </InteractivePressable>
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
                onChangeText={(text) => setNewCarNo(text.replace(/[^a-zA-Z0-9\s]/g, "").toUpperCase())}
                autoCapitalize="characters"
                maxLength={13}
              />

              <Text className="text-[13px] font-[700] color-textSecondary mb-3 tracking-widest uppercase">
                Vehicle Type
              </Text>
              <View className="flex-row flex-wrap gap-2 mb-8">
                {VEHICLE_TYPES.map((type) => (
                  <InteractivePressable
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
                  </InteractivePressable>
                ))}
              </View>

              <View className="flex-row gap-4">
                <InteractivePressable
                  onPress={() => setShowAddCarModal(false)}
                  className="flex-1 py-4 bg-background border border-border rounded-2xl items-center"
                >
                  <Text className="text-[15px] font-[700] color-textSecondary">
                    Cancel
                  </Text>
                </InteractivePressable>
                <InteractivePressable
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
                </InteractivePressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}
