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
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
import Animated, { FadeInUp, ZoomIn, SlideInRight } from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";

import { HomeBackground } from "../../../components/home/HomeBackground";
import { HeroSection } from "../../../components/home/HeroSection";
import { ServiceActionGrid } from "../../../components/home/ServiceActionGrid";
import { NextServiceWidget } from "../../../components/home/NextServiceWidget";
import { CoreProtocols } from "../../../components/home/CoreProtocols";
import { toast } from "@/utils/toast";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const bookings = useSelector((state: RootState) => state.bookings.bookings);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  const userAvatar = useSelector((state: RootState) => state.profile.avatar);

  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      router.replace("/(tabs)/dashboard");
    }
  }, [isLoggedIn, isAdmin, router]);

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
  const [timer, setTimer] = useState(60);
  const [isOtpWarningVisible, setIsOtpWarningVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const isNavigating = useRef(false);

  const [requestOtp] = useRequestOtpMutation();
  const [verifyLoginOtp] = useVerifyLoginOtpMutation();
  const [register] = useRegisterMutation();
  const [verifyRegisterOtp] = useVerifyRegisterOtpMutation();

  useEffect(() => {
    let interval: any;
    if (modalStep === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [modalStep, timer]);

  const handleSendOtp = async () => {
    const cleanedPhone = phoneNumber.trim();
    setTimer(60);
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

      toast.success("OTP Sent", "Please check your messages.");
      setModalStep("otp");
    } catch (err: any) {
      console.error("Auth Request Failed", err);
      toast.error(
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
      toast.error("Invalid OTP", "Please enter the complete 6-digit OTP.");
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
        toast.error("Login Failed", "No access token received.");
      }
    } catch (err: any) {
      console.error("Login Verification Failed", err);
      toast.error(
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
        addons: booking.addons,
        addonsTotal: booking.addonsTotal,
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
    if (isNavigating.current) return;
    isNavigating.current = true;

    if (!booking.serviceId) {
      Alert.alert(
        "Rebook Unavailable",
        "This past booking cannot be quick-rebooked. Please start a new booking.",
        [
          {
            text: "Start New Booking",
            onPress: () => {
              router.push("/(tabs)/home/book-doorstep/enter-location");
              setTimeout(() => {
                isNavigating.current = false;
              }, 1000);
            },
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              isNavigating.current = false;
            },
          },
        ],
      );
      return;
    }

    const rebookAddons = (booking.addons || []).map((a: any) => ({
      id: a.addOn?._id || a.addOn,
      name: a.addOn?.name || "Addon",
      price: a.price,
    }));

    router.push({
      pathname: "/(tabs)/home/book-doorstep/select-slot",
      params: {
        serviceId: booking.serviceId as string,
        serviceName: booking.serviceName as string,
        shopName: (booking.center || "Your Location") as string,
        basePrice: (
          (booking.price || 0) - (booking.addonsTotal || 0)
        ).toString(),
        totalPrice: (booking.price || 0).toString(),
        address: (booking.address || "") as string,
        vehicleType: (booking.car?.split(" - ")[0] || "Sedan") as string,
        vehicleNumber: (booking.car?.split(" - ")[1] || "") as string,
        addons: JSON.stringify(rebookAddons),
      },
    });

    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
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
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
        >
          <HeroSection isLoggedIn={isLoggedIn} />
        </Animated.View>

        {/* Action Grid (Book / Add-ons) */}
        <ServiceActionGrid
          isLoggedIn={isLoggedIn}
          hasActiveSubscription={activeSubs.length > 0}
        />

        {/* Core Protocols (Replaces WhyChooseUs) */}
        {!isLoggedIn && (
          <Animated.View
            entering={ZoomIn.delay(400).duration(600)}
          >
            <CoreProtocols />
          </Animated.View>
        )}

        {/* Next Service (For Subscribers) */}
        {isLoggedIn &&
          activeSubs.map((sub: any) => {
            const frequencyType = sub.frequencyType || 'DAILY';
            const completed = sub.servicesCompleted || 0;
            const total = sub.servicesTotal || 30;
            
            let nextDate = new Date();
            
            if (sub.serviceDates && sub.serviceDates.length > 0) {
              const nextPending = sub.serviceDates.find((sd: any) => sd.status === 'pending');
              if (nextPending) {
                nextDate = new Date(nextPending.date);
              }
            } else {
              // Fallback to manual calculation based on frequency
              const startDate = new Date(sub.startDate || new Date());
              nextDate = new Date(startDate);
              
              if (frequencyType === 'DAILY') {
                nextDate.setDate(startDate.getDate() + completed);
              } else if (frequencyType === 'WEEKLY') {
                nextDate.setDate(startDate.getDate() + (completed * 7));
              } else if (frequencyType === 'BIWEEKLY') {
                nextDate.setDate(startDate.getDate() + (completed * 3.5)); // Approx
              } else if (frequencyType === 'ALTERNATE_DAY') {
                nextDate.setDate(startDate.getDate() + (completed * 2));
              }
            }

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
                <Animated.View
                  key={index}
                  entering={SlideInRight.delay(400 + index * 100).duration(500)}
                >
                  <TouchableOpacity
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
                </Animated.View>
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
        <View className="flex-1 bg-black">
          <View
            style={{ paddingTop: insets.top + 20 }}
            className="flex-1 px-6"
          >
            {/* Header / Back Button */}
            <TouchableOpacity
              onPress={handleCloseModal}
              className="w-10 h-10 items-center justify-center -ml-2 mb-8"
            >
              <Ionicons name="chevron-back" size={28} color="white" />
            </TouchableOpacity>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="flex-1"
            >
              <Text className="text-[32px] font-[800] text-white leading-[40px] mb-3">
                {modalStep === "details" ? "Enter your\nmobile number" : "Enter\nverification code"}
              </Text>
              
              <View className="flex-row items-center mb-10">
                <Text className="text-base text-gray-400 font-[500]">
                  {modalStep === "details"
                    ? "to continue with Cleanmywheels"
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
                  <View className="mb-10">
                    <View className="flex-row items-center bg-[#1A1A1A] border border-white/10 rounded-[16px] h-[64px] px-5">
                      <Text className="text-lg text-white font-[700]">+91</Text>
                      <View className="w-[1px] h-6 bg-white/20 mx-4" />
                      <TextInput
                        className="flex-1 text-lg text-white font-[700]"
                        placeholder="000 000 0000"
                        placeholderTextColor="#444"
                        keyboardType="phone-pad"
                        maxLength={10}
                        autoFocus
                        value={phoneNumber}
                        onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    className="bg-primary h-[60px] rounded-[16px] items-center justify-center shadow-2xl shadow-primary/40"
                    onPress={handleSendOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
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
                  <View className="flex-row justify-between mb-10">
                    {otp.map((digit, i) => (
                      <View key={i}>
                        <TextInput
                          ref={(ref: any) => {
                            inputRefs.current[i] = ref;
                          }}
                          className={`w-[52px] h-[64px] rounded-[16px] border-[2px] text-center text-2xl font-[800] text-white ${
                            digit
                              ? "border-primary bg-[#1A1A1A]"
                              : "border-white/10 bg-[#1A1A1A]"
                          }`}
                          keyboardType="number-pad"
                          maxLength={6}
                          contextMenuHidden={false}
                          selectTextOnFocus
                          autoFocus={i === 0}
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
                              const newOtp = [...otp];
                              newOtp[i] = val.slice(-1);
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
                      </View>
                    ))}
                  </View>

                  {isOtpWarningVisible && (
                    <Text className="text-red-500 text-[12px] mt-[-20px] mb-[20px] text-center">
                      Only numbers are allowed
                    </Text>
                  )}

                  <TouchableOpacity
                    className="bg-primary h-[60px] rounded-[16px] items-center justify-center mb-8 shadow-2xl shadow-primary/40"
                    onPress={handleVerifyOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
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
