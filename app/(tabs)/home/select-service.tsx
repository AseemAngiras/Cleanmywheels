import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Image, Keyboard, KeyboardAvoidingView, LayoutAnimation, Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, UIManager, View } from 'react-native';
import BookingStepper from '../../../components/BookingStepper';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function SelectServiceScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const [selectedService, setSelectedService] = useState('premium');
    const [addons, setAddons] = useState({
        wheelWash: false,
        acService: false,
        matPolish: false,
    });
    const [expandedService, setExpandedService] = useState<string | null>(null);

    // Vehicle State
    const [vehicleType, setVehicleType] = useState('sedan');
    const [vehicleNumber, setVehicleNumber] = useState('');

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

    const addonList = [
        { id: 'wheelWash', name: 'Wheel Wash', price: 5 },
        { id: 'acService', name: 'AC Service', price: 10 },
        { id: 'matPolish', name: 'Mat Polish', price: 5 },
    ];

    const toggleAddon = (id: keyof typeof addons) => {
        setAddons((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleDetails = (id: string, e: any) => {
        e.stopPropagation(); // Prevent selecting the card when easy toggling
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedService(expandedService === id ? null : id);
    };

    const calculateTotal = () => {
        const servicePrice = services.find((s) => s.id === selectedService)?.price || 0;
        let addonTotal = 0;
        if (addons.wheelWash) addonTotal += 5;
        if (addons.acService) addonTotal += 10;
        if (addons.matPolish) addonTotal += 5;
        return servicePrice + addonTotal;
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
                        {services.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                style={[
                                    styles.serviceCard,
                                    selectedService === service.id && styles.selectedServiceCard,
                                ]}
                                onPress={() => setSelectedService(service.id)}
                                activeOpacity={0.9}
                            >
                                <View style={styles.cardHeader}>
                                    <Image source={{ uri: service.image }} style={styles.serviceImage} />
                                    <View style={styles.serviceInfo}>
                                        {service.isBestseller && (
                                            <View style={styles.bestsellerBadge}>
                                                <Text style={styles.bestsellerText}>BESTSELLER</Text>
                                            </View>
                                        )}
                                        <Text style={styles.serviceName}>{service.name}</Text>
                                        <Text style={styles.serviceDesc}>{service.description}</Text>
                                    </View>

                                    <View style={styles.priceContainer}>
                                        <Text style={styles.servicePrice}>₹{service.price}</Text>
                                        <TouchableOpacity onPress={(e) => toggleDetails(service.id, e)} style={styles.dropdownButton}>
                                            <Ionicons
                                                name={expandedService === service.id ? "chevron-up" : "chevron-down"}
                                                size={20}
                                                color="#999"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {expandedService === service.id && (
                                    <View style={styles.detailsContainer}>
                                        <View style={styles.separator} />
                                        <Text style={styles.detailsText}>{service.details}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}

                        <Text style={styles.sectionTitle}>Make it Shine (Add-ons)</Text>

                        {addonList.map((addon) => (
                            <View key={addon.id} style={styles.addonRow}>
                                <View>
                                    <Text style={styles.addonName}>{addon.name}</Text>
                                    <Text style={styles.addonPrice}>+₹{addon.price}</Text>
                                </View>
                                <Switch
                                    trackColor={{ false: '#e0e0e0', true: '#84c95c' }}
                                    thumbColor={'#fff'}
                                    onValueChange={() => toggleAddon(addon.id as keyof typeof addons)}
                                    value={addons[addon.id as keyof typeof addons]}
                                />
                            </View>
                        ))}
                        {/* Vehicle Selection Section */}
                        <Text style={styles.sectionTitle}>Vehicle Details</Text>
                        <View style={styles.gridContainer}>
                            {vehicleTypes.map((type) => {
                                const isSelected = vehicleType === type.id;
                                return (
                                    <TouchableOpacity
                                        key={type.id}
                                        style={[
                                            styles.typeCard,
                                            isSelected && styles.selectedTypeCard
                                        ]}
                                        onPress={() => setVehicleType(type.id)}
                                    >
                                        {isSelected && (
                                            <View style={styles.checkmarkContainer}>
                                                <Ionicons name="checkmark-circle" size={20} color="#84c95c" />
                                            </View>
                                        )}
                                        <View style={[
                                            styles.iconContainer,
                                            isSelected ? styles.selectedIconContainer : styles.unselectedIconContainer
                                        ]}>
                                            <MaterialCommunityIcons
                                                name={type.icon as any}
                                                size={32}
                                                color={isSelected ? "#1a1a1a" : "#999"}
                                            />
                                        </View>
                                        <Text style={[
                                            styles.typeText,
                                            isSelected && styles.selectedTypeText
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
                <TouchableOpacity style={styles.nextButton} onPress={() => {
                    const params = {
                        serviceId: selectedService,
                        serviceName: services.find(s => s.id === selectedService)?.name,
                        servicePrice: services.find(s => s.id === selectedService)?.price,
                        addons: JSON.stringify(addons),
                        totalPrice: calculateTotal(),
                        vehicleType,
                        vehicleNumber: vehicleNumber.toUpperCase()
                    };
                    router.push({ pathname: '/(tabs)/home/shops-list', params });
                }}>
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
    container: { padding: 20, paddingBottom: 100 },

    serviceCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        marginBottom: 15,
        borderWidth: 2,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectedServiceCard: {
        borderColor: '#84c95c', // Green border
    },
    serviceImage: {
        width: 60,
        height: 60,
        borderRadius: 15,
        marginRight: 15,
    },
    serviceInfo: { flex: 1 },
    bestsellerBadge: {
        backgroundColor: '#e6f7e0',
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
    },
    bestsellerText: {
        color: '#6bb84c',
        fontSize: 10,
        fontWeight: 'bold',
    },
    serviceName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
    serviceDesc: { fontSize: 12, color: '#888', marginTop: 2 },
    priceContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 60,
    },
    servicePrice: { fontSize: 16, fontWeight: 'bold', color: '#84c95c' },
    dropdownButton: {
        padding: 5,
    },
    detailsContainer: {
        marginTop: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginBottom: 10,
    },
    detailsText: {
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 15,
        color: '#1a1a1a',
    },
    addonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 20,
        marginBottom: 10,
    },
    addonName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
    addonPrice: { fontSize: 12, color: '#84c95c', marginTop: 2 },

    // Vehicle Styles
    subSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 5,
        marginBottom: 10,
        color: '#1a1a1a',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: -40, // Negative margin to pull next section up
    },
    typeCard: {
        width: '48%',
        aspectRatio: 1.1,
        backgroundColor: '#fff',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 2,
        borderColor: '#f0f0f0',
        position: 'relative',
    },
    selectedTypeCard: {
        borderColor: '#84c95c',
        backgroundColor: '#f0f9eb',
    },
    iconContainer: {
        padding: 15,
        borderRadius: 20,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unselectedIconContainer: {
        backgroundColor: '#f5f5f5',
    },
    selectedIconContainer: {
        backgroundColor: '#84c95c',
    },
    checkmarkContainer: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
    },
    typeText: {
        marginTop: 5,
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    selectedTypeText: {
        color: '#1a1a1a',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 14, // Changed from 16 to 14
        color: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 15
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
        backgroundColor: '#ffeb69',
        paddingVertical: 15,
        paddingHorizontal: 0,
        borderRadius: 30,
        width: 150,
        marginLeft: 30,
        alignItems: 'center',
    },
    nextButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
});
