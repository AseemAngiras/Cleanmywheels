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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  // StyleSheet,
  // Text,
  // TextInput,
  // TouchableOpacity,
  // View,
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
  const userName = firstName;

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

  const user = useSelector((state: RootState) => state.user.user);

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [requestOtp] = useRequestOtpMutation();
  const [verifyLoginOtp, { isLoading: isVerifyingOtp }] =
    useVerifyLoginOtpMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const [verifyRegisterOtp, { isLoading: isVerifyingRegOtp }] =
    useVerifyRegisterOtpMutation();

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
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSmall}>ON-DEMAND CARE</Text>
            <Text style={styles.headerTitleLogo}>
              CLEANMY<Text style={styles.headerTitleHighlight}>WHEELS</Text>
            </Text>
          </View>

          <View style={styles.headerIcons}>
            {!isLoggedIn ? (
              <TouchableOpacity
                style={styles.limePillBtn}
                onPress={() => setIsLoginModalVisible(true)}
              >
                <Text style={styles.limePillText}>LOG IN</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Image
                  source={{
                    uri:
                      userAvatar ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                  }}
                  style={styles.avatarImage}
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
          <View style={styles.sectionContainer}>
            <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
              <Text style={styles.sectionTitle}>Recent Services</Text>
              <TouchableOpacity>
                {/* <Text style={styles.viewAllText}>View All</Text> */}
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            >
              {pastBookings.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.recentCard}
                  activeOpacity={0.9}
                  onPress={() => handleRecentServicePress(item)}
                >
                  <View style={styles.recentCardHeader}>
                    <View style={styles.recentIconBox}>
                      <Ionicons name="sparkles" size={20} color="#C8F000" />
                    </View>
                    <View style={styles.rebookBadge}>
                      <Ionicons name="refresh" size={10} color="#C8F000" />
                      <Text style={styles.rebookText}>Rebook</Text>
                    </View>
                  </View>

                  <Text style={styles.recentServiceName} numberOfLines={1}>
                    {item.serviceName}
                  </Text>
                  <Text style={styles.recentCarText} numberOfLines={1}>
                    {item.car}
                  </Text>

                  <View style={styles.recentDivider} />

                  <View style={styles.recentFooter}>
                    <Text style={styles.recentDate}>
                      {item.date
                        ? new Date(item.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </Text>
                    <Text style={styles.recentPrice}>₹ {item.price}</Text>
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
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={handleCloseModal}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIndicator} />
            </View>

            <Text style={styles.modalTitle}>
              {modalStep === "details" ? "Welcome Back!" : "Enter OTP"}
            </Text>
            <Text style={styles.modalSubtitle}>
              {modalStep === "details"
                ? "Enter your mobile number to continue."
                : `We sent a code to +91 ${phoneNumber}`}
            </Text>

            {modalStep === "details" ? (
              <View>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Mobile Number</Text>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.prefixText}>+91</Text>
                    <View style={styles.verticalDivider} />
                    <TextInput
                      style={styles.phoneInput}
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
                  style={styles.primaryModalBtn}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.primaryModalBtnText}>Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.otpContainer}>
                  {otp.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={(ref) => {
                        inputRefs.current[i] = ref;
                      }}
                      style={[
                        styles.otpBox,
                        digit ? styles.otpBoxFilled : null,
                      ]}
                      keyboardType="number-pad"
                      maxLength={6}
                      contextMenuHidden={false}
                      selectTextOnFocus
                      value={digit}
                      onChangeText={(val) => {
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

                <View style={styles.resendContainer}>
                  <Text style={styles.resendText}>
                    Didn&apos;t receive code?{" "}
                  </Text>
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.resendLink}>Resend</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.primaryModalBtn}
                  onPress={handleVerifyOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#000" />
                  ) : (
                    <Text style={styles.primaryModalBtnText}>Verify Login</Text>
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#111",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
    marginBottom: 20,
  },
  headerSmall: {
    fontSize: 10,
    color: "#C8F000",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  headerTitleLogo: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  headerTitleHighlight: {
    color: "#C8F000",
  },
  headerIcons: {
    marginTop: 8,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#333",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  limePillBtn: {
    backgroundColor: "#C8F000",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6, // Boxy button per design
    shadowColor: "#C8F000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  limePillText: {
    fontWeight: "900",
    color: "#000",
    fontStyle: "italic",
    fontSize: 12,
  },

  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  viewAllText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  recentList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recentCard: {
    width: 200,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "rgba(200, 240, 0, 0.2)", // Subtle golden border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  recentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  recentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(200, 240, 0, 0.1)", // Yellow tint bg
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(200, 240, 0, 0.1)",
  },
  rebookBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(200, 240, 0, 0.1)", // Subtle yellow tint
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 24,
    gap: 4,
    borderWidth: 1,
    borderColor: "#C8F000",
  },
  rebookText: {
    color: "#C8F000",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  recentServiceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 2,
  },
  recentCarText: {
    fontSize: 12,
    color: "#888",
    fontWeight: "500",
  },
  recentDivider: {
    height: 1,
    backgroundColor: "#333",
    marginVertical: 12,
  },
  recentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentDate: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
  },
  recentPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#C8F000",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#121212",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: "#333",
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#333",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  prefixText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#333",
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  primaryModalBtn: {
    backgroundColor: "#C8F000",
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  primaryModalBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1A1A1A",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  otpBoxFilled: {
    borderColor: "#DFFF00",
    backgroundColor: "rgba(223, 255, 0, 0.1)",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: "#888",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DFFF00",
  },
});
