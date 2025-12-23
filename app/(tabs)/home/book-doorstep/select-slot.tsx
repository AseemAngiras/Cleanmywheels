import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import BookingStepper from '../../../../components/BookingStepper';

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

    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: "none" }
            });
        }, [navigation])
    );

    // Login Logic States
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [modalStep, setModalStep] = useState<'details' | 'otp'>('details');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [name, setName] = useState('');

    // Slot Picker State
    const [selectedDate, setSelectedDate] = useState<number>(0);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // --- Mock Slot Data ---
    const dates = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
            id: i,
            day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
            date: d.getDate(),
            month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
            fullDate: d
        };
    });

    const timeSlots: TimeSlot[] = [
        { id: '1', time: '08:00 AM', period: 'Morning', available: true },
        { id: '2', time: '08:30 AM', period: 'Morning', available: true },
        { id: '3', time: '09:00 AM', period: 'Morning', available: false },
        { id: '4', time: '09:30 AM', period: 'Morning', available: true },
        { id: '5', time: '10:00 AM', period: 'Morning', available: true },
        { id: '6', time: '10:30 AM', period: 'Morning', available: false },
        { id: '7', time: '12:00 PM', period: 'Afternoon', available: true },
        { id: '8', time: '12:30 PM', period: 'Afternoon', available: true },
        { id: '9', time: '01:00 PM', period: 'Afternoon', available: true },
        { id: '10', time: '01:30 PM', period: 'Afternoon', available: true },
        { id: '11', time: '02:00 PM', period: 'Afternoon', available: true },
        { id: '12', time: '02:30 PM', period: 'Afternoon', available: false },
        { id: '13', time: '05:00 PM', period: 'Evening', available: true },
        { id: '14', time: '05:30 PM', period: 'Evening', available: false },
        { id: '15', time: '06:00 PM', period: 'Evening', available: true },
    ];

    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleSendOtp = () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter your name.');
            return;
        }
        if (!phoneNumber.trim() || phoneNumber.length < 10) {
            Alert.alert('Invalid Phone', 'Please enter a valid phone number.');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setModalStep('otp');
        }, 1500);
    };

    const handleVerifyOtp = () => {
        const otpValue = otp.join('');
        if (otpValue.length < 4) {
            Alert.alert('Invalid OTP', 'Please enter the complete 4-digit OTP.');
            return;
        }

        // Validation logic here
        setIsLoginModalVisible(false);
        setModalStep('details');
        setOtp(['', '', '', '']);

        // Proceed to Booking Summary
        navigateToSummary();
    };

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Move to next input if text is entered
        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
        // Move to previous input if backspace (empty string)
        if (!text && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const navigateToSummary = () => {
        router.push({
            pathname: '/(tabs)/home/book-doorstep/booking-summary',
            params: {
                ...params,
                // Assign a generic provider
                shopName: 'Assigned Professional',
                // User Info
                userPhone: phoneNumber,
                userName: name,
                // Selected Slot
                selectedDate: dates[selectedDate].fullDate.toISOString(),
                selectedTime: timeSlots.find(s => s.id === selectedSlot)?.time,
                selectedTimeSlotId: selectedSlot,
            }
        });
    };

    const handleConfirmSlot = () => {
        if (!selectedSlot) return;
        // Check if user is logged in (mock check: if no generic auth state, ask for details here)
        // For now, let's assume valid user session OR require phone verification every time for guests.
        // Let's trigger the modal.
        setIsLoginModalVisible(true);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Select Slot</Text>
                <View style={{ width: 24 }} />
            </View>

            <BookingStepper
                currentStep={2}
                steps={[
                    { id: 1, label: 'Service' },
                    { id: 2, label: 'Slot' },
                    { id: 3, label: 'Payment' },
                ]}
            />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                <Text style={styles.pageTitle}>When should we arrive?</Text>
                <Text style={styles.pageSubtitle}>Select a date and time for your doorstep service.</Text>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList}>
                        {dates.map((item, index) => {
                            const isSelected = selectedDate === index;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.dateItem, isSelected && styles.dateItemSelected]}
                                    onPress={() => setSelectedDate(index)}
                                >
                                    <Text style={[styles.monthText, isSelected && styles.textSelected]}>{item.month}</Text>
                                    <Text style={[styles.dateNumberText, isSelected && styles.textSelected]}>{item.date}</Text>
                                    <Text style={[styles.dayText, isSelected && styles.textSelected]}>{item.day}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Select Time</Text>
                    <Text style={styles.durationHint}>Service duration: ~45-60 mins</Text>

                    <View style={styles.gridContainer}>
                        {timeSlots.map((slot) => {
                            const isSelected = selectedSlot === slot.id;
                            const isUnavailable = !slot.available;
                            const offer = slot.id === '2' ? '5% OFF' : slot.id === '3' ? '10% OFF' : null;

                            return (
                                <TouchableOpacity
                                    key={slot.id}
                                    style={[
                                        styles.timeGridItem,
                                        isSelected && styles.timeGridItemSelected
                                    ]}
                                    disabled={isUnavailable}
                                    onPress={() => setSelectedSlot(slot.id)}
                                >
                                    {offer && (
                                        <View style={styles.offerBadge}>
                                            <Text style={styles.offerText}>{offer}</Text>
                                        </View>
                                    )}
                                    <Text style={[
                                        styles.timeGridText,
                                        isSelected && styles.timeGridTextSelected,
                                        isUnavailable && styles.timeGridTextUnavailable
                                    ]}>
                                        {slot.time}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <View style={styles.selectionSummary}>
                    {selectedSlot ? (
                        <View>
                            <Text style={styles.summaryLabel}>Selected Slot</Text>
                            <Text style={styles.summaryValue}>
                                {dates[selectedDate].day}, {dates[selectedDate].date} {dates[selectedDate].month} • {timeSlots.find(s => s.id === selectedSlot)?.time}
                            </Text>
                        </View>
                    ) : (
                        <Text style={styles.placeholderSummary}>Please select a slot</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.continueButton, !selectedSlot && { opacity: 0.6 }]}
                    disabled={!selectedSlot}
                    onPress={handleConfirmSlot}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#1a1a1a" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>


            {/* Login Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isLoginModalVisible}
                onRequestClose={() => {
                    setIsLoginModalVisible(false);
                    setModalStep('details');
                }}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalOverlayTouch}>
                            <TouchableOpacity
                                style={{ flex: 1 }}
                                activeOpacity={1}
                                onPress={() => {
                                    setIsLoginModalVisible(false);
                                    setModalStep('details');
                                }}
                            />
                        </View>
                    </TouchableWithoutFeedback>

                    <View style={styles.modalContent}>
                        <View style={styles.dragHandle} />

                        {modalStep === 'details' ? (
                            <>
                                <Text style={styles.modalTitle}>Contact Details</Text>
                                <Text style={styles.modalSubtitle}>We need your details to confirm the booking.</Text>

                                {/* Name Input */}
                                <Text style={styles.inputLabel}>Name</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.inputField}
                                        placeholder="Enter your name"
                                        placeholderTextColor="#999"
                                        value={name}
                                        onChangeText={setName}
                                    />
                                    <Ionicons name="person" size={20} color="#999" />
                                </View>

                                {/* Phone Input */}
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <View style={styles.phoneContainer}>
                                    <View style={styles.countryCode}>
                                        <Text style={styles.countryCodeText}>+91</Text>
                                    </View>
                                    <TextInput
                                        style={[styles.inputField, { flex: 1, paddingLeft: 10 }]}
                                        placeholder="Enter your phone number"
                                        placeholderTextColor="#999"
                                        keyboardType="phone-pad"
                                        value={phoneNumber}
                                        onChangeText={setPhoneNumber}
                                    />
                                </View>

                                {/* Send OTP Button */}
                                <TouchableOpacity
                                    style={styles.modalContinueButton}
                                    onPress={handleSendOtp}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="#1a1a1a" />
                                    ) : (
                                        <>
                                            <Text style={styles.continueButtonText}>Send OTP</Text>
                                            <Ionicons name="arrow-forward" size={20} color="#1a1a1a" style={{ marginLeft: 5 }} />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </>
                        ) : (
                            <>
                                <View style={styles.otpHeaderRow}>
                                    <TouchableOpacity onPress={() => setModalStep('details')} style={{ paddingRight: 10 }}>
                                        <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                                    </TouchableOpacity>
                                    <Text style={styles.modalTitle}>Verification</Text>
                                </View>
                                <Text style={styles.modalSubtitle}>Enter the 4-digit code sent to +91 {phoneNumber}</Text>

                                <View style={styles.otpContainer}>
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(ref) => { inputRefs.current[index] = ref; }}
                                            style={styles.otpBox}
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(text) => handleOtpChange(text, index)}
                                            textAlign="center"
                                        />
                                    ))}
                                </View>

                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                                    <Text style={{ color: '#888', marginRight: 5 }}>Didn't receive code?</Text>
                                    <TouchableOpacity>
                                        <Text style={{ color: '#C8F000', fontWeight: 'bold' }}>Resend</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.modalContinueButton}
                                    onPress={handleVerifyOtp}
                                >
                                    <Text style={styles.continueButtonText}>Verify & Continue</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
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

    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        paddingHorizontal: 20,
        marginTop: 10
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#666',
        paddingHorizontal: 20,
        marginTop: 5,
        marginBottom: 20
    },

    sectionContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    durationHint: {
        fontSize: 13,
        color: '#888',
        paddingHorizontal: 20,
        marginTop: -10,
        marginBottom: 15
    },

    // Date List
    dateList: {
        paddingHorizontal: 20,
    },
    dateItem: {
        width: 70,
        height: 90,
        borderRadius: 15,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    dateItemSelected: {
        backgroundColor: '#1a1a1a',
        borderColor: '#1a1a1a',
        transform: [{ scale: 1.05 }]
    },
    monthText: { fontSize: 12, color: '#888', marginBottom: 4, textTransform: 'uppercase' },
    dateNumberText: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
    dayText: { fontSize: 12, color: '#666' },
    textSelected: { color: '#fff' },

    // Time Grid
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 20,
        gap: 10,
    },
    timeGridItem: {
        width: '30%', // roughly 3 per row
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        marginBottom: 5,
        position: 'relative',
    },
    timeGridItemSelected: {
        backgroundColor: '#1a1a1a',
        borderColor: '#1a1a1a',
    },
    timeGridText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    timeGridTextSelected: {
        color: '#fff',
    },
    timeGridTextUnavailable: {
        color: '#ccc',
        textDecorationLine: 'line-through'
    },
    offerBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#C8F000',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        zIndex: 1,
    },
    offerText: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#1a1a1a'
    },

    // Footer
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
    selectionSummary: { flex: 1, justifyContent: 'center' },
    summaryLabel: { fontSize: 12, color: '#888' },
    summaryValue: { fontSize: 15, fontWeight: 'bold', color: '#1a1a1a' },
    placeholderSummary: { fontSize: 14, color: '#ccc', fontStyle: 'italic' },

    continueButton: {
        backgroundColor: '#C8F000', // Yellow
        paddingVertical: 15,
        paddingHorizontal: 25,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalOverlayTouch: { flex: 1 },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#888',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    inputField: {
        flex: 1,
        fontSize: 14,
        color: '#1a1a1a',
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 30,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    countryCode: { marginRight: 10 },
    countryCodeText: { fontSize: 14, fontWeight: 'bold', color: '#1a1a1a' },

    modalContinueButton: {
        backgroundColor: '#C8F000',
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    otpHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 20,
    },
    otpBox: {
        width: 60,
        height: 60,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: '#f9f9f9',
        textAlign: 'center'
    },
});
