import { RootState } from '@/store';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSelector } from 'react-redux';

// --- RICH MOCK DATA FOR WORKERS ---
const REVENUE_DATA = {
    amount: '₹1,240',
    growth: '+12%',
    history: 'vs. ₹1,105 yesterday'
};

const INITIAL_WORKERS = [
    {
        id: '1',
        name: 'Amit Kumar',
        statusText: 'Bay 3: Silver Sedan',
        statusType: 'active', // green dot
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    },
    {
        id: '2',
        name: 'Priya Sharma',
        statusText: 'Back at 2:00 PM',
        statusType: 'break', // orange dot
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    },
    {
        id: '3',
        name: 'Rajesh Singh',
        statusText: 'Interior Detailing',
        statusType: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    },
    {
        id: '4',
        name: 'Neha Gupta',
        statusText: 'Starts at 4:00 PM',
        statusType: 'inactive', // grey dot
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    },
    {
        id: '5',
        name: 'Suresh Patel',
        statusText: 'Polishing: Black SUV',
        statusType: 'active',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    },
];

export default function DashboardScreen() {
    const userName = useSelector((state: RootState) => state.user.name);
    const [workers, setWorkers] = useState(INITIAL_WORKERS);
    const [modalVisible, setModalVisible] = useState(false);
    const [complaintsModalVisible, setComplaintsModalVisible] = useState(false);
    const tickets = useSelector((state: RootState) => state.bookings.tickets);

    const [newWorkerName, setNewWorkerName] = useState('');
    const [newWorkerStatus, setNewWorkerStatus] = useState('');

    const handleAddWorker = () => {
        if (!newWorkerName.trim()) {
            Alert.alert("Error", "Please enter a worker name.");
            return;
        }

        const newWorker = {
            id: Date.now().toString(),
            name: newWorkerName,
            statusText: newWorkerStatus || 'Available',
            statusType: 'active',
            avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80', // Default avatar
        };

        setWorkers([...workers, newWorker]);
        setModalVisible(false);
        setNewWorkerName('');
        setNewWorkerStatus('');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header - Preserved as requested */}
            {/* Header - Shop Dashboard Style */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {userName || 'Owner'} 👋</Text>
                    <Text style={styles.brandTitle}>Shop Dashboard</Text>
                </View>
                <TouchableOpacity style={styles.profileBtn}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80' }}
                        style={styles.profileAvatar}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>





                {/* Revenue Card */}
                <View style={styles.revenueCard}>
                    <View style={styles.revenueHeader}>
                        <View style={styles.iconCircleBlue}>
                            <Ionicons name="cash-outline" size={20} color="#3498DB" />
                        </View>
                        <View style={styles.growthBadge}>
                            <Ionicons name="trending-up" size={14} color="#2ECC71" />
                            <Text style={styles.growthText}>{REVENUE_DATA.growth}</Text>
                        </View>
                    </View>
                    <Text style={styles.revenueLabel}>Today's Revenue</Text>
                    <Text style={styles.revenueAmount}>{REVENUE_DATA.amount}</Text>
                    <Text style={styles.revenueHistory}>{REVENUE_DATA.history}</Text>
                </View>

                {/* Directory Header */}
                <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                    <Text style={styles.sectionTitle}>Worker Directory</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAllText}>View All</Text>
                    </TouchableOpacity>
                </View>

                {/* Worker List */}
                <View style={styles.directoryList}>
                    {workers.map((worker) => (
                        <View key={worker.id} style={styles.workerRow}>
                            <View style={styles.workerInfoLeft}>
                                <View>
                                    <Image source={{ uri: worker.avatar }} style={styles.workerAvatar} />
                                    <View style={[
                                        styles.statusDot,
                                        worker.statusType === 'active' ? styles.dotGreen :
                                            worker.statusType === 'break' ? styles.dotOrange : styles.dotGrey
                                    ]} />
                                </View>
                                <View>
                                    <Text style={styles.workerName}>{worker.name}</Text>
                                    <View style={styles.statusRow}>
                                        <Ionicons
                                            name={
                                                worker.statusType === 'active' ? 'car-sport' :
                                                    worker.statusType === 'break' ? 'time' : 'person'
                                            }
                                            size={12}
                                            color="#888"
                                        />
                                        <Text style={styles.workerStatus}>{worker.statusText}</Text>
                                    </View>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.moreBtn}>
                                <Ionicons name="ellipsis-horizontal" size={20} color="#ccc" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={32} color="#1a1a1a" />
            </TouchableOpacity>

            {/* Add Worker Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Add New Worker</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Worker Name"
                            value={newWorkerName}
                            onChangeText={setNewWorkerName}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Status (e.g., Bay 1)"
                            value={newWorkerStatus}
                            onChangeText={setNewWorkerStatus}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.btn, styles.btnCancel]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.btnTextCancel}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.btn, styles.btnAdd]}
                                onPress={handleAddWorker}
                            >
                                <Text style={styles.btnTextAdd}>Add Worker</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Complaints Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={complaintsModalVisible}
                onRequestClose={() => setComplaintsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { maxHeight: '80%', padding: 0 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>User Complaints ({tickets?.length || 0})</Text>
                            <TouchableOpacity onPress={() => setComplaintsModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 0 }}>
                            {(!tickets || tickets.length === 0) ? (
                                <Text style={styles.emptyText}>No complaints raised yet.</Text>
                            ) : (
                                tickets.map((t) => (
                                    <View key={t.id} style={styles.ticketCard}>
                                        <View style={styles.ticketHeader}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                <Text style={styles.ticketTitle}>{t.title}</Text>
                                                {t.refundRequested && (
                                                    <View style={styles.refundBadge}>
                                                        <Text style={styles.refundBadgeText}>Refund Requested</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={styles.ticketDate}>{t.date}</Text>
                                        </View>
                                        <Text style={styles.ticketDesc}>{t.description}</Text>
                                        <Text style={styles.ticketId}>{t.id}</Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: '#F8F9FA',
    },
    greeting: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    brandTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    profileBtn: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    profileAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#fff',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: -0.5,
    },
    filterBtn: {
        backgroundColor: '#fff',
        padding: 8,
        borderRadius: 20,
    },
    redDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
    viewAllText: {
        fontSize: 14,
        color: '#F1C40F', // Yellowish Gold
        fontWeight: '600',
    },



    // Revenue Card Styles
    revenueCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    revenueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconCircleBlue: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EBF5FB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    growthBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E9F7EF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    growthText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#2ECC71',
    },
    revenueLabel: {
        fontSize: 14,
        color: '#7F8C8D',
        fontWeight: '500',
        marginBottom: 4,
    },
    revenueAmount: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    revenueHistory: {
        fontSize: 12,
        color: '#95A5A6',
    },

    // List Styles
    directoryList: {
        gap: 12,
    },
    workerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    workerInfoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    workerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#eee',
    },
    statusDot: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#fff',
        position: 'absolute',
        bottom: 0,
        right: 0,
    },
    dotGreen: { backgroundColor: '#2ECC71' },
    dotOrange: { backgroundColor: '#F39C12' },
    dotGrey: { backgroundColor: '#BDC3C7' },

    workerName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    workerStatus: {
        fontSize: 13,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    moreBtn: {
        padding: 8,
        backgroundColor: '#f9f9f9',
        borderRadius: 20,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 100,
        right: 20,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1C40F', // Vibrant Yellow
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#F1C40F',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '80%',
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        color: '#1a1a1a',
    },
    input: {
        width: '100%',
        backgroundColor: '#F5F5F5',
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
        fontSize: 14,
        color: '#333',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 10,
        width: '100%',
    },
    btn: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    btnCancel: {
        backgroundColor: '#F5F5F5',
    },
    btnAdd: {
        backgroundColor: '#F1C40F',
    },
    btnTextCancel: {
        fontWeight: '600',
        color: '#666',
    },
    btnTextAdd: {
        fontWeight: '700',
        color: '#1a1a1a',
    },
    // Ticket UI
    modalHeader: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 10,
    },
    ticketCard: {
        backgroundColor: '#FEF2F2',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    ticketTitle: {
        fontWeight: '700',
        color: '#991B1B',
    },
    ticketDate: {
        fontSize: 12,
        color: '#991B1B',
    },
    ticketDesc: {
        color: '#333',
        marginBottom: 6,
    },
    ticketId: {
        fontSize: 10,
        color: '#991B1B',
        opacity: 0.6,
    },
    refundBadge: {
        backgroundColor: '#FEE2E2',
        borderWidth: 1,
        borderColor: '#EF4444',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    refundBadgeText: {
        color: '#EF4444',
        fontSize: 10,
        fontWeight: '700',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        fontStyle: 'italic',
        marginTop: 20,
    },
});
