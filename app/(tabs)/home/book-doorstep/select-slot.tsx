import {
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyLoginOtpMutation,
  useVerifyRegisterOtpMutation,
} from "@/store/api/authApi";
import { useCreateAddressMutation } from "@/store/api/addressApi";
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
import { useAlert } from "@/components/providers/AlertProvider";
import { InteractivePressable } from "@/components/ui/InteractivePressable";

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
  const { showAlert, hideAlert } = useAlert();
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

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDate]);

  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
  const [verifyLoginOtp, { isLoading: isVerifyingLoginOtp }] =
    useVerifyLoginOtpMutation();
  const [verifyRegisterOtp, { isLoading: isVerifyingRegOtp }] =
    useVerifyRegisterOtpMutation();
  const [createAddress] = useCreateAddressMutation();

  const profileState = useSelector((state: RootState) => state.profile);

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
  const [timer, setTimer] = useState(45);
  const [isExistingUser, setIsExistingUser] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isLoginModalVisible && modalStep === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoginModalVisible, modalStep, timer]);

  const handleSendOtp = async () => {
    if (!name.trim()) {
      showAlert({
        title: "Required",
        message: "Please enter your name.",
        type: "warning",
      });
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      showAlert({
        title: "Invalid Phone",
        message: "Please enter a valid phone number.",
        type: "warning",
      });
      return;
    }

    setTimer(45);
    const trimmedPhone = phoneNumber.trim();
    const trimmedName = name.trim();

    setIsExistingUser(false);
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
      if (err?.data?.message?.includes("already exists") || err?.data?.message?.includes("already found")) {
        showAlert({
          title: "Account Already Exists",
          message: "Please login from homepage to continue.",
          type: "info",
          buttons: [
            {
              text: "Ok",
              onPress: () => hideAlert(),
            },
          ],
        });
      } else {
        showAlert({
          title: "Registration Failed",
          message: err?.data?.message || "Something went wrong.",
          type: "error",
        });
      }
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("").trim();
    if (otpValue.length < 6) {
      showAlert({
        title: "Invalid OTP",
        message: "Please enter the complete 6-digit OTP.",
        type: "warning",
      });
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
      if (name.trim() && !isExistingUser) {
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

        // Sync local address to backend if it exists (guest flow)
        if (profileState.addresses && profileState.addresses.length > 0) {
          const addr = profileState.addresses[0];
          try {
            await createAddress({
              houseOrFlatNo: addr.houseOrFlatNo,
              locality: addr.locality,
              landmark: addr.landmark,
              city: addr.city,
              postalCode: addr.postalCode,
              addressType: addr.addressType,
            }).unwrap();
            console.log("✅ [SelectSlot] Address synced to backend");
          } catch (syncErr) {
            console.error("❌ [SelectSlot] Address sync failed:", syncErr);
          }
        }

        setIsLoginModalVisible(false);
        setOtp(["", "", "", "", "", ""]);
        setModalStep("details");
        navigateToSummary();
      } else {
        showAlert({
          title: "Error",
          message: response.message || "Verification failed.",
          type: "error",
        });
      }
    } catch (err: any) {
      showAlert({
        title: "Verification Failed",
        message: err?.data?.message || "Invalid OTP",
        type: "error",
      });
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
        addons: params.addons as string,
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
              Selected Service & Add-ons
            </Text>
            <View className="flex-row items-center mt-1">
               <Text className="text-[16px] font-[900] color-primary">
                 {params.serviceName || "Wash"}
               </Text>
               {params.addons && JSON.parse(params.addons as string).length > 0 && (
                 <Text className="text-[13px] font-[700] color-textSecondary ml-2">
                   + {JSON.parse(params.addons as string).length} Add-ons
                 </Text>
               )}
            </View>
            {selectedSlot ? (
              <Text className="text-[14px] font-[800] color-text mt-0.5">
                {dates[selectedDate].month} {dates[selectedDate].date} •{" "}
                {timeSlots.find((s) => s.id === selectedSlot)?.time}
              </Text>
            ) : (
              <Text className="text-[13px] font-[700] color-textSecondary italic mt-0.5">
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

        <InteractivePressable
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
        </InteractivePressable>
      </View>

      {/* Login Bottom Sheet */}
      <Modal
        visible={isLoginModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsLoginModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          <View
            style={{ paddingTop: insets.top + 20 }}
            className="flex-1 px-6"
          >
            {/* Header / Back Button */}
            <TouchableOpacity
              onPress={() => setIsLoginModalVisible(false)}
              className="w-10 h-10 items-center justify-center -ml-2 mb-8"
            >
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1"
            >
              <Text className="text-[32px] font-[800] text-white leading-[40px] mb-3">
                {modalStep === "details"
                  ? "Welcome to\nCleanmywheels"
                  : "Enter\nverification code"}
              </Text>

              <View className="flex-row items-center mb-10">
                <Text className="text-base text-gray-400 font-[500]">
                  {modalStep === "details"
                    ? "Complete your profile to book"
                    : "enter the verification code sent to"}
                </Text>
                {modalStep === "otp" && (
                  <View className="flex-row items-center ml-1">
                    <Text className="text-base text-white font-[600]">+91 {phoneNumber}</Text>
                    <TouchableOpacity onPress={() => setModalStep("details")} className="ml-2">
                       <Ionicons name="pencil" size={14} color="#C8F000" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {modalStep === "details" ? (
                <View>
                  <View className="mb-5">
                    <View className="flex-row items-center bg-[#1A1A1A] border border-white/10 rounded-[16px] h-[64px] px-5">
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color="#64748B"
                        style={{ marginRight: 12 }}
                      />
                      <TextInput
                        className="flex-1 text-lg text-white font-[700]"
                        placeholder="Your Full Name"
                        placeholderTextColor="#444"
                        value={name}
                        onChangeText={(text) => {
                          const filtered = text.replace(/[^a-zA-Z\s]/g, "");
                          if (filtered !== text) {
                            setIsNameWarningVisible(true);
                            setTimeout(() => setIsNameWarningVisible(false), 3000);
                          }
                          setName(filtered);
                        }}
                        autoCapitalize="words"
                        maxLength={30}
                      />
                    </View>
                    <View className="flex-row justify-between items-center mt-1.5 px-1">
                      <View className="flex-1">
                        {isNameWarningVisible && (
                          <Text className="text-[10px] color-red-500 font-[700]">
                            Only alphabets allowed
                          </Text>
                        )}
                      </View>
                      <Text className={`text-[11px] font-[800] ${name.length >= 25 ? 'text-primary' : 'text-gray-500'}`}>
                        {name.length} / 30
                      </Text>
                    </View>
                  </View>

                  <View className="mb-10">
                    <View className="flex-row items-center bg-[#1A1A1A] border border-white/10 rounded-[16px] h-[64px] px-5">
                      <Text className="text-lg text-white font-[800]">+91</Text>
                      <View className="w-[1px] h-6 bg-white/20 mx-4" />
                      <TextInput
                        className="flex-1 text-lg text-white font-[800] tracking-[1px]"
                        placeholder="Mobile Number"
                        placeholderTextColor="#444"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={phoneNumber}
                        onChangeText={(val) => setPhoneNumber(val.replace(/[^0-9]/g, ""))}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    className="bg-primary h-[60px] rounded-[16px] items-center justify-center shadow-2xl shadow-primary/40"
                    onPress={handleSendOtp}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text className="text-[18px] font-[900] text-black">
                        Continue
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View className="mb-10 relative w-full">
                    <TextInput
                      style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, zIndex: 10 }}
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      maxLength={6}
                      autoFocus={true}
                      value={otp.join("")}
                      onChangeText={(val) => {
                        const text = val.replace(/[^0-9]/g, "").slice(0, 6);
                        const newOtp = ["", "", "", "", "", ""];
                        for (let j = 0; j < text.length; j++) {
                          newOtp[j] = text[j];
                        }
                        setOtp(newOtp);
                      }}
                    />
                    <View className="flex-row justify-between w-full" pointerEvents="none">
                      {otp.map((digit, i) => {
                        const currentLength = otp.join("").length;
                        const isFocused = currentLength === i || (currentLength === 6 && i === 5);
                        return (
                          <View
                            key={i}
                            className={`w-[14%] aspect-square bg-[#1A1A1A] rounded-xl border-[2px] items-center justify-center ${
                              isFocused ? "border-primary" : "border-white/10"
                            }`}
                          >
                            <Text className="text-[24px] font-[900] text-white">
                              {digit}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>

                  <TouchableOpacity
                    className="bg-primary h-[60px] rounded-[16px] items-center justify-center mb-8 shadow-2xl shadow-primary/40"
                    onPress={handleVerifyOtp}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text className="text-[18px] font-[900] text-black">
                        Verify
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View className="items-center">
                    <Text className="text-sm text-gray-500 font-[500] mb-2">
                      Didn&apos;t receive code?
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (timer === 0) {
                          handleSendOtp();
                        }
                      }}
                      disabled={timer > 0}
                      className="flex-row items-center"
                    >
                      <Text
                        className={`text-base font-[800] ${
                          timer > 0 ? "text-gray-500" : "text-primary"
                        }`}
                      >
                        Resend
                      </Text>
                      {timer > 0 && (
                        <Text className="text-base font-[600] text-gray-500 ml-2">
                          - 00:{timer < 10 ? `0${timer}` : timer}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
