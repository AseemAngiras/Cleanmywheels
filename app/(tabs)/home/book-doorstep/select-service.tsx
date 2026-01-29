import { RootState } from "@/store";
import {
  useGetWashPackagesQuery,
  useUpdateWashPackageMutation,
} from "@/store/api/washPackageApi";
import {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
} from "@/store/api/vehicleApi";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";
import { useAppSelector } from "@/store/hooks";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import BookingStepper from "../../../../components/BookingStepper";
import { ListSkeleton } from "../../../../components/SkeletonLoader";

const SERVICE_ADDONS: Record<
  string,
  { id: string; name: string; price: number }[]
> = {};

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
      <View style={expandableStyles.detailsContainer}>
        <View style={expandableStyles.featureTagsContainer}>
          {features.map((feature, index) => (
            // @ts-ignore
            <View key={index.toString()} style={expandableStyles.featureTag}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color="#84c95c"
                style={{ marginRight: 6 }}
              />
              <Text style={expandableStyles.featureTagText}>
                {feature.trim()}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

const expandableStyles = StyleSheet.create({
  detailsContainer: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  featureTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8e8",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#84c95c20",
  },
  featureTagText: {
    fontSize: 12,
    color: "#2d5a1a",
    fontWeight: "500",
  },
});

export default function SelectServiceScreen() {
  const user = useSelector((state: RootState) => state.user.user);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const isAdmin = user?.accountType === "Super Admin";

  const { data: allCars = [] } = useGetVehiclesQuery();
  const { data: subscriptions } = useGetMySubscriptionQuery();

  // Filter out subscribed vehicle from the list
  const cars = allCars.filter((car: any) => {
    // If no subscriptions or not an array, return all cars
    if (!subscriptions || !Array.isArray(subscriptions)) return true;

    // Check if this car is in any active subscription
    const isSubscribed = subscriptions.some((sub: any) => {
      if (sub.status !== "active" || !sub.vehicle) return false;
      const subCarId = sub.vehicle._id || sub.vehicle;
      return (car._id || car.id) === subCarId;
    });

    return !isSubscribed;
  });

  const [createVehicle, { isLoading: isCreatingVehicle }] =
    useCreateVehicleMutation();

  const router = useRouter();
  const navigation = useNavigation();
  const { address, latitude, longitude, addressId } = useLocalSearchParams();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [addons, setAddons] = useState<Record<string, boolean>>({});

  const {
    data: washPackagesData,
    isLoading: isLoadingPackages,
    error: loadError,
  } = useGetWashPackagesQuery({ page: 1, perPage: 10 });
  const [updateWashPackage, { isLoading: isUpdating }] =
    useUpdateWashPackageMutation();

  const servicesFromApi = washPackagesData?.data?.washPackageList || [];

  // Map API services to UI structure (FROM HEAD)
  const services = servicesFromApi.map((pkg: any) => ({
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
  }));

  useEffect(() => {
    if (washPackagesData) {
      console.log(
        "🔍 [SelectService] RAW API RESPONSE:",
        JSON.stringify(washPackagesData, null, 2)
      );
    }

    if (loadError) {
      console.error(
        "❌ [SelectService] API LOAD ERROR:",
        JSON.stringify(loadError, null, 2)
      );
      // DEBUG: Show error to user
      let errorMessage = "Unknown error";
      if ('status' in loadError) {
        errorMessage = `Status: ${loadError.status}, Error: ${JSON.stringify(loadError.data)}`;
      } else {
        errorMessage = loadError.message || JSON.stringify(loadError);
      }
      // Only alert once
      Alert.alert("Debug API Error", errorMessage);
      // Commented out to avoid loop, but let's enable it once or imply it.
    }

    if (servicesFromApi.length > 0) {
      console.log(
        "📦 [SelectService] API packages found:",
        servicesFromApi.length
      );
      servicesFromApi.forEach((pkg: any) =>
        console.log(`   - ${pkg.name}: ${pkg._id}`)
      );
    } else if (!isLoadingPackages && !loadError) {
      console.warn(
        "⚠️ [SelectService] No packages found in API database! (washPackageList is empty)"
      );
    }
  }, [washPackagesData, servicesFromApi, isLoadingPackages, loadError]);

  // Select first service by default if available
  if (!selectedService && services.length > 0) {
    setSelectedService(services[0].id);
  }

  const [detailsExpanded, setDetailsExpanded] = useState<Set<string>>(
    new Set()
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const [vehicleType, setVehicleType] = useState("Sedan");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  const vehicleTypes = [
    { id: "Hatchback", name: "Hatchback", icon: "car-hatchback" },
    { id: "Sedan", name: "Sedan", icon: "car" },
    { id: "SUV", name: "SUV", icon: "car-estate" },
    { id: "Other", name: "Others", icon: "truck-delivery" },
  ];

  // Auto-fill form updates when selectedCarId changes
  useEffect(() => {
    if (selectedCarId) {
      const selectedCar = cars.find(
        (c: any) => (c._id || c.id) === selectedCarId
      );
      if (selectedCar) {
        // Match against our supported types
        const matchedType = vehicleTypes.find(
          (vt) =>
            vt.id.toLowerCase() ===
            (selectedCar.vehicleType || selectedCar.type || "").toLowerCase()
        );
        // Default to "Other" if no match found (e.g. if it was a Bike/Scooter previously)
        setVehicleType(matchedType ? matchedType.id : "Other");
        setVehicleNumber(selectedCar.vehicleNo || selectedCar.number || "");
      }
    }
  }, [selectedCarId, cars]);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });
    }, [navigation])
  );

  const currentAddons = selectedService
    ? SERVICE_ADDONS[selectedService] || []
    : [];

  const toggleAddon = (id: string) => {
    setAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const validateVehicleNumber = (
    number: string
  ): { isValid: boolean; message: string } => {
    if (!number || !number.trim()) {
      return { isValid: false, message: "Please enter your vehicle number." };
    }

    const cleaned = number.replace(/[\s-]/g, "").toUpperCase();

    const indianVehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/;
    const alternateRegex = /^[A-Z]{2}[0-9]{2}[A-Z]{1,2}[0-9]{4}$/;

    if (!indianVehicleRegex.test(cleaned) && !alternateRegex.test(cleaned)) {
      return {
        isValid: false,
        message:
          "Please enter a valid vehicle number.\n\nExamples:\n• MH01AB1234\n• DL12CA5678\n• KA09MA1234",
      };
    }

    const validStateCodes = [
      "AN", "AP", "AR", "AS", "BH", "BR", "CG", "CH", "DD", "DL",
      "GA", "GJ", "HP", "HR", "JH", "JK", "KA", "KL", "LA", "LD",
      "MH", "ML", "MN", "MP", "MZ", "NL", "OD", "OR", "PB", "PY",
      "RJ", "SK", "TN", "TR", "TS", "UK", "UP", "WB",
    ];
    const stateCode = cleaned.substring(0, 2);
    if (!validStateCodes.includes(stateCode)) {
      return {
        isValid: false,
        message: `'${stateCode}' is not a valid Indian state code.`,
      };
    }

    return { isValid: true, message: "" };
  };

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
      console.error("Update failed:", err);
      Alert.alert("Error", err?.data?.message || "Failed to update price");
    }
  };

  const calculateTotal = () => {
    const servicePrice =
      services.find((s: any) => s.id === selectedService)?.price || 0;

    let addonTotal = 0;

    currentAddons.forEach((addon) => {
      if (addons[addon.id]) {
        addonTotal += addon.price;
      }
    });

    return servicePrice + addonTotal;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <BookingStepper currentStep={1} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container}>
            {/* Services - Vertical Accordion */}
            <View style={styles.servicesContainer}>
              {isLoadingPackages ? (
                <ListSkeleton type="service" count={3} />
              ) : services.length === 0 ? (
                <Text
                  style={{ textAlign: "center", marginTop: 20, color: "#888" }}
                >
                  No wash packages available
                </Text>
              ) : (
                services.map((service: any) => {
                  const isSelected = selectedService === service.id;
                  const isServiceExpanded = isSelected;

                  return (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceCard,
                        isServiceExpanded
                          ? styles.serviceCardExpandedLayout
                          : styles.serviceCardCollapsedLayout,
                        isSelected
                          ? styles.serviceCardSelectedBorder
                          : styles.serviceCardUnselectedBorder,
                      ]}
                      onPress={() => handleServiceSelect(service.id)}
                      activeOpacity={0.9}
                    >
                      {isServiceExpanded ? (
                        <View>
                          <View style={styles.expandedHeader}>
                            <View style={styles.expandedImageContainer}>
                              <Image
                                source={{ uri: service.image }}
                                style={styles.expandedImage}
                              />
                              {service.isBestseller && (
                                <View style={styles.bestsellerBadge}>
                                  <Text style={styles.bestsellerText}>
                                    BESTSELLER
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.expandedContent}>
                              <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.expandedName}>
                                  {service.name}
                                </Text>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                  }}
                                >
                                  <Text style={styles.expandedPrice}>
                                    ₹{service.price}
                                  </Text>
                                  {isAdmin && (
                                    <TouchableOpacity
                                      onPress={(e) => {
                                        e.stopPropagation();
                                        setEditingService({
                                          id: service.id,
                                          name: service.name,
                                          price: service.price,
                                        });
                                        setNewPrice(service.price.toString());
                                      }}
                                      style={{ marginLeft: 10, padding: 5 }}
                                    >
                                      <Ionicons
                                        name="pencil"
                                        size={16}
                                        color="#84c95c"
                                      />
                                    </TouchableOpacity>
                                  )}
                                </View>
                                <Text style={styles.expandedDesc}>
                                  {service.description}
                                </Text>
                              </View>

                              <View
                                style={{
                                  alignItems: "flex-end",
                                  justifyContent: "space-between",
                                }}
                              >
                                {isSelected ? (
                                  <Ionicons
                                    name="radio-button-on"
                                    size={24}
                                    color="#84c95c"
                                  />
                                ) : (
                                  <Ionicons
                                    name="radio-button-off"
                                    size={24}
                                    color="#ccc"
                                  />
                                )}
                                <TouchableOpacity
                                  onPress={(e) => toggleDetails(service.id, e)}
                                  style={{ padding: 5, marginTop: 15 }}
                                >
                                  <Ionicons
                                    name={
                                      detailsExpanded.has(service.id)
                                        ? "chevron-up"
                                        : "chevron-down"
                                    }
                                    size={24}
                                    color="#84c95c"
                                  />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>

                          <ExpandableDetails
                            isExpanded={detailsExpanded.has(service.id)}
                            features={
                              service.features ||
                              service.details?.split(", ") ||
                              []
                            }
                          />
                        </View>
                      ) : (
                        <View style={styles.collapsedRow}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Ionicons
                              name={
                                isSelected
                                  ? "radio-button-on"
                                  : "radio-button-off"
                              }
                              size={20}
                              color={isSelected ? "#84c95c" : "#ccc"}
                              style={{ marginRight: 12 }}
                            />
                            <Text style={styles.collapsedName}>
                              {service.name}
                            </Text>
                            {service.isBestseller && (
                              <View
                                style={[
                                  styles.bestsellerBadge,
                                  {
                                    marginLeft: 8,
                                    position: "relative",
                                    top: 0,
                                    left: 0,
                                  },
                                ]}
                              >
                                <Text style={styles.bestsellerText}>BEST</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.collapsedPrice}>
                            ₹{service.price}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>

            {/* Dynamic Add-ons Section */}
            {selectedService && currentAddons.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>Make it Shine (Add-ons)</Text>
                <View style={styles.addonsContainer}>
                  {currentAddons.map((addon) => {
                    const isSelected = !!addons[addon.id];
                    return (
                      <TouchableOpacity
                        key={addon.id}
                        style={[
                          styles.addonChip,
                          isSelected && styles.addonChipSelected,
                        ]}
                        onPress={() => toggleAddon(addon.id)}
                      >
                        <Text
                          style={[
                            styles.addonName,
                            isSelected && { color: "#fff" },
                          ]}
                        >
                          {addon.name}
                        </Text>
                        <Text
                          style={[
                            styles.addonPrice,
                            isSelected && { color: "#fff" },
                          ]}
                        >
                          +₹{addon.price}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#fff"
                            style={{ marginLeft: 5 }}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* MY SAVED CARS SECTION */}
            {cars.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={styles.sectionTitle}>My Saved Vehicles</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {cars.map((car: any) => {
                    const isSelected = selectedCarId === (car._id || car.id);
                    return (
                      <TouchableOpacity
                        key={car._id || car.id}
                        style={[
                          styles.savedCarCard,
                          isSelected && styles.savedCarCardSelected,
                        ]}
                        onPress={() => setSelectedCarId(car._id || car.id)}
                      >
                        <Ionicons
                          name="car-sport"
                          size={24}
                          color={isSelected ? "#D1F803" : "#666"}
                          style={{ marginBottom: 8 }}
                        />
                        <Text
                          style={[
                            styles.savedCarNumber,
                            isSelected && { color: "#fff" },
                          ]}
                        >
                          {car.vehicleNo || car.number}
                        </Text>
                        <Text
                          style={[
                            styles.savedCarType,
                            isSelected && { color: "#rgba(255,255,255,0.7)" },
                          ]}
                        >
                          {car.vehicleType || car.type}
                        </Text>
                        {isSelected && (
                          <View style={styles.selectedCheck}>
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#D1F803"
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Vehicle Selection Section */}
            <Text style={styles.sectionTitle}>Vehicle Details</Text>
            <View style={styles.vehicleRow}>
              {vehicleTypes.map((type) => {
                const isSelected = vehicleType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.vehicleIconBtn,
                      isSelected && styles.vehicleIconBtnSelected,
                    ]}
                    onPress={() => {
                      setSelectedCarId(null);
                      setVehicleNumber("");
                      setVehicleType(type.id);
                    }}
                  >
                    <MaterialCommunityIcons
                      name={type.icon as any}
                      size={24}
                      color={isSelected ? "#fff" : "#999"}
                    />
                    <Text
                      style={[
                        styles.vehicleTypeName,
                        isSelected && { color: "#fff", fontWeight: "bold" },
                      ]}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.subSectionTitle}>
              Vehicle Number <Text style={{ color: "#e74c3c" }}> *</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="E.G. IND-1234"
              placeholderTextColor="#ccc"
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              autoCapitalize="characters"
            />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{calculateTotal()}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (services.length === 0 || !selectedService) && {
              opacity: 0.5,
              backgroundColor: "#ccc",
            },
            isCreatingVehicle && { opacity: 0.7 },
          ]}
          disabled={
            services.length === 0 || !selectedService || isCreatingVehicle
          }
          onPress={async () => {
            if (!selectedService) {
              Alert.alert(
                "Selection Required",
                "Please select a service to proceed."
              );
              return;
            }

            const validation = validateVehicleNumber(vehicleNumber);
            if (!validation.isValid) {
              Alert.alert("Invalid Vehicle Number", validation.message);
              return;
            }

            const cleanNumber = vehicleNumber
              .replace(/[^a-zA-Z0-9]/g, "")
              .toUpperCase();

            if (cleanNumber.length < 6 || cleanNumber.length > 10) {
              Alert.alert(
                "Invalid Vehicle Number",
                "Please enter a valid vehicle number (e.g., KA01AB1234)."
              );
              return;
            }

            if (!/^[A-Z]{2}[0-9A-Z]{4,8}$/.test(cleanNumber)) {
              Alert.alert(
                "Invalid Vehicle Number",
                "Please enter a valid vehicle number (e.g., KA01AB1234)."
              );
              return;
            }

            // Check if this vehicle number is already subscribed
            if (subscriptions && Array.isArray(subscriptions)) {
              const duplicate = subscriptions.find((sub: any) => {
                if (sub.status !== "active" || !sub.vehicle) return false;
                // Normalize and compare
                const subNo = (
                  sub.vehicle.vehicleNo ||
                  sub.vehicle.number ||
                  ""
                )
                  .replace(/[^a-zA-Z0-9]/g, "")
                  .toUpperCase();
                return subNo === cleanNumber;
              });

              if (duplicate) {
                Alert.alert(
                  "Already Subscribed",
                  "You already have an active subscription for this vehicle. Please use the Add-on service to modify your booking or choose a different vehicle."
                );
                return;
              }
            }

            const service = services.find((s: any) => s.id === selectedService);
            if (!service) {
              Alert.alert("Error", "Selected service is no longer available.");
              return;
            }

            const selectedAddons = currentAddons.filter(
              (addon) => addons[addon.id]
            );

            const normalizedNumber = vehicleNumber
              .replace(/[\s-]/g, "")
              .toUpperCase();

            let existingCar = cars.find(
              (car: any) => (car.vehicleNo || car.number) === normalizedNumber
            );

            if (!existingCar) {
              // Only save to backend if user is logged in
              if (isLoggedIn) {
                try {
                  const response = await createVehicle({
                    vehicleType:
                      vehicleType === "suv" ? "SUV" :
                        vehicleType === "others" ? "Other" :
                          vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1),
                    vehicleNo: normalizedNumber,
                    image: "",
                    isDefault: false,
                  }).unwrap();

                  if (response?.data) {
                    existingCar = response.data;
                    setSelectedCarId(existingCar._id);
                  }
                } catch (err) {
                  console.error("Vehicle Creation Failed", err);
                  Alert.alert(
                    "Note",
                    "Could not save vehicle to your profile, but you can proceed with booking."
                  );
                }
              }
            }

            const params = {
              serviceId: service.id,
              serviceName: service.name,
              basePrice: service.price,
              totalPrice: calculateTotal(),
              vehicleType,
              vehicleNumber: normalizedNumber,
              address,
              latitude,
              longitude,
              addressId,
              vehicleId: existingCar?._id || selectedCarId,
            };

            router.push({
              pathname: "/(tabs)/home/book-doorstep/select-slot",
              params,
            });
          }}
        >
          {isCreatingVehicle ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>Proceed to Slot</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </>
          )}
        </TouchableOpacity>
      </View>
      <Modal
        visible={!!editingService}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingService(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                Update Price: {editingService?.name}
              </Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={newPrice}
                onChangeText={setNewPrice}
                placeholder="Enter new price"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setEditingService(null)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.saveBtn]}
                  onPress={handleUpdatePrice}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    marginTop: 20,
  },
  servicesContainer: {
    marginBottom: 32,
  },
  serviceCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  serviceCardCollapsedLayout: {
    padding: 16,
  },
  serviceCardExpandedLayout: {
    // removed padding here to allow full bleed image if needed,
    // but we apply padding in inner containers
  },
  serviceCardSelectedBorder: {
    borderColor: "#84c95c",
    backgroundColor: "#fcfefb",
  },
  serviceCardUnselectedBorder: {
    borderColor: "#f0f0f0",
  },
  collapsedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  collapsedName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  collapsedPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#84c95c",
  },
  // Expanded Styles
  expandedHeader: {
    flexDirection: "row",
    padding: 12,
  },
  expandedImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 16,
  },
  expandedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  expandedContent: {
    flex: 1,
    flexDirection: "row",
  },
  expandedName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  expandedPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#84c95c",
    marginBottom: 8,
  },
  expandedDesc: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  bestsellerBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#FFD700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderBottomRightRadius: 8,
  },
  bestsellerText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#000",
  },
  // Addons
  addonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  addonChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addonChipSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  addonName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginRight: 8,
  },
  addonPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#84c95c",
  },
  // Saved Cars
  savedCarCard: {
    width: 140,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: "#f0f0f0",
  },
  savedCarCardSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  savedCarNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  savedCarType: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  selectedCheck: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  // Form
  vehicleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  vehicleIconBtn: {
    width: "23%",
    aspectRatio: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  vehicleIconBtnSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  vehicleTypeName: {
    marginTop: 8,
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  footer: {
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  nextButton: {
    backgroundColor: "#D1F803",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlign: "center",
    fontSize: 18,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelBtn: {
    backgroundColor: "#ccc",
  },
  saveBtn: {
    backgroundColor: "#84c95c",
  },
  cancelBtnText: {
    color: "white",
    fontWeight: "bold",
  },
  saveBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});
