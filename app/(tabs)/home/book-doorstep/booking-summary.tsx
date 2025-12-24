
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import BookingStepper from '../../../../components/BookingStepper';

export default function BookingSummaryScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();

    // Extract params - Note that for doorstep flow, we display user address instead of shop address
    const {
        serviceName,
        servicePrice,
        addons,
        vehicleType,
        vehicleNumber,
        shopName, // This might be the selected shop name for service assignment
        // shopAddress, // Not used for map, but might be relevant? 
        // shopImage, 
        // shopRating,
        shopLat, // These might be shop coordinates
        shopLong,

        // Slot info
        selectedDate,
        selectedTime,

        // User info
        userPhone,
        userName,

        // Address info (passed from earlier flow or context)
        // Wait, where is address coming from? 
        // It should have been passed down from enter-location -> select-service -> shops-list -> select-slot -> summary
        // Let's assume we need to ensure these params traverse the stack.
        // Or if using context, we grab from there. 
        // For now, let's look for address params.
        address,
        latitude,
        longitude,

        totalPrice
    } = params;

    const lat = parseFloat(latitude as string) || 37.7749;
    const long = parseFloat(longitude as string) || -122.4194;

    // Payment Logic
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('upi');
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const itemTotal = parseFloat(totalPrice as string) || 0;
    const taxAmount = Math.round(itemTotal * 0.18);
    const grandTotal = itemTotal + taxAmount;

    const paymentOptions = [
        { id: 'upi', label: 'UPI', subLabel: 'Pay via Google Pay, PhonePe, Paytm', icon: 'wallet-outline', recommended: true },
        { id: 'card', label: 'Credit / Debit Cards', subLabel: 'VISA, MasterCard', icon: 'card-outline' },
        { id: 'netbanking', label: 'Netbanking', subLabel: 'All major banks supported', icon: 'business-outline' },
        { id: 'cash', label: 'Pay with Cash', subLabel: 'Pay after service completion', icon: 'cash-outline' },
    ];

    const selectedPaymentOption = paymentOptions.find(opt => opt.id === selectedPaymentMethod);

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

            <BookingStepper
                currentStep={3}
                steps={[
                    { id: 1, label: 'Service' },
                    { id: 2, label: 'Slot' },
                    { id: 3, label: 'Payment' },
                ]}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>

                {/* Map View - Showing User Location for Doorstep */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: lat,
                            longitude: long,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                    >
                        <Marker
                            coordinate={{ latitude: lat, longitude: long }}
                            title="Your Location"
                            description={address as string || "Selected Address"}
                        />
                    </MapView>
                    <View style={styles.mapOverlay}>
                        <View style={styles.shopPinCard}>
                            <View style={styles.shopIconContainer}>
                                <Ionicons name="home" size={20} color="#fbc02d" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.pinShopName}>Service Location</Text>
                                <Text style={styles.pinShopAddress} numberOfLines={1}>{address || 'Your Address'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Booking Details Card */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>

                    {/* Shop Assigned (Service Provider) */}
                    <View style={styles.row}>
                        <View style={styles.iconBox}>
                            <Ionicons name="briefcase" size={20} color="#555" />
                        </View>
                        <View style={styles.rowContent}>
                            <Text style={styles.label}>Service Provider</Text>
                            <Text style={styles.value}>{shopName || 'Assigned Professional'}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

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
                                {selectedDate ? new Date(selectedDate as string).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }) : 'Date'}, {selectedTime || 'Time'}
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

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.paymentMethodSelector}
                    onPress={() => setShowPaymentModal(true)}
                >
                    <View style={styles.payUsingRow}>
                        {selectedPaymentOption && (
                            <Ionicons
                                name={selectedPaymentOption.icon as any}
                                size={14}
                                color="#666"
                                style={{ marginRight: 4 }}
                            />
                        )}
                        <Text style={styles.payUsingText}>PAY USING</Text>
                        <Ionicons name="caret-up" size={10} color="#666" style={{ marginLeft: 4 }} />
                    </View>
                    <Text style={styles.selectedMethodText} numberOfLines={1}>
                        {selectedPaymentOption ? selectedPaymentOption.label : 'Select Payment Mode'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.payButton, !selectedPaymentMethod && styles.payButtonDisabled]}
                    disabled={!selectedPaymentMethod}
                    onPress={() => {
                        if (!selectedPaymentMethod) {
                            Alert.alert('Payment Method Required', 'Please select a payment option to proceed.');
                            return;
                        }
                        // Navigate to Order Confirmation / Tracking Ticket
                        router.push({
                            pathname: '/(tabs)/home/book-doorstep/order-confirmation',
                            params: {
                                ...params,
                                grandTotal,
                                paymentMethod: selectedPaymentMethod
                            }
                        });
                    }}
                >
                    <View style={styles.payButtonContent}>
                        <View style={styles.payButtonPriceContainer}>
                            <Text style={styles.payButtonPriceText}>₹{grandTotal}</Text>
                            <Text style={styles.payButtonTotalLabel}>TOTAL</Text>
                        </View>
                        <View style={styles.payButtonActionContainer}>
                            <Text style={styles.payButtonActionText}>Pay Now</Text>
                            <Ionicons name="caret-forward" size={16} color="#1a1a1a" style={{ marginLeft: 4 }} />
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Payment Options Modal */}
            <Modal
                visible={showPaymentModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPaymentModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => setShowPaymentModal(false)}>
                        <View style={styles.modalBackdrop} />
                    </TouchableWithoutFeedback>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Payment Options</Text>
                            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                                <Ionicons name="close" size={24} color="#1a1a1a" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={styles.modalScroll}>
                            {paymentOptions.map(option => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={[
                                        styles.optionCard,
                                        selectedPaymentMethod === option.id && styles.optionCardSelected,
                                    ]}
                                    onPress={() => {
                                        setSelectedPaymentMethod(option.id);
                                        setShowPaymentModal(false);
                                    }}
                                >
                                    <View style={styles.optionRow}>
                                        <View style={styles.radioContainer}>
                                            <View
                                                style={[
                                                    styles.radioInfo,
                                                    selectedPaymentMethod === option.id
                                                        ? styles.radioSelected
                                                        : styles.radioUnselected,
                                                ]}
                                            >
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
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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
        backgroundColor: '#fff3e0', // Orange-ish for user address
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
        marginLeft: 51,
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 24,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    paymentMethodSelector: {
        flex: 1,
        marginRight: 15,
        justifyContent: 'center',
    },
    payUsingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    payUsingText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#888',
        textTransform: 'uppercase',
    },
    selectedMethodText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    payButton: {
        backgroundColor: '#C8F000',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        flex: 1.2, // Give button more space
        height: 50,
        justifyContent: 'center',
    },
    payButtonDisabled: {
        backgroundColor: '#f0f0f0',
        opacity: 0.7,
    },
    payButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    payButtonPriceContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    payButtonPriceText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    payButtonTotalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#1a1a1a',
        opacity: 0.6,
    },
    payButtonActionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    payButtonActionText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalBackdrop: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 20,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    modalScroll: {
        paddingBottom: 20,
    },

    // Payment Options Styles
    optionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 15,
        padding: 20,
        borderWidth: 1,
        borderColor: '#eee', // Changed to match other file
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
        backgroundColor: '#f8fff5', // Changed to match other file
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
