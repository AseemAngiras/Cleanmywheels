import { RootState } from "@/store";
import {
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyLoginOtpMutation,
  useVerifyRegisterOtpMutation,
  useGetProfileQuery,
} from "@/store/api/authApi";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";
import { loginSuccess, logout } from "@/store/slices/authSlice";
import { Booking } from "@/store/slices/bookingSlice";
import { setUser } from "@/store/slices/userSlice";
import AdminSubscriptionScreen from "../admin/subscriptions";

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
  SafeAreaView,
  ScrollView,
  StyleSheet,
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
import { WhyChooseUs } from "../../../components/home/WhyChooseUs";

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

  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<"details" | "otp">("details");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [requestOtp, { isLoading: isRequestingOtp }] = useRequestOtpMutation();
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

  const allBookings = bookings;
  const uniqueBookingsMap = new Map();
  allBookings.forEach((booking) => {
    if (booking.serviceName) {
      const key = `${booking.serviceName}|${booking.address}|${booking.car}`;
      uniqueBookingsMap.set(key, booking);
    }
  });
  const pastBookings = Array.from(uniqueBookingsMap.values()).reverse();

  const activeSubs =
    subscriptions?.filter((s: any) =>
      ["active", "ongoing"].includes(s.status),
    ) || [];
  const nextSubscription = activeSubs.sort(
    (a: any, b: any) =>
      new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
  )[0];

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

  if (isAdmin) {
    return <AdminSubscriptionScreen />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Background Pattern */}
      <HomeBackground />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            {isLoggedIn && userName ? (
              <Text style={styles.headerGreeting}>Hello, {userName} 👋</Text>
            ) : null}
            <Text style={styles.headerTitleLarge}>Welcome to</Text>
            <Text style={styles.headerTitleSub}>Cleanmywheels</Text>
          </View>

          <View style={styles.headerIcons}>
            {!isLoggedIn ? (
              <TouchableOpacity
                style={styles.limePillBtn}
                onPress={() => setIsLoginModalVisible(true)}
              >
                <Text style={styles.limePillText}>Log in</Text>
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
        <ServiceActionGrid isLoggedIn={isLoggedIn} />

        {/* Why Choose Us - Only for Guests */}
        {!isLoggedIn && <WhyChooseUs />}

        {/* Next Service (For Subscribers) */}
        {isLoggedIn && nextSubscription && (
          <NextServiceWidget
            date={nextSubscription.endDate}
            vehicleNo={
              nextSubscription.vehicle?.number ||
              nextSubscription.vehicle?.vehicleNo ||
              "Car"
            }
          />
        )}

        {isLoggedIn && pastBookings.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
              <Text style={styles.sectionTitle}>Recent Services</Text>
              <TouchableOpacity>
                <Text style={styles.viewAllText}>View All</Text>
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
                      <Ionicons name="sparkles" size={16} color="#000" />
                    </View>
                    <View style={styles.rebookBadge}>
                      <Ionicons name="refresh" size={10} color="#000" />
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
        onRequestClose={() => setIsLoginModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setIsLoginModalVisible(false)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  headerGreeting: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 4,
  },
  headerTitleLarge: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 36,
  },
  headerTitleSub: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    lineHeight: 36,
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
    borderColor: "#FFF",
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
  },
  limePillText: {
    fontWeight: "700",
    color: "#000",
  },

  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  viewAllText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  recentList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  recentCard: {
    width: 180,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  recentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  recentIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  rebookBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    height: 24,
    gap: 2,
  },
  rebookText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  recentServiceName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  recentCarText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  recentDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  recentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  recentPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
  },
  prefixText: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "600",
  },
  verticalDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "500",
  },
  primaryModalBtn: {
    backgroundColor: "#C8F000",
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryModalBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  otpBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    textAlign: "center",
    fontSize: 20,
    fontWeight: "600",
    color: "#0F172A",
  },
  otpBoxFilled: {
    borderColor: "#C8F000",
    backgroundColor: "#FAFDEB",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  resendText: {
    fontSize: 14,
    color: "#64748B",
  },
  resendLink: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
});
