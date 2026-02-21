import { useAppSelector } from "@/store/hooks";
import { addCar } from "@/store/slices/userSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
  Text,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import BookingStepper from "../../../../components/BookingStepper";
import { Colors } from "@/constants/Colors";

// Define available add-ons per service
const SERVICE_ADDONS: Record<
  string,
  { id: string; name: string; price: number }[]
> = {
  basic: [
    { id: "wheelWash", name: "Wheel Wash", price: 5 },
    { id: "matPolish", name: "Mat Polish", price: 5 },
  ],
  premium: [],
  detailing: [
    { id: "ceramicCoating", name: "Ceramic Coating", price: 50 },
    { id: "scratchRemoval", name: "Scratch Removal", price: 30 },
    { id: "engineBay", name: "Engine Bay Clean", price: 20 },
  ],
};

const vehicleTypes = [
  { id: "Hatchback", name: "Hatchback", icon: "car-hatchback" },
  { id: "Sedan", name: "Sedan", icon: "car" },
  { id: "SUV", name: "SUV", icon: "car-estate" },
  { id: "Other", name: "Others", icon: "truck-delivery" },
];

const services = [
  {
    id: "basic",
    name: "Basic Wash",
    price: 15,
    description: "Exterior rinse & soap wash.",
    details:
      "Includes high-pressure water rinse, foam soap formatting, and hand dry.",
    image:
      "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "premium",
    name: "Premium Wash",
    price: 25,
    description: "Exterior + Interior vacuum.",
    details:
      "Includes Basic Wash features plus interior vacuuming, dashboard wiping, and window cleaning.",
    image:
      "https://images.unsplash.com/photo-1552930294-6b595f4c2974?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
    isBestseller: true,
  },
  {
    id: "detailing",
    name: "Full Detailing",
    price: 80,
    description: "Complete restoration & wax.",
    details:
      "Comprehensive cleaning including clay bar treatment, machine polishing, waxing, and deep interior shampoo.",
    image:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
  },
];

export default function SelectServiceScreen() {
  const dispatch = useDispatch();
  const cars = useAppSelector((state) => state.user.cars);

  const router = useRouter();
  const navigation = useNavigation();
  const [selectedService, setSelectedService] = useState<string | null>(
    "premium",
  );
  const [addons, setAddons] = useState<Record<string, boolean>>({});
  const [detailsExpanded, setDetailsExpanded] = useState<Set<string>>(
    new Set(),
  );

  // Vehicle State
  const [vehicleType, setVehicleType] = useState("Sedan");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });
    }, [navigation]),
  );

  const currentAddons = selectedService
    ? SERVICE_ADDONS[selectedService] || []
    : [];

  const toggleDetails = (id: string, e: any) => {
    e.stopPropagation();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDetailsExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAddon = (id: string) => {
    setAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleServiceSelect = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedService(id);
    setAddons({});
  };

  const calculateTotal = () => {
    const servicePrice =
      services.find((s) => s.id === selectedService)?.price || 0;
    let addonTotal = 0;
    currentAddons.forEach((addon) => {
      if (addons[addon.id]) addonTotal += addon.price;
    });
    return servicePrice + addonTotal;
  };

  const handleSelectExistingCar = (car: any) => {
    setSelectedCarId(car.id);
    setVehicleType(car.type);
    setVehicleNumber(car.number);
  };

  const handleNext = () => {
    if (!selectedService) {
      Alert.alert("Selection Required", "Please select a service to proceed.");
      return;
    }

    const cleanNumber = vehicleNumber
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();

    if (cleanNumber.length < 6 || cleanNumber.length > 11) {
      Alert.alert(
        "Invalid Vehicle Number",
        "Please enter a valid vehicle number (e.g., KA01AB1234).",
      );
      return;
    }

    const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
    if (!vehicleRegex.test(cleanNumber)) {
      Alert.alert(
        "Invalid Vehicle Number",
        "Please enter a valid vehicle number format (e.g., KA01AB1234).",
      );
      return;
    }

    const service = services.find((s) => s.id === selectedService);
    if (!service) return;

    const selectedAddonsList = currentAddons.filter(
      (addon) => addons[addon.id],
    );

    const bookingDraft = {
      service: {
        id: service.id,
        name: service.name,
        basePrice: service.price,
        addons: selectedAddonsList,
        totalPrice: calculateTotal(),
      },
      vehicle: {
        type: vehicleType,
        number: vehicleNumber.toUpperCase(),
      },
    };

    const normalizedNumber = vehicleNumber.trim().toUpperCase();
    let existingCar = cars.find((car) => car.number === normalizedNumber);

    if (!existingCar) {
      const newCar = {
        id: Date.now().toString(),
        name: vehicleType.toUpperCase(),
        type: vehicleType,
        number: normalizedNumber,
        image: "",
      };
      dispatch(addCar(newCar));
    }

    router.push({
      pathname: "/(tabs)/home/book-service/shops-list",
      params: { bookingDraft: JSON.stringify(bookingDraft) },
    });
  };

  const insets = useSafeAreaInsets();

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="flex-row justify-between items-center px-5 py-4 bg-background">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text className="text-[18px] font-[800] color-text tracking-tight">
          Select Service
        </Text>
        <View className="w-8" />
      </View>

      <BookingStepper currentStep={1} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 150 + insets.bottom }}
            showsVerticalScrollIndicator={false}
          >
            {/* Services Section */}
            <View className="px-5 mt-6 gap-4">
              {services.map((service) => {
                const isSelected = selectedService === service.id;
                const isExpanded = detailsExpanded.has(service.id);

                return (
                  <TouchableOpacity
                    key={service.id}
                    className={`bg-card rounded-[32px] overflow-hidden border ${
                      isSelected ? "border-primary" : "border-border"
                    } shadow-sm`}
                    onPress={() => handleServiceSelect(service.id)}
                    activeOpacity={0.9}
                  >
                    <View className="p-5">
                      <View className="flex-row">
                        <View className="mr-4 relative">
                          <Image
                            source={{ uri: service.image }}
                            className="w-[72px] h-[72px] rounded-2xl bg-background border border-border/50"
                          />
                          {service.isBestseller && (
                            <View className="absolute -top-1 -left-1 bg-primary px-2 py-0.5 rounded-full z-10 border border-black/5">
                              <Text className="color-black text-[7px] font-[900] uppercase">
                                BESTSELLER
                              </Text>
                            </View>
                          )}
                        </View>

                        <View className="flex-1">
                          <View className="flex-row justify-between items-start">
                            <View className="flex-1 mr-2">
                              <Text className="text-[17px] font-[800] color-text">
                                {service.name}
                              </Text>
                              <Text className="text-[18px] font-[900] color-primary mt-1">
                                ₹{service.price}
                              </Text>
                            </View>
                            <View>
                              <Ionicons
                                name={
                                  isSelected
                                    ? "radio-button-on"
                                    : "radio-button-off"
                                }
                                size={24}
                                color={
                                  isSelected
                                    ? Colors.primary
                                    : Colors.textSecondary
                                }
                              />
                            </View>
                          </View>
                          <Text
                            className="text-[13px] color-textSecondary font-[500] mt-1"
                            numberOfLines={2}
                          >
                            {service.description}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={(e) => toggleDetails(service.id, e)}
                        className="flex-row items-center justify-center mt-4 pt-4 border-t border-border/50"
                      >
                        <Text className="text-[12px] font-[700] color-primary uppercase tracking-widest mr-1">
                          {isExpanded ? "Hide Details" : "View Details"}
                        </Text>
                        <Ionicons
                          name={isExpanded ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={Colors.primary}
                        />
                      </TouchableOpacity>

                      {isExpanded && (
                        <View className="mt-4 p-4 bg-background/50 rounded-2xl border border-border/50">
                          <Text className="text-[13px] color-textSecondary font-[500] leading-5 italic">
                            {service.details}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Add-ons Section */}
            {selectedService && currentAddons.length > 0 && (
              <View className="mt-8">
                <Text className="text-[15px] font-[800] color-text px-6 mb-4 uppercase tracking-widest text-[11px] color-textSecondary">
                  Make it Shine (Add-ons)
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                  className="flex-row"
                >
                  {currentAddons.map((addon) => {
                    const isSelected = !!addons[addon.id];
                    return (
                      <TouchableOpacity
                        key={addon.id}
                        className={`flex-row items-center h-12 px-6 rounded-full mr-3 border ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "bg-card border-border"
                        }`}
                        onPress={() => toggleAddon(addon.id)}
                      >
                        <Text
                          className={`text-[13px] font-[700] ${isSelected ? "color-black" : "color-text"}`}
                        >
                          {addon.name}
                        </Text>
                        <Text
                          className={`text-[13px] font-[800] ml-2 ${isSelected ? "color-black/60" : "color-primary"}`}
                        >
                          +₹{addon.price}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#000"
                            className="ml-2"
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Saved Cars Section */}
            {cars.length > 0 && (
              <View className="mt-8">
                <Text className="text-[15px] font-[800] color-text px-6 mb-4 uppercase tracking-widest text-[11px] color-textSecondary">
                  Saved Vehicles
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                  {cars.map((car) => {
                    const isSelected = selectedCarId === car.id;
                    return (
                      <TouchableOpacity
                        key={car.id}
                        className={`w-32 h-28 rounded-[24px] mr-3 items-center justify-center border ${
                          isSelected
                            ? "bg-primary border-primary shadow-lg shadow-primary/30"
                            : "bg-card border-border"
                        }`}
                        onPress={() => handleSelectExistingCar(car)}
                      >
                        <MaterialCommunityIcons
                          name="car"
                          size={28}
                          color={isSelected ? "#000" : Colors.text}
                        />
                        <Text
                          className={`text-[13px] font-[800] mt-2 ${isSelected ? "color-black" : "color-text"}`}
                        >
                          {car.number}
                        </Text>
                        <Text
                          className={`text-[10px] font-[700] uppercase tracking-tighter mt-0.5 ${isSelected ? "color-black/60" : "color-textSecondary"}`}
                        >
                          {car.type}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Vehicle Selection Section */}
            <View className="mt-8">
              <Text className="text-[15px] font-[800] color-text px-6 mb-4 uppercase tracking-widest text-[11px] color-textSecondary">
                Vehicle Specifics
              </Text>
              <View className="flex-row justify-between px-5 mb-6">
                {vehicleTypes.map((type) => {
                  const isSelected = vehicleType === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      className={`items-center justify-center w-[22%] h-20 rounded-2xl border ${
                        isSelected
                          ? "bg-primary border-primary"
                          : "bg-card border-border"
                      }`}
                      onPress={() => {
                        setSelectedCarId(null);
                        setVehicleType(type.id);
                      }}
                    >
                      <MaterialCommunityIcons
                        name={type.icon as any}
                        size={24}
                        color={isSelected ? "#000" : Colors.textSecondary}
                      />
                      <Text
                        className={`text-[10px] font-[800] mt-1.5 ${isSelected ? "color-black" : "color-textSecondary"}`}
                      >
                        {type.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="px-5">
                <Text className="text-[13px] font-[800] color-textSecondary uppercase tracking-widest mb-3 px-1">
                  License Number
                </Text>
                <TextInput
                  className="bg-card border border-border rounded-2xl p-4.5 text-[16px] color-text font-[700] tracking-wider"
                  placeholder="E.G. KA01AB1234"
                  placeholderTextColor="#64748B"
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-card p-6 flex-row justify-between items-center border-t border-border shadow-2xl"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View>
          <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-widest">
            Total Amount
          </Text>
          <Text className="text-[28px] font-[900] color-primary">
            ₹{calculateTotal()}
          </Text>
        </View>
        <TouchableOpacity
          className={`bg-primary h-14 w-40 rounded-2xl items-center justify-center shadow-lg shadow-primary/30 ${!selectedService ? "opacity-50" : ""}`}
          disabled={!selectedService}
          onPress={handleNext}
        >
          <Text className="text-[16px] font-[900] color-black">Next Step</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
