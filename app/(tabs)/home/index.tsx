import { RootState } from '@/store';
import { loginSuccess } from '@/store/slices/authSlice';
import { Booking } from '@/store/slices/bookingSlice';
import { setUser } from '@/store/slices/userSlice';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';



// --- MOCK DATA FOR SHOP DASHBOARD ---
const REVENUE_DATA = {
  amount: '$1,240',
  growth: '+12%',
  history: 'vs. $1,105 yesterday'
};

const INITIAL_WORKERS = [
  { id: '1', name: 'Amit', statusType: 'active' },
  { id: '2', name: 'Priya', statusType: 'active' },
  { id: '3', name: 'Rajesh', statusType: 'active' },
  { id: '4', name: 'Neha', statusType: 'break' },
  { id: '5', name: 'Suresh', statusType: 'active' },
  { id: '6', name: 'Rahul', statusType: 'active' },
  { id: '7', name: 'Vikram', statusType: 'active' },
  { id: '8', name: 'Sameer', statusType: 'active' },
];

// --- SHOP HOME SCREEN COMPONENT (NEW DASHBOARD DESIGN) ---
function ShopHomeScreen() {
  const userName = useSelector((state: RootState) => state.user.name);
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [modalVisible, setModalVisible] = useState(false);
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
      statusType: 'active',
    };
    setWorkers([...workers, newWorker]);
    setModalVisible(false);
    setNewWorkerName('');
    setNewWorkerStatus('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: 20 }]}>
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

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Shop Hero Image */}
        {/* Shop Hero Image */}
        <View style={styles.shopHeroContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
            style={styles.shopHeroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroSloganTitle}>Elevate Your Service</Text>
            <Text style={styles.heroSloganSubtitle}>Manage your wash operation with ease.</Text>
          </View>
        </View>

        {/* Revenue Card */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View style={styles.iconCircleBlue}>
              <Ionicons name="logo-usd" size={20} color="#3498DB" />
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

        {/* Main Stats Row */}
        <View style={styles.statsRow}>
          {/* Active Washers */}
          <View style={styles.statBox}>
            <View style={styles.iconCircleBlueLight}>
              <Ionicons name="car-sport" size={22} color="#3498DB" />
            </View>
            <Text style={styles.statBoxLabel}>Active Washers</Text>
            <View style={styles.statCountRow}>
              <Text style={styles.statBigNum}>{workers.filter(w => w.statusType === 'active').length}</Text>
              <Text style={styles.statTotalNum}>/ 12</Text>
            </View>
          </View>

          {/* Pending */}
          <View style={styles.statBox}>
            <View style={styles.iconCircleOrangeLight}>
              <Ionicons name="clipboard" size={22} color="#E67E22" />
            </View>
            <Text style={styles.statBoxLabel}>Pending</Text>
            <Text style={styles.statBigNum}>3</Text>
          </View>
        </View>



        <View style={{ height: 100 }} />
      </ScrollView>




    </SafeAreaView>
  );
}

// --- MAIN HOME SCREEN (CONTROLLER) ---
export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const bookings = useSelector((state: RootState) => state.bookings.bookings);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userName = useSelector((state: RootState) => state.user.name);
  const userPhone = useSelector((state: RootState) => state.user.phone);
  const dispatch = useDispatch();

  // Admin Check
  const sanitizedPhone = userPhone ? userPhone.replace(/\D/g, '') : '';
  const isAdmin = sanitizedPhone.endsWith('1234567890');

  // Login State
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // ... (Login handlers)
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

    dispatch(setUser({ name: name.trim(), phone: phoneNumber.trim() }));
    dispatch(loginSuccess('dummy-token'));

    setIsLoginModalVisible(false);
    setModalStep('details');
    setOtp(['', '', '', '']);
    setName('');
    setPhoneNumber('');
  };


  const allBookings = bookings;
  const uniqueBookingsMap = new Map();
  allBookings.forEach((booking) => {
    const key = `${booking.serviceName}|${booking.address}|${booking.car}`;
    uniqueBookingsMap.set(key, booking);
  });
  const pastBookings = Array.from(uniqueBookingsMap.values()).reverse();

  useFocusEffect(
    useCallback(() => {
      // Ensure tab bar is visible when on Home root
      const homeStack = navigation.getParent();
      const tabs = homeStack?.getParent();

      if (tabs) {
        tabs.setOptions({
          tabBarStyle: { display: 'flex' }
        });
      }
    }, [navigation])
  );

  const handleRecentServicePress = (booking: Partial<Booking>) => {
    router.push({
      pathname: '/(tabs)/home/book-doorstep/select-slot',
      params: {
        serviceName: booking.serviceName,
        shopName: booking.center || 'Your Location',
        basePrice: booking.price ? Math.round(booking.price / 1.18) : 0,
        address: booking.address,
        vehicleType: booking.car?.split(' - ')[0] || 'Sedan',
        vehicleNumber: booking.car?.split(' - ')[1] || '',
      }
    });
  };

  // --- CONDITIONAL RENDER ---
  if (isAdmin) {
    return <ShopHomeScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>Cleanmywheels</Text>
            {isLoggedIn ? (
              <Text style={styles.greeting}>Hi, {userName || 'User'}</Text>
            ) : (
              <Text style={styles.greeting}>Welcome</Text>
            )}
          </View>
          <View style={styles.headerIcons}>
            {!isLoggedIn && (
              <TouchableOpacity style={styles.headerLoginBtn} onPress={() => setIsLoginModalVisible(true)}>
                <Text style={styles.headerLoginText}>Log in</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <View style={[styles.imageWrapper, (!isLoggedIn || pastBookings.length === 0) && { height: 450 }]}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
              style={styles.heroImage}
            />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Make Your Car Shine.</Text>
            <Text style={styles.heroSubtitle}>
              Premium eco-friendly car wash service{'\n'}delivered right to your doorstep.
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.bookDoorstepButton}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/home/book-doorstep/enter-location')}
              >
                <Ionicons name="home" size={22} color="#1a1a1a" style={{ marginRight: 10 }} />
                <Text style={styles.bookDoorstepButtonText}>Book Doorstep</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Services Section */}
        {isLoggedIn && pastBookings.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.recentTitle}>Recent Services</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
              {pastBookings.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentCard}
                  onPress={() => handleRecentServicePress(item)}
                >
                  <View style={styles.recentIconContainer}>
                    <Ionicons name="sparkles" size={24} color="#84c95c" />
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentServiceName}>{item.serviceName}</Text>
                    {/* Display Address */}
                    {item.address && (
                      <Text style={styles.recentAddress} numberOfLines={1}>
                        {item.address}
                      </Text>
                    )}
                    <Text style={styles.recentCarText}>{item.car}</Text>
                    <View style={styles.recentPriceRow}>
                      <Text style={styles.recentPrice}>₹{item.price}</Text>
                      <View style={styles.rebookBadge}>
                        <Text style={styles.rebookText}>Rebook</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Login Modal */}
      <Modal
        visible={isLoginModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLoginModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlayTouch}
            activeOpacity={1}
            onPress={() => setIsLoginModalVisible(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.dragHandle} />

            <Text style={styles.modalTitle}>
              {modalStep === 'details' ? 'Welcome' : 'Verify OTP'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {modalStep === 'details'
                ? 'Enter your details to log in.'
                : `Enter the 4-digit code sent to +91 ${phoneNumber}`
              }
            </Text>

            {modalStep === 'details' ? (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color="#666" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.inputField}
                    placeholder="Full Name"
                    placeholderTextColor="#ccc"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>

                <View style={styles.phoneContainer}>
                  <View style={styles.countryCode}>
                    <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                  </View>
                  <TextInput
                    style={styles.inputField}
                    placeholder="Mobile Number"
                    placeholderTextColor="#ccc"
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                  />
                </View>

                <TouchableOpacity
                  style={styles.modalContinueButton}
                  onPress={handleSendOtp}
                >
                  {isLoading ? (
                    <Text style={styles.continueButtonText}>Sending...</Text>
                  ) : (
                    <Text style={styles.continueButtonText}>Send OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.otpHeaderRow}>
                  <TouchableOpacity onPress={() => setModalStep('details')} style={{ marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 14, color: '#666' }}>Change Number</Text>
                </View>

                <View style={styles.otpContainer}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(ref) => { inputRefs.current[i] = ref; }}
                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => {
                        const newOtp = [...otp];
                        newOtp[i] = val;
                        setOtp(newOtp);
                        if (val && i < 3) {
                          inputRefs.current[i + 1]?.focus();
                        }
                      }}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace' && !otp[i] && i > 0) {
                          inputRefs.current[i - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.modalContinueButton}
                  onPress={handleVerifyOtp}
                >
                  <Text style={styles.continueButtonText}>Verify & Proceed</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  greeting: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
  },
  iconButton: {
    padding: 4,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imageWrapper: {
    width: '100%',
    height: 240,
    borderRadius: 25,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroContent: {
    alignItems: 'center',
    width: '100%',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    color: '#1a1a1a',
    lineHeight: 38,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    width: '100%',
  },
  bookDoorstepButton: {
    backgroundColor: '#C8F000',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 40,
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C8F000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  bookDoorstepButtonText: {
    color: '#1a1a1a',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },

  // Recent Services Styles
  recentSection: {
    marginTop: 0,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  recentList: {
    paddingRight: 20,
  },
  recentCard: {
    backgroundColor: '#fff',
    width: 250,
    padding: 15,
    borderRadius: 16,
    marginRight: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  recentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f9eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  recentInfo: {
    flex: 1,
  },
  recentServiceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  recentAddress: {
    fontSize: 11,
    color: '#555',
    marginBottom: 4,
  },
  recentCarText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  recentPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  rebookBadge: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rebookText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Login Styles
  loginText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },

  // Modal Styles
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
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
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

  // Header Login Button
  headerLoginBtn: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLoginText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // --- DASHBOARD STYLES (Appended) ---
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3498DB',
    fontWeight: '600',
  },

  // Revenue Card
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

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    height: 140,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircleBlueLight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleOrangeLight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF5E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statBoxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  statCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  statBigNum: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  statTotalNum: {
    fontSize: 16,
    color: '#95A5A6',
    fontWeight: '500',
  },

  // Live Status Timeline
  liveStatusContainer: {
    gap: 0, // Timeline items connect
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
    marginRight: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 12,
    color: '#95A5A6',
    fontWeight: '500',
  },
  timelineSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  // FAB (Matches dashboard)
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1C40F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F1C40F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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
  filterBtn: { // Keeping definition for safety
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 20,
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
  shopHeroContainer: {
    width: '100%',
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  shopHeroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 20,
  },
  heroSloganTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSloganSubtitle: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    opacity: 0.9,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});