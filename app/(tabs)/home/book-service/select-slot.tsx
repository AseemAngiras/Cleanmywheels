import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Types
type TimeSlot = {
    id: string;
    time: string;
    period: 'Morning' | 'Afternoon' | 'Evening';
    available: boolean;
};

export default function SelectSlotScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const { shopId, shopName, shopAddress, shopLat, shopLong } = params;

    // Tab bar hidden via global layout

    // --- State ---
    const [selectedDate, setSelectedDate] = useState<number>(0); // Index of selected date
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // ID of selected slot

    // --- Mock Data ---

    // Generate next 7 days
    const dates = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            id: i,
            day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            date: d.getDate(),
            fullDate: d // for footer display
        };
    });

    // Mock Slots (12:00 format)
    const timeSlots: TimeSlot[] = [
        // Morning
        { id: '1', time: '08:00 AM', period: 'Morning', available: true },
        { id: '2', time: '08:30 AM', period: 'Morning', available: true },
        { id: '3', time: '09:00 AM', period: 'Morning', available: false }, // Unavailable example
        { id: '4', time: '09:30 AM', period: 'Morning', available: true },
        { id: '5', time: '10:00 AM', period: 'Morning', available: true },
        { id: '6', time: '10:30 AM', period: 'Morning', available: false },

        // Afternoon
        { id: '7', time: '12:00 PM', period: 'Afternoon', available: true },
        { id: '8', time: '12:30 PM', period: 'Afternoon', available: true },
        { id: '9', time: '01:00 PM', period: 'Afternoon', available: true },
        { id: '10', time: '01:30 PM', period: 'Afternoon', available: true },
        { id: '11', time: '02:00 PM', period: 'Afternoon', available: true },
        { id: '12', time: '02:30 PM', period: 'Afternoon', available: false },

        // Evening
        { id: '13', time: '05:00 PM', period: 'Evening', available: true },
        { id: '14', time: '05:30 PM', period: 'Evening', available: false },
        { id: '15', time: '06:00 PM', period: 'Evening', available: true },
    ];

    const slotsByPeriod = {
        Morning: timeSlots.filter(s => s.period === 'Morning'),
        Afternoon: timeSlots.filter(s => s.period === 'Afternoon'),
        Evening: timeSlots.filter(s => s.period === 'Evening'),
    };

    // --- Components ---

    const DateItem = ({ item, index }: { item: any, index: number }) => {
        const isSelected = selectedDate === index;
        return (
            <TouchableOpacity
                style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                onPress={() => setSelectedDate(index)}
            >
                <Text style={[styles.dayText, isSelected && styles.textSelected]}>{item.day}</Text>
                <Text style={[styles.dateText, isSelected && styles.textSelected]}>{item.date}</Text>
            </TouchableOpacity>
        );
    };

    const SlotItem = ({ item }: { item: TimeSlot }) => {
        const isSelected = selectedSlot === item.id;
        const isUnavailable = !item.available;

        if (isUnavailable) {
            return (
                <View style={[styles.slotItem, styles.slotUnavailable]}>
                    <Text style={styles.slotTextUnavailable}>{item.time}</Text>
                </View>
            );
        }

        return (
            <TouchableOpacity
                style={[styles.slotItem, isSelected && styles.slotSelected]}
                onPress={() => setSelectedSlot(item.id)}
            >
                <Text style={[styles.slotText, isSelected && styles.slotTextSelected]}>{item.time}</Text>
                {isSelected && (
                    <View style={styles.checkIcon}>
                        <Ionicons name="checkmark-circle" size={16} color="#1a1a1a" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const getSelectedDateTimeString = () => {
        if (!selectedSlot) return 'Select a time';
        const dateObj = dates[selectedDate].fullDate;
        const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' });
        const timeStr = timeSlots.find(s => s.id === selectedSlot)?.time;
        return `${dateStr}, ${timeStr}`;
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Time Slot</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>

                {/* Shop Info Card */}
                <View style={styles.shopCard}>
                    <View style={styles.shopIconContainer}>
                        <Ionicons name="car-sport" size={24} color="#fbc02d" />
                    </View>
                    <View>
                        <Text style={styles.shopName}>{shopName || 'Shop Name'}</Text>
                        <Text style={styles.shopAddress}>{shopAddress || '123 Location St.'}</Text>
                    </View>
                </View>

                {/* Date Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {dates.map((item, index) => (
                        <DateItem key={index} item={item} index={index} />
                    ))}
                </ScrollView>

                {/* Legend */}
                <View style={styles.legendContainer}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { borderColor: '#ddd', borderWidth: 1 }]} />
                        <Text style={styles.legendText}>Available</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#C8F000' }]} />
                        <Text style={styles.legendText}>Selected</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#f5f5f5' }]} />
                        <Text style={styles.legendText}>Unavailable</Text>
                    </View>
                </View>

                {/* Time Slots - Morning */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Morning</Text>
                        <View style={styles.greenBadge}>
                            <Text style={styles.greenBadgeText}>{slotsByPeriod.Morning.filter(s => s.available).length} Slots Left</Text>
                        </View>
                    </View>
                    <View style={styles.grid}>
                        {slotsByPeriod.Morning.map(slot => <SlotItem key={slot.id} item={slot} />)}
                    </View>
                </View>

                {/* Time Slots - Afternoon */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Afternoon</Text>
                    <View style={styles.grid}>
                        {slotsByPeriod.Afternoon.map(slot => <SlotItem key={slot.id} item={slot} />)}
                    </View>
                </View>

                {/* Time Slots - Evening */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Evening</Text>
                        <View style={styles.greenBadge}>
                            <Text style={styles.greenBadgeText}>High Demand</Text>
                        </View>
                    </View>
                    <View style={styles.grid}>
                        {slotsByPeriod.Evening.map(slot => <SlotItem key={slot.id} item={slot} />)}
                    </View>
                </View>

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerLabel}>You selected</Text>
                <Text style={styles.footerValue}>{getSelectedDateTimeString()}</Text>

                <TouchableOpacity
                    style={[styles.confirmButton, !selectedSlot && { opacity: 0.6 }]}
                    disabled={!selectedSlot}
                    onPress={() => {
                        console.log("Navigating to booking-summary with params:", selectedSlot);
                        router.push({
                            pathname: '/(tabs)/home/book-service/booking-summary',
                            params: {
                                ...params,
                                selectedDate: dates[selectedDate].fullDate.toISOString(),
                                selectedTime: timeSlots.find(s => s.id === selectedSlot)?.time,
                                selectedTimeSlotId: selectedSlot
                            }
                        });
                    }}
                >
                    <Text style={styles.confirmButtonText}>Review Summary</Text>
                    <Ionicons name="arrow-forward" size={20} color="#1a1a1a" />
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

    // Shop Card
    shopCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 20,
        padding: 15,
        borderRadius: 20,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    shopIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF9C4', // Light yellow
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    shopName: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a' },
    shopAddress: { fontSize: 12, color: '#888', marginTop: 2 },

    // Date Selector
    dateList: { marginBottom: 20 },
    dateItem: {
        width: 60,
        height: 70,
        backgroundColor: '#fff',
        borderRadius: 30, // Capsule shape
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    dateItemSelected: {
        backgroundColor: '#C8F000',
        borderColor: '#C8F000',
        // Shadow
        shadowColor: '#C8F000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    dayText: { fontSize: 10, color: '#888', marginBottom: 4, fontWeight: '600' },
    dateText: { fontSize: 18, color: '#1a1a1a', fontWeight: 'bold' },
    textSelected: { color: '#1a1a1a' },

    // Legend
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: { fontSize: 12, color: '#666' },

    // Sections
    section: { paddingHorizontal: 20, marginBottom: 25 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 10 },
    greenBadge: {
        backgroundColor: '#e6f7e0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    greenBadgeText: { fontSize: 10, color: '#4CAF50', fontWeight: 'bold' },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },

    // Slot Item
    slotItem: {
        width: '31%', // 3 columns
        paddingVertical: 12,
        borderRadius: 20, // Pill shape
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#eee',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    slotSelected: {
        backgroundColor: '#C8F000',
        borderColor: '#C8F000',
    },
    slotUnavailable: {
        backgroundColor: '#f5f5f5', // Very light grey
        borderColor: '#f5f5f5',
    },
    slotText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
    slotTextSelected: { fontWeight: 'bold' },
    slotTextUnavailable: { fontSize: 13, color: '#bbb', textDecorationLine: 'line-through' },
    checkIcon: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#fff',
        borderRadius: 8,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        paddingBottom: 30,
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
    },
    footerLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
    footerValue: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 20 },
    confirmButton: {
        backgroundColor: '#C8F000',
        borderRadius: 30,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: { fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', marginRight: 8 },
});
