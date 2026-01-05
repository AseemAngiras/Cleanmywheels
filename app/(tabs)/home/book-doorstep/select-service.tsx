import { useCreateWashPackageMutation, useGetWashPackagesQuery, useUpdateWashPackageMutation } from '@/store/api/washPackageApi';
import { useAppSelector } from '@/store/hooks';
import { addCar } from '@/store/slices/userSlice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, LayoutAnimation, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useDispatch } from 'react-redux';
import BookingStepper from '../../../../components/BookingStepper';


const SERVICE_ADDONS: Record<string, { id: string; name: string; price: number }[]> = {};

const HARDCODED_SERVICES = [
    {
        id: '507f1f77bcf86cd799439011',
        name: 'Basic Wash',
        price: 15,
        description: 'Standard',
        details: 'Includes high-pressure water rinse, foam soap formatting, and hand dry.',
        image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    },
    {
        id: '507f1f77bcf86cd799439012',
        name: 'Premium Wash',
        price: 25,
        description: 'Bestseller',
        details: 'Includes Basic Wash features plus interior vacuuming, dashboard wiping, and window cleaning.',
        image: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        isBestseller: true,
    },
    {
        id: '507f1f77bcf86cd799439013',
        name: 'Full Detailing',
        price: 80,
        description: 'Premium',
        details: 'Comprehensive cleaning including clay bar treatment, machine polishing, waxing, and deep interior shampoo.',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    },
];

export default function SelectServiceScreen() {
    const dispatch = useDispatch();

    const cars = useAppSelector((state) => {
        return state.user.cars;
    });


    const router = useRouter();
    const navigation = useNavigation();
    const { address, latitude, longitude, addressId } = useLocalSearchParams();
    const user = useAppSelector((state) => state.user.user);
    const userPhone = user?.phone || "";
    const sanitizedPhone = userPhone.replace(/\D/g, "");
    const isAdmin = sanitizedPhone.endsWith("1234567890") || user?.accountType === 'Admin' || user?.accountType === 'SuperAdmin';

    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [addons, setAddons] = useState<Record<string, boolean>>({});

    const { data: washPackagesData, isLoading: isLoadingPackages, error: loadError, refetch } = useGetWashPackagesQuery({ page: 1, perPage: 10 });
    const [updateWashPackage, { isLoading: isUpdating }] = useUpdateWashPackageMutation();
    const [createWashPackage] = useCreateWashPackageMutation();
    const servicesFromApi = washPackagesData?.data?.washPackageList || [];

    // Prioritize API data if available, otherwise use hardcoded static data
    const services = servicesFromApi.length > 0 
        ? servicesFromApi.map(pkg => ({
            id: pkg._id,
            name: pkg.name,
            price: pkg.price,
            description: pkg.tag || 'Professional car wash service',
            details: pkg.features?.join(', ') || 'Interior and exterior cleaning',
            features: pkg.features || [],
            image: pkg.logo || 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            isBestseller: pkg.tag?.toLowerCase().includes('best')
        }))
        : HARDCODED_SERVICES;

    useEffect(() => {
        if (washPackagesData) {
            console.log("🔍 [SelectService] RAW API RESPONSE:", JSON.stringify(washPackagesData, null, 2));
        }

        if (loadError) {
            console.error("❌ [SelectService] API LOAD ERROR:", JSON.stringify(loadError, null, 2));
        }

        if (servicesFromApi.length > 0) {
            console.log("📦 [SelectService] API packages found:", servicesFromApi.length);
            servicesFromApi.forEach(pkg => console.log(`   - ${pkg.name}: ${pkg._id}`));
        } else if (!isLoadingPackages && !loadError) {
            console.warn("⚠️ [SelectService] No packages found in API database! (washPackageList is empty)");
        }
    }, [washPackagesData, servicesFromApi, isLoadingPackages, loadError]);

    const handleSeedData = async () => {
        try {
            console.log("🌱 [SelectService] SEEDING STARTING...");
            for (const service of HARDCODED_SERVICES) {
                console.log(`📤 Sending: ${service.name}`);
                const result = await createWashPackage({
                    name: service.name,
                    price: service.price,
                    tag: service.description,
                    features: service.details.split(', '),
                    logo: service.image,
                }).unwrap();
                console.log(`✅ Success for ${service.name}:`, JSON.stringify(result, null, 2));
            }
            Alert.alert("Success", "Seed complete! Check console for IDs.");
            refetch();
        } catch (err: any) {
            console.error("❌ SEED FAILED:", JSON.stringify(err, null, 2));
            Alert.alert("Seed Failed", err?.data?.message || "Check network/console");
        }
    };

    if (!selectedService && services.length > 0) {
        setSelectedService(services[0].id);
    }

    const [detailsExpanded, setDetailsExpanded] = useState<Set<string>>(new Set());
    const [editingService, setEditingService] = useState<{ id: string, name: string, price: number } | null>(null);
    const [newPrice, setNewPrice] = useState("");

    const toggleDetails = (id: string, e: any) => {
        e.stopPropagation();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setDetailsExpanded(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const [vehicleType, setVehicleType] = useState('sedan');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

    const vehicleTypes = [
        { id: 'hatchback', name: 'Hatchback', icon: 'car-hatchback' },
        { id: 'sedan', name: 'Sedan', icon: 'car' },
        { id: 'suv', name: 'SUV', icon: 'car-estate' },
        { id: 'others', name: 'Others', icon: 'truck-delivery' },
    ];

    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: "none" }
            });
        }, [navigation])
    );

    const currentAddons = selectedService ? SERVICE_ADDONS[selectedService] || [] : [];

    const toggleAddon = (id: string) => {
        setAddons((prev) => ({ ...prev, [id]: !prev[id] }));
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
                body: { price: Number(newPrice) } 
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
        const servicePrice = services.find((s) => s.id === selectedService)?.price || 0;
        let addonTotal = 0;

        currentAddons.forEach(addon => {
            if (addons[addon.id]) {
                addonTotal += addon.price;
            }
        });

        return servicePrice + addonTotal;
    };

    const handleSelectExistingCar = (car: any) => {
        setSelectedCarId(car.id);
        setVehicleType(car.type);
        setVehicleNumber(car.number);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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

                        {/* Developer Seed Tool */}
                        {isAdmin && (
                            <TouchableOpacity 
                                style={{
                                    backgroundColor: '#333',
                                    paddingVertical: 10,
                                    paddingHorizontal: 15,
                                    borderRadius: 10,
                                    alignSelf: 'center',
                                    marginTop: 10,
                                    marginBottom: 10
                                }}
                                onPress={handleSeedData}
                            >
                                <Text style={{ color: '#C8F000', fontWeight: 'bold' }}>🌱 Developer: Seed Static Packages</Text>
                            </TouchableOpacity>
                        )}

                        {/* Services - Vertical Accordion */}
                        <View style={styles.servicesContainer}>
                            {isLoadingPackages ? (
                                <ActivityIndicator size="large" color="#84c95c" style={{ marginTop: 20 }} />
                            ) : services.length === 0 ? (
                                <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>No wash packages available</Text>
                            ) : services.map((service) => {
                                const isSelected = selectedService === service.id;
                                const isServiceExpanded = isSelected;

                                return (
                                    <TouchableOpacity
                                        key={service.id}
                                        style={[
                                            styles.serviceCard,
                                            isServiceExpanded ? styles.serviceCardExpandedLayout : styles.serviceCardCollapsedLayout,
                                            isSelected ? styles.serviceCardSelectedBorder : styles.serviceCardUnselectedBorder
                                        ]}
                                        onPress={() => handleServiceSelect(service.id)}
                                        activeOpacity={0.9}
                                    >
                                        {isServiceExpanded ? (
                                            <View>
                                                <View style={styles.expandedHeader}>
                                                    <View style={styles.expandedImageContainer}>
                                                        <Image source={{ uri: service.image }} style={styles.expandedImage} />
                                                        {service.isBestseller && (
                                                            <View style={styles.bestsellerBadge}>
                                                                <Text style={styles.bestsellerText}>BESTSELLER</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <View style={styles.expandedContent}>
                                                        <View style={{ flex: 1, marginRight: 10 }}>
                                                            <Text style={styles.expandedName}>{service.name}</Text>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <Text style={styles.expandedPrice}>₹{service.price}</Text>
                                                                {isAdmin && (
                                                                    <TouchableOpacity 
                                                                        onPress={(e) => {
                                                                            e.stopPropagation();
                                                                            setEditingService({ id: service.id, name: service.name, price: service.price });
                                                                            setNewPrice(service.price.toString());
                                                                        }}
                                                                        style={{ marginLeft: 10, padding: 5 }}
                                                                    >
                                                                        <Ionicons name="pencil" size={16} color="#84c95c" />
                                                                    </TouchableOpacity>
                                                                )}
                                                            </View>
                                                            <Text style={styles.expandedDesc}>{service.description}</Text>
                                                        </View>

                                                        <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                                            {isSelected ? (
                                                                <Ionicons name="radio-button-on" size={24} color="#84c95c" />
                                                            ) : (
                                                                <Ionicons name="radio-button-off" size={24} color="#ccc" />
                                                            )}
                                                            <TouchableOpacity
                                                                onPress={(e) => toggleDetails(service.id, e)}
                                                                style={{ padding: 5, marginTop: 15 }}
                                                            >
                                                                <Ionicons
                                                                    name={detailsExpanded.has(service.id) ? "chevron-up" : "chevron-down"}
                                                                    size={24}
                                                                    color="#84c95c"
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </View>

                                                {detailsExpanded.has(service.id) && (
                                                    <View style={styles.detailsContainer}>
                                                        <Text style={styles.detailsText}>{service.details}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        ) : (
                                            <View style={styles.collapsedRow}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Ionicons name={isSelected ? "radio-button-on" : "radio-button-off"} size={20} color={isSelected ? "#84c95c" : "#ccc"} style={{ marginRight: 12 }} />
                                                    <Text style={styles.collapsedName}>{service.name}</Text>
                                                    {service.isBestseller && <View style={[styles.bestsellerBadge, { marginLeft: 8, position: 'relative', top: 0, left: 0 }]}><Text style={styles.bestsellerText}>BEST</Text></View>}
                                                </View>
                                                <Text style={styles.collapsedPrice}>₹{service.price}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
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
                                                    isSelected && styles.addonChipSelected
                                                ]}
                                                onPress={() => toggleAddon(addon.id)}
                                            >
                                                <Text style={[styles.addonName, isSelected && { color: '#fff' }]}>{addon.name}</Text>
                                                <Text style={[styles.addonPrice, isSelected && { color: '#fff' }]}>+₹{addon.price}</Text>
                                                {isSelected && <Ionicons name="checkmark-circle" size={16} color="#fff" style={{ marginLeft: 5 }} />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Saved Cars Section */}
                        {cars.length > 0 && (
                            <View style={{ marginBottom: 10 }}>
                                <Text style={styles.sectionTitle}>Saved Cars</Text>
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
                                                style={[
                                                    styles.savedCarCard,
                                                    isSelected && styles.savedCarCardSelected,
                                                ]}
                                                onPress={() => handleSelectExistingCar(car)}
                                            >
                                                <MaterialCommunityIcons
                                                    name="car"
                                                    size={24}
                                                    color={isSelected ? '#fff' : '#1a1a1a'}
                                                />
                                                <Text
                                                    style={[
                                                        styles.savedCarNumber,
                                                        isSelected && { color: '#fff' },
                                                    ]}
                                                >
                                                    {car.number}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.savedCarType,
                                                        isSelected && { color: '#fff' },
                                                    ]}
                                                >
                                                    {car.type.toUpperCase()}
                                                </Text>
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
                                            isSelected && styles.vehicleIconBtnSelected
                                        ]}
                                        onPress={() => {
                                            setSelectedCarId(null); // Clear saved car selection when manually changing type
                                            setVehicleType(type.id);
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name={type.icon as any}
                                            size={24}
                                            color={isSelected ? "#fff" : "#999"}
                                        />
                                        <Text style={[
                                            styles.vehicleTypeName,
                                            isSelected && { color: '#fff', fontWeight: 'bold' }
                                        ]}>
                                            {type.name}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <Text style={styles.subSectionTitle}>Vehicle Number</Text>
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
                        (services.length === 0 || !selectedService) && { opacity: 0.5, backgroundColor: '#ccc' }
                    ]}
                    disabled={services.length === 0 || !selectedService}
                    onPress={() => {
                        if (!selectedService) {
                            Alert.alert("Selection Required", "Please select a service to proceed.");
                            return;
                        }
                        if (!vehicleNumber.trim()) {
                            Alert.alert("Missing Detail", "Please enter your vehicle number to proceed.");
                            return;
                        }

                        const service = services.find(s => s.id === selectedService);
                        if (!service) {
                            Alert.alert("Error", "Selected service is no longer available.");
                            return;
                        }

                        const selectedAddons = currentAddons.filter(addon => addons[addon.id]);

                        const normalizedNumber = vehicleNumber.trim().toUpperCase();

                        let existingCar = cars.find(car => car.number === normalizedNumber);

                        if (!existingCar) {
                            const newCar = {
                                id: Date.now().toString(),
                                name: vehicleType.toUpperCase(),
                                type: vehicleType,
                                number: normalizedNumber,
                                image: '',
                            };
                            dispatch(addCar(newCar));
                            existingCar = newCar;
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
                            vehicleId: selectedCarId,
                        };

                        router.push({ pathname: '/(tabs)/home/book-doorstep/select-slot', params });
                    }}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
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
                        <Text style={styles.modalSubtitle}>Change price for {editingService?.name}</Text>
                        
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
                                {isUpdating ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f9f9f9',
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    container: { paddingBottom: 100 },

    servicesContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
        marginTop: 12,
    },
    serviceCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    serviceCardExpandedLayout: { padding: 15 },
    serviceCardCollapsedLayout: { paddingVertical: 15, paddingHorizontal: 15 },
    serviceCardSelectedBorder: { borderColor: '#84c95c', backgroundColor: '#fbfdfa', borderWidth: 2 },
    serviceCardUnselectedBorder: { borderColor: '#eee', backgroundColor: '#fff', borderWidth: 1 },

    expandedHeader: { flexDirection: 'row' },
    expandedImageContainer: { marginRight: 15, position: 'relative' },
    expandedImage: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#eee' },
    expandedContent: { flex: 1, flexDirection: 'row' },
    expandedName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
    expandedPrice: { fontSize: 18, fontWeight: 'bold', color: '#84c95c', marginVertical: 4 },
    expandedDesc: { fontSize: 12, color: '#666', lineHeight: 16 },

    detailsContainer: { marginTop: 15, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    detailsText: { fontSize: 13, color: '#555', lineHeight: 20, fontStyle: 'italic' },

    collapsedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    collapsedName: { fontSize: 15, fontWeight: '500', color: '#333' },
    collapsedPrice: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },

    bestsellerBadge: { position: 'absolute', top: -6, left: -4, backgroundColor: '#C8F000', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 1 },
    bestsellerText: { color: '#1a1a1a', fontSize: 7, fontWeight: 'bold' },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15, marginBottom: 10, color: '#1a1a1a', paddingHorizontal: 20 },

    addonsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20 },
    addonChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff', borderRadius: 20, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
    addonChipSelected: { backgroundColor: '#84c95c', borderColor: '#84c95c' },
    addonName: { fontSize: 13, fontWeight: '600', color: '#555', marginRight: 5 },
    addonPrice: { fontSize: 13, fontWeight: '700', color: '#84c95c' },

    subSectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 5, marginBottom: 10, color: '#1a1a1a', paddingHorizontal: 20 },

    vehicleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15 },
    vehicleIconBtn: { alignItems: 'center', justifyContent: 'center', width: '23%', paddingVertical: 12, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
    vehicleIconBtnSelected: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
    vehicleTypeName: { fontSize: 10, fontWeight: '500', color: '#999', marginTop: 4 },

    input: { backgroundColor: '#fff', borderRadius: 15, paddingHorizontal: 20, paddingVertical: 15, fontSize: 14, color: '#1a1a1a', borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 20, marginHorizontal: 20 },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    totalContainer: { justifyContent: 'center' },
    totalLabel: { fontSize: 12, color: '#888', marginLeft: 6 },
    totalPrice: { fontSize: 24, fontWeight: 'bold', color: '#84c95c', marginLeft: 6 },
    nextButton: { backgroundColor: '#C8F000', paddingVertical: 15, paddingHorizontal: 0, borderRadius: 30, width: 150, marginLeft: 30, alignItems: 'center' },
    nextButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },

    savedCarCard: {
        width: 120,
        height: 100,
        borderRadius: 14,
        backgroundColor: '#fff',
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#eee',
    },
    savedCarCardSelected: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
    savedCarNumber: { marginTop: 6, fontSize: 13, fontWeight: 'bold', color: '#1a1a1a' },
    savedCarType: { fontSize: 11, color: '#666', marginTop: 2 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    priceInput: {
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 15,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 25,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
    },
    saveButton: {
        backgroundColor: '#84c95c',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
