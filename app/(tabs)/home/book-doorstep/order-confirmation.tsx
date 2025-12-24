
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function OrderConfirmationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {
        shopName,
        shopAddress,
        shopImage,
        shopRating,
        selectedDate,
        selectedTime,
        paymentMethod,
        grandTotal,
    } = params;

    const [status, setStatus] = useState('Confirmed');
    const [statusMessage, setStatusMessage] = useState('Your booking has been confirmed.');

    // Simulate Status Updates
    useEffect(() => {
        const timer1 = setTimeout(() => {
            setStatus('Assigning Professional');
            setStatusMessage('We are looking for a nearby professional.');
        }, 3000);

        const timer2 = setTimeout(() => {
            setStatus('On the Way');
            setStatusMessage('Professional Vijay is on the way to your location.');
        }, 8000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Status Header */}
                <View style={styles.statusHeader}>
                    <View style={styles.successIcon}>
                        <Ionicons name="checkmark" size={40} color="#fff" />
                    </View>
                    <Text style={styles.statusTitle}>Booking Confirmed!</Text>
                    <Text style={styles.statusSubtitle}>Ticket #CMW-{Math.floor(Math.random() * 10000)}</Text>
                </View>

                {/* Status Timeline / Updates */}
                <View style={styles.trackingContainer}>
                    <Text style={styles.sectionTitle}>Live Status</Text>

                    {/* Driver Info Card - Standard view now */}
                    {status === 'On the Way' && (
                        <View style={styles.driverInfoCard}>
                            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.driverAvatar} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.driverName}>Vijay Kumar</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="star" size={12} color="#FBC02D" />
                                    <Text style={styles.driverRating}>4.8</Text>
                                </View>
                            </View>
                            <View style={styles.driverActions}>
                                <TouchableOpacity style={styles.callButton}>
                                    <Ionicons name="call" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={styles.timelineContainer}>
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, styles.dotActive]} />
                            <View style={styles.timelineContent}>
                                <Text style={styles.timelineTitle}>{status}</Text>
                                <Text style={styles.timelineDesc}>{statusMessage}</Text>
                            </View>
                        </View>
                        {/* Next steps placeholders */}
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, styles.dotInactive]} />
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineTitle, { color: '#999' }]}>Service In Progress</Text>
                            </View>
                        </View>
                        <View style={styles.timelineItem}>
                            <View style={[styles.timelineDot, styles.dotInactive]} />
                            <View style={styles.timelineContent}>
                                <Text style={[styles.timelineTitle, { color: '#999' }]}>Completed</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Booking Details Summary */}
                <View style={styles.detailsCard}>
                    <Text style={styles.sectionTitle}>Booking Details</Text>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Service</Text>
                        <Text style={styles.detailValue}>{shopName || 'Premium Wash'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date & Time</Text>
                        <Text style={styles.detailValue}>
                            {selectedDate ? new Date(selectedDate as string).toLocaleDateString() : 'Today'}, {selectedTime}
                        </Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Payment Method</Text>
                        <Text style={styles.detailValueVisible}>{paymentMethod ? (paymentMethod as string).toUpperCase() : 'CASH'}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalValue}>₹{grandTotal}</Text>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={() => router.push('/(tabs)/home')}
                >
                    <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    statusHeader: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#f9f9f9',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
    },
    successIcon: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: '#4CAF50',
        alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
    },
    statusTitle: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 5 },
    statusSubtitle: { fontSize: 14, color: '#888' },

    trackingContainer: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 15 },

    // Driver Card - Updated for relative positioning
    driverInfoCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0'
    },
    driverAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
    driverName: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },
    driverRating: { fontSize: 12, fontWeight: 'bold', color: '#555', marginLeft: 4 },
    driverActions: { marginLeft: 'auto' },
    callButton: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#4CAF50',
        alignItems: 'center', justifyContent: 'center',
    },

    timelineContainer: { paddingLeft: 10 },
    timelineItem: { flexDirection: 'row', paddingBottom: 20, borderLeftWidth: 2, borderLeftColor: '#f0f0f0', paddingLeft: 20, position: 'relative' },
    timelineDot: {
        position: 'absolute', left: -7, top: 0,
        width: 12, height: 12, borderRadius: 6,
    },
    dotActive: { backgroundColor: '#4CAF50', borderColor: '#fff', borderWidth: 2 },
    dotInactive: { backgroundColor: '#ccc', borderColor: '#fff', borderWidth: 2 },
    timelineContent: { top: -4 },
    timelineTitle: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
    timelineDesc: { fontSize: 12, color: '#666' },

    detailsCard: {
        marginHorizontal: 20,
        backgroundColor: '#f9f9f9',
        borderRadius: 20,
        padding: 20,
    },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    detailLabel: { fontSize: 14, color: '#666' },
    detailValue: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
    detailValueVisible: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', padding: 20, paddingBottom: 30,
        borderTopWidth: 1, borderTopColor: '#f0f0f0',
    },
    homeButton: {
        backgroundColor: '#1a1a1a', borderRadius: 30, paddingVertical: 16, alignItems: 'center',
    },
    homeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
