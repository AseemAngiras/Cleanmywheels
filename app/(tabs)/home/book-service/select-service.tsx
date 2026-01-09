
import { useAppSelector } from '@/store/hooks';
import { addCar } from '@/store/slices/userSlice';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Image, Keyboard, KeyboardAvoidingView, LayoutAnimation, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, UIManager, View } from 'react-native';
import { useDispatch } from 'react-redux';
import BookingStepper from '../../../../components/BookingStepper';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// Define available add-ons per service
const SERVICE_ADDONS: Record<string, { id: string; name: string; price: number }[]> = {
    basic: [
        { id: 'wheelWash', name: 'Wheel Wash', price: 5 },
        { id: 'matPolish', name: 'Mat Polish', price: 5 },
    ],
    premium: [],
    detailing: [
        { id: 'ceramicCoating', name: 'Ceramic Coating', price: 50 },
        { id: 'scratchRemoval', name: 'Scratch Removal', price: 30 },
        { id: 'engineBay', name: 'Engine Bay Clean', price: 20 },
    ],
};

export default function SelectServiceScreen() {
    const dispatch = useDispatch();
    const cars = useAppSelector((state) => state.user.cars);

    const router = useRouter();
    const navigation = useNavigation();
    const [selectedService, setSelectedService] = useState<string | null>('premium');
    const [addons, setAddons] = useState<Record<string, boolean>>({});

    const [detailsExpanded, setDetailsExpanded] = useState<Set<string>>(new Set());

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

    // Vehicle State
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

    const services = [
        {
            id: 'basic',
            name: 'Basic Wash',
            price: 15,
            description: 'Exterior rinse & soap wash.',
            details: 'Includes high-pressure water rinse, foam soap formatting, and hand dry.',
            image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        },
        {
            id: 'premium',
            name: 'Premium Wash',
            price: 25,
            description: 'Exterior + Interior vacuum.',
            details: 'Includes Basic Wash features plus interior vacuuming, dashboard wiping, and window cleaning.',
            image: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
            isBestseller: true,
        },
        {
            id: 'detailing',
            name: 'Full Detailing',
            price: 80,
            description: 'Complete restoration & wax.',
            details: 'Comprehensive cleaning including clay bar treatment, machine polishing, waxing, and deep interior shampoo.',
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
        },
    ];

    const currentAddons = selectedService ? SERVICE_ADDONS[selectedService] || [] : [];

    const toggleAddon = (id: string) => {
        setAddons((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleServiceSelect = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedService(id);
        setAddons({});
    }

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
    }

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

                        {/* Services - Vertical Accordion */}
                        <View style={styles.servicesContainer}>
                            {services.map((service) => {
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
                                            // EXPANDED STATE
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
                                                        {/* Text Section (Left) */}
                                                        <View style={{ flex: 1, marginRight: 10 }}>
                                                            <Text style={styles.expandedName}>{service.name}</Text>
                                                            <Text style={styles.expandedPrice}>₹{service.price}</Text>
                                                            <Text style={styles.expandedDesc}>{service.description}</Text>
                                                        </View>

                                                        {/* Icons Section (Right) */}
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

                                                {/* Inline Details Dropdown */}
                                                {detailsExpanded.has(service.id) && (
                                                    <View style={styles.detailsContainer}>
                                                        <Text style={styles.detailsText}>{service.details}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        ) : (
                                            // COLLAPSED STATE
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
                    style={[styles.nextButton, !selectedService && { opacity: 0.5 }]}
                    disabled={!selectedService}
                    onPress={() => {
                        if (!selectedService) {
                            Alert.alert("Selection Required", "Please select a service to proceed.");
                            return;
                        }
                        // Basic Indian Vehicle Number Validation (e.g. KA01AB1234, DL1CA1234)
                        // Remove spaces/dashes
                        const cleanNumber = vehicleNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

                        if (cleanNumber.length < 6 || cleanNumber.length > 11) {
                            Alert.alert("Invalid Vehicle Number", "Please enter a valid vehicle number (e.g., KA01AB1234).");
                            return;
                        }

                        // Regex: 
                        // ^[A-Z]{2}        : State Code (e.g. KA, DL)
                        // [0-9]{1,2}       : District Code (e.g. 01, 1)
                        // [A-Z]{0,3}       : Series (e.g. AB, A, or empty)
                        // [0-9]{4}         : Unique Number (e.g. 1234)
                        const vehicleRegex = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;

                        if (!vehicleRegex.test(cleanNumber)) {
                            Alert.alert("Invalid Vehicle Number", "Please enter a valid vehicle number format (e.g., KA01AB1234).");
                            return;
                        }
                        const service = services.find(s => s.id === selectedService);

                        if (!service) return;

                        const selectedAddons = currentAddons.filter(
                            addon => addons[addon.id]
                        )

                        const bookingDraft = {
                            service: {
                                id: service.id,
                                name: service.name,
                                basePrice: service.price,
                                addons: selectedAddons,
                                totalPrice: calculateTotal(),
                            },
                            vehicle: {
                                type: vehicleType,
                                number: vehicleNumber.toUpperCase(),
                            },
                        };

                        const normalizedNumber = vehicleNumber.trim().toUpperCase();

                        let existingCar = cars.find(
                            car => car.number === normalizedNumber
                        );

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


                        router.push({
                            pathname: '/(tabs)/home/book-service/shops-list',
                            params: {
                                bookingDraft: JSON.stringify(bookingDraft)
                            }
                        });
                    }}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                </TouchableOpacity>
            </View>
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

    // Services Accordion
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
        // Shadow
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    },
    serviceCardExpandedLayout: {
        padding: 15,
    },
    serviceCardCollapsedLayout: {
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    serviceCardSelectedBorder: {
        borderColor: '#84c95c',
        backgroundColor: '#fbfdfa',
        borderWidth: 2,
    },
    serviceCardUnselectedBorder: {
        borderColor: '#eee',
        backgroundColor: '#fff',
        borderWidth: 1,
    },

    // Expanded Styles
    expandedHeader: {
        flexDirection: 'row',
    },
    expandedImageContainer: {
        marginRight: 15,
        position: 'relative',
    },
    expandedImage: {
        width: 60, height: 60, borderRadius: 10, backgroundColor: '#eee',
    },
    expandedContent: {
        flex: 1,
        flexDirection: 'row',
    },
    expandedName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
    expandedPrice: { fontSize: 18, fontWeight: 'bold', color: '#84c95c', marginVertical: 4 },
    expandedDesc: { fontSize: 12, color: '#666', lineHeight: 16 },

    // Inline Details
    detailsContainer: {
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    detailsText: { fontSize: 13, color: '#555', lineHeight: 20, fontStyle: 'italic' },

    // Collapsed Styles
    collapsedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    collapsedName: { fontSize: 15, fontWeight: '500', color: '#333' },
    collapsedPrice: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },

    bestsellerBadge: {
        position: 'absolute',
        top: -6,
        left: -4,
        backgroundColor: '#C8F000',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 1,
    },
    bestsellerText: {
        color: '#1a1a1a',
        fontSize: 7,
        fontWeight: 'bold',
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 10,
        color: '#1a1a1a',
        paddingHorizontal: 20,
    },

    // Addons Chips
    addonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
    },
    addonChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    addonChipSelected: {
        backgroundColor: '#84c95c',
        borderColor: '#84c95c',
    },
    addonName: { fontSize: 13, fontWeight: '600', color: '#555', marginRight: 5 },
    addonPrice: { fontSize: 13, fontWeight: '700', color: '#84c95c' },

    // Vehicle Styles Compact
    subSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 10,
        color: '#1a1a1a',
        paddingHorizontal: 20,
    },
    vehicleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    vehicleIconBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '23%',
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    vehicleIconBtnSelected: {
        backgroundColor: '#1a1a1a',
        borderColor: '#1a1a1a',
    },
    vehicleTypeName: {
        fontSize: 10,
        fontWeight: '500',
        color: '#999',
        marginTop: 4,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 14,
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 20,
        marginHorizontal: 20,
    },

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
    totalContainer: {
        justifyContent: 'center',
    },
    totalLabel: { fontSize: 12, color: '#888', marginLeft: 6 },
    totalPrice: { fontSize: 24, fontWeight: 'bold', color: '#84c95c', marginLeft: 6 },
    nextButton: {
        backgroundColor: '#C8F000',
        paddingVertical: 15,
        paddingHorizontal: 0,
        borderRadius: 30,
        width: 150,
        marginLeft: 30,
        alignItems: 'center',
    },
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

    savedCarCardSelected: {
        backgroundColor: '#1a1a1a',
        borderColor: '#1a1a1a',
    },

    savedCarNumber: {
        marginTop: 6,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },

    savedCarType: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },

});