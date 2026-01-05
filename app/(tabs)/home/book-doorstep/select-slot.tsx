import {
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyLoginOtpMutation,
  useVerifyRegisterOtpMutation
} from "@/store/api/authApi";
import { loginSuccess } from "@/store/slices/authSlice";
import { setUser } from "@/store/slices/userSlice";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import BookingStepper from "@/components/BookingStepper";
import { RootState } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
type TimeSlot = {
  id: string;
  time: string;
  period: "Morning" | "Afternoon" | "Evening";
  available: boolean;
};

export default function SelectSlotScreen() {
  const dispatch = useDispatch();
  const userState = useSelector((state: RootState) => state.user.user);
  const userName = userState?.name;
  const userPhone = userState?.phone;

  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });
    }, [navigation])
  );

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    if (userName) setName(userName);
    if (userPhone) setPhoneNumber(userPhone);
  }, [userName, userPhone]);

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<"details" | "otp">("details");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [verifyLoginOtp, { isLoading: isVerifyingLoginOtp }] = useVerifyLoginOtpMutation();
  const [verifyRegisterOtp, { isLoading: isVerifyingRegOtp }] = useVerifyRegisterOtpMutation();

  const isProcessing = isRegistering || isRequestingOtp;
  const isVerifying = isVerifyingLoginOtp || isVerifyingRegOtp;

  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      id: i,
      day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      fullDate: d,
    };
  });

  const now = new Date();

  const timeSlots: TimeSlot[] = [
    { id: "1", time: "08:00 AM", period: "Morning", available: true },
    { id: "2", time: "08:30 AM", period: "Morning", available: true },
    { id: "3", time: "09:00 AM", period: "Morning", available: false },
    { id: "4", time: "09:30 AM", period: "Morning", available: true },
    { id: "5", time: "10:00 AM", period: "Morning", available: true },
    { id: "6", time: "10:30 AM", period: "Morning", available: false },
    { id: "7", time: "12:00 PM", period: "Afternoon", available: true },
    { id: "8", time: "12:30 PM", period: "Afternoon", available: true },
    { id: "9", time: "01:00 PM", period: "Afternoon", available: true },
    { id: "10", time: "01:30 PM", period: "Afternoon", available: true },
    { id: "11", time: "02:00 PM", period: "Afternoon", available: true },
    { id: "12", time: "02:30 PM", period: "Afternoon", available: false },
    { id: "13", time: "05:00 PM", period: "Evening", available: true },
    { id: "14", time: "05:30 PM", period: "Evening", available: false },
    { id: "15", time: "06:00 PM", period: "Evening", available: true },
  ].map((slot) => {
    const typedSlot = slot as TimeSlot;
    const isToday = selectedDate === 0;

    if (!isToday) return typedSlot;

    const [timeStr, modifier] = typedSlot.time.trim().split(/\s+/); 
    let [hours, minutes] = timeStr.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const slotDate = new Date();
    slotDate.setHours(hours, minutes, 0, 0);

    const bufferTime = new Date(now.getTime() + 30 * 60000); // 30 mins ahead

    if (slotDate < bufferTime) {
      return { ...typedSlot, available: false };
    }
    return typedSlot;
  });

  const inputRefs = useRef<Array<TextInput | null>>([]);
 
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const guestAddresses = useSelector((state: RootState) => state.profile.addresses);
  const currentBooking = useSelector((state: RootState) => state.bookings.currentBooking);

  const handleSendOtp = async () => {
    console.log("handleSendOtp (Register Only) started");

    if (!name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number.");
      return;
    }

    const trimmedPhone = phoneNumber.trim();
    const trimmedName = name.trim();

    try {
        if (trimmedName) {
            const result = await register({
                name: trimmedName,
                countryCode: "+91",
                phone: trimmedPhone,
                accountType: "Seeker",
            }).unwrap();

            const token = result.data?.token || result.token;
            if (token) {
                setRegistrationToken(token);
            }
        } else {
            await requestOtp({
                phone: trimmedPhone,
                countryCode: "+91",
                verifyType: "PHONE",
                otpType: "LOGIN",
            }).unwrap();
        }

        setModalStep("otp");
    } catch (err: any) {
        console.log("Auth request failed:", err);
        Alert.alert("Error", err?.data?.message || "Something went wrong. Try adding your name.");
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("").trim();

    if (otpValue.length < 6) {
      Alert.alert("Invalid OTP", "Please enter the complete 6-digit OTP.");
      return;
    }

    try {
        const payload = {
            verifyType: "PHONE",
            countryCode: "+91",
            phone: phoneNumber.trim(),
            phoneToken: otpValue,
        };

        let response;
        if (name.trim()) {
            response = await verifyRegisterOtp({ 
              body: { ...payload, otpType: "REGISTER" },
              token: registrationToken 
            }).unwrap();
        } else {
            // BACKEND Joi strictly requires ONLY these 3 keys for login verification
            const loginPayload = {
                countryCode: payload.countryCode,
                phone: payload.phone,
                loginToken: payload.phoneToken
            };
            response = await verifyLoginOtp(loginPayload).unwrap();
        }

        console.log("✅ Auth verified successfully:", response);

        if (response.success || response.data || typeof response.data === 'string') {
            const responseToken = response.data?.token || response.token || (typeof response.data === 'string' ? response.data : null);
            const user = response.data?.user || response.user;
            const finalToken = responseToken || registrationToken;

            if (finalToken) {
                console.log(" [SelectSlot] Final token stored in Redux:", finalToken.substring(0, 10) + "...");
                dispatch(loginSuccess(finalToken));
            } else {
                console.warn(" [SelectSlot] No token found in response or local state!");
            }

            if (user) dispatch(setUser(user));

            setIsLoginModalVisible(false);
            setOtp(["", "", "", "", "", ""]);
            setModalStep("details"); 
            navigateToSummary();
        } else {
            Alert.alert("Error", response.message || "Verification failed.");
        }
    } catch (err: any) {
        console.error("Auth Verify Error:", err);
        Alert.alert("Error", err?.data?.message || "Invalid OTP");
    }
  };
  const navigateToSummary = () => {
    console.log("➡️ Navigating to summary");

    const dateOnly = dates[selectedDate].fullDate.toISOString().split("T")[0];

    router.push({
      pathname: "/(tabs)/home/book-doorstep/booking-summary",
      params: {
        ...params,
        shopName: "Your Location",
        userName: userName || name,
        userPhone: userPhone || phoneNumber,
        selectedDate: dateOnly,
        selectedTime: timeSlots.find((s) => s.id === selectedSlot)?.time,
        selectedTimeSlotId: selectedSlot,
        servicePrice: params.basePrice,
        totalPrice: params.totalPrice || params.basePrice,
      },
    });
  };

  const authState = useSelector((state: RootState) => state.auth);

  const handleConfirmSlot = () => {
    console.log("Confirm slot clicked, selectedSlot:", selectedSlot);

    if (!selectedSlot) return;

    if (authState.isLoggedIn && authState.token) {
      console.log("User has valid token → go to summary");
      navigateToSummary();
    } else {
      console.log("No token found → opening login modal");
      setIsLoginModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Slot</Text>
        <View style={{ width: 24 }} />
      </View>

      <BookingStepper currentStep={2} />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={styles.pageTitle}>When should we arrive?</Text>
        <Text style={styles.pageSubtitle}>
          Choose a date and time for your service.
        </Text>

        {/* Date Selection */}
        <View style={styles.sectionContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateList}
          >
            {dates.map((item, index) => {
              const isSelected = selectedDate === index;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dateItem,
                    isSelected && styles.dateItemSelected,
                  ]}
                  onPress={() => setSelectedDate(index)}
                >
                  <Text
                    style={[
                      styles.monthText,
                      isSelected && styles.textSelected,
                    ]}
                  >
                    {item.month}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumberText,
                      isSelected && styles.textSelected,
                    ]}
                  >
                    {item.date}
                  </Text>
                  <Text
                    style={[styles.dayText, isSelected && styles.textSelected]}
                  >
                    {item.day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Available Slots</Text>
          <Text style={styles.durationHint}>
            Service duration: approx. 45 mins
          </Text>

          <View style={styles.gridContainer}>
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              const isUnavailable = !slot.available;
              const offer =
                slot.id === "2"
                  ? "5% OFF"
                  : slot.id === "3" || slot.id === "4"
                  ? "10% OFF"
                  : null;

              return (
                <TouchableOpacity
                  key={slot.id}
                  disabled={isUnavailable}
                  style={[
                    styles.timeGridItem,
                    isSelected && styles.timeGridItemSelected,
                    isUnavailable && {
                      opacity: 0.5,
                      backgroundColor: "#f5f5f5",
                      borderColor: "#eee",
                    },
                  ]}
                  onPress={() => setSelectedSlot(slot.id)}
                >
                  {offer && (
                    <View style={styles.offerBadge}>
                      <Text style={styles.offerText}>{offer}</Text>
                    </View>
                  )}
                  <Text
                    style={[
                      styles.timeGridText,
                      isSelected && styles.timeGridTextSelected,
                      isUnavailable && styles.timeGridTextUnavailable,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.selectionSummary}>
          <Text style={styles.summaryLabel}>Selected Slot</Text>
          {selectedSlot ? (
            <Text style={styles.summaryValue}>
              {dates[selectedDate].month} {dates[selectedDate].date},{" "}
              {timeSlots.find((s) => s.id === selectedSlot)?.time}
            </Text>
          ) : (
            <Text style={styles.placeholderSummary}>Please select a time</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.continueButton, !selectedSlot && { opacity: 0.5 }]}
          disabled={!selectedSlot}
          onPress={handleConfirmSlot}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color="#1a1a1a"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

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
              {modalStep === "details" ? "Add Details" : "Verify OTP"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {modalStep === "details"
                ? "We need your details to confirm the booking."
                : `Enter the 6-digit code sent to +91 ${phoneNumber}`}
            </Text>

            {modalStep === "details" ? (
              <>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#666"
                    style={{ marginRight: 10 }}
                  />
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
                  disabled={isProcessing}
                >
                  <Text style={styles.continueButtonText}>
                    {isProcessing ? "Processing..." : "Send OTP"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.otpHeaderRow}>
                  <TouchableOpacity
                    onPress={() => setModalStep("details")}
                    style={{ marginRight: 10 }}
                  >
                    <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
                  </TouchableOpacity>
                  <Text style={{ fontSize: 14, color: "#666" }}>
                    Change Number
                  </Text>
                </View>

                <View style={styles.otpContainer}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(ref) => {
                        inputRefs.current[i] = ref;
                      }}
                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(val) => {
                        const newOtp = [...otp];
                        newOtp[i] = val;
                        setOtp(newOtp);
                        if (val && i < 5) {
                          inputRefs.current[i + 1]?.focus();
                        }
                      }}
                      onKeyPress={({ nativeEvent }) => {
                        if (
                          nativeEvent.key === "Backspace" &&
                          !otp[i] &&
                          i > 0
                        ) {
                          inputRefs.current[i - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.modalContinueButton}
                  onPress={handleVerifyOtp}
                  disabled={isVerifying}
                >
                  <Text style={styles.continueButtonText}>
                    {isVerifying ? "Verifying..." : "Verify & Continue"}
                  </Text>
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
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f9f9f9",
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },

  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    paddingHorizontal: 20,
    marginTop: 10,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
  },

  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  durationHint: {
    fontSize: 13,
    color: "#888",
    paddingHorizontal: 20,
    marginTop: -10,
    marginBottom: 15,
  },

  // Date List
  dateList: {
    paddingHorizontal: 20,
  },
  dateItem: {
    width: 70,
    height: 90,
    borderRadius: 15,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  dateItemSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
    transform: [{ scale: 1.05 }],
  },
  monthText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  dateNumberText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  dayText: { fontSize: 12, color: "#666" },
  textSelected: { color: "#fff" },

  // Time Grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between", // Changed from gap to space-between
  },
  timeGridItem: {
    width: "31%", // roughly 3 per row
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 5,
    position: "relative",
  },
  timeGridItemSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  timeGridText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  timeGridTextSelected: {
    color: "#fff",
  },
  timeGridTextUnavailable: {
    color: "#ccc",
    textDecorationLine: "line-through",
  },
  offerBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#C8F000",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 1,
  },
  offerText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1a1a1a",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  selectionSummary: { flex: 1, justifyContent: "center" },
  summaryLabel: { fontSize: 12, color: "#888" },
  summaryValue: { fontSize: 15, fontWeight: "bold", color: "#1a1a1a" },
  placeholderSummary: { fontSize: 14, color: "#ccc", fontStyle: "italic" },

  continueButton: {
    backgroundColor: "#C8F000", // Yellow
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalOverlayTouch: { flex: 1 },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: "#1a1a1a",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  countryCode: { marginRight: 10 },
  countryCodeText: { fontSize: 14, fontWeight: "bold", color: "#1a1a1a" },

  modalContinueButton: {
    backgroundColor: "#C8F000",
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  otpHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    // paddingHorizontal: 20,
  },
  otpBox: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    backgroundColor: "#f9f9f9",
  },
});
