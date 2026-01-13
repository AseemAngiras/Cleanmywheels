import { RootState } from "@/store";
import {
    useGetWashPackagesQuery,
    useUpdateWashPackageMutation,
} from "@/store/api/washPackageApi";
import {
    useGetVehiclesQuery,
    useCreateVehicleMutation
} from "@/store/api/vehicleApi";
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
import { useDispatch, useSelector } from "react-redux";
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
                        <View key={index} style={expandableStyles.featureTag}>
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
    const dispatch = useDispatch();

    const user = useSelector((state: RootState) => state.user.user);
    const isAdmin = user?.accountType === "Super Admin";

    // Replace local selector with API query
    const { data: vehiclesData, isLoading: isLoadingVehicles } =
        useGetVehiclesQuery();
    const [createVehicle, { isLoading: isCreatingVehicle }] =
        useCreateVehicleMutation();

    const cars =
        vehiclesData?.data?.map((v: any) => ({
            id: v._id,
            name: v.vehicleType || "Car",
            type: v.vehicleType,
            number: v.vehicleNo,
            image: v.image || "",
        })) || [];

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

    const [vehicleType, setVehicleType] = useState("sedan");
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

    // Auto-fill form updates when selectedCarId changes
    useEffect(() => {
        if (selectedCarId) {
            const selectedCar = cars.find((c: any) => c.id === selectedCarId);
            if (selectedCar) {
                // If type matches one of our presets, use it, otherwise 'others' or custom logic
                const matchedType = vehicleTypes.find(
                    (vt) => vt.id.toLowerCase() === selectedCar.type.toLowerCase()
                );
                setVehicleType(matchedType ? matchedType.id : "others");
                setVehicleNumber(selectedCar.number);
            }
        }
    }, [selectedCarId, cars]);

    const vehicleTypes = [
        { id: "hatchback", name: "Hatchback", icon: "car-hatchback" },
        { id: "sedan", name: "Sedan", icon: "car" },
        { id: "suv", name: "SUV", icon: "car-estate" },
        { id: "others", name: "Others", icon: "truck-delivery" },
    ];

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
            "AN",
            "AP",
            "AR",
            "AS",
            "BH",
            "BR",
            "CG",
            "CH",
            "DD",
            "DL",
            "GA",
            "GJ",
            "HP",
            "HR",
            "JH",
            "JK",
            "KA",
            "KL",
            "LA",
            "LD",
            "MH",
            "ML",
            "MN",
            "MP",
            "MZ",
            "NL",
            "OD",
            "OR",
            "PB",
            "PY",
            "RJ",
            "SK",
            "TN",
            "TR",
            "TS",
            "UK",
            "UP",
            "WB",
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
                                        const isSelected = selectedCarId === car.id;
                                        return (
                                            <TouchableOpacity
                                                key={car.id}
                                                style={[
                                                    styles.savedCarCard,
                                                    isSelected && styles.savedCarCardSelected,
                                                ]}
                                                onPress={() => setSelectedCarId(car.id)}
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
                                                    {car.number}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.savedCarType,
                                                        isSelected && { color: "#rgba(255,255,255,0.7)" },
                                                    ]}
                                                >
                                                    {car.type}
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

                        let carIdToUse = selectedCarId;

                        // Use 'createVehicleMutation' if it's a new car
                        // Check if car with this number already exists
                        const existingCar = cars.find(
                            (car: any) => car.number === normalizedNumber
                        );

                        if (existingCar) {
                            carIdToUse = existingCar.id;
                        } else {
                            // Creating a new vehicle in DB
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
                                carIdToUse = response.data._id; // Adjust based on actual API response structure
                            } catch (error: any) {
                                console.error("Failed to persist vehicle:", error);
                                Alert.alert(
                                    "Error",
                                    error?.data?.message ||
                                    "Could not save vehicle details. Please try again."
                                );
                                return;
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
                            vehicleId: carIdToUse,
                        };

                        router.push({
                            pathname: "/(tabs)/home/book-doorstep/select-slot",
                            params,
                        });
                    }}
                >
                    {isCreatingVehicle ? (
                        <ActivityIndicator color="#1a1a1a" />
                    ) : (
                        <Text style={styles.nextButtonText}>Next</Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Price Edit Modal */}
            <Modal
                visible={!!editingService}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setEditingService(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Price</Text>
                        <Text style={styles.modalSubtitle}>
                            Change price for {editingService?.name}
                        </Text>

                        <TextInput
                            style={styles.priceInput}
                            keyboardType="numeric"
                            value={newPrice}
                            onChangeText={setNewPrice}
                            placeholder="Enter new price"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEditingService(null)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleUpdatePrice}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
    safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#f9f9f9",
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: "bold" },
    container: { paddingBottom: 100 },

    servicesContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
        marginTop: 12,
    },
    serviceCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    serviceCardExpandedLayout: { padding: 15 },
    serviceCardCollapsedLayout: { paddingVertical: 15, paddingHorizontal: 15 },
    serviceCardSelectedBorder: {
        borderColor: "#84c95c",
        backgroundColor: "#fbfdfa",
        borderWidth: 2,
    },
    serviceCardUnselectedBorder: {
        borderColor: "#eee",
        backgroundColor: "#fff",
        borderWidth: 1,
    },

    expandedHeader: { flexDirection: "row" },
    expandedImageContainer: { marginRight: 15, position: "relative" },
    expandedImage: {
        width: 60,
        height: 60,
        borderRadius: 10,
        backgroundColor: "#eee",
    },
    expandedContent: { flex: 1, flexDirection: "row" },
    expandedName: { fontSize: 16, fontWeight: "bold", color: "#1a1a1a" },
    expandedPrice: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#84c95c",
        marginVertical: 4,
    },
    expandedDesc: { fontSize: 12, color: "#666", lineHeight: 16 },

    detailsContainer: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    detailsText: {
        fontSize: 13,
        color: "#555",
        lineHeight: 20,
        fontStyle: "italic",
    },

    collapsedRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    collapsedName: { fontSize: 15, fontWeight: "500", color: "#333" },
    collapsedPrice: { fontSize: 15, fontWeight: "600", color: "#1a1a1a" },

    bestsellerBadge: {
        position: "absolute",
        top: -6,
        left: -4,
        backgroundColor: "#C8F000",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    bestsellerText: { color: "#1a1a1a", fontSize: 7, fontWeight: "bold" },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        // marginTop: 5,
        marginBottom: 10,
        color: "#1a1a1a",
        paddingHorizontal: 20,
    },

    addonsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 20,
    },
    addonChip: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: "#fff",
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },
    addonChipSelected: { backgroundColor: "#84c95c", borderColor: "#84c95c" },
    addonName: { fontSize: 13, fontWeight: "600", color: "#555", marginRight: 5 },
    addonPrice: { fontSize: 13, fontWeight: "700", color: "#84c95c" },

    subSectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        // marginTop: 5,
        marginBottom: 10,
        color: "#1a1a1a",
        paddingHorizontal: 20,
    },

    vehicleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    vehicleIconBtn: {
        alignItems: "center",
        justifyContent: "center",
        width: "23%",
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#eee",
    },
    vehicleIconBtnSelected: {
        backgroundColor: "#1a1a1aff",
        borderColor: "#1a1a1a",
    },
    savedCarCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 16,
        padding: 8,
        marginRight: 12,
        marginLeft: 12,
        borderWidth: 1,
        borderColor: "#eee",
        minWidth: 120,
        alignItems: "flex-start",
    },
    savedCarCardSelected: {
        backgroundColor: "#1a1a1a",
        marginLeft: 15,
    },
    savedCarNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 4,
    },
    savedCarType: {
        fontSize: 12,
        color: "#666",
        textTransform: "uppercase",
    },
    selectedCheck: {
        position: "absolute",
        top: 8,
        right: 8,
    },
    vehicleTypeName: {
        fontSize: 10,
        fontWeight: "500",
        color: "#999",
        marginTop: 4,
    },

    input: {
        backgroundColor: "#fff",
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 14,
        color: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#f0f0f0",
        marginBottom: 20,
        marginHorizontal: 20,
    },

    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 20,
        paddingBottom: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    totalContainer: { justifyContent: "center" },
    totalLabel: { fontSize: 12, color: "#888", marginLeft: 6 },
    totalPrice: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#84c95c",
        marginLeft: 6,
    },
    nextButton: {
        backgroundColor: "#C8F000",
        paddingVertical: 15,
        paddingHorizontal: 0,
        borderRadius: 30,
        width: 150,
        marginLeft: 30,
        alignItems: "center",
    },
    nextButtonText: { fontSize: 16, fontWeight: "bold", color: "#1a1a1a" },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 25,
        width: "100%",
        maxWidth: 400,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1a1a1a",
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
    },
    priceInput: {
        backgroundColor: "#f5f5f5",
        borderRadius: 12,
        padding: 15,
        fontSize: 18,
        fontWeight: "bold",
        color: "#1a1a1a",
        borderWidth: 1,
        borderColor: "#eee",
        marginBottom: 25,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f5f5f5",
    },
    saveButton: {
        backgroundColor: "#84c95c",
    },
    cancelButtonText: {
        color: "#666",
        fontWeight: "bold",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
});
