
import { RootState } from '@/store';
import { setUser } from '@/store/slices/userSlice';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BookingStepper from '../../../../components/BookingStepper';

// Types
type TimeSlot = {
    id: string;
    time: string;
    period: 'Morning' | 'Afternoon' | 'Evening';
    available: boolean;
};

export default function ShopsListScreen() {
    const router = useRouter();
    const navigation = useNavigation();

    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    useFocusEffect(
        useCallback(() => {
            // Hide the bottom tab bar when this screen is mounted or focused
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: "none" }
            });
            return () => {
                // Do not restore here, let the next screen handle it or index.tsx restore it
            };
        }, [navigation])
    );
    const params = useLocalSearchParams();
    const bookingDraft = params.bookingDraft
        ? JSON.parse(params.bookingDraft as string)
        : null;

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

    // Login Logic States
    const [isLoading, setIsLoading] = useState(false);
    const [modalStep, setModalStep] = useState<'details' | 'otp'>('details');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [name, setName] = useState('');

    // Slot Picker State
    const [showSlotPicker, setShowSlotPicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<number>(0);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const [selectedShop, setSelectedShop] = useState<any>(null);

    // Mock Data
    const allShops = [
        {
            id: '1',
            name: 'Sparkle Station Main St.',
            rating: 4.8,
            distance: '1.2km away',
            slots: '3 slots available',
            price: 25.00,
            image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            slotsColor: '#e6f7e0',
            slotsTextColor: '#6bb84c',
            address: '123 Main St, Downtown',
            latitude: 37.7749,
            longitude: -122.4194
        },
        {
            id: '2',
            name: 'GlowWash Downtown',
            rating: 4.5,
            distance: '2.5km away',
            slots: '2-3 slots available',
            price: 22.00,
            image: 'https://images.unsplash.com/photo-1552930294-6b595f4c2974?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            slotsColor: '#e6f7e0',
            slotsTextColor: '#6bb84c',
            address: '456 Central Ave, Westside',
            latitude: 37.7849,
            longitude: -122.4094
        },
        {
            id: '3',
            name: 'Sunny Side Wash',
            rating: 4.2,
            distance: '3.0km away',
            slots: '1 slot left',
            price: 18.00,
            image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            slotsColor: '#ffe5d4', // Orange-ish for low slots
            slotsTextColor: '#ff7f50',
            address: '789 Sunshine Blvd, Eastside',
            latitude: 37.7649,
            longitude: -122.4294
        },
        {
            id: '4',
            name: 'Blue Wave Auto',
            rating: 4.9,
            distance: '0.8km away',
            slots: '5+ slots available',
            price: 30.00,
            image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
            slotsColor: '#e6f7e0',
            slotsTextColor: '#6bb84c',
            address: '101 Ocean Dr, Coastal',
            latitude: 37.7549,
            longitude: -122.4394
        },
    ];

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

    // Use robust date comparison
    const now = new Date();
    const selectedDateObj = dates[selectedDate].fullDate;
    const isToday = selectedDateObj.getDate() === now.getDate() &&
        selectedDateObj.getMonth() === now.getMonth() &&
        selectedDateObj.getFullYear() === now.getFullYear();

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
    ].map((slot) => {
        const typedSlot = slot as TimeSlot;
        if (!isToday) return typedSlot;

        // Parse time
        const [timeStr, modifier] = typedSlot.time.trim().split(/\s+/);
        let [hours, minutes] = timeStr.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;

        const slotDate = new Date();
        slotDate.setHours(hours, minutes, 0, 0);

        const bufferTime = new Date(now.getTime() + 30 * 60000); // 30 mins ahead

        if (slotDate < bufferTime) {
            return { ...typedSlot, available: false };
        }
        return typedSlot;
    });

    const slotsByPeriod = {
        Morning: timeSlots.filter(s => s.period === 'Morning'),
        Afternoon: timeSlots.filter(s => s.period === 'Afternoon'),
        Evening: timeSlots.filter(s => s.period === 'Evening'),
    };

    const filteredShops = allShops.filter(shop =>
        shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useFocusEffect(
        useCallback(() => {
            // Hide tab bar for this screen
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'none' }
            });
        }, [navigation])
    );

    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleSendOtp = () => {
        if (!name.trim()) {
            alert('Please enter your name.');
            return;
        }
        if (!phoneNumber.trim() || phoneNumber.length < 10) {
            alert('Please enter a valid phone number.');
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
            alert('Please enter the complete 4-digit OTP.');
            return;
        }

        dispatch(setUser({
            name: name.trim(),
            phone: phoneNumber.trim(),
        }))

        // Validation logic here
        setIsLoginModalVisible(false);
        setModalStep('details');
        setOtp(['', '', '', '']);

        // Show Slot Picker instead of navigating
        // setIsLoginModalVisible(false);
        // setModalStep('details');
        // setOtp(['', '', '', '']);
        setShowSlotPicker(true);
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

    const renderShopCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                    <Text style={styles.shopName}>{item.name}</Text>
                    <TouchableOpacity
                        style={styles.selectButton}
                        onPress={() => {
                            setSelectedShop(item);
                            if (user?.name && user?.phone) {
                                setShowSlotPicker(true);
                            } else {
                                setIsLoginModalVisible(true);
                            }
                        }}
                    >
                        <Text style={styles.selectButtonText}>Select</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color="#4CAF50" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                    <Text style={styles.distanceText}> • {item.distance}</Text>
                </View>

                <View style={[styles.slotsBadge, { backgroundColor: item.slotsColor }]}>
                    <Text style={[styles.slotsText, { color: item.slotsTextColor }]}>{item.slots}</Text>
                </View>

                <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                {isSearchVisible ? (
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search shops..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                        <TouchableOpacity onPress={() => {
                            setIsSearchVisible(false);
                            setSearchQuery('');
                        }}>
                            <Ionicons name="close-circle" size={24} color="#999" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => router.back()}>
                            <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Shops List</Text>
                        <TouchableOpacity onPress={() => setIsSearchVisible(true)}>
                            <Ionicons name="search" size={24} color="#1a1a1a" />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <BookingStepper currentStep={2} />

            <FlatList
                data={filteredShops}
                renderItem={renderShopCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No shops found matching "{searchQuery}"</Text>
                    </View>
                }
            />

            {/* Slot Picker Modal */}
            <Modal
                animationType="slide"
                transparent={false} // Full screen
                visible={showSlotPicker}
                onRequestClose={() => setShowSlotPicker(false)}
            >
                <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setShowSlotPicker(false)}>
                            <Ionicons name="close" size={24} color="#1a1a1a" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Select Slot</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <BookingStepper currentStep={2} />

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180, paddingTop: 20 }}>
                        <Text style={[styles.sectionTitle, { marginLeft: 20 }]}>Select the Date for your Service</Text>
                        {/* Shop Hero Card */}
                        {/* Shop Hero Card - Compact Horizontal */}
                        <View style={styles.shopCardHero}>
                            {selectedShop?.image && (
                                <Image source={{ uri: selectedShop.image }} style={styles.shopImageHero} />
                            )}
                            <View style={styles.shopInfoContainer}>
                                <Text style={styles.shopNameHero}>{selectedShop?.name}</Text>
                                <View style={styles.shopMetaRow}>
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color="#fff" />
                                        <Text style={styles.ratingLabel}>{selectedShop?.rating}</Text>
                                    </View>
                                    <View style={styles.metaDivider} />
                                    <Text style={styles.metaText}>{selectedShop?.distance}</Text>
                                </View>
                                <Text style={styles.metaAddressText} numberOfLines={1}>{selectedShop?.address}</Text>
                            </View>
                        </View>

                        {/* Date Selector */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateList} contentContainerStyle={{ paddingHorizontal: 20 }}>
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

                        {/* Time Picker (Grid View) */}
                        <View style={styles.timePickerContainer}>
                            <Text style={styles.sectionTitle}>Select the start time for your service</Text>
                            <Text style={{ fontSize: 13, color: '#888', marginBottom: 15, paddingHorizontal: 5 }}>Your service will take approximately 58 minutes</Text>

                            {/* Offers/Slots Grid */}
                            <View style={styles.gridContainer}>
                                {timeSlots.map((slot) => {
                                    const isSelected = selectedSlot === slot.id;
                                    const isUnavailable = !slot.available;
                                    // Mock offer logic for demonstration
                                    const offer = slot.id === '2' ? '5% OFF' : slot.id === '3' || slot.id === '4' ? '10% OFF' : null;

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
                        {selectedSlot && (
                            <View style={styles.selectedSlotCard}>
                                <View style={styles.slotCardLeft}>
                                    <View style={styles.iconContainer}>
                                        <Ionicons name="calendar-outline" size={24} color="#666" />
                                    </View>
                                    <View>
                                        <Text style={styles.selectedLabel}>SELECTED SLOT</Text>
                                        <Text style={styles.selectedDateTime}>
                                            {dates[selectedDate].day} {dates[selectedDate].date} {dates[selectedDate].month} | {timeSlots.find(s => s.id === selectedSlot)?.time}
                                        </Text>
                                    </View>
                                </View>
                                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.continueButton, !selectedSlot && { opacity: 0.6 }]}
                            disabled={!selectedSlot}
                            onPress={() => {
                                if (!bookingDraft) return;

                                const updatedBookingDraft = {
                                    ...bookingDraft,

                                    shop: {
                                        id: selectedShop.id,
                                        name: selectedShop.name,
                                        address: selectedShop.address,
                                        image: selectedShop.image,
                                        rating: selectedShop.rating,
                                        location: {
                                            lat: selectedShop.latitude,
                                            long: selectedShop.longitude,
                                        },
                                    },

                                    slot: {
                                        date: dates[selectedDate].fullDate.toISOString(),
                                        time: timeSlots.find(s => s.id === selectedSlot)?.time,
                                        slotId: selectedSlot,
                                    },
                                };

                                setShowSlotPicker(false);

                                router.push({
                                    pathname: "/(tabs)/home/book-service/booking-summary",
                                    params: {
                                        bookingDraft: JSON.stringify(updatedBookingDraft),
                                    },
                                });
                            }}

                        >
                            <Text style={styles.continueButtonText}>Confirm Slot</Text>
                            <Ionicons name="arrow-forward" size={20} color="#1a1a1a" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

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
                                <Text style={styles.modalTitle}>Login to Book Slot</Text>
                                <Text style={styles.modalSubtitle}>Enter your details to confirm your wash.</Text>

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
                                    style={styles.continueButton}
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
                                        <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>Resend</Text>
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={styles.continueButton}
                                    onPress={handleVerifyOtp}
                                >
                                    <Text style={styles.continueButtonText}>Continue</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView >
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
        height: 70, // Fixed height to prevent jump
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a' },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1a1a1a',
        marginRight: 10,
    },
    listContainer: { padding: 20, paddingBottom: 100 },

    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    cardContent: {
        padding: 15,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 5,
    },
    shopName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        flex: 1,
        marginRight: 10,
    },
    selectButton: {
        backgroundColor: '#C8F000',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 25,
    },
    selectButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginLeft: 4,
    },
    distanceText: {
        fontSize: 12,
        color: '#888',
    },
    slotsBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 10,
    },
    slotsText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    priceText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: '#999',
        fontSize: 16,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalOverlayTouch: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 25,
        paddingBottom: 40,
        // Shadow
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
    otpHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        borderRadius: 30, // Pill shape
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
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    countryCode: {
        marginRight: 10,
    },
    countryCodeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a1a1a',
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
    },
    continueButton: {
        backgroundColor: '#C8F000',
        paddingVertical: 16,
        borderRadius: 30,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },

    // Slot Picker Styles
    // Shop Hero Card Styles
    shopCardHero: {
        marginHorizontal: 20,
        marginTop: 10,
        marginBottom: 25,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        // Shadow
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 5, elevation: 3,
    },
    shopImageHero: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    shopInfoContainer: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    shopInfoOverlay: {
        // Removed as no longer overlay
    },
    shopNameHero: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    shopMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    metaAddressText: {
        fontSize: 12,
        color: '#888',
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#84c95c', // Primary
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    ratingLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginLeft: 3,
    },
    metaDivider: {
        width: 4, height: 4,
        borderRadius: 2,
        backgroundColor: '#ccc',
        marginHorizontal: 8,
    },
    metaText: {
        fontSize: 13,
        color: '#666',
    },

    dateList: { maxHeight: 100, marginBottom: 20 },
    dateItem: {
        width: 60, height: 90,
        backgroundColor: '#fff', borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
        marginRight: 10,
        borderWidth: 1, borderColor: '#f0f0f0',
        paddingVertical: 5
    },
    dateItemSelected: {
        backgroundColor: '#84c95c', // Primary Green
        borderColor: '#84c95c',
        transform: [{ scale: 1.05 }],
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 5, elevation: 5
    },
    monthText: { fontSize: 10, fontWeight: '600', color: '#888', marginBottom: 2 },
    dateNumberText: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 2 },
    dayText: { fontSize: 10, fontWeight: '600', color: '#888' },

    textSelected: { color: '#fff' }, // White text for selected black card

    section: { paddingHorizontal: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15, color: '#1a1a1a' },

    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    slotItem: {
        width: '31%', paddingVertical: 12, borderRadius: 15, backgroundColor: '#fff',
        borderWidth: 1, borderColor: '#eee', alignItems: 'center', marginBottom: 10
    },
    slotSelected: { backgroundColor: '#C8F000', borderColor: '#C8F000' },
    slotUnavailable: { backgroundColor: '#f5f5f5', borderColor: '#f5f5f5' },

    slotText: { fontSize: 12, fontWeight: '600', color: '#1a1a1a' },
    slotTextSelected: { fontWeight: 'bold' },
    slotTextUnavailable: { color: '#ccc', textDecorationLine: 'line-through' },

    // Grid Style Time Picker
    timePickerContainer: {
        marginTop: 0,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    timeGridItem: {
        width: '31%', // 3 columns
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        // Shadow
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
        position: 'relative', // For badge positioning
    },
    timeGridItemSelected: {
        borderColor: '#84c95c', // Primary color border
        backgroundColor: '#f0f9eb', // Light green bg
        borderWidth: 1.5,
    },
    timeGridText: {
        fontSize: 14,
        color: '#1a1a1a',
        fontWeight: '600',
    },
    timeGridTextSelected: {
        fontWeight: 'bold',
        color: '#84c95c', // Primary color text
    },
    timeGridTextUnavailable: {
        color: '#ccc',
        textDecorationLine: 'line-through',
    },

    // Offer Badge Styles
    offerBadge: {
        position: 'absolute',
        top: -8,
        right: -5,
        backgroundColor: '#84c95c', // Primary Green
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        zIndex: 10,
    },
    offerText: {
        color: '#fff',
        fontSize: 8,
        fontWeight: 'bold',
    },

    // Footer Selected Card
    selectedSlotCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 15,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Shadow for floating effect
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
        borderWidth: 1, borderColor: '#f0f0f0',
    },
    slotCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40, height: 40,
        borderRadius: 20,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center', alignItems: 'center',
        marginRight: 12,
    },
    selectedLabel: {
        fontSize: 10,
        color: '#888',
        fontWeight: '600',
        marginBottom: 2,
        letterSpacing: 0.5,
    },
    selectedDateTime: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#fff', padding: 20, paddingBottom: 30,
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        shadowColor: '#000', shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1, shadowRadius: 10, elevation: 20,
    },
});
