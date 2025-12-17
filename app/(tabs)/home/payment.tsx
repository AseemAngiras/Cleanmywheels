import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PaymentScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {
        serviceName,
        servicePrice,
        addons,
        totalPrice, // This is treated as Subtotal/Item Total
    } = params;

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');

    // Calculations
    const itemTotal = parseFloat(totalPrice as string) || 0;
    const taxAmount = Math.round(itemTotal * 0.18);
    const grandTotal = itemTotal + taxAmount;

    // Parse Addons for display if needed, or just show count
    const parsedAddons = addons ? JSON.parse(addons as string) : {};
    const addonNames = Object.keys(parsedAddons).filter(k => parsedAddons[k]);
    const addonsTotal = addonNames.reduce((acc, curr) => acc + (curr === 'acService' ? 10 : 5), 0);
    // Note: servicePrice + addonsTotal should equal itemTotal. 
    // If servicePrice is missing (e.g. from earlier flow), we fallback.

    // We can allow the UI to show the breakdown:
    // Item Total (Service)
    // Add-ons 
    // But `itemTotal` passed from previous screen ALREADY includes add-ons. 
    // So "Item Total (Premium Wash)" might be misleading if we just put service price.
    // Let's stick to the visual: "Item Total (Service)" = Service Price, "Add-ons" = Addon Price.

    const baseServicePrice = parseFloat(servicePrice as string) || (itemTotal - addonsTotal);

    const paymentOptions = [
        { id: 'upi', label: 'UPI', subLabel: 'Pay via Google Pay, PhonePe, Paytm', icon: 'wallet-outline', recommended: true },
        { id: 'card', label: 'Credit / Debit Cards', subLabel: 'VISA, MasterCard', icon: 'card-outline' },
        { id: 'netbanking', label: 'Netbanking', subLabel: 'All major banks supported', icon: 'business-outline' },
        { id: 'cash', label: 'Pay on Delivery / Cash', subLabel: 'Pay after service completion', icon: 'cash-outline' },
    ];

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>

                {/* Hero Amount */}
                <View style={styles.heroSection}>
                    <Text style={styles.heroLabel}>AMOUNT TO PAY</Text>
                    <Text style={styles.heroAmount}>₹{grandTotal}</Text>
                </View>

                {/* Bill Summary */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={styles.billIcon}>
                            <Ionicons name="receipt-outline" size={20} color="#4CAF50" />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>Bill Summary</Text>
                            <Text style={styles.orderId}>Order #GW-{Math.floor(Math.random() * 90000) + 10000}</Text>
                        </View>
                    </View>

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Item Total ({serviceName || 'Service'})</Text>
                        <Text style={styles.billValue}>₹{baseServicePrice}</Text>
                    </View>

                    {addonsTotal > 0 && (
                        <View style={styles.billRow}>
                            <Text style={styles.billLabel}>Add-ons ({addonNames.length})</Text>
                            <Text style={styles.billValue}>₹{addonsTotal}</Text>
                        </View>
                    )}

                    <View style={styles.billRow}>
                        <Text style={styles.billLabel}>Taxes & Fees (GST 18%)</Text>
                        <Text style={styles.billValue}>₹{taxAmount}</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.billRow}>
                        <Text style={styles.grandTotalLabel}>Grand Total</Text>
                        <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
                    </View>
                </View>

                {/* Payment Options */}
                <Text style={styles.sectionTitle}>Payment Options</Text>

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

                            <View style={[styles.optionIconContainer, { backgroundColor: selectedPaymentMethod === option.id ? '#E8F5E9' : '#F5F5F5' }]}>
                                <Ionicons name={option.icon as any} size={24} color={selectedPaymentMethod === option.id ? '#4CAF50' : '#666'} />
                            </View>

                            <View style={styles.optionContent}>
                                <Text style={styles.optionLabel}>{option.label}</Text>
                                <Text style={styles.optionSubLabel}>{option.subLabel}</Text>

                                {/* Example Logos for UPI */}
                                {option.id === 'upi' && selectedPaymentMethod === 'upi' && (
                                    <View style={styles.upiLogos}>
                                        <View style={styles.upiIconPlaceholder}><Text style={{ fontSize: 8, fontWeight: 'bold' }}>GPay</Text></View>
                                        <View style={styles.upiIconPlaceholder}><Text style={{ fontSize: 8, fontWeight: 'bold' }}>Pe</Text></View>
                                        <View style={styles.upiIconPlaceholder}><Text style={{ fontSize: 8, fontWeight: 'bold' }}>Paytm</Text></View>
                                    </View>
                                )}
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
                <View>
                    <Text style={styles.footerTotalLabel}>Total</Text>
                    <Text style={styles.footerTotalValue}>₹{grandTotal}</Text>
                </View>

                <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => router.push('/(tabs)/home')} // Loop back to home for now
                >
                    <Ionicons name="lock-closed" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.payButtonText}>Pay ₹{grandTotal}</Text>
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
        justifyContent: 'center', // Center title
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#f9f9f9',
        position: 'relative'
    },
    backButton: { position: 'absolute', left: 20, padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },

    heroSection: { alignItems: 'center', marginVertical: 20 },
    heroLabel: { fontSize: 12, color: '#666', marginBottom: 5, letterSpacing: 1 },
    heroAmount: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },

    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 30,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    billIcon: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
        marginRight: 15
    },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
    orderId: { fontSize: 12, color: '#4CAF50' },

    billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    billLabel: { fontSize: 14, color: '#666' },
    billValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10, borderStyle: 'dotted', borderWidth: 1, borderColor: '#eee' },

    grandTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
    grandTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },

    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginLeft: 20, marginBottom: 15 },

    // payment Options
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
        borderColor: '#4CAF50',
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
    radioSelected: { borderColor: '#4CAF50' },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50' },

    optionIconContainer: {
        width: 40, height: 40, borderRadius: 10,
        alignItems: 'center', justifyContent: 'center', marginRight: 15
    },
    optionContent: { flex: 1 },
    optionLabel: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
    optionSubLabel: { fontSize: 12, color: '#888', marginBottom: 5 },

    upiLogos: { flexDirection: 'row', marginTop: 5 },
    upiIconPlaceholder: {
        width: 30, height: 20, backgroundColor: '#f0f0f0', borderRadius: 4,
        justifyContent: 'center', alignItems: 'center', marginRight: 8
    },

    securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    securityText: { fontSize: 12, color: '#999', marginLeft: 5 },

    // Footer
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        padding: 20, paddingBottom: 30,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1, shadowRadius: 10, elevation: 20,
    },
    footerTotalLabel: { fontSize: 12, color: '#888' },
    footerTotalValue: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
    payButton: {
        backgroundColor: '#84c95c',
        borderRadius: 30,
        paddingVertical: 12, paddingHorizontal: 30,
        flexDirection: 'row', alignItems: 'center',
        shadowColor: '#84c95c', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 5, elevation: 5,
    },
    payButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
