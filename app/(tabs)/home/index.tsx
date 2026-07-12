import { RootState } from "@/store";
import {
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyLoginOtpMutation,
  useVerifyRegisterOtpMutation,
  useGetProfileQuery,
} from "@/store/api/authApi";
import { useGetAddressesQuery, useCreateAddressMutation } from "@/store/api/addressApi";
import { useGetBookingsQuery } from "@/store/api/bookingApi";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { type BookingStatus } from "@/store/slices/bookingSlice";
import { setUser } from "@/store/slices/userSlice";
import { updateProfile } from "@/store/slices/profileSlice";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import { InteractivePressable } from "@/components/ui/InteractivePressable";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInUp,
  ZoomIn,
  SlideInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";

import { HomeBackground } from "../../../src/components/home/HomeBackground";
import { HeroSection } from "../../../src/components/home/HeroSection";
import { ServiceActionGrid } from "../../../src/components/home/ServiceActionGrid";
import { NextServiceWidget } from "../../../src/components/home/NextServiceWidget";
import { CoreProtocols } from "../../../src/components/home/CoreProtocols";
import { TransformationSection } from "../../../src/components/home/TransformationSection";
import { ProtocolSection } from "../../../src/components/home/ProtocolSection";
import { MembershipPerks } from "../../../src/components/home/MembershipPerks";
import { OnboardingTour } from "../../../src/components/home/OnboardingTour";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { toast } from "@/utils/toast";
import { useAlert } from "@/providers/AlertProvider";

interface OtpBoxProps {
  digit: string;
  index: number;
  isFocused: boolean;
  mergeAnim: any;
}

const OtpBox: React.FC<OtpBoxProps> = ({ digit, index, isFocused, mergeAnim }) => {
  const boxStyle = useAnimatedStyle(() => {
    const translateX = (2.5 - index) * 44 * mergeAnim.value;
    const opacity = 1 - mergeAnim.value;
    const scale = 1 - 0.7 * mergeAnim.value;
    return {
      transform: [{ translateX }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[boxStyle]}
      className={`w-[52px] h-[64px] rounded-[16px] border-[2px] items-center justify-center bg-[#1C1C1E] ${
        digit ? "border-[#C8F000]" : isFocused ? "border-[#C8F000]/50" : "border-white/5"
      }`}
    >
      <Text className="text-[24px] font-[900] text-white">
        {digit}
      </Text>
    </Animated.View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { showAlert, hideAlert } = useAlert();
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);


  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoggedIn, isAdmin, router]);

  useEffect(() => {
    if (token === "dummy-token") {
      dispatch(logout());
    }
  }, [token, dispatch]);

  const { data: userProfile, refetch: refetchProfile } = useGetProfileQuery(undefined, {
    skip: !token || token === "dummy-token",
  });

  useEffect(() => {
    if (userProfile?.user) {
      console.log("✅ [HomeScreen] Setting user:", userProfile.user);
      dispatch(setUser(userProfile.user));
    }
  }, [userProfile, dispatch]);

  const { data: subscriptions, refetch: refetchSubscriptions } = useGetMySubscriptionQuery(undefined, {
    skip: !isLoggedIn,
  });

  const { data: bookingsData, refetch: refetchBookings } = useGetBookingsQuery(undefined, {
    skip: !isLoggedIn,
  });

  useGetAddressesQuery(undefined, {
    skip: !isLoggedIn,
  });

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!isLoggedIn) {
        const hasSeen = await AsyncStorage.getItem("hasSeenOnboarding");
        if (!hasSeen) {
          setTimeout(() => {
            setShowOnboarding(true);
          }, 200);
        }
      }
    };
    checkOnboarding();
  }, [isLoggedIn]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoggedIn) {
        setIsLoginModalVisible(true);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCloseOnboarding = async () => {
    setShowOnboarding(false);
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
    } catch (error) {
      console.error("Error saving onboarding state:", error);
    }
  };
  const [modalStep, setModalStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(45);
  const [isOtpWarningVisible, setIsOtpWarningVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const otpInputRef = useRef<TextInput>(null);
  const isNavigating = useRef(false);
  const [isExistingUser, setIsExistingUser] = useState(false);

  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const mergeAnim = useSharedValue(0);

  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: mergeAnim.value,
      transform: [{ scale: mergeAnim.value }],
    };
  });


  // Auto-submit OTP when it reaches length 6
  useEffect(() => {
    const code = otp.join("").trim();
    if (code.length === 6 && !isOtpSuccess) {
      handleVerifyOtp();
    }
  }, [otp]);

  useEffect(() => {
    if (modalStep === "otp" && isLoginModalVisible) {
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    }
  }, [modalStep, isLoginModalVisible]);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<any>(null);
  const [isNameWarningVisible, setIsNameWarningVisible] = useState(false);

  const [requestOtp] = useRequestOtpMutation();
  const [verifyLoginOtp] = useVerifyLoginOtpMutation();
  const [register] = useRegisterMutation();
  const [verifyRegisterOtp] = useVerifyRegisterOtpMutation();
  const [createAddress] = useCreateAddressMutation();

  const profileState = useSelector((state: RootState) => state.profile);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (!isLoggedIn) return;
    setRefreshing(true);
    try {
      await Promise.all([
        refetchProfile(),
        refetchSubscriptions(),
        refetchBookings(),
      ]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [isLoggedIn, refetchProfile, refetchSubscriptions, refetchBookings]);

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
    if (!cleanedPhone || cleanedPhone.length < 10) {
      showAlert({
        title: "Invalid Phone",
        message: "Please enter a valid 10-digit mobile number.",
        type: "warning",
      });
      return;
    }

    setIsLoading(true);
    setTimer(45);
    setIsExistingUser(false);
    try {
      if (authMode === "signup") {
        if (!name.trim()) {
          showAlert({
            title: "Name Required",
            message: "Please enter your name to register.",
            type: "warning",
          });
          setIsLoading(false);
          return;
        }

        if (modalStep === "otp" || registrationToken) {
          await requestOtp({
            phone: cleanedPhone,
            countryCode: "+91",
            verifyType: "PHONE",
            otpType: "REGISTER",
          }).unwrap();
        } else {
          const result = await register({
            name: name.trim(),
            countryCode: "+91",
            phone: cleanedPhone,
            accountType: "Seeker",
          }).unwrap();

          const token = result.data?.token || result.token;
          const user = result.data?.user || result.user;
          if (token) {
            setRegistrationToken(token);
          }
          if (user) {
            setRegisteredUser(user);
          }
        }
      } else {
        await requestOtp({
          phone: cleanedPhone,
          countryCode: "+91",
          verifyType: "PHONE",
          otpType: "LOGIN",
        }).unwrap();
      }

      showAlert({
        title: "OTP Sent",
        message: "Please check your messages.",
        type: "success",
      });
      setModalStep("otp");
    } catch (err: any) {
      if (err?.data?.message?.includes("already exists") || err?.data?.message?.includes("already found")) {
        showAlert({
          title: "Account Exists",
          message: "An account with this phone number already exists. Please log in to continue.",
          type: "info",
          buttons: [
            {
              text: "Cancel",
              onPress: () => hideAlert(),
              style: "cancel",
            },
            {
              text: "Log In",
              onPress: async () => {
                hideAlert();
                setIsExistingUser(true);
                setAuthMode("login");
                setName("");
                try {
                  await requestOtp({
                    phone: cleanedPhone,
                    countryCode: "+91",
                    verifyType: "PHONE",
                    otpType: "LOGIN",
                  }).unwrap();
                  showAlert({
                    title: "OTP Sent",
                    message: "Please check your messages.",
                    type: "success",
                  });
                  setModalStep("otp");
                } catch (loginErr: any) {
                  showAlert({
                    title: "Auth Request Failed",
                    message: loginErr?.data?.message || "Could not send OTP.",
                    type: "error",
                  });
                }
              },
            },
          ],
        });
      } else {
        if (authMode === "login" && (err?.data?.message?.includes("not found") || err?.data?.message?.includes("not register"))) {
          showAlert({
            title: "Account Not Found",
            message: "No account is registered with this phone number. Would you like to sign up?",
            type: "info",
            buttons: [
              {
                text: "Cancel",
                onPress: () => hideAlert(),
                style: "cancel",
              },
              {
                text: "Sign Up",
                onPress: () => {
                  hideAlert();
                  setAuthMode("signup");
                },
              },
            ],
          });
        } else {
          showAlert({
            title: "Auth Request Failed",
            message: err?.data?.message || "Authentication request failed. Please try again.",
            type: "error",
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      showAlert({
        title: "Invalid OTP",
        message: "Please enter the complete 6-digit OTP.",
        type: "warning",
      });
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
      if (authMode === "signup" && !isExistingUser) {
        response = await verifyRegisterOtp({
          body: { ...payload, otpType: "REGISTER" },
          token: registrationToken || undefined,
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
          (typeof response?.data === "string" ? response?.data : null) ||
          registrationToken;

      if (token) {
        console.log("🎟 [HomeScreen] New token received and stored");
        const backendUser = response?.data?.user || response?.user || registeredUser;

        // Perform merge animation
        setIsOtpSuccess(true);
        mergeAnim.value = withTiming(1, { duration: 600 });

        setTimeout(async () => {
          if (backendUser) {
            dispatch(setUser(backendUser));
            if (backendUser.name) {
              dispatch(updateProfile({ key: "name", value: backendUser.name }));
            }
            if (backendUser.phone) {
              dispatch(updateProfile({ key: "phone", value: backendUser.phone }));
            }
            if (backendUser.email) {
              dispatch(updateProfile({ key: "email", value: backendUser.email }));
            }
          }
          dispatch(loginSuccess(token));

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
              console.log("✅ [HomeScreen] Address synced to backend");
            } catch (syncErr) {
              console.error("❌ [HomeScreen] Address sync failed:", syncErr);
            }
          }

          const isAdminUser = backendUser?.accountType === "Super Admin";

          setModalStep("details");
          setOtp(["", "", "", "", "", ""]);
          setName("");
          setPhoneNumber("");
          setAuthMode("login");
          setRegistrationToken(null);
          setRegisteredUser(null);
          setIsLoginModalVisible(false);
          setIsOtpSuccess(false);
          mergeAnim.value = 0;

          if (isAdminUser) {
            router.replace("/dashboard");
          }
        }, 1200);
      } else {
        showAlert({
          title: "Login Failed",
          message: "No access token received.",
          type: "error",
        });
      }
    } catch (err: any) {
      setOtp(["", "", "", "", "", ""]);
      showAlert({
        title: "Verification Failed",
        message: err?.data?.message || "Invalid OTP or Server Error",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
    return;
  };

  const handleCloseModal = () => {
    setIsLoginModalVisible(false);

    setPhoneNumber("");
    setOtp(["", "", "", "", "", ""]);
    setModalStep("details");
    setName("");
    setAuthMode("login");
    setRegistrationToken(null);
    setRegisteredUser(null);
  };

  const allBookings = bookingsData?.data?.bookingList || [];
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
  const pastBookings = Array.from(uniqueBookingsMap.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reverse();

  const activeSubs =
      subscriptions?.filter((s: any) =>
          ["active", "ongoing"].includes(s.status),
      ) || [];

  useFocusEffect(
      useCallback(() => {
        if (isLoggedIn) {
          refetchBookings();
        }
        const homeStack = navigation.getParent();
        const tabs = homeStack?.getParent();

        if (tabs) {
          tabs.setOptions({
            tabBarStyle: { display: "flex" },
          });
        }
      }, [navigation, refetchBookings, isLoggedIn]),
  );

  const handleRecentServicePress = (booking: any) => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    if (!booking.serviceId) {
      showAlert({
        title: "Rebook Unavailable",
        message: "This past booking cannot be quick-rebooked. Please start a new booking.",
        buttons: [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              isNavigating.current = false;
            },
          },
          {
            text: "Start New Booking",
            onPress: () => {
              router.push("/home/book-doorstep/enter-location");
              setTimeout(() => {
                isNavigating.current = false;
              }, 1000);
            },
          },
        ],
      });
      return;
    }

    const rebookAddons = (booking.addons || []).map((a: any) => ({
      id: a.addOn?._id || a.addOn,
      name: a.addOn?.name || "Addon",
      price: a.price,
    }));

    router.push({
      pathname: "/home/book-doorstep/select-slot",
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

  if (!isLoggedIn) {
    return (
      <ScreenWrapper
        background={<HomeBackground />}
        statusBarStyle="light-content"
        className="bg-background"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top brand banner */}
            <View className="h-60 bg-[#1A1A1A] relative justify-center items-center overflow-hidden">
              <LinearGradient
                colors={["#10172A", "#020617"]}
                className="absolute inset-0"
              />
              {/* Decorative Background Lines / Drawing */}
              <View className="absolute inset-0 opacity-15" pointerEvents="none">
                {/* Diagonal speed lines */}
                <View 
                  className="absolute left-[-100px] top-[10%] w-[600px] h-[1px] bg-white" 
                  style={{ transform: [{ rotate: "25deg" }] }} 
                />
                <View 
                  className="absolute left-[-100px] top-[45%] w-[600px] h-[1px] bg-white" 
                  style={{ transform: [{ rotate: "25deg" }] }} 
                />
                <View 
                  className="absolute left-[-100px] top-[30%] w-[600px] h-[1px] bg-[#C8F000]" 
                  style={{ transform: [{ rotate: "-35deg" }] }} 
                />
                <View 
                  className="absolute left-[-100px] top-[65%] w-[600px] h-[1px] bg-[#C8F000]" 
                  style={{ transform: [{ rotate: "-35deg" }] }} 
                />
                {/* Decorative circular wireframes */}
                <View className="absolute right-[-30px] top-[-30px] w-48 h-48 rounded-full border border-white/20" />
                <View className="absolute left-[-50px] bottom-[-50px] w-56 h-56 rounded-full border border-[#C8F000]/20" />
              </View>

              <View className="items-center z-10 w-full px-4">
                {/* <Ionicons name="leaf-outline" size={48} color="#C8F000" className="mb-2" /> */}
                <Text 
                  className="text-2xl font-[500] text-white tracking-[1.5px] italic text-center w-full"
                  numberOfLines={1}
                >
                  CLEANMY<Text className="text-[#C8F000]">WHEELS</Text>
                </Text>
                <Text 
                  className="text-[#A3E635] text-[10px] font-[700] tracking-[2px] uppercase mt-1 text-center"
                  numberOfLines={1}
                >
                  Premium Eco Car Care
                </Text>
              </View>
            </View>

            {/* Login / Signup Card */}
            <View className="flex-1 bg-[#121212] px-6 pt-8 pb-12 rounded-t-[32px] mt-[-24px] border-t border-white/10 relative overflow-hidden">
              {/* Background Drawings in Form Body */}
              <View className="absolute inset-0 opacity-[0.05]" pointerEvents="none">
                {/* Diagonal lines */}
                <View 
                  className="absolute left-[-150px] top-[20%] w-[700px] h-[1px] bg-[#C8F000]" 
                  style={{ transform: [{ rotate: "-20deg" }] }} 
                />
                <View 
                  className="absolute left-[-150px] top-[65%] w-[700px] h-[1px] bg-white" 
                  style={{ transform: [{ rotate: "-20deg" }] }} 
                />
                {/* Circular wireframe */}
                <View className="absolute right-[-60px] bottom-[15%] w-60 h-60 rounded-full border border-[#C8F000]" />
              </View>
              <Text className="text-3xl font-[500] text-white mb-1 text-center italic">
                Welcome! <Text className="text-[#C8F000]"></Text>
              </Text>
              <Text className="text-sm font-[500] text-gray-400 mb-6 text-center">
                {modalStep === "details"
                  ? authMode === "login"
                    ? "Log in to your account"
                    : "Create your account to get started"
                  : `Enter verification code sent to`}
              </Text>

              {modalStep === "otp" && (
                <TouchableOpacity
                  onPress={() => setModalStep("details")}
                  className="flex-row items-center justify-center mb-8 bg-[#1C1C1E] border border-white/5 py-1.5 px-4 rounded-full self-center"
                >
                  <Text className="text-sm text-gray-300 font-[600] mr-2">+91 {phoneNumber}</Text>
                  <Ionicons name="pencil" size={13} color="#C8F000" />
                </TouchableOpacity>
              )}

              {modalStep === "details" ? (
                <View>
                  {authMode === "signup" && (
                    <View className="mb-5">
                      <View className="flex-row items-center bg-[#1C1C1E] rounded-[16px] h-14 px-4 border border-white/5">
                        <Ionicons
                          name="person-outline"
                          size={20}
                          color="#64748B"
                          style={{ marginRight: 10 }}
                        />
                        <TextInput
                          className="flex-1 text-base text-white font-[600]"
                          placeholder="Your Full Name"
                          placeholderTextColor="#64748B"
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
                      {isNameWarningVisible && (
                        <Text className="text-[10px] text-red-500 font-[600] mt-1.5 ml-1">
                          Only alphabets allowed
                        </Text>
                      )}
                    </View>
                  )}

                  <View className="mb-8">
                    <View className="flex-row items-center bg-[#1C1C1E] rounded-[16px] h-14 px-4 border border-white/5">
                      <Text className="text-base text-white font-[700]">+91</Text>
                      <View className="w-[1px] h-5 bg-white/10 mx-3" />
                      <TextInput
                        className="flex-1 text-base text-white font-[600]"
                        placeholder="Mobile Number"
                        placeholderTextColor="#64748B"
                        keyboardType="phone-pad"
                        maxLength={10}
                        value={phoneNumber}
                        onChangeText={(text) => setPhoneNumber(text.replace(/[^0-9]/g, ""))}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    className="bg-[#C8F000] h-14 rounded-[16px] items-center justify-center mb-5 shadow-lg shadow-[#C8F000]/10"
                    onPress={handleSendOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text className="text-base font-[900] text-black uppercase tracking-wider italic">
                        {authMode === "login" ? "Login" : "Sign Up"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View className="flex-row justify-center items-center mt-2">
                    <Text className="text-sm text-gray-400 font-medium">
                      {authMode === "login" ? "Don't have an account? " : "Already have an account? "}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setAuthMode(authMode === "login" ? "signup" : "login");
                        setName("");
                      }}
                    >
                      <Text className="text-sm font-[800] text-[#C8F000]">
                        {authMode === "login" ? "Sign Up" : "Log In"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View>
                  <View className="mb-8 relative w-full">
                    <TextInput
                      ref={otpInputRef}
                      style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0, zIndex: 10 }}
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                      maxLength={6}
                      autoFocus={true}
                      value={otp.join("")}
                      onChangeText={(text) => {
                        if (/[^0-9]/.test(text)) {
                          setIsOtpWarningVisible(true);
                          setTimeout(() => setIsOtpWarningVisible(false), 3000);
                        }
                        const val = text.replace(/[^0-9]/g, "").slice(0, 6);
                        const newOtp = ["", "", "", "", "", ""];
                        for (let j = 0; j < val.length; j++) {
                          newOtp[j] = val[j];
                        }
                        setOtp(newOtp);
                      }}
                    />
                    <View className="flex-row justify-between w-full h-[64px] relative items-center" pointerEvents="none">
                      <View className="absolute inset-0 justify-center items-center z-20" pointerEvents="none">
                        <Animated.View 
                          style={[
                            checkmarkStyle, 
                            { 
                              justifyContent: "center", 
                              alignItems: "center", 
                              width: 56, 
                              height: 64, 
                              borderRadius: 16, 
                              backgroundColor: "#C8F000",
                            }
                          ]}
                        >
                          <Ionicons name="checkmark" size={28} color="#000" />
                        </Animated.View>
                      </View>

                      {otp.map((digit, i) => {
                        const currentLength = otp.join("").length;
                        const isFocused = currentLength === i || (currentLength === 6 && i === 5);
                        return (
                          <OtpBox
                            key={i}
                            digit={digit}
                            index={i}
                            isFocused={isFocused}
                            mergeAnim={mergeAnim}
                          />
                        );
                      })}
                    </View>
                  </View>

                  {isOtpWarningVisible && (
                    <Text className="text-red-500 text-[12px] mt-[-10px] mb-[15px] text-center font-[600]">
                      Only numbers are allowed
                    </Text>
                  )}

                  <TouchableOpacity
                    className="bg-[#C8F000] h-14 rounded-[16px] items-center justify-center mb-6 shadow-lg shadow-[#C8F000]/10"
                    onPress={handleVerifyOtp}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#000" />
                    ) : (
                      <Text className="text-base font-[900] text-black uppercase tracking-wider italic">
                        Verify
                      </Text>
                    )}
                  </TouchableOpacity>

                  <View className="items-center">
                    <Text className="text-sm text-gray-400 font-medium mb-3">
                      Didn&apos;t receive code?
                    </Text>
                    {timer > 0 ? (
                      <View className="bg-[#1C1C1E] rounded-full px-4 py-2 flex-row items-center gap-2 border border-white/5">
                        <Ionicons name="time-outline" size={14} color="#64748B" />
                        <Text className="text-sm font-[700] text-[#C8F000]">
                          Resend code in 00:{timer < 10 ? `0${timer}` : timer}
                        </Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          if (timer === 0) {
                            handleSendOtp();
                          }
                        }}
                        className="bg-[#C8F000]/10 border border-[#C8F000]/25 rounded-full px-5 py-2.5"
                      >
                        <Text className="text-sm font-[800] text-[#C8F000]">
                          Resend Code
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Decorative Brand Highlight Cards */}
              {/* <View className="mt-10 pt-8 border-t border-white/5 gap-4">
                <Text className="text-[11px] text-gray-500 font-[800] uppercase tracking-[2px] text-center mb-2">
                  Why Cleanmywheels?
                </Text>

                <View className="flex-row items-center gap-3 bg-[#1C1C1E] p-4 rounded-[16px] border border-white/5">
                  <View className="w-10 h-10 rounded-full bg-[#C8F000]/10 items-center justify-center">
                    <Ionicons name="water-outline" size={20} color="#C8F000" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-bold">Eco-Friendly Detailing</Text>
                    <Text className="text-xs text-gray-400">Save water with our premium waterless nano-technology washes.</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3 bg-[#1C1C1E] p-4 rounded-[16px] border border-white/5">
                  <View className="w-10 h-10 rounded-full bg-[#C8F000]/10 items-center justify-center">
                    <Ionicons name="shield-checkmark-outline" size={20} color="#C8F000" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-bold">Certified Professionals</Text>
                    <Text className="text-xs text-gray-400">Only verified and highly trained cleaners handle your car.</Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3 bg-[#1C1C1E] p-4 rounded-[16px] border border-white/5">
                  <View className="w-10 h-10 rounded-full bg-[#C8F000]/10 items-center justify-center">
                    <Ionicons name="time-outline" size={20} color="#C8F000" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white text-sm font-bold">On-Demand Convenience</Text>
                    <Text className="text-xs text-gray-400">Book in under a minute and have your wheels cleaned at your doorstep.</Text>
                  </View>
                </View>
              </View> */}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      background={<HomeBackground />}
      statusBarStyle="light-content"
      className="bg-background"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View className="px-5 pt-[10px] mb-6">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-[10px] text-primary font-[700] tracking-[1px] mb-1 uppercase">
                ON-DEMAND CARE
              </Text>
              <Text className="text-2xl font-[800] text-white italic tracking-[-1px]">
                CLEANMY<Text className="text-primary">WHEELS</Text>
              </Text>
            </View>

            <View className="mt-2">
              {isLoggedIn && (
                <InteractivePressable
                  className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#333] elevation-4 shadow-lg shadow-black"
                  onPress={() => router.push("/profile")}
                >
                  <View className="w-full h-full bg-[#1A1A1A] items-center justify-center">
                    <Text className="text-primary font-[900] text-[18px]">
                      {(userProfile?.user?.name || user?.name || "U").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                </InteractivePressable>
              )}
            </View>
          </View>

          {/* Location Bar (Professional Touch)
          <Animated.View 
            entering={FadeInUp.delay(100).duration(500)}
            className="flex-row items-center bg-[#1A1A1A] border border-white/5 rounded-[18px] px-4 py-3 shadow-2xl"
          >
            <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3 border border-primary/20">
              <Ionicons name="location" size={16} color="#C8F000" />
            </View>
            <View className="flex-1">
              <Text className="text-[#666] text-[10px] font-[700] uppercase tracking-wider">Service Location</Text>
              <Text className="text-white text-sm font-[600]" numberOfLines={1}>
                {isLoggedIn ? (userProfile?.user?.address || "Detecting address...") : "Select your area"}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#444" />
          </Animated.View> */}
        </View>

        {/* Hero Section */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
        >
          <HeroSection isLoggedIn={isLoggedIn} />
        </Animated.View>

        {/* Transformation Section (Intrigue Guest) */}
        {/* {!isLoggedIn && <TransformationSection />} */}

        {/* Action Grid (Book / Add-ons) */}
        <ServiceActionGrid
          isLoggedIn={isLoggedIn}
          hasActiveSubscription={activeSubs.length > 0}
          onOpenLoginModal={() => setIsLoginModalVisible(true)}
        />

        {/* The Protocol (Intrigue Guest) */}
        {!isLoggedIn && <ProtocolSection />}

        {/* Membership Perks (Intrigue Guest) */}
        {!isLoggedIn && <MembershipPerks />}

        {/* Core Protocols (Replaces WhyChooseUs) */}
        {/* {!isLoggedIn && (
          <Animated.View
            entering={ZoomIn.delay(400).duration(600)}
          >
            <CoreProtocols />
          </Animated.View>
        )} */}

        {/* Next Service (For Subscribers) */}
        {isLoggedIn &&
          activeSubs.map((sub: any) => {
            const frequencyType = sub.frequencyType || 'TWICE_MONTHLY';
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
              
              if (frequencyType === 'TWICE_MONTHLY') {
                nextDate.setDate(startDate.getDate() + (completed * 15));
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
                  <InteractivePressable
                    className="w-[200px] p-5 rounded-[24px] bg-[#181818] border border-primary/20 shadow-lg elevation-6"
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
                </InteractivePressable>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Newsroom Section */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          className="px-5 mb-10"
        >
          <InteractivePressable
            onPress={() => router.push("/profile/blogs" as any)}
            className="bg-card border border-primary/20 rounded-[32px] overflow-hidden shadow-2xl"
          >
            <View className="flex-row items-center p-6">
              <View className="flex-1 pr-4">
                <View className="flex-row items-center mb-2">
                  <View className="bg-primary/20 px-2 py-1 rounded-md border border-primary/10">
                    <Text className="text-[12px] text-primary font-[800] uppercase tracking-wider">NEWSROOM</Text>
                  </View>
                </View>
                <Text className="text-xl font-[800] text-white mb-2 italic">
                  TIPS & <Text className="text-primary">UPDATES</Text>
                </Text>
                <Text className="text-textSecondary text-[13px] leading-5 font-medium">
                  Stay ahead with expert car care tips and the latest platform news.
                </Text>
                
                <View className="flex-row items-center mt-4">
                  <Text className="text-primary font-bold text-sm">Read More</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} style={{ marginLeft: 6 }} />
                </View>
              </View>
              
              <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center border border-primary/20">
                <Ionicons name="newspaper-outline" size={40} color={Colors.primary} />
              </View>
            </View>
          </InteractivePressable>
        </Animated.View>
      </ScrollView>

      {/* Onboarding Tour for Guest */}
      <OnboardingTour 
        isVisible={showOnboarding} 
        onClose={handleCloseOnboarding} 
      />
    </ScreenWrapper>
  );
}
