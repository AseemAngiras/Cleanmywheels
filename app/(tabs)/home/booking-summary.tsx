import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

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
        shopLat,
        shopLong,
        selectedDate,
        selectedTime,
        userPhone,
        totalPrice
    } = params;

    const lat = parseFloat(shopLat as string) || 37.7749;
    const long = parseFloat(shopLong as string) || -122.4194;

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
                        <Text style={styles.totalTextLabel}>Total Amount</Text>
                        <Text style={styles.totalTextValue}>₹{totalPrice || 0}</Text>
                    </View>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => router.push({
                        pathname: '/(tabs)/home/payment',
                        params: params // Pass all params forward
                    })}
                >
                    <View style={styles.payButtonContent}>
                        <Text style={styles.payButtonText}>Pay ₹{totalPrice || 0}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#1a1a1a" />
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
    totalTextValue: { fontSize: 18, fontWeight: 'bold', color: '#84c95c' },

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
        backgroundColor: '#ffeb69',
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
        marginRight: 8,
    },
});
