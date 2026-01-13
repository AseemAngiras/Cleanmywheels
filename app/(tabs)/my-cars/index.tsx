import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
    Keyboard,
    LayoutAnimation,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    UIManager,
    View,
} from "react-native";

import {
    useCreateVehicleMutation,
    useDeleteVehicleMutation,
    useGetVehiclesQuery,
    useUpdateVehicleMutation,
} from "../../../store/api/vehicleApi";
import { Car } from "../../../store/slices/userSlice";

if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function MyCarsScreen() {
    const { data: vehiclesData, isLoading, refetch } = useGetVehiclesQuery();
    const [createVehicle] = useCreateVehicleMutation();
    const [updateVehicle] = useUpdateVehicleMutation();
    const [deleteVehicle] = useDeleteVehicleMutation();

    // Map backend vehicles to frontend Car interface
    const cars: Car[] =
        vehiclesData?.data?.map((v: any) => ({
            id: v._id,
            name: v.vehicleType || "Car",
            type: v.vehicleType,
            number: v.vehicleNo,
            image: v.image || "",
        })) || [];

    const [modalVisible, setModalVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const [editingCarId, setEditingCarId] = useState<string | null>(null);
    const [type, setType] = useState("");
    const [number, setNumber] = useState("");
    const [image, setImage] = useState<string | undefined>(undefined);

    const [expandedCarId, setExpandedCarId] = useState<string | null>(null);

    const toggleCard = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedCarId(expandedCarId === id ? null : id);
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert("Permission required", "Allow photo access");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
            base64: true, // Request base64 if needed by backend, or just URI upload strategy
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const openModal = (car?: Car) => {
        if (car) {
            setEditingCarId(car.id);
            setType(car.type);
            setNumber(car.number);
            setImage(car.image);
        } else {
            setEditingCarId(null);
            setType("");
            setNumber("");
            setImage(undefined);
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

    const closeModal = () => {
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
        ]).start(() => setModalVisible(false));
    };

    const handleSaveCar = async () => {
        if (!type || !number) {
            Alert.alert("Error", "Vehicle type and number are required");
            return;
        }

        const vehicleNumberPattern = /^[A-Z]{2,3}\d{2}[A-Z]{1,2}\d{4}$/i;
        const cleanedNumber = number.trim().replace(/\s+/g, "").toUpperCase();

        if (!vehicleNumberPattern.test(cleanedNumber)) {
            Alert.alert(
                "Invalid Vehicle Number",
                "Please enter a valid vehicle number (e.g., CH01GH4321, PB10QH3210)"
            );
            return;
        }

        try {
            if (editingCarId) {
                await updateVehicle({
                    id: editingCarId,
                    body: {
                        vehicleType: type,
                        vehicleNo: cleanedNumber,
                        image: image || "",
                        isDefault: false,
                    },
                }).unwrap();
            } else {
                await createVehicle({
                    vehicleType: type,
                    vehicleNo: cleanedNumber,
                    image: image || "",
                    isDefault: false,
                }).unwrap();
            }
            closeModal();
        } catch (error: any) {
            console.error("Failed to save vehicle:", error);
            Alert.alert("Error", error?.data?.message || "Failed to save vehicle");
        }
    };

    const handleRemoveCar = (id: string) => {
        Alert.alert("Remove Car", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Remove",
                style: "destructive",
                onPress: async () => {
                    try {
                        await deleteVehicle(id).unwrap();
                    } catch (error) {
                        console.error("Failed to delete vehicle:", error);
                        Alert.alert("Error", "Failed to delete vehicle");
                    }
                },
            },
        ]);
    };

    const [isTypePickerVisible, setIsTypePickerVisible] = useState(false);
    const VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback", "Other"];

    const handleDismiss = () => {
        if (expandedCarId) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setExpandedCarId(null);
        }
        Keyboard.dismiss();
    };

    const renderCar = ({ item }: { item: Car }) => {
        const isExpanded = expandedCarId === item.id;

        return (
            <TouchableOpacity
                style={[styles.card, isExpanded && styles.cardExpanded]}
                activeOpacity={0.9}
                onPress={() => toggleCard(item.id)}
            >
                <LinearGradient
                    colors={["#f7fee7", "#ffffff"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 20 }}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.carInfo}>
                            <Text style={styles.carName}>{item.name}</Text>
                            <Text style={styles.carType}>{item.type}</Text>
                        </View>
                    </View>

                    <View style={styles.cardBody}>
                        <View style={styles.plateContainer}>
                            <View style={styles.plateInd}>
                                <Text style={styles.plateIndText}>IND</Text>
                            </View>
                            <Text style={styles.plateNumber}>{item.number}</Text>
                        </View>

                        {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.carImage} />
                        ) : (
                            <View style={[styles.carImage, styles.imagePlaceholder]}>
                                <Ionicons name="car-sport" size={32} color="#CBD5E1" />
                            </View>
                        )}
                    </View>

                    {isExpanded && (
                        <View style={styles.cardFooter}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.editBtn]}
                                onPress={() => openModal(item)}
                            >
                                <Ionicons name="create-outline" size={16} color="#1a1a1a" />
                                <Text style={styles.editText}>Edit Vehicle</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionBtn, styles.removeBtn]}
                                onPress={() => handleRemoveCar(item.id)}
                            >
                                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                                <Text style={styles.removeText}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <TouchableWithoutFeedback onPress={handleDismiss} accessible={false}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>My Garage</Text>
                        <Text style={styles.headerSubtitle}>
                            {cars.length} {cars.length === 1 ? "Vehicle" : "Vehicles"} Managed
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.addBtn} onPress={() => openModal()}>
                        <Ionicons name="add" size={24} color="#000" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={cars}
                    keyExtractor={(item) => item.id}
                    renderItem={renderCar}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    onScrollBeginDrag={handleDismiss}
                    refreshing={isLoading}
                    onRefresh={refetch}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="car-sport-outline" size={64} color="#E2E8F0" />
                            <Text style={styles.emptyText}>No cars added yet</Text>
                            <TouchableOpacity onPress={() => openModal()}>
                                <Text style={styles.emptyAction}>Add your first vehicle</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />

                {/* ADD/EDIT MODAL */}
                <Modal visible={modalVisible} transparent animationType="none">
                    <View style={styles.modalContainer}>
                        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                            <TouchableOpacity
                                style={StyleSheet.absoluteFill}
                                onPress={closeModal}
                            />
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.bottomSheet,
                                { transform: [{ translateY: slideAnim }] },
                            ]}
                        >
                            <View style={styles.sheetHeader}>
                                <Text style={styles.sheetTitle}>
                                    {editingCarId ? "Edit Vehicle" : "Add Vehicle"}
                                </Text>
                                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                    <Ionicons name="close" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={styles.formScroll}>
                                <View style={styles.limeAccentBox}>
                                    <Ionicons name="car-sport" size={24} color="#1a1a1a" />
                                    <Text style={styles.limeBoxText}>
                                        {editingCarId
                                            ? "Update your vehicle details"
                                            : "Enter details for your new ride"}
                                    </Text>
                                </View>

                                {/* Removed Name Input */}

                                <View style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={styles.fieldLabel}>Type</Text>
                                        <TouchableOpacity
                                            style={styles.darkInput}
                                            onPress={() => setIsTypePickerVisible(true)}
                                        >
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: type ? "#fff" : "#666",
                                                        fontSize: 16,
                                                    }}
                                                >
                                                    {type || "Select Type"}
                                                </Text>
                                                <Ionicons name="chevron-down" size={20} color="#666" />
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={styles.fieldLabel}>Reg. Number</Text>
                                        <TextInput
                                            placeholder="DL10AB1234"
                                            placeholderTextColor="#666"
                                            value={number}
                                            onChangeText={setNumber}
                                            style={styles.darkInput}
                                            autoCapitalize="characters"
                                        />
                                    </View>
                                </View>

                                <Text style={styles.fieldLabel}>Vehicle Image</Text>
                                <TouchableOpacity
                                    style={styles.darkImagePicker}
                                    onPress={pickImage}
                                >
                                    {image ? (
                                        <Image source={{ uri: image }} style={styles.preview} />
                                    ) : (
                                        <View style={styles.uploadPlaceholder}>
                                            <Ionicons name="camera" size={32} color="#444" />
                                            <Text style={styles.uploadTextDark}>Upload Photo</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.saveBtn}
                                    onPress={handleSaveCar}
                                >
                                    <Text style={styles.saveBtnText}>
                                        {editingCarId ? "Update Vehicle" : "Add Vehicle"}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={18} color="#000" />
                                </TouchableOpacity>
                            </ScrollView>
                        </Animated.View>
                    </View>
                </Modal>

                {/* TYPE PICKER MODAL */}
                <Modal visible={isTypePickerVisible} transparent animationType="fade">
                    <View style={styles.pickerOverlay}>
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            onPress={() => setIsTypePickerVisible(false)}
                        />
                        <View style={styles.pickerContainer}>
                            <Text style={styles.pickerTitle}>Select Vehicle Type</Text>
                            <FlatList
                                data={VEHICLE_TYPES}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.pickerItem,
                                            type === item && styles.pickerItemSelected,
                                        ]}
                                        onPress={() => {
                                            setType(item);
                                            setIsTypePickerVisible(false);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.pickerItemText,
                                                type === item && styles.pickerItemTextSelected,
                                            ]}
                                        >
                                            {item}
                                        </Text>
                                        {type === item && (
                                            <Ionicons name="checkmark" size={20} color="#000" />
                                        )}
                                    </TouchableOpacity>
                                )}
                                style={{ maxHeight: 300 }}
                            />
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 20,
        paddingTop: 60,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1a1a1a",
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748B",
        fontWeight: "500",
        marginTop: 2,
    },
    addBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#D1F803",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#D1F803",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    card: {
        // backgroundColor: "#fff", // Handled by LinearGradient
        borderRadius: 24,
        // padding: 20, // Handled by LinearGradient
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        overflow: "hidden",
    },
    cardExpanded: {
        borderColor: "#D1F803",
        borderWidth: 1.5,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    carInfo: { flex: 1 },
    carName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1E293B",
        marginBottom: 2,
    },
    carType: {
        fontSize: 13,
        color: "#64748B",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    cardBody: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 0,
    },
    plateContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderWidth: 2,
        borderColor: "#000",
        borderRadius: 6,
        overflow: "hidden",
        alignItems: "center",
        height: 36,
    },
    plateInd: {
        backgroundColor: "#003399",
        height: "100%",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    plateIndText: {
        color: "#fff",
        fontSize: 8,
        fontWeight: "bold",
    },
    plateNumber: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#000",
        paddingHorizontal: 8,
        letterSpacing: 1,
    },
    carImage: {
        width: 80,
        height: 50,
        borderRadius: 8,
        resizeMode: "cover",
    },
    imagePlaceholder: {
        backgroundColor: "#F1F5F9",
        justifyContent: "center",
        alignItems: "center",
    },

    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: "#F1F5F9",
        gap: 12,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    editBtn: {
        backgroundColor: "#F0FDF4",
        borderWidth: 1,
        borderColor: "#DCFCE7",
    },
    removeBtn: {
        backgroundColor: "#FEF2F2",
        borderWidth: 1,
        borderColor: "#FEE2E2",
    },
    editText: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: "600",
        color: "#1a1a1a",
    },
    removeText: {
        marginLeft: 6,
        fontSize: 13,
        fontWeight: "600",
        color: "#EF4444",
    },

    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 80,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: "#94A3B8",
        fontWeight: "500",
    },
    emptyAction: {
        marginTop: 8,
        fontSize: 14,
        color: "#1a1a1a",
        fontWeight: "700",
        textDecorationLine: "underline",
    },

    modalContainer: {
        flex: 1,
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.6)",
    },
    bottomSheet: {
        backgroundColor: "#000",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
        height: "72%",
    },
    sheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    sheetTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
    },
    closeBtn: {
        padding: 4,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 20,
    },
    formScroll: {
        paddingBottom: 20,
    },
    limeAccentBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#D1F803",
        padding: 16,
        borderRadius: 20,
        marginBottom: 24,
    },
    limeBoxText: {
        marginLeft: 12,
        fontSize: 14,
        fontWeight: "700",
        color: "#1a1a1a",
        flex: 1,
    },
    fieldLabel: {
        fontSize: 13,
        color: "#A1A1AA",
        marginBottom: 8,
        marginLeft: 4,
        fontWeight: "500",
    },
    darkInput: {
        backgroundColor: "#27272a",
        borderRadius: 16,
        padding: 16,
        fontSize: 16,
        color: "#fff",
        marginBottom: 16,
    },
    row: {
        flexDirection: "row",
    },
    darkImagePicker: {
        height: 140,
        backgroundColor: "#27272a",
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "#3f3f46",
        borderStyle: "dashed",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
        overflow: "hidden",
    },
    uploadPlaceholder: {
        alignItems: "center",
    },
    uploadTextDark: {
        marginTop: 8,
        color: "#71717A",
        fontSize: 14,
        fontWeight: "600",
    },
    preview: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    saveBtn: {
        backgroundColor: "#D1F803",
        borderRadius: 20,
        paddingVertical: 18,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#D1F803",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
        gap: 10,
    },
    saveBtnText: {
        color: "#1a1a1a",
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    pickerContainer: {
        backgroundColor: "#fff",
        width: "100%",
        borderRadius: 24,
        padding: 20,
        maxHeight: "60%",
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1a",
        marginBottom: 16,
        textAlign: "center",
    },
    pickerItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#F1F5F9",
    },
    pickerItemSelected: {
        backgroundColor: "#F0FDF4",
        borderRadius: 12,
        paddingHorizontal: 12,
        borderBottomWidth: 0,
    },
    pickerItemText: {
        fontSize: 16,
        color: "#4B5563",
    },
    pickerItemTextSelected: {
        color: "#1a1a1a",
        fontWeight: "700",
    },
});