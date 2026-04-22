import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  useGetWashPackagesQuery,
  useUpdateWashPackageMutation,
} from "@/store/api/washPackageApi";
import { useGetVehiclesQuery } from "@/store/api/vehicleApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeInLeft,
  Layout,
  ZoomIn,
} from "react-native-reanimated";
import { InteractivePressable } from "@/components/ui/InteractivePressable";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import BookingStepper from "../../../../components/BookingStepper";
import { ListSkeleton } from "../../../../components/SkeletonLoader";
import {
  useGetMySubscriptionQuery,
  useGetAddonsQuery,
} from "@/store/api/subscriptionApi";

const VEHICLE_TYPE_TO_PRICE_KEY: Record<string, string> = {
  Hatchback: "hatchback",
  Sedan: "sedan",
  SUV: "suv",
  "Two Wheeler": "twoWheeler",
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
      return "motorbike";
    default:
      return "car";
  }
};

export default function SelectServiceScreen() {
  const user = useSelector((state: RootState) => (state as any).user?.user);
  const isAdmin = user?.accountType === "Super Admin";

  const { data: allCars = [] } = useGetVehiclesQuery();
  const { data: subscriptions } = useGetMySubscriptionQuery();

  const cars = useMemo(() => {
    const allCarsList = allCars || [];
    if (!subscriptions || !Array.isArray(subscriptions)) return allCarsList;
    return allCarsList.filter((car: any) => {
      return !subscriptions.some((sub: any) => {
        if (sub.status !== "active" || !sub.vehicle) return false;
        const subCarId = sub.vehicle._id || sub.vehicle;
        return (car._id || car.id) === subCarId;
      });
    });
  }, [allCars, subscriptions]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { address, latitude, longitude, addressId, addressType } =
    useLocalSearchParams();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [addons, setAddons] = useState<Record<string, boolean>>({});

  const {
    data: washPackagesData,
    isLoading: isLoadingPackages,
    // error: loadError,
  } = useGetWashPackagesQuery({
    page: 1,
    perPage: 10,
    packageType: "ONE_TIME",
    status: "Active",
  });
  const { data: addonsList = [], isLoading: isLoadingAddons } =
    useGetAddonsQuery();

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
        prices: pkg.prices,
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
    if (services.length > 0 && selectedService === null) {
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
    prices: {
      hatchback: number;
      sedan: number;
      suv: number;
      twoWheeler: number;
    };
  } | null>(null);
  const [newPrices, setNewPrices] = useState({
    hatchback: "",
    sedan: "",
    suv: "",
    twoWheeler: "",
  });

  const handleUpdatePrice = async () => {
    if (!editingService) return;
    try {
      await updateWashPackage({
        id: editingService.id,
        body: {
          prices: {
            hatchback: Number(newPrices.hatchback),
            sedan: Number(newPrices.sedan),
            suv: Number(newPrices.suv),
            twoWheeler: Number(newPrices.twoWheeler),
          },
        },
      }).unwrap();
      setEditingService(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update price");
    }
  };

  const toggleDetails = (id: string, e: any) => {
    e.stopPropagation();
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

  const vehicleTypes = useMemo(
    () => [
      { id: "Hatchback", name: "Hatchback", icon: "car-hatchback" },
      { id: "Sedan", name: "Sedan", icon: "car-side" },
      { id: "SUV", name: "SUV", icon: "car-estate" },
      { id: "Two Wheeler", name: "Two Wheeler", icon: "motorbike" },
    ],
    [],
  );

  useEffect(() => {
    if (selectedCarId) {
      const selectedCar = (cars as any[]).find(
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
  }, [selectedCarId, cars, vehicleTypes]);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
    }, [navigation]),
  );

  const handleServiceSelect = (id: string) => {
    if (selectedService !== id) {
      setSelectedService(id);
      setAddons({});
    }
  };

  const totalPrice = useMemo(() => {
    const service = services.find((s) => s.id === selectedService);

    const priceKey = VEHICLE_TYPE_TO_PRICE_KEY[vehicleType] || "sedan";
    const priceData = (service?.prices as any)?.[priceKey];
    let basePrice =
      typeof priceData === "object"
        ? priceData.ONE_TIME || 0
        : priceData || service?.price || 0;
    let total = basePrice;

    const addonMap = new Map(
      (addonsList as any[]).map((a) => [a._id || a.id, a]),
    );
    Object.entries(addons).forEach(([id, selected]) => {
      if (selected) {
        const addon = addonMap.get(id) as any;
        total += addon?.normalPrice || addon?.price || 0;
      }
    });

    return total;
  }, [services, selectedService, addons, addonsList, vehicleType]);

  const handleNext = () => {
    if (!selectedService) {
      Alert.alert("Error", "Please select a service package");
      return;
    }
    if (!vehicleNumber.trim()) {
      Alert.alert("Error", "Please enter vehicle number");
      return;
    }

    const selectedAddonDetails = Object.entries(addons)
      .filter(([_, selected]) => selected)
      .map(([id, _]) => {
        const addon = addonsList.find((a: any) => (a._id || a.id) === id);
        return {
          id: addon?._id || addon?.id,
          name: addon?.name,
          price: addon?.normalPrice || addon?.price,
        };
      });

    const selectedServiceData = services.find((s) => s.id === selectedService);
    const priceKey = VEHICLE_TYPE_TO_PRICE_KEY[vehicleType] || "sedan";
    const priceData = (selectedServiceData?.prices as any)?.[priceKey];
    const actualBasePrice =
      typeof priceData === "object"
        ? priceData.ONE_TIME || 0
        : priceData || selectedServiceData?.price;

    router.push({
      pathname: "/(tabs)/home/book-doorstep/select-slot",
      params: {
        serviceId: selectedService,
        serviceName: selectedServiceData?.name,
        basePrice: actualBasePrice,
        vehicleNumber,
        vehicleType,
        address,
        latitude,
        longitude,
        addressId,
        addressType,
        totalPrice,
        addons: JSON.stringify(selectedAddonDetails),
      },
    });
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="flex-row justify-between items-center px-5 py-4 bg-background">
        <InteractivePressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border/50"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </InteractivePressable>
        <Text className="text-[18px] font-[800] color-text tracking-tight">
          Select Service
        </Text>
        <View className="w-10" />
      </View>

      <BookingStepper currentStep={1} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 350 + insets.bottom }}
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
                {services.map((service, index) => {
                  const isSelected = selectedService === service.id;
                  const isExpanded = detailsExpanded.has(service.id);
                  return (
                    <InteractivePressable
                      key={service.id as any}
                      onPress={() => handleServiceSelect(service.id)}
                      onLongPress={() => {
                        if (!isAdmin) return;
                        setEditingService({
                          id: service.id,
                          name: service.name,
                          price: service.price || 0,
                          prices: service.prices || {
                            hatchback: 0,
                            sedan: 0,
                            suv: 0,
                            twoWheeler: 0,
                          },
                        });
                        setNewPrices({
                          hatchback: (
                            service.prices?.hatchback || 0
                          ).toString(),
                          sedan: (service.prices?.sedan || 0).toString(),
                          suv: (service.prices?.suv || 0).toString(),
                          twoWheeler: (
                            service.prices?.twoWheeler || 0
                          ).toString(),
                        });
                      }}
                      className="mb-4 overflow-hidden rounded-[28px]"
                    >
                      <Animated.View
                        entering={FadeInUp.delay(index * 100).duration(500)}
                        className={`rounded-[28px] border ${
                          isSelected
                            ? "bg-card border-primary shadow-lg shadow-primary/20"
                            : "bg-card border-border/50 shadow-sm"
                        }`}
                      >
                        <View className="p-5">
                          <View className="flex-row items-center justify-between mb-2">
                            <View className="flex-1">
                              <Text className="text-[18px] font-[800] color-text">
                                {service.name}
                              </Text>
                              <View className="flex-row items-center mt-1">
                                <Text className="text-[20px] font-[900] color-primary">
                                  ₹
                                  {(() => {
                                    const priceKey =
                                      VEHICLE_TYPE_TO_PRICE_KEY[vehicleType] ||
                                      "sedan";
                                    const pData = (service.prices as any)?.[
                                      priceKey
                                    ];
                                    return typeof pData === "object"
                                      ? pData.ONE_TIME || 0
                                      : pData || service.price;
                                  })()}
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

                          <InteractivePressable
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
                          </InteractivePressable>

                          {isExpanded && (
                            <View className="mt-4">
                              <View className="flex-row flex-wrap gap-2">
                                {service.features.map(
                                  (feature: string, idx: number) => (
                                    <View
                                      key={idx}
                                      className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex-row items-center"
                                    >
                                      <View className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                                      <Text className="text-[11px] font-[700] color-primary uppercase">
                                        {feature}
                                      </Text>
                                    </View>
                                  ),
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                      </Animated.View>
                    </InteractivePressable>
                  );
                })}
              </View>
            )}
          </View>

          {selectedService && (
            <View className="mt-8 mb-10">
              <View className="flex-row items-center justify-between px-5 mb-6">
                <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest px-1">
                  Pick Add-ons
                </Text>
              </View>

              <View className="px-5">
                {isLoadingAddons ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : addonsList.length === 0 ? (
                  <View className="bg-card p-6 rounded-[24px] items-center border border-border/50">
                    <Text className="color-textSecondary italic">
                      No add-ons available
                    </Text>
                  </View>
                ) : (
                  <View className="gap-3">
                    {addonsList.map((addon: any, idx: number) => {
                      const aid = addon._id || addon.id;
                      const isSelected = !!addons[aid];
                      return (
                        <InteractivePressable
                          key={(aid || `addon-${idx}`) as any}
                          onPress={() => {
                            setAddons((prev) => ({
                              ...prev,
                              [aid]: !prev[aid],
                            }));
                          }}
                          className="mb-3"
                        >
                          <Animated.View
                            entering={FadeInLeft.delay(100 + idx * 50).duration(
                              400,
                            )}
                            className={`flex-row items-center p-5 rounded-[28px] border ${
                              isSelected
                                ? "bg-primary/10 border-primary"
                                : "bg-card border-border/50"
                            }`}
                          >
                            <View
                              className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${
                                isSelected ? "bg-primary/20" : "bg-background"
                              }`}
                            >
                              <Ionicons
                                name={
                                  isSelected ? "sparkles" : "add-circle-outline"
                                }
                                size={28}
                                color={
                                  isSelected
                                    ? Colors.primary
                                    : Colors.textSecondary
                                }
                              />
                            </View>

                            <View className="flex-1">
                              <Text className="text-[16px] font-[800] color-text">
                                {addon.name}
                              </Text>
                              <View className="flex-row items-center mt-1">
                                <Text className="text-[14px] font-[900] color-primary">
                                  +₹{addon.normalPrice || addon.price}
                                </Text>
                                {isSelected && (
                                  <Text className="ml-2 text-[10px] font-[800] color-success uppercase tracking-widest">
                                    Selected
                                  </Text>
                                )}
                              </View>
                            </View>

                            <View
                              className={`w-7 h-7 rounded-full items-center justify-center border-2 ${
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-border/50"
                              }`}
                            >
                              {isSelected && (
                                <Ionicons
                                  name="checkmark"
                                  size={16}
                                  color="#000"
                                />
                              )}
                            </View>
                          </Animated.View>
                        </InteractivePressable>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

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
                {cars.map((car: any, index: number) => {
                  const isSelected = selectedCarId === (car._id || car.id);
                  return (
                    <InteractivePressable
                      key={(car._id || car.id || index) as any}
                      onPress={() => setSelectedCarId(car._id || car.id)}
                      className="w-[100px] ml-[10px]"
                    >
                      <Animated.View
                        entering={FadeInUp.delay(index * 100).duration(500)}
                        style={{
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
                        }}
                      >
                        {isSelected && (
                          <Animated.View
                            entering={ZoomIn.duration(300)}
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
                          </Animated.View>
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
                      </Animated.View>
                    </InteractivePressable>
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
                <InteractivePressable
                  key={type.id as any}
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
                </InteractivePressable>
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
              ₹{totalPrice}
            </Text>
          </View>
          <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Text className="text-[11px] font-[900] color-primary">
              DOORSTEP SERVICE
            </Text>
          </View>
        </View>

        <InteractivePressable onPress={handleNext}>
          <Animated.View
            className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
            layout={Layout.springify()}
          >
            <Text className="text-[16px] font-[900] color-black">Continue</Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#000"
              style={{ marginLeft: 8 }}
            />
          </Animated.View>
        </InteractivePressable>
      </View>

      {/* Admin Edit Modal */}
      <Modal visible={editingService !== null} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-card w-full rounded-[32px] p-6 border border-border shadow-2xl">
            <Text className="text-[18px] font-[800] color-text mb-2">
              Edit Prices
            </Text>
            <Text className="text-[14px] color-textSecondary mb-6">
              {editingService?.name}
            </Text>

            <ScrollView className="max-h-[400px] mb-6">
              {Object.keys(VEHICLE_TYPE_TO_PRICE_KEY).map((type) => {
                const key = VEHICLE_TYPE_TO_PRICE_KEY[
                  type
                ] as keyof typeof newPrices;
                return (
                  <View key={type} className="mb-4">
                    <Text className="text-[12px] font-[800] color-textSecondary uppercase mb-2 px-1">
                      {type} Price
                    </Text>
                    <View className="bg-background border border-border rounded-2xl px-4 h-14 flex-row items-center">
                      <Text className="text-[18px] font-[800] color-textSecondary mr-2">
                        ₹
                      </Text>
                      <TextInput
                        className="flex-1 text-[18px] font-[800] color-text"
                        keyboardType="numeric"
                        value={newPrices[key] ? newPrices[key].toString() : ""}
                        onChangeText={(val) =>
                          setNewPrices((prev) => ({ ...prev, [key]: val }))
                        }
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <View className="flex-row gap-4">
              <InteractivePressable
                className="flex-1 h-12 rounded-xl items-center justify-center border border-border"
                onPress={() => setEditingService(null)}
              >
                <Text className="color-textSecondary font-[700]">Cancel</Text>
              </InteractivePressable>
              <InteractivePressable
                className="flex-1 h-12 bg-primary rounded-xl items-center justify-center"
                onPress={handleUpdatePrice}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="color-black font-[900]">Update</Text>
                )}
              </InteractivePressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
