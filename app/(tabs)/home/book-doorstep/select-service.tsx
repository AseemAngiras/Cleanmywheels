import { RootState } from "@/store";
import {
  useGetWashPackagesQuery,
  useUpdateWashPackageMutation,
} from "@/store/api/washPackageApi";
import { useGetVehiclesQuery } from "@/store/api/vehicleApi";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { useSelector } from "react-redux";
import BookingStepper from "../../../../components/BookingStepper";
import { ListSkeleton } from "../../../../components/SkeletonLoader";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";

// Animated expandable component for smooth transitions
const ExpandableDetails = ({
  isExpanded,
  features,
}: {
  isExpanded: boolean;
  features: string[];
}) => {
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: isExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedOpacity, {
        toValue: isExpanded ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isExpanded, animatedHeight, animatedOpacity]);

  const maxHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200],
  });

  return (
    <Animated.View
      style={{
        maxHeight: maxHeight,
        opacity: animatedOpacity,
        overflow: "hidden",
      }}
    >
      <View className="mt-4 pt-4 border-t border-border/30">
        <View className="flex-row flex-wrap gap-2">
          {features.map((feature, index) => (
            <View
              key={index}
              className="flex-row items-center bg-primary/10 px-3 py-2 rounded-full border border-primary/20"
            >
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text className="text-[11px] color-primary font-[700] uppercase">
                {feature.trim()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

export default function SelectServiceScreen() {
  // const user = useSelector((state: RootState) => state.user.user);
  // const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  // const isAdmin = user?.accountType === "Super Admin";

  const { data: allCars = [] } = useGetVehiclesQuery();
  const { data: subscriptions } = useGetMySubscriptionQuery();

  // Filter out subscribed vehicle from the list
  const cars = allCars.filter((car: any) => {
    if (!subscriptions || !Array.isArray(subscriptions)) return true;
    return !subscriptions.some((sub: any) => {
      if (sub.status !== "active" || !sub.vehicle) return false;
      const subCarId = sub.vehicle._id || sub.vehicle;
      return (car._id || car.id) === subCarId;
    });
  });

  // const [createVehicle] = useCreateVehicleMutation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { address, latitude, longitude, addressId } = useLocalSearchParams();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [addons, setAddons] = useState<Record<string, boolean>>({});

  const {
    data: washPackagesData,
    isLoading: isLoadingPackages,
    // error: loadError,
  } = useGetWashPackagesQuery({ page: 1, perPage: 10 });

  const [updateWashPackage, { isLoading: isUpdating }] =
    useUpdateWashPackageMutation();

  const servicesFromApi = useMemo(
    () => washPackagesData?.data?.washPackageList || [],
    [washPackagesData],
  );

  const services = useMemo(
    () =>
      servicesFromApi.map((pkg: any) => ({
        id: pkg._id,
        name: pkg.name,
        price: pkg.price,
        description: pkg.tag || "Professional car wash service",
        details: pkg.features?.join(", ") || "Interior and exterior cleaning",
        features: pkg.features || [],
        image:
          pkg.logo ||
          "https://images.unsplash.com/photo-1552930294-6b595f4c2974?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80",
        isBestseller: pkg.tag?.toLowerCase().includes("best"),
      })),
    [servicesFromApi],
  );

  useEffect(() => {
    if (services.length > 0 && !selectedService) {
      setSelectedService(services[0].id);
    }
  }, [services, selectedService]);

  const [detailsExpanded, setDetailsExpanded] = useState<Set<string>>(
    new Set(),
  );
  const [editingService, setEditingService] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);
  const [newPrice, setNewPrice] = useState("");

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

  const [vehicleType, setVehicleType] = useState("Sedan");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  const vehicleTypes = [
    { id: "Hatchback", name: "Hatchback", icon: "car-hatchback" },
    { id: "Sedan", name: "Sedan", icon: "car-side" },
    { id: "SUV", name: "SUV", icon: "car-estate" },
    { id: "Two Wheeler", name: "Two Wheeler", icon: "motorbike" },
  ];

  useEffect(() => {
    if (selectedCarId) {
      const selectedCar = cars.find(
        (c: any) => (c._id || c.id) === selectedCarId,
      );
      if (selectedCar) {
        const matchedType = vehicleTypes.find(
          (vt) =>
            vt.id.toLowerCase() ===
            (selectedCar.vehicleType || selectedCar.type || "").toLowerCase(),
        );
        setVehicleType(matchedType ? matchedType.id : "Other");
        setVehicleNumber(selectedCar.vehicleNo || selectedCar.number || "");
      }
    }
  }, [selectedCarId, cars]);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    }, [navigation]),
  );

  const handleServiceSelect = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedService(id);
    setAddons({});
  };

  const handleUpdatePrice = async () => {
    if (!editingService || !newPrice) return;
    try {
      await updateWashPackage({
        id: editingService.id,
        body: { price: Number(newPrice) },
      }).unwrap();
      Alert.alert("Success", "Price updated successfully");
      setEditingService(null);
      setNewPrice("");
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to update price");
    }
  };

  const calculateTotal = () => {
    let servicePrice =
      services.find((s) => s.id === selectedService)?.price || 0;
    return servicePrice;
  };

  const handleNext = () => {
    if (!selectedService) {
      Alert.alert("Error", "Please select a service package");
      return;
    }
    if (!vehicleNumber.trim()) {
      Alert.alert("Error", "Please enter vehicle number");
      return;
    }

    router.push({
      pathname: "/(tabs)/home/book-doorstep/select-slot",
      params: {
        serviceId: selectedService,
        vehicleNumber,
        vehicleType,
        address,
        latitude,
        longitude,
        addressId,
        totalPrice: calculateTotal(),
      },
    });
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="flex-row justify-between items-center px-5 py-4 bg-background">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border/50"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text className="text-[18px] font-[800] color-text tracking-tight">
          Select Service
        </Text>
        <View className="w-10" />
      </View>

      <BookingStepper currentStep={1} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 160 + insets.bottom }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-1">
            Wash Packages
          </Text>

          <View className="mb-8">
            {isLoadingPackages ? (
              <ListSkeleton type="service" count={3} />
            ) : services.length === 0 ? (
              <View className="bg-card p-8 rounded-[32px] items-center border border-border/50">
                <Ionicons
                  name="alert-circle-outline"
                  size={40}
                  color={Colors.textSecondary}
                />
                <Text className="color-textSecondary font-[600] mt-3">
                  No packages available
                </Text>
              </View>
            ) : (
              <View className="px-5">
                {services.map((service) => {
                  const isSelected = selectedService === service.id;
                  const isExpanded = detailsExpanded.has(service.id);
                  return (
                    <TouchableOpacity
                      key={service.id}
                      activeOpacity={0.9}
                      onPress={() => handleServiceSelect(service.id)}
                      className={`mb-4 rounded-[28px] overflow-hidden border ${
                        isSelected
                          ? "bg-card border-primary shadow-lg shadow-primary/20"
                          : "bg-card border-border/50 shadow-sm"
                      }`}
                    >
                      <View className="p-5">
                        {/* Main Row */}
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-1">
                            <Text className="text-[18px] font-[800] color-text">
                              {service.name}
                            </Text>
                            <View className="flex-row items-center mt-1">
                              <Text className="text-[20px] font-[900] color-primary">
                                ₹{service.price}
                              </Text>
                              {service.isBestseller && (
                                <Text className="ml-3 text-[12px] font-[700] color-textSecondary uppercase tracking-widest">
                                  Bestseller
                                </Text>
                              )}
                            </View>
                          </View>

                          <View
                            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                              isSelected
                                ? "bg-primary border-primary"
                                : "border-border/50"
                            }`}
                          >
                            {isSelected && (
                              <View className="w-2.5 h-2.5 rounded-full bg-black/80" />
                            )}
                          </View>
                        </View>

                        <Text
                          className="text-[13px] color-textSecondary font-[500] leading-5"
                          numberOfLines={isExpanded ? 0 : 1}
                        >
                          {service.description}
                        </Text>

                        {/* Show Details Action */}
                        <TouchableOpacity
                          onPress={(e) => toggleDetails(service.id, e)}
                          className="flex-row items-center justify-center mt-4 border-t border-border/20"
                        >
                          <Text className="text-[12px] font-[800] color-primary uppercase tracking-widest mr-1.5">
                            {isExpanded ? "Hide details" : "Show details"}
                          </Text>
                          <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={16}
                            color={Colors.primary}
                          />
                        </TouchableOpacity>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <View className="mt-4">
                            <View className="flex-row flex-wrap gap-2">
                              {service.features.map((feature, idx) => (
                                <View
                                  key={idx}
                                  className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex-row items-center"
                                >
                                  <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                                  <Text className="text-[11px] font-[700] color-primary uppercase">
                                    {feature}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* MY SAVED CARS */}
          {cars.length > 0 && (
            <View className="mb-10">
              <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-5">
                My Vehicles
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="overflow-visible"
              >
                {cars.map((car: any) => {
                  const isSelected = selectedCarId === (car._id || car.id);
                  return (
                    <Pressable
                      key={car._id || car.id}
                      style={{
                        width: 100,
                        marginLeft: 10,
                        padding: 10,
                        borderRadius: 15,
                        borderWidth: 1,
                        alignItems: "center",
                        position: "relative",
                        backgroundColor: isSelected
                          ? Colors.primary
                          : Colors.card,
                        borderColor: isSelected
                          ? Colors.primary
                          : "rgba(226, 232, 240, 0.5)",
                        // Shadow for selected
                        shadowColor: isSelected ? Colors.primary : "#000",
                        shadowOffset: {
                          width: 0,
                          height: isSelected ? 4 : 0, 
                        },
                        shadowOpacity: isSelected ? 0.2 : 0, 
                        shadowRadius: isSelected ? 8 : 0, 
                        elevation: isSelected ? 4 : 0, 
                      }}
                      onPress={() => setSelectedCarId(car._id || car.id)}
                    >
                      {isSelected && (
                        <View
                          style={{
                            position: "absolute",
                            top: 8, 
                            right: 8, 
                            backgroundColor: "rgba(0,0,0,0.2)",
                            width: 20, 
                            height: 20, 
                            borderRadius: 10, 
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Ionicons name="checkmark" size={12} color="#000" />
                        </View>
                      )}
                      <View
                        style={{
                          width: 48, 
                          height: 48, 
                          borderRadius: 14, 
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: 8, 
                          backgroundColor: isSelected
                            ? "rgba(0,0,0,0.1)"
                            : Colors.background,
                        }}
                      >
                        <MaterialCommunityIcons
                          name={
                            getVehicleIconName(
                              car.vehicleType || car.type,
                            ) as any
                          }
                          size={28} 
                          color={isSelected ? "#000" : Colors.textSecondary}
                        />
                      </View>
                      <Text
                        style={{
                          fontSize: 12, 
                          fontWeight: "800",
                          textAlign: "center",
                          color: isSelected ? "#000" : Colors.text,
                        }}
                        numberOfLines={1}
                      >
                        {car.vehicleNo || car.number}
                      </Text>
                      <Text
                        style={{
                          fontSize: 10, 
                          fontWeight: "600",
                          marginTop: 1, 
                          color: isSelected
                            ? "rgba(0,0,0,0.6)"
                            : Colors.textSecondary,
                        }}
                      >
                        {car.vehicleType || car.type}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Manual Vehicle Selection */}
          <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-1">
            Vehicle Details
          </Text>
          <View className="flex-row flex-wrap justify-between mb-8 px-5">
            {vehicleTypes.map((type) => {
              const isSelected = vehicleType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  activeOpacity={0.8}
                  className={`w-[48%] mb-4 p-5 rounded-[24px] flex-row items-center border ${
                    isSelected
                      ? "bg-primary/20 border-primary"
                      : "bg-card border-border/50"
                  }`}
                  onPress={() => {
                    setSelectedCarId(null);
                    setVehicleType(type.id);
                  }}
                >
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isSelected ? "bg-primary/20" : "bg-background"}`}
                  >
                    <MaterialCommunityIcons
                      name={type.icon as any}
                      size={22}
                      color={isSelected ? Colors.primary : Colors.textSecondary}
                    />
                  </View>
                  <Text
                    className={`text-[13px] font-[800] ${
                      isSelected ? "color-text" : "color-textSecondary"
                    }`}
                  >
                    {type.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="mx-5 bg-card border border-border/50 rounded-[24px] px-5 h-16 flex-row items-center shadow-sm">
            <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-4">
              <MaterialCommunityIcons
                name="numeric"
                size={22}
                color={Colors.primary}
              />
            </View>
            <TextInput
              className="flex-1 text-[16px] color-text font-[800]"
              placeholder="E.G. MH01CK1234"
              placeholderTextColor="#64748B"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              autoCapitalize="characters"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-card px-6 pt-5 rounded-t-[40px] border-t border-border shadow-2xl"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View className="flex-row justify-between items-center mb-5 px-1">
          <View>
            <Text className="text-[12px] font-[800] color-textSecondary uppercase tracking-wider">
              Total Amount
            </Text>
            <Text className="text-[28px] font-[900] color-primary">
              ₹{calculateTotal()}
            </Text>
          </View>
          <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Text className="text-[11px] font-[900] color-primary">
              DOORSTEP SERVICE
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
          onPress={handleNext}
        >
          <Text className="text-[16px] font-[900] color-black">Continue</Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color="#000"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {/* Admin Edit Modal */}
      <Modal visible={editingService !== null} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-card w-full rounded-[32px] p-6 border border-border shadow-2xl">
            <Text className="text-[18px] font-[800] color-text mb-2">
              Edit Price
            </Text>
            <Text className="text-[14px] color-textSecondary mb-6">
              {editingService?.name}
            </Text>

            <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center mb-6">
              <Text className="text-[18px] font-[800] color-textSecondary mr-2">
                ₹
              </Text>
              <TextInput
                className="flex-1 text-[18px] font-[800] color-text"
                keyboardType="numeric"
                value={newPrice}
                onChangeText={setNewPrice}
                autoFocus
              />
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 h-12 rounded-xl items-center justify-center border border-border"
                onPress={() => setEditingService(null)}
              >
                <Text className="color-textSecondary font-[700]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 h-12 bg-primary rounded-xl items-center justify-center"
                onPress={handleUpdatePrice}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="color-black font-[900]">Update</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const getVehicleIconName = (type: string) => {
  switch (type?.toLowerCase()) {
    case "hatchback":
      return "car-hatchback";
    case "sedan":
      return "car-side";
    case "suv":
      return "car-estate";
    case "two wheeler":
      return "motorbike";
    default:
      return "car";
  }
};
