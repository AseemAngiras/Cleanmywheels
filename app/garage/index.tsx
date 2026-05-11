import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { toast } from "@/utils/toast";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Keyboard,
  LayoutAnimation,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from "react-native";
import { useAlert } from "@/components/providers/AlertProvider";
import { InteractivePressable } from "@/components/ui/InteractivePressable";

import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useGetVehiclesQuery,
  useUpdateVehicleMutation,
} from "../../store/api/vehicleApi";
import { useGetMySubscriptionQuery } from "../../store/api/subscriptionApi";

import { RootState } from "@/store";
import { useSelector } from "react-redux";
import AdminSubscriptionsScreen from "../(tabs)/admin/subscriptions";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { CarItem } from "@/components/CarItem";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MyCarsScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  const { data: cars = [], isLoading: isLoadingCars } = useGetVehiclesQuery(
    undefined,
    {
      skip: isAdmin,
    },
  );
  const { data: subscriptions } = useGetMySubscriptionQuery(undefined, {
    skip: isAdmin,
  });

  const [createVehicle] = useCreateVehicleMutation();
  const [updateVehicle] = useUpdateVehicleMutation();
  const [deleteVehicle] = useDeleteVehicleMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [type, setType] = useState("");
  const [number, setNumber] = useState("");
  const [expandedCarId, setExpandedCarId] = useState<string | null>(null);

  if (isAdmin) return <AdminSubscriptionsScreen />;

  const toggleCard = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCarId(expandedCarId === id ? null : id);
  };

  const openModal = (car?: any) => {
    if (car) {
      setEditingCarId(car._id || car.id);
      setType(car.vehicleType || car.type);
      setNumber(car.vehicleNo || car.number);
    } else {
      setEditingCarId(null);
      setType("");
      setNumber("");
    }
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeModal = (callback?: () => void) => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      if (typeof callback === "function") callback();
    });
  };

  const handleNumberChange = (value: string) => {
    const filtered = value.replace(/[^a-zA-Z0-9\s]/gi, "").toUpperCase();
    setNumber(filtered);
  };

  const handleSaveCar = async () => {
    if (!type || !number) {
      showAlert({
        title: "Error",
        message: "Vehicle type and number are required",
        type: "warning",
      });
      return;
    }
    const cleanedNumber = number.trim().replace(/\s+/g, " ").toUpperCase();

    const standardRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
    const bhRegex = /^[0-9]{2}\s?BH\s?[0-9]{4}\s?[A-Z]{2}$/;

    if (!standardRegex.test(cleanedNumber.replace(/\s+/g, "")) && !bhRegex.test(cleanedNumber)) {
      showAlert({
        title: "Invalid Number",
        message: "Please enter a valid format (e.g. MH01AB1234 or 22 BH 1234 AA)",
        type: "warning",
      });
      return;
    }

    const isDuplicate = cars.some((car: any) => {
      const carId = car._id || car.id;
      if (editingCarId && carId === editingCarId) return false;

      const existingNo = (car.vehicleNo || car.number || "")
        .trim()
        .replace(/\s+/g, "")
        .toUpperCase();
      const existingType = car.vehicleType || car.type;

      return existingNo === cleanedNumber && existingType === type;
    });

    if (isDuplicate) {
      showAlert({
        title: "Duplicate Vehicle",
        message: `A ${type} with number ${cleanedNumber} is already in your garage.`,
        type: "info",
      });
      return;
    }

    const payload = {
      vehicleType: type,
      vehicleNo: cleanedNumber,
      isDefault: false,
    };
    try {
      if (editingCarId)
        await updateVehicle({ id: editingCarId, data: payload }).unwrap();
      else await createVehicle(payload).unwrap();

      closeModal(() => {
        toast.success(
          "Success",
          `Vehicle ${editingCarId ? "updated" : "added"} successfully`,
        );
      });
    } catch (err: any) {
      console.log("Failed to save vehicle:", err);
      showAlert({
        title: "Error",
        message: err?.data?.message || "Failed to save vehicle",
        type: "error",
      });
    }
  };

  const isVehicleSubscribed = (carId: string) => {
    if (!subscriptions || !Array.isArray(subscriptions)) return false;
    return subscriptions.some((sub: any) => {
      if (!["active", "ongoing"].includes(sub.status) || !sub.vehicle)
        return false;
      const subCarId = sub.vehicle._id || sub.vehicle;
      return carId === subCarId;
    });
  };

  const handleRemoveCar = (id: string) => {
    if (isVehicleSubscribed(id)) {
      toast.error("Cannot Remove", "This vehicle has an active subscription.");
      return;
    }
    showAlert({
      title: "Remove Car",
      message: "Are you sure you want to remove this vehicle?",
      type: "warning",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicle(id).unwrap();
              setTimeout(() => {
                toast.success("Success", "Vehicle removed successfully");
              }, 500);
            } catch {
              setTimeout(() => {
                toast.error("Error", "Failed to remove");
              }, 500);
            }
          },
        },
      ],
    });
  };

  const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback"];

  const getVehicleIconName = (typeValue: string) => {
    switch (typeValue?.toLowerCase()) {
      case "hatchback":
        return "car-hatchback";
      case "sedan":
        return "car-side";
      case "suv":
        return "car-estate";

      default:
        return "car";
    }
  };

  const handleToggle = React.useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCarId((prev) => (prev === id ? null : id));
  }, []);

  const handleEdit = React.useCallback((item: any) => {
    openModal(item);
  }, [openModal]);

  const renderCar = ({ item }: { item: any }) => {
    const id = item._id || item.id;
    return (
      <CarItem
        item={item}
        isExpanded={expandedCarId === id}
        isSubscribed={isVehicleSubscribed(id)}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onRemove={handleRemoveCar}
      />
    );
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="flex-row justify-between items-center px-6 py-5 bg-background">
        <InteractivePressable
          onPress={() => router.back()}
          className="p-2 bg-card rounded-xl border border-border/50"
        >
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </InteractivePressable>
        <View className="items-center">
          <Text className="text-[25px] font-[800] color-text tracking-tight">
            My Garage
          </Text>
          <Text className="text-[12px] color-textSecondary font-[800] uppercase tracking-widest mt-0.5">
            {cars.length} {cars.length === 1 ? "Vehicle" : "Vehicles"} Saved
          </Text>
        </View>
        {/* <TouchableOpacity
          className="w-10 h-10 bg-primary rounded-xl items-center justify-center shadow-lg shadow-primary/20"
          onPress={() => openModal()}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity> */}
      </View>

      <FlatList
        data={cars}
        keyExtractor={(item) => item._id || item.id}
        renderItem={renderCar}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoadingCars ? (
            <View className="items-center justify-center mt-20">
              <View className="w-32 h-32 bg-card rounded-[48px] items-center justify-center mb-8 border border-border/30">
                <Ionicons
                  name="car-outline"
                  size={64}
                  color={Colors.textSecondary}
                />
              </View>
              <Text className="text-[20px] font-[800] color-text text-center">
                Your garage is empty
              </Text>
              <Text className="text-[14px] color-textSecondary text-center mt-2 leading-5 px-10">
                Add your vehicles to enjoy faster bookings and personalized
                service.
              </Text>
              <InteractivePressable
                className="mt-10 bg-primary px-8 py-4 rounded-2xl shadow-lg shadow-primary/30"
                onPress={() => openModal()}
              >
                <Text className="text-[15px] font-[900] color-black uppercase tracking-tight">
                  Add New Vehicle
                </Text>
              </InteractivePressable>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator color={Colors.primary} size="large" />
            </View>
          )
        }
      />

      {/* FAB for Adding (Optional, depending on UI Preference) */}
      {!modalVisible && cars.length > 0 && (
        <InteractivePressable
          className="absolute bottom-16 right-6 w-16 h-16 bg-primary rounded-full items-center justify-center shadow-xl shadow-primary/40 z-50 border-[4px] border-background"
          onPress={() => openModal()}
        >
          <Ionicons name="add" size={32} color="#000" />
        </InteractivePressable>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="none">
        <View className="flex-1 bg-black/60 justify-end">
          <InteractivePressable
            className="absolute inset-0"
            onPress={closeModal}
            scaleTo={1}
          />
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            }}
            className="bg-card rounded-t-[44px] p-8 pb-[330px] border-t border-border shadow-2xl"
          >
            <View className="w-14 h-1.5 bg-border/50 rounded-full self-center mb-10" />

            <View className="flex-row justify-between items-center mb-8">
              <View>
                <Text className="text-[26px] font-[900] color-text tracking-tighter">
                  {editingCarId ? "Update Vehicle" : "Add New Vehicle"}
                </Text>
                <Text className="text-[13px] color-textSecondary font-[600] mt-1">
                  Enter your vehicle details below
                </Text>
              </View>
              <InteractivePressable
                onPress={closeModal}
                className="w-10 h-10 bg-background rounded-full items-center justify-center border border-border"
              >
                <Ionicons name="close" size={20} color={Colors.text} />
              </InteractivePressable>
            </View>

            <View className="gap-6">
              <View>
                <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-widest mb-4 ml-1">
                  Vehicle Type
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {VEHICLE_TYPES.map((vType) => {
                    const isSelected = type === vType;
                    return (
                      <Pressable
                        key={vType}
                        style={{
                          width: "48%",
                          marginBottom: 16,
                          padding: 16,
                          borderRadius: 16,
                          flexDirection: "row",
                          alignItems: "center",
                          borderWidth: 1,
                          backgroundColor: isSelected
                            ? "rgba(132, 201, 92, 0.1)"
                            : Colors.background,
                          borderColor: isSelected
                            ? Colors.primary
                            : "rgba(226, 232, 240, 0.5)",
                          // shadow-sm
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: isSelected ? 0.05 : 0,
                          shadowRadius: 2,
                          elevation: isSelected ? 1 : 0,
                        }}
                        onPress={() => setType(vType)}
                      >
                        <MaterialCommunityIcons
                          name={getVehicleIconName(vType) as any}
                          size={20}
                          color={
                            isSelected ? Colors.primary : Colors.textSecondary
                          }
                          style={{ marginRight: 10 }}
                        />
                        <Text
                          className={`text-[13px] font-[800] ${isSelected ? "color-text" : "color-textSecondary"}`}
                        >
                          {vType}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-widest mb-4 ml-1">
                  Registration Number
                </Text>
                <View className="bg-background border border-border rounded-2xl px-5 h-16 flex-row items-center">
                  <MaterialCommunityIcons
                    name="numeric"
                    size={24}
                    color={Colors.textSecondary}
                    style={{ marginRight: 12 }}
                  />
                  <TextInput
                    className="flex-1 text-[16px] color-text font-[700]"
                    placeholder="E.G. MH01CK1234"
                    placeholderTextColor="#64748B"
                    value={number}
                    onChangeText={handleNumberChange}
                    autoCapitalize="characters"
                    maxLength={10}
                  />
                </View>
              </View>

              <Pressable
                style={{
                  backgroundColor: Colors.primary,
                  height: 56,
                  borderRadius: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 0,
                  shadowColor: Colors.primary,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 10,
                }}
                onPress={handleSaveCar}
              >
                <Text className="text-[16px] font-[900] color-black uppercase tracking-tight">
                  {editingCarId ? "Update Garage" : "Add to Garage"}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
