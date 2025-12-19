import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import BookingStepper from '../../../../components/BookingStepper';

export default function BookingSummaryScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();

    const {
        serviceName,
        servicePrice,
        addons,
        vehicleType,
        vehicleNumber,
        shopName,
        shopAddress,
        shopImage,
        shopRating,
        shopLat,
        shopLong,
        selectedDate,
        selectedTime,
        userPhone,
        totalPrice
    } = params;

    const lat = parseFloat(shopLat as string) || 37.7749;
    const long = parseFloat(shopLong as string) || -122.4194;

    // Payment Logic
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
    const itemTotal = parseFloat(totalPrice as string) || 0;
    const taxAmount = Math.round(itemTotal * 0.18);
    const grandTotal = itemTotal + taxAmount;

    const paymentOptions = [
        { id: 'upi', label: 'UPI', subLabel: 'Pay via Google Pay, PhonePe, Paytm', icon: 'wallet-outline', recommended: true },
        { id: 'card', label: 'Credit / Debit Cards', subLabel: 'VISA, MasterCard', icon: 'card-outline' },
        { id: 'netbanking', label: 'Netbanking', subLabel: 'All major banks supported', icon: 'business-outline' },
        { id: 'cash', label: 'Pay on Delivery / Cash', subLabel: 'Pay after service completion', icon: 'cash-outline' },
    ];

    const parsedAddons = addons ? JSON.parse(addons as string) : {};
    const addonNames = Object.keys(parsedAddons).filter(k => parsedAddons[k]);

    useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: { display: 'none' }
        });
    }, [navigation]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Booking Summary</Text>
                <View style={{ width: 40 }} />
            </View>

            <BookingStepper currentStep={3} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>

                {/* Map View */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: lat,
                            longitude: long,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false} // Minimap usually static
                        zoomEnabled={false}
                    >
                        <Marker
                            coordinate={{ latitude: lat, longitude: long }}
                            title={shopName as string}
                            description={shopAddress as string}
                        />
                    </MapView>
                    <View style={styles.mapOverlay}>
                        <View style={styles.shopPinCard}>
                            <View style={styles.shopIconContainer}>
                                <Ionicons name="location" size={20} color="#fbc02d" />
                            </View>
                            <View>
                                <Text style={styles.pinShopName}>{shopName || 'Shop Name'}</Text>
                                <Text style={styles.pinShopAddress} numberOfLines={1}>{shopAddress || 'Location'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Booking Details Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>

                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Ionicons name="car-sport" size={20} color="#555" />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.label}>Vehicle</Text>
                            <Text style={styles.value}>
                                {vehicleType ? (vehicleType as string).charAt(0).toUpperCase() + (vehicleType as string).slice(1) : 'Sedan'} - {vehicleNumber || 'N/A'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Ionicons name="calendar" size={20} color="#555" />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.label}>Date & Time</Text>
                            <Text style={styles.value}>
                                {selectedDate ? new Date(selectedDate as string).toLocaleDateString() : 'Date'}, {selectedTime || 'Time'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Ionicons name="call" size={20} color="#555" />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.label}>Contact Number</Text>
                            <Text style={styles.value}>+91 {userPhone || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Payment Summary */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Payment Summary</Text>

                    <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>{serviceName || 'Service'}</Text>
                        <Text style={styles.paymentValue}>₹{servicePrice || 0}</Text>
                    </View>

                    {addonNames.map((addon) => (
                        <View key={addon} style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>{addon.replace(/([A-Z])/g, ' $1').trim()}</Text>
                            <Text style={styles.paymentValue}>
                                {addon === 'acService' ? '+₹10' : '+₹5'}
                            </Text>
                        </View>
                    ))}

                    <View style={styles.totalDivider} />

                    <View style={styles.paymentRow}>
                        <Text style={styles.totalTextLabel}>Tax (18% GST)</Text>
                        <Text style={styles.totalTextValue}>₹{taxAmount}</Text>
                    </View>
                    <View style={styles.totalDivider} />
                    <View style={styles.paymentRow}>
                        <Text style={styles.totalTextLabel}>Grand Total</Text>
                        <Text style={styles.totalTextValue}>₹{grandTotal}</Text>
                    </View>
                </View>

                {/* Payment Options */}
                {/* Payment Options */}
                <Text style={styles.paymentTitle}>Payment Options</Text>

                {paymentOptions.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionCard,
                            selectedPaymentMethod === option.id && styles.optionCardSelected
                        ]}
                        onPress={() => setSelectedPaymentMethod(option.id)}
                    >
                        {option.recommended && (
                            <View style={styles.recommendedBadge}>
                                <Text style={styles.recommendedText}>RECOMMENDED</Text>
                            </View>
                        )}

                        <View style={styles.optionRow}>
                            <View style={styles.radioContainer}>
                                <View style={[
                                    styles.radioInfo,
                                    selectedPaymentMethod === option.id ? styles.radioSelected : styles.radioUnselected
                                ]}>
                                    {selectedPaymentMethod === option.id && <View style={styles.radioDot} />}
                                </View>
                            </View>

                            <View style={[styles.optionIconContainer, { backgroundColor: selectedPaymentMethod === option.id ? '#f0f9eb' : '#F5F5F5' }]}>
                                <Ionicons name={option.icon as any} size={24} color={selectedPaymentMethod === option.id ? '#1a1a1a' : '#666'} />
                            </View>

                            <View style={styles.optionContent}>
                                <Text style={styles.optionLabel}>{option.label}</Text>
                                <Text style={styles.optionSubLabel}>{option.subLabel}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                <View style={styles.securityNote}>
                    <Ionicons name="shield-checkmark-outline" size={16} color="#999" />
                    <Text style={styles.securityText}>100% Safe & Secure Payments</Text>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => {
                        if (!selectedPaymentMethod) {
                            Alert.alert('Payment Method Required', 'Please select a payment option to proceed.');
                            return;
                        }
                        router.push({
                            pathname: '/(tabs)/home/book-service/order-confirmation',
                            params: {
                                shopName: shopName,
                                shopAddress: shopAddress,
                                shopImage: shopImage,
                                shopRating: shopRating,
                                date: selectedDate,
                                time: selectedTime
                            }
                        });
                    }}
                >
                    <View style={styles.payButtonContent}>
                        <Ionicons name="lock-closed" size={20} color="#1a1a1a" style={{ marginRight: 8 }} />
                        <Text style={styles.payButtonText}>Pay ₹{grandTotal}</Text>
                    </View>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f9f9f9',
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },

    // Map
    mapContainer: {
        height: 200,
        marginHorizontal: 20,
        borderRadius: 20,
        overflow: 'hidden',
        marginTop: 10,
        marginBottom: 20,
        position: 'relative',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 15,
        left: 15,
        right: 15,
    },
    shopPinCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 15,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#FFF9C4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    pinShopName: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },
    pinShopAddress: { fontSize: 10, color: '#666', marginTop: 2 },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 15,
    },
    paymentTitle: {
        marginLeft: 20,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    rowContent: {
        flex: 1,
    },
    label: { fontSize: 12, color: '#888', marginBottom: 2 },
    value: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 12,
        marginLeft: 51, // offset icon width
    },

    // Payment
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    paymentLabel: { fontSize: 14, color: '#666' },
    paymentValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
    totalDivider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    totalTextLabel: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
    totalTextValue: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        paddingBottom: 30,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    payButton: {
        backgroundColor: '#C8F000',
        borderRadius: 30,
        paddingVertical: 16,
        alignItems: 'center',
    },
    payButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    payButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },

    // Payment Options Styles
    optionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
        position: 'relative',
        overflow: 'hidden'
    },
    optionCardSelected: {
        borderColor: '#84c95c',
        backgroundColor: '#fff',
    },
    recommendedBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#FFEB3B',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderBottomLeftRadius: 10,
    },
    recommendedText: { fontSize: 10, fontWeight: 'bold', color: '#1a1a1a' },
    optionRow: { flexDirection: 'row', alignItems: 'flex-start' },
    radioContainer: { marginRight: 15, paddingTop: 2 },
    radioInfo: {
        width: 20, height: 20, borderRadius: 10, borderWidth: 2,
        alignItems: 'center', justifyContent: 'center'
    },
    radioUnselected: { borderColor: '#ddd' },
    radioSelected: { borderColor: '#84c95c' },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#84c95c' },
    optionIconContainer: {
        width: 40, height: 40, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center', marginRight: 15
    },
    optionContent: { flex: 1 },
    optionLabel: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
    optionSubLabel: { fontSize: 12, color: '#888', marginBottom: 5 },
    securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    securityText: { fontSize: 12, color: '#999', marginLeft: 5 },
});
