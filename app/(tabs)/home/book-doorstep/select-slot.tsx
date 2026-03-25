import {
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyLoginOtpMutation,
  useVerifyRegisterOtpMutation,
} from "@/store/api/authApi";
import { loginSuccess } from "@/store/slices/authSlice";
import { updateProfile } from "@/store/slices/profileSlice";
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
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RootState } from "@/store";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });
    }, [navigation]),
  );

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isNameWarningVisible, setIsNameWarningVisible] = useState(false);

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
  const [verifyLoginOtp, { isLoading: isVerifyingLoginOtp }] =
    useVerifyLoginOtpMutation();
  const [verifyRegisterOtp, { isLoading: isVerifyingRegOtp }] =
    useVerifyRegisterOtpMutation();

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
    { id: "3", time: "09:00 AM", period: "Morning", available: true },
    { id: "4", time: "09:30 AM", period: "Morning", available: true },
    { id: "5", time: "10:00 AM", period: "Morning", available: true },
    { id: "6", time: "10:30 AM", period: "Morning", available: true },
    { id: "7", time: "12:00 PM", period: "Afternoon", available: true },
    { id: "8", time: "12:30 PM", period: "Afternoon", available: true },
    { id: "9", time: "01:00 PM", period: "Afternoon", available: true },
    { id: "10", time: "01:30 PM", period: "Afternoon", available: true },
    { id: "11", time: "02:00 PM", period: "Afternoon", available: true },
    { id: "12", time: "02:30 PM", period: "Afternoon", available: true },
    { id: "13", time: "05:00 PM", period: "Evening", available: true },
    { id: "14", time: "05:30 PM", period: "Evening", available: true },
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

    if (slotDate < bufferTime) return { ...typedSlot, available: false };
    return typedSlot;
  });

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [registrationToken, setRegistrationToken] = useState<string | null>(
    null,
  );

  const handleSendOtp = async () => {
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
      const result = await register({
        name: trimmedName,
        countryCode: "+91",
        phone: trimmedPhone,
        accountType: "Seeker",
      }).unwrap();
      const token = result.data?.token || result.token;
      if (token) setRegistrationToken(token);
      await requestOtp({
        phone: trimmedPhone,
        countryCode: "+91",
        verifyType: "PHONE",
        otpType: "REGISTER",
      }).unwrap();
      setModalStep("otp");
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Something went wrong.");
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
        }).unwrap();
      } else {
        response = await verifyLoginOtp({
          countryCode: payload.countryCode,
          phone: payload.phone,
          loginToken: payload.phoneToken,
        }).unwrap();
      }

      if (response.success || response.data) {
        const responseToken =
          response.data?.token ||
          response.token ||
          (typeof response.data === "string" ? response.data : null);
        const user = response.data?.user || response.user;
        const finalToken = responseToken || registrationToken;
        if (finalToken) dispatch(loginSuccess(finalToken));
        if (user) dispatch(setUser(user));
        if (name.trim())
          dispatch(updateProfile({ key: "name", value: name.trim() }));
        if (phoneNumber.trim())
          dispatch(updateProfile({ key: "phone", value: phoneNumber.trim() }));
        setIsLoginModalVisible(false);
        setOtp(["", "", "", "", "", ""]);
        setModalStep("details");
        navigateToSummary();
      } else {
        Alert.alert("Error", response.message || "Verification failed.");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Invalid OTP");
    }
  };

  const navigateToSummary = () => {
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
        servicePrice: params.basePrice as string,
        totalPrice: (params.totalPrice || params.basePrice) as string,
        addressType: params.addressType as string,
      },
    });
  };

  const authState = useSelector((state: RootState) => state.auth);

  const handleConfirmSlot = () => {
    if (!selectedSlot) return;
    if (authState.isLoggedIn && authState.token) navigateToSummary();
    else setIsLoginModalVisible(true);
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="flex-row justify-between items-center px-5 py-4 bg-background">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border/50"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text className="text-[18px] font-[800] color-text tracking-tight">
          Select Slot
        </Text>
        <View className="w-10" />
      </View>

      <BookingStepper currentStep={2} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-5 mt-6 mb-8">
          <Text className="text-[28px] font-[900] color-text leading-[34px]">
            Choose your{"\n"}
            <Text className="color-primary">Arrival Time</Text>
          </Text>
          <Text className="text-[14px] color-textSecondary font-[600] mt-2">
            Pick a slot that suits your schedule.
          </Text>
        </View>

        {/* Date Selection */}
        <View className="mb-10">
          <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-5">
            Select Date
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {dates.map((item, index) => {
              const isSelected = selectedDate === index;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedDate(index)}
                  style={{
                    width: 70,
                    height: 90,
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                    borderWidth: 1,
                    backgroundColor: isSelected ? Colors.primary : Colors.card,
                    borderColor: isSelected
                      ? Colors.primary
                      : "rgba(226, 232, 240, 0.5)",
                    shadowColor: isSelected ? Colors.primary : undefined,
                    shadowOffset: isSelected
                      ? { width: 0, height: 10 }
                      : undefined,
                    shadowOpacity: isSelected ? 0.3 : undefined,
                    shadowRadius: isSelected ? 20 : undefined,
                    elevation: isSelected ? 10 : 0,
                  }}
                >
                  <Text
                    className={`text-[11px] font-[800] ${
                      isSelected ? "color-black/60" : "color-textSecondary"
                    } uppercase`}
                  >
                    {item.month}
                  </Text>
                  <Text
                    className={`text-[26px] font-[900] my-1 ${
                      isSelected ? "color-black" : "color-text"
                    }`}
                  >
                    {item.date}
                  </Text>
                  <Text
                    className={`text-[11px] font-[800] ${
                      isSelected ? "color-black/60" : "color-textSecondary"
                    } uppercase`}
                  >
                    {item.day}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View className="px-5">
          <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6">
            Arrival Time
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot.id;
              const isUnavailable = !slot.available;
              return (
                <Pressable
                  key={slot.id}
                  disabled={isUnavailable}
                  onPress={() => setSelectedSlot(slot.id)}
                  style={{
                    width: "31%",
                    height: 56,
                    borderRadius: 16,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    borderWidth: 1,
                    backgroundColor: isSelected ? Colors.primary : Colors.card,
                    borderColor: isSelected
                      ? Colors.primary
                      : "rgba(226, 232, 240, 0.5)",
                    opacity: isUnavailable ? 0.3 : 1,
                    shadowColor: isSelected ? Colors.primary : undefined,
                    shadowOffset: isSelected
                      ? { width: 0, height: 4 }
                      : undefined,
                    shadowOpacity: isSelected ? 0.3 : undefined,
                    shadowRadius: isSelected ? 10 : undefined,
                    elevation: isSelected ? 5 : 0,
                  }}
                >
                  <Text
                    className={`text-[13px] font-[800] ${
                      isSelected ? "color-black" : "color-text"
                    }`}
                  >
                    {slot.time.replace(" AM", "am").replace(" PM", "pm")}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-card px-6 pt-5 rounded-t-[40px] border-t border-border shadow-2xl"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View className="flex-row justify-between items-center mb-5 px-1">
          <View>
            <Text className="text-[12px] font-[800] color-textSecondary uppercase tracking-widest">
              Selected Slot
            </Text>
            {selectedSlot ? (
              <Text className="text-[18px] font-[900] color-primary mt-1">
                {dates[selectedDate].month} {dates[selectedDate].date} •{" "}
                {timeSlots.find((s) => s.id === selectedSlot)?.time}
              </Text>
            ) : (
              <Text className="text-[15px] font-[700] color-textSecondary italic mt-1">
                Pick a time to continue
              </Text>
            )}
          </View>
          <View className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Text className="text-[11px] font-[900] color-primary">
              DOORSTEP SERVICE
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className={`h-14 rounded-2xl flex-row items-center justify-center shadow-lg ${
            selectedSlot ? "bg-primary shadow-primary/30" : "bg-border/20"
          }`}
          disabled={!selectedSlot}
          onPress={handleConfirmSlot}
        >
          <Text
            className={`text-[16px] font-[900] ${
              selectedSlot ? "color-black" : "color-textSecondary"
            }`}
          >
            Confirm Slot
          </Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={selectedSlot ? "#000" : "#64748B"}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>

      {/* Login Bottom Sheet */}
      <Modal
        visible={isLoginModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLoginModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={() => setIsLoginModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View className="bg-card rounded-t-[44px] p-6 pb-12 border-t border-border shadow-2xl">
              <View className="w-14 h-1.5 bg-border/50 rounded-full self-center mb-8" />

              <View className="mb-8">
                <Text className="text-[26px] font-[900] color-text tracking-tighter">
                  {modalStep === "details"
                    ? "Welcome to Cleanmywheels"
                    : "Verify Securely"}
                </Text>
                <Text className="text-[14px] color-textSecondary font-[600] mt-2">
                  {modalStep === "details"
                    ? "Complete your profile to book the service."
                    : `Enter the 6-digit code sent to +91 ${phoneNumber}`}
                </Text>
              </View>

              {modalStep === "details" ? (
                <View>
                  <View className="bg-background rounded-2xl px-5 h-16 flex-row items-center border border-border/50 mb-5">
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={Colors.textSecondary}
                      style={{ marginRight: 12 }}
                    />
                    <TextInput
                      className="flex-1 text-[16px] color-text font-[700]"
                      placeholder="Your Full Name"
                      placeholderTextColor="#64748B"
                      value={name}
                      onChangeText={(text) => {
                        const filtered = text.replace(/[^a-zA-Z\s]/g, "");
                        if (filtered !== text) {
                          setIsNameWarningVisible(true);
                          setTimeout(
                            () => setIsNameWarningVisible(false),
                            3000,
                          );
                        }
                        setName(filtered);
                      }}
                      autoCapitalize="words"
                      maxLength={30}
                    />
                    {isNameWarningVisible && (
                      <Text className="absolute -bottom-5 left-12 text-[10px] color-red-500 font-[700]">
                        Only alphabets allowed
                      </Text>
                    )}
                  </View>

                  <View className="bg-background rounded-2xl px-5 h-16 flex-row items-center border border-border/50 mb-8">
                    <View className="pr-4 border-r border-border/50 mr-4">
                      <Text className="text-[16px] font-[800] color-text">
                        +91
                      </Text>
                    </View>
                    <TextInput
                      className="flex-1 text-[16px] color-text font-[800] tracking-[2px]"
                      placeholder="Mobile Number"
                      placeholderTextColor="#64748B"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                    />
                  </View>

                  <TouchableOpacity
                    className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/30"
                    onPress={handleSendOtp}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text className="text-[16px] font-[900] color-black uppercase tracking-tight">
                        Request Secure OTP
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <TouchableOpacity
                    onPress={() => setModalStep("details")}
                    className="flex-row items-center mb-6 ml-1"
                  >
                    <Ionicons
                      name="arrow-back"
                      size={16}
                      color={Colors.primary}
                    />
                    <Text className="text-[13px] font-[800] color-primary ml-2 uppercase tracking-tight">
                      Change Number
                    </Text>
                  </TouchableOpacity>

                  <View className="flex-row justify-between mb-8">
                    {otp.map((digit, i) => (
                      <View key={i} className="w-[14%] aspect-square">
                        <TextInput
                          ref={(ref) => {
                            inputRefs.current[i] = ref;
                          }}
                          className="w-full h-full bg-background rounded-xl text-center text-[24px] font-[900] color-text border border-border/50"
                          keyboardType="number-pad"
                          maxLength={1}
                          value={digit}
                          onChangeText={(val) => {
                            const text = val.replace(/[^0-9]/g, "");
                            if (text.length > 0) {
                              const newOtp = [...otp];
                              newOtp[i] = text.slice(-1);
                              setOtp(newOtp);
                              if (i < 5) inputRefs.current[i + 1]?.focus();
                            } else {
                              const newOtp = [...otp];
                              newOtp[i] = "";
                              setOtp(newOtp);
                            }
                          }}
                          onKeyPress={({ nativeEvent }) => {
                            if (
                              nativeEvent.key === "Backspace" &&
                              !otp[i] &&
                              i > 0
                            )
                              inputRefs.current[i - 1]?.focus();
                          }}
                        />
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/30"
                    onPress={handleVerifyOtp}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text className="text-[16px] font-[900] color-black uppercase tracking-tight">
                        Verify & Complete
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
