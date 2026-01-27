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

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const bookings = useSelector((state: RootState) => state.bookings.bookings);
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  const userStateName = useSelector(
    (state: RootState) => state.user.user?.name,
  );
  const profileName = useSelector((state: RootState) => state.profile.name);

  const userName = profileName || userStateName;

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
  const hasActiveSubscription =
    subscriptions &&
    subscriptions.some((sub: any) =>
      ["active", "ongoing"].includes(sub.status),
    );

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

  const getDaysLeft = (dateStr: string) => {
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

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
                    uri: userAvatar || "https://i.pravatar.cc/150?img=12",
                  }}
                  style={styles.avatarImage}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          {isLoggedIn && hasActiveSubscription && nextSubscription ? (
            <View style={{ flexDirection: "row", height: 200, gap: 12 }}>
              <View
                style={[
                  styles.heroCard,
                  { flex: 3, height: "100%", marginBottom: 0 },
                ]}
              >
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                  }}
                  style={styles.heroImage}
                />
                <View style={styles.heroOverlay}>
                  <Text style={styles.heroOverlayTitleSmall}>
                    Premium{"\n"}Car Care
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.whiteCard,
                  {
                    flex: 2,
                    height: "100%",
                    borderRadius: 24,
                    padding: 16,
                    justifyContent: "space-between",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                    elevation: 3,
                  },
                ]}
                activeOpacity={0.9}
                onPress={() => router.push("/subscription/addons")}
              >
                <View
                  style={[styles.iconContainer, { backgroundColor: "#FFF8E1" }]}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={28}
                    color="#F59E0B"
                  />
                </View>
                <View>
                  <Text style={styles.squareTitle}>Add-ons</Text>
                  <Text style={styles.squareSubtitle}>For next visit</Text>
                </View>
                <View
                  style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    opacity: 0.3,
                  }}
                >
                  <Ionicons name="chevron-forward" size={20} color="#1a1a1a" />
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.heroCard}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
                }}
                style={styles.heroImage}
              />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroOverlayTitle}>Premium Car Care</Text>
                <Text style={styles.heroOverlaySubtitle}>
                  <Text style={{ color: "#D1F803", fontWeight: "800" }}>
                    Eco-friendly wash
                  </Text>{" "}
                  at your doerstop
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {!isLoggedIn ? (
          /* Guest Action Button */
          <View
            style={{ alignItems: "center", marginBottom: 10, marginTop: 10 }}
          >
            <TouchableOpacity
              style={styles.guestBookBtn}
              activeOpacity={0.9}
              onPress={() =>
                router.push("/(tabs)/home/book-doorstep/enter-location")
              }
            >
              <Ionicons name="car-sport" size={24} color="#1a1a1a" />
              <Text style={styles.guestBookBtnText}>Book Service</Text>
            </TouchableOpacity>
          </View>
        ) : !hasActiveSubscription ? (
          /* Non-Subscriber Actions */
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[styles.squareCard, styles.whiteCard]}
              activeOpacity={0.9}
              onPress={() =>
                router.push("/(tabs)/home/book-doorstep/enter-location")
              }
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#F1F5F9" }]}
              >
                <Ionicons name="calendar-outline" size={28} color="#1a1a1a" />
              </View>
              <View>
                <Text style={styles.squareTitle}>Book Service</Text>
                <Text style={styles.squareSubtitle}>One-time wash</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.squareCard, styles.blueCard]}
              activeOpacity={0.9}
              onPress={() => router.push("/(tabs)/subscriptions")}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: "rgba(255,255,255,0.2)" },
                ]}
              >
                <Ionicons name="water-outline" size={28} color="#fff" />
              </View>
              <View>
                <Text style={[styles.squareTitle, { color: "#fff" }]}>
                  Daily Wash
                </Text>
                <Text
                  style={[
                    styles.squareSubtitle,
                    { color: "rgba(255,255,255,0.8)" },
                  ]}
                >
                  View Plans
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          /* Subscriber Actions */
          <View style={[styles.quickActionsGrid, { gap: 12 }]}>
            <TouchableOpacity
              style={[styles.squareCard, styles.whiteCard, { flex: 3 }]}
              activeOpacity={0.9}
              onPress={() =>
                router.push("/(tabs)/home/book-doorstep/enter-location")
              }
            >
              <View
                style={[styles.iconContainer, { backgroundColor: "#F1F5F9" }]}
              >
                <Ionicons name="calendar-outline" size={28} color="#1a1a1a" />
              </View>
              <View>
                <Text style={styles.squareTitle}>Book Service</Text>
                <Text style={styles.squareSubtitle}>One-time wash</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.subscriptionStatusCard,
                {
                  flex: 2,
                  height: 120,
                  backgroundColor: "#fff",
                  borderWidth: 1,
                  borderColor: "#F1F5F9",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 3,
                },
              ]}
              activeOpacity={0.9}
              onPress={() => router.push("/(tabs)/subscriptions")}
            >
              <View style={styles.subStatusIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.subStatusLabel}>Next Service</Text>
                <Text style={styles.subStatusValue}>
                  {new Date(nextSubscription.endDate).toLocaleDateString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </Text>
                <Text
                  style={[
                    styles.subStatusDays,
                    getDaysLeft(nextSubscription.endDate) < 5 && {
                      color: "#EF4444",
                    },
                  ]}
                >
                  {nextSubscription.vehicle?.number ||
                    nextSubscription.vehicle?.vehicleNo ||
                    "Car"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Services Section */}
        {isLoggedIn && pastBookings.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
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
                    <View
                      style={[
                        styles.recentIconBox,
                        { backgroundColor: "#E8F5E9" },
                      ]}
                    >
                      <Ionicons name="sparkles" size={16} color="#2E7D32" />
                    </View>
                    <View style={styles.rebookBadge}>
                      <Ionicons name="refresh" size={10} color="#fff" />
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

        {/* Guest Features Section */}
        {!isLoggedIn && (
          <View style={styles.guestSection}>
            <Text style={styles.guestFeaturesTitle}>Why Choose Us?</Text>
            <View style={styles.guestFeaturesRow}>
              {[
                {
                  icon: "leaf",
                  title: "Eco-Friendly",
                  desc: "(Waterless technology)",
                },
                {
                  icon: "shield-checkmark",
                  title: "Trusted Pros",
                  desc: "(Vetted partners)",
                },
                {
                  icon: "home",
                  title: "Doorstep Service",
                  desc: "(We comes to you)",
                },
              ].map((item, idx) => (
                <View key={idx} style={styles.guestFeatureItem}>
                  <View style={styles.guestFeatureIconCircle}>
                    <Ionicons
                      name={item.icon as any}
                      size={28}
                      color="#7BBF2A"
                    />
                  </View>
                  <Text style={styles.guestFeatureTitle}>{item.title}</Text>
                  <Text style={styles.guestFeatureDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
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
    backgroundColor: "#FAFAFA",
  },
  container: {
    paddingBottom: 100,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  greeting: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLoginBtn: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerLoginText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  // Hero
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroCard: {
    height: 200,
    borderRadius: 24,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#1a1a1a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    opacity: 0.8,
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  heroOverlayTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroOverlaySubtitle: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "500",
  },

  actionSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 20,
    gap: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryBtn: {
    backgroundColor: "#D1F803",
  },
  secondaryBtn: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  actionBtnSubtitle: {
    fontSize: 12,
    color: "#475569",
    marginTop: 2,
  },

  // Sections
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    paddingLeft: 20,
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
  },
  recentList: {
    paddingLeft: 20,
    paddingRight: 8,
  },
  recentCard: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  recentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  recentIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  rebookBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rebookText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  recentServiceName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  recentCarText: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 12,
  },
  recentDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  recentFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentDate: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
  },
  recentPrice: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a1a1a",
  },

  promoSection: {
    paddingHorizontal: 20,
  },
  promoCard: {
    backgroundColor: "#2563EB",
    borderRadius: 24,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  promoContent: {
    flex: 1,
    zIndex: 1,
  },
  promoTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  promoDesc: {
    color: "#BFDBFE",
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  promoBtn: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  promoBtnText: {
    color: "#1D4ED8",
    fontWeight: "700",
    fontSize: 12,
  },
  promoIcon: {
    position: "absolute",
    right: -10,
    bottom: -10,
    opacity: 0.2,
    transform: [{ rotate: "-15deg" }],
  },

  stepsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  stepDesc: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: 48,
    minHeight: 400,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalIndicator: {
    width: 48,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 32,
  },
  inputWrapper: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: "#F8FAFC",
  },
  prefixText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  verticalDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 16,
  },
  phoneInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  primaryModalBtn: {
    backgroundColor: "#D1F803",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D1F803",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryModalBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
    gap: 8,
  },
  otpBox: {
    width: "14%",
    height: 55,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  otpBoxFilled: {
    borderColor: "#D1F803",
    backgroundColor: "#fff",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  resendText: {
    color: "#64748B",
  },
  resendLink: {
    color: "#1a1a1a",
    fontWeight: "700",
    textDecorationLine: "underline",
  },

  // Quick Actions Grid
  quickActionsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 32,
  },
  squareCard: {
    flex: 1,
    height: 120,
    borderRadius: 24,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  whiteCard: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  blueCard: {
    backgroundColor: "#2563EB",
  },
  squareTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1a",
    // paddingTop: 10,
    marginBottom: 1,
  },
  squareSubtitle: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },

  // Guest Refactor Styles
  headerGreeting: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },
  headerTitleLarge: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -1,
    lineHeight: 32,
  },
  headerTitleSub: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -1,
    lineHeight: 32,
  },
  limePillBtn: {
    backgroundColor: "#D1F803",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  limePillText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  guestBookBtn: {
    backgroundColor: "#D1F803",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    gap: 12,
    shadowColor: "#D1F803",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  guestBookBtnText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  guestSection: {
    paddingVertical: 40,
    alignItems: "center",
  },
  guestFeaturesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 32,
  },
  guestFeaturesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  guestFeatureItem: {
    alignItems: "center",
    width: "30%",
  },
  guestFeatureIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F7FEE7",
    borderWidth: 4,
    borderColor: "#ECFCCB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  guestFeatureTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 4,
  },
  guestFeatureDesc: {
    fontSize: 10,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 14,
  },

  // Split Hero Styles
  heroSplitRow: {
    flexDirection: "row",
    height: 200,
  },
  heroOverlayTitleSmall: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 26,
  },
  subscriptionStatusCard: {
    borderRadius: 24,
    padding: 16,
    justifyContent: "space-between",
  },
  subStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  subStatusLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
    marginBottom: 2,
  },
  subStatusValue: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "800",
    marginBottom: 4,
  },
  subStatusDays: {
    fontSize: 12,
    color: "#0284C7",
    fontWeight: "600",
  },
});
