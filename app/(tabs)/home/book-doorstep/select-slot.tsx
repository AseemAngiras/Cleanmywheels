import { setUser } from '@/store/slices/userSlice';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { RootState } from '@/store';
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    TextInput
} from 'react-native';

// Types
type TimeSlot = {
  id: string;
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  available: boolean;
};

export default function SelectSlotScreen() {
  const dispatch = useDispatch();
  const { name: userName, phone: userPhone } = useSelector(
    (state: RootState) => state.user
  );

  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' },
      });
    }, [navigation])
  );

  // --- Local state (synced with Redux user) ---
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (userName) setName(userName);
    if (userPhone) setPhoneNumber(userPhone);
  }, [userName, userPhone]);

  // Login Modal State
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [modalStep, setModalStep] = useState<'details' | 'otp'>('details');
  const [otp, setOtp] = useState(['', '', '', '']);

  // Slot Picker State
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // --- Mock Dates ---
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      id: i,
      day: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
      date: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      fullDate: d,
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

    dispatch(
      setUser({
        name: name.trim(),
        phone: phoneNumber.trim(),
      })
    );

    setIsLoginModalVisible(false);
    setModalStep('details');
    setOtp(['', '', '', '']);

    navigateToSummary();
  };

  const navigateToSummary = () => {
    const dateOnly =
      dates[selectedDate].fullDate.toISOString().split('T')[0];

    router.push({
      pathname: '/(tabs)/home/book-doorstep/booking-summary',
      params: {
        ...params,
        shopName: 'Assigned Professional',
        userName: userName || name,
        userPhone: userPhone || phoneNumber,
        selectedDate: dateOnly,
        selectedTime: timeSlots.find((s) => s.id === selectedSlot)?.time,
        selectedTimeSlotId: selectedSlot,
      },
    });
  };

  const handleConfirmSlot = () => {
    if (!selectedSlot) return;

    if (userName && userPhone) {
      navigateToSummary();
    } else {
      setIsLoginModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* UI unchanged below */}
      {/* Everything else remains exactly as before */}
    </SafeAreaView>
  );
}

/* styles unchanged */

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
