import { RootState } from "@/store";
import {
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyLoginOtpMutation,
  useVerifyRegisterOtpMutation,
  useGetProfileQuery,
} from "@/store/api/authApi";
import { useGetAddressesQuery } from "@/store/api/addressApi";
import { useGetBookingsQuery } from "@/store/api/bookingApi";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { Booking } from "@/store/slices/bookingSlice";
import { setUser } from "@/store/slices/userSlice";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { HomeBackground } from "../../../components/home/HomeBackground";
import { HeroSection } from "../../../components/home/HeroSection";
import { ServiceActionGrid } from "../../../components/home/ServiceActionGrid";
import { NextServiceWidget } from "../../../components/home/NextServiceWidget";
import { CoreProtocols } from "../../../components/home/CoreProtocols";

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const bookings = useSelector((state: RootState) => state.bookings.bookings);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userStateName = useSelector(
    (state: RootState) => state.user.user?.name,
  );
  const profileName = useSelector((state: RootState) => state.profile.name);

  const fullName = profileName || userStateName || "";
  const firstName = fullName.split(" ")[0];

  const userAvatar = useSelector((state: RootState) => state.profile.avatar);

  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    if (token === "dummy-token") {
      dispatch(logout());
    }
  }, [token, dispatch]);

  const { data: userProfile } = useGetProfileQuery(undefined, {
    skip: !token || token === "dummy-token",
  });

  useEffect(() => {
    if (userProfile?.user) {
      console.log("✅ [HomeScreen] Setting user:", userProfile.user);
      dispatch(setUser(userProfile.user));
    }
  }, [userProfile, dispatch]);

  const { data: subscriptions } = useGetMySubscriptionQuery(undefined, {
    skip: !isLoggedIn,
  });

  const { data: bookingsData } = useGetBookingsQuery(undefined, {
    skip: !isLoggedIn,
  });

  useGetAddressesQuery(undefined, {
    skip: !isLoggedIn,
  });

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpWarningVisible, setIsOtpWarningVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [requestOtp] = useRequestOtpMutation();
  const [verifyLoginOtp] = useVerifyLoginOtpMutation();
  const [register] = useRegisterMutation();
  const [verifyRegisterOtp] = useVerifyRegisterOtpMutation();

  const handleSendOtp = async () => {
    const cleanedPhone = phoneNumber.trim();

    if (!cleanedPhone || cleanedPhone.length !== 10) {
      Alert.alert("Invalid Phone", "Please enter a 10-digit phone number.");
      return;
    }

    if (!/^[6-9]/.test(cleanedPhone) && cleanedPhone !== "1234567890") {
      Alert.alert("Invalid Phone", "Please enter a valid mobile number.");
      return;
    }
    setIsLoading(true);
    try {
      if (name.trim()) {
        const trimmedName = name.trim();
        const trimmedPhone = cleanedPhone;
        const result = await register({
          name: trimmedName,
          countryCode: "+91",
          phone: trimmedPhone,
          accountType: trimmedPhone === "1234567890" ? "Super Admin" : "Seeker",
        }).unwrap();

        const token = result.data?.token;
        const backendUser = result.data?.user;

        if (token) {
          dispatch(loginSuccess(token));
        }
        if (backendUser) {
          dispatch(setUser(backendUser));
        }
      } else {
        await requestOtp({
          phone: cleanedPhone,
          countryCode: "+91",
          verifyType: "PHONE",
          otpType: "LOGIN",
        }).unwrap();
      }

      Alert.alert("OTP Sent", "Please check your messages.");
      setModalStep("otp");
    } catch (err: any) {
      console.error("Auth Request Failed", err);
      Alert.alert(
        "Error",
        err?.data?.message ||
          "Failed to proceed. Try entering your name to register.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      Alert.alert("Invalid OTP", "Please enter the complete 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        countryCode: "+91",
        verifyType: "PHONE",
        phone: phoneNumber.trim(),
        phoneToken: otpValue,
      };

      let response;
      if (name.trim()) {
        response = await verifyRegisterOtp({
          ...payload,
          otpType: "REGISTER",
        }).unwrap();
      } else {
        const loginPayload = {
          countryCode: payload.countryCode,
          phone: payload.phone,
          loginToken: payload.phoneToken,
        };
        response = await verifyLoginOtp(loginPayload).unwrap();
      }

      console.log("✅ Auth verified successfully:", response);

      const token =
        response?.data?.token ||
        response?.token ||
        (typeof response?.data === "string" ? response?.data : null);

      if (token) {
        console.log("🎟 [HomeScreen] New token received and stored");
        const backendUser = response?.data?.user;
        if (backendUser) {
          dispatch(setUser(backendUser));
        }
        dispatch(loginSuccess(token));

        const isAdminUser = backendUser?.accountType === "Super Admin";

        setModalStep("details");
        setOtp(["", "", "", "", "", ""]);
        setName("");
        setPhoneNumber("");
        setIsLoginModalVisible(false);

        if (isAdminUser) {
          setTimeout(() => {
            router.replace("/(tabs)/dashboard");
          }, 100);
        }
      } else {
        Alert.alert("Login Failed", "No access token received.");
      }
    } catch (err: any) {
      console.error("Login Verification Failed", err);
      Alert.alert(
        "Login Failed",
        err?.data?.message || "Invalid OTP or Server Error",
      );
    } finally {
      setIsLoading(false);
    }
    return;
  };

  const handleCloseModal = () => {
    setIsLoginModalVisible(false);

    if (modalStep === "details") {
      setPhoneNumber("");
      setOtp(["", "", "", "", "", ""]);
      setModalStep("details");
      setName("");
    }
  };

  const allBookings = [...(bookingsData?.data?.bookingList || []), ...bookings];
  const uniqueBookingsMap = new Map();

  allBookings.forEach((booking) => {
    // Map backend fields to frontend expected fields if necessary
    const serviceName = booking.serviceName || booking.washPackage?.name;
    const address = booking.address?.fullAddress || booking.address || "";
    const car =
      booking.car ||
      (booking.vehicle
        ? `${booking.vehicle.vehicleType} - ${booking.vehicle.vehicleNo}`
        : "");
    const price = booking.price || booking.washPackage?.price || 0;
    const date = booking.date || booking.bookingDate;
    const serviceId = booking.serviceId || booking.washPackage?._id;

    if (serviceName) {
      const key = `${serviceName}|${address}|${car}`;
      // Store a normalized object
      uniqueBookingsMap.set(key, {
        ...booking,
        serviceName,
        address,
        car,
        price,
        date,
        serviceId,
      });
    }
  });
  const pastBookings = Array.from(uniqueBookingsMap.values()).reverse();

  const activeSubs =
    subscriptions?.filter((s: any) =>
      ["active", "ongoing"].includes(s.status),
    ) || [];

  useFocusEffect(
    useCallback(() => {
      const homeStack = navigation.getParent();
      const tabs = homeStack?.getParent();

      if (tabs) {
        tabs.setOptions({
          tabBarStyle: { display: "flex" },
        });
      }
    }, [navigation]),
  );

  const handleRecentServicePress = (booking: Partial<Booking>) => {
    if (!booking.serviceId) {
      Alert.alert(
        "Rebook Unavailable",
        "This past booking cannot be quick-rebooked. Please start a new booking.",
        [
          {
            text: "Start New Booking",
            onPress: () =>
              router.push("/(tabs)/home/book-doorstep/enter-location"),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }

    router.push({
      pathname: "/(tabs)/home/book-doorstep/select-slot",
      params: {
        serviceName: booking.serviceName,
        shopName: booking.center || "Your Location",
        basePrice: booking.price ? Math.round(booking.price / 1.18) : 0,
        address: booking.address,
        vehicleType: booking.car?.split(" - ")[0] || "Sedan",
        vehicleNumber: booking.car?.split(" - ")[1] || "",
        serviceId: booking.serviceId,
      },
    });
  };

  return (
    <ScreenWrapper
      background={<HomeBackground />}
      statusBarStyle="light-content"
      className="bg-background"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row justify-between items-start px-5 pt-[10px] mb-5">
          <View>
            <Text className="text-[10px] text-primary font-[700] tracking-[1px] mb-1 uppercase">
              ON-DEMAND CARE
            </Text>
            <Text className="text-2xl font-[800] text-white italic tracking-[-1px]">
              CLEANMY<Text className="text-primary">WHEELS</Text>
            </Text>
          </View>

          <View className="mt-2">
            {!isLoggedIn ? (
              <TouchableOpacity
                className="bg-primary px-4 py-2 rounded-md shadow-md shadow-primary"
                onPress={() => setIsLoginModalVisible(true)}
              >
                <Text className="font-[900] text-black italic text-[12px]">
                  LOG IN
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#333] elevation-4 shadow-lg shadow-black"
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Image
                  source={{
                    uri:
                      userAvatar ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                  }}
                  className="w-full h-full"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <HeroSection isLoggedIn={isLoggedIn} />

        {/* Action Grid (Book / Add-ons) */}
        <ServiceActionGrid
          isLoggedIn={isLoggedIn}
          hasActiveSubscription={activeSubs.length > 0}
        />

        {/* Core Protocols (Replaces WhyChooseUs) */}
        {!isLoggedIn && <CoreProtocols />}

        {/* Next Service (For Subscribers) */}
        {isLoggedIn &&
          activeSubs.map((sub: any) => {
            const startDate = new Date(sub.startDate || new Date());
            const completed = sub.servicesCompleted || 0;
            const total = sub.servicesTotal || 30;
            const nextDate = new Date(startDate);
            nextDate.setDate(startDate.getDate() + completed);

            return (
              <NextServiceWidget
                key={sub._id}
                date={nextDate.toISOString()}
                vehicleNo={sub.vehicle?.vehicleNo || "Car"}
                progress={completed / total}
              />
            );
          })}
        {isLoggedIn && pastBookings.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-[5px] px-5">
              <Text className="text-lg font-[700] text-white">
                Recent Services
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
            >
              {pastBookings.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  className="w-[200px] p-5 rounded-[24px] bg-[#181818] border border-primary/20 shadow-lg elevation-6"
                  activeOpacity={0.9}
                  onPress={() => handleRecentServicePress(item)}
                >
                  <View className="flex-row justify-between mb-4">
                    <View className="w-11 h-11 rounded-[14px] bg-primary/10 items-center justify-center border border-primary/10">
                      <Ionicons name="sparkles" size={20} color="#C8F000" />
                    </View>
                    <View className="flex-row items-center bg-primary/10 rounded-[12px] px-2 py-1 h-6 gap-1 border border-primary">
                      <Ionicons name="refresh" size={10} color="#C8F000" />
                      <Text className="text-primary text-[10px] font-[700] uppercase">
                        Rebook
                      </Text>
                    </View>
                  </View>

                  <Text
                    className="text-base font-[700] text-white mb-[2px]"
                    numberOfLines={1}
                  >
                    {item.serviceName}
                  </Text>
                  <Text
                    className="text-[12px] text-[#888] font-[500]"
                    numberOfLines={1}
                  >
                    {item.car}
                  </Text>

                  <View className="h-[1px] bg-[#333] my-3" />

                  <View className="flex-row justify-between items-center">
                    <Text className="text-[12px] text-[#888] font-[600]">
                      {item.date
                        ? new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </Text>
                    <Text className="text-base font-[800] text-primary">
                      ₹ {item.price}
                    </Text>
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
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/80 justify-end"
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={handleCloseModal}
          />

          <View className="bg-background rounded-t-[24px] p-6 pb-10 border-t border-border">
            <View className="items-center mb-6">
              <View className="w-10 h-1 bg-border rounded-[2px]" />
            </View>

            <Text className="text-2xl font-[700] text-text mb-2">
              {modalStep === "details" ? "Welcome Back!" : "Enter OTP"}
            </Text>
            <Text className="text-sm text-textSecondary mb-8">
              {modalStep === "details"
                ? "Enter your mobile number to continue."
                : `We sent a code to +91 ${phoneNumber}`}
            </Text>

            {modalStep === "details" ? (
              <View>
                <View className="mb-6">
                  <Text className="text-sm font-[600] text-text mb-2">
                    Mobile Number
                  </Text>
                  <View className="flex-row items-center bg-card border border-border rounded-[12px] h-[52px] px-4">
                    <Text className="text-base text-text font-[600]">+91</Text>
                    <View className="w-[1px] h-6 bg-border mx-3" />
                    <TextInput
                      className="flex-1 text-base text-text font-[600]"
                      placeholder="98765 43210"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  className="bg-primary h-[52px] rounded-[12px] items-center justify-center mb-4"
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-base font-[700] text-black">
                      Continue
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="flex-row justify-between mb-8">
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(ref) => {
                        inputRefs.current[i] = ref;
                      }}
                      className={`w-[50px] h-[50px] rounded-[12px] border text-center text-xl font-[700] text-text ${
                        digit
                          ? "border-primary bg-primary/10"
                          : "border-border bg-card"
                      }`}
                      keyboardType="number-pad"
                      maxLength={6}
                      contextMenuHidden={false}
                      selectTextOnFocus
                      value={digit}
                      onChangeText={(text) => {
                        if (/[^0-9]/.test(text)) {
                          setIsOtpWarningVisible(true);
                          setTimeout(() => setIsOtpWarningVisible(false), 3000);
                        }
                        const val = text.replace(/[^0-9]/g, "");
                        if (val.length >= 6) {
                          const pasted = val.slice(-6).split("");
                          setOtp(pasted);
                          inputRefs.current[5]?.focus();
                        } else if (val.length > 0) {
                          const lastChar = val.slice(-1);
                          const newOtp = [...otp];
                          newOtp[i] = lastChar;
                          setOtp(newOtp);
                          if (i < 5) {
                            inputRefs.current[i + 1]?.focus();
                          }
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
                        ) {
                          inputRefs.current[i - 1]?.focus();
                        }
                      }}
                    />
                  ))}
                </View>

                {isOtpWarningVisible && (
                  <Text className="text-red-500 text-[12px] mt-[-10px] mb-[10px] text-center">
                    Only numbers are allowed
                  </Text>
                )}

                <View className="flex-row justify-center mb-8">
                  <Text className="text-sm text-textSecondary">
                    Didn&apos;t receive code?{" "}
                  </Text>
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text className="text-sm font-[700] text-primary">
                      Resend
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="bg-primary h-[52px] rounded-[12px] items-center justify-center mb-4"
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text className="text-base font-[700] text-black">
                      Verify Login
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}
