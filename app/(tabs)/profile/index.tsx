import { InteractivePressable } from "@/components/ui/InteractivePressable";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { toast } from "@/utils/toast";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Animated as RNAnimated,
  BackHandler,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useAlert } from "@/components/providers/AlertProvider";
import { useSelector } from "react-redux";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { RootState } from "@/store";
import {
  useDeleteAccountMutation,
  useUpdateProfileMutation,
  useGetProfileQuery,
} from "@/store/api/authApi";
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useSetDefaultAddressMutation,
} from "@/store/api/addressApi";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import {
  removeAddresses,
  setDefaultAddress,
  updateProfile,
} from "@/store/slices/profileSlice";
import { updateUser } from "@/store/slices/userSlice";

const { height } = Dimensions.get("window");

export default function ProfileHome() {
  const dispatch = useAppDispatch();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const { data: userProfile, refetch: refetchProfile } =
    useGetProfileQuery(undefined);
  const { data: subscriptions, refetch: refetchSubscriptions } =
    useGetMySubscriptionQuery(undefined);
  const { data: addressesData, refetch: refetchAddresses } =
    useGetAddressesQuery(undefined);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchProfile(),
        refetchSubscriptions(),
        refetchAddresses(),
      ]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchProfile, refetchSubscriptions, refetchAddresses]);

  const activeSub = Array.isArray(subscriptions)
    ? subscriptions.find((s: any) => s.status === "active")
    : (subscriptions as any)?.status === "active"
      ? subscriptions
      : null;

  const isPremiumUser = !!activeSub;

  const [showLogout, setShowLogout] = useState(false);
  const translateY = useRef(new RNAnimated.Value(height)).current;
  const profileTranslateY = useRef(new RNAnimated.Value(-height)).current;
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

  // Edit Profile Animations
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isNameWarningVisible, setIsNameWarningVisible] = useState(false);

  const [updateUserProfileAPI] = useUpdateProfileMutation();
  const [deleteAccountAPI] = useDeleteAccountMutation();

  const userState = useSelector((state: RootState) => state.user);
  const userData = userState.user;
  const isAdmin = userData?.accountType === "Super Admin";

  const [deleteAddress] = useDeleteAddressMutation();
  const [setDefaultAddressAPI] = useSetDefaultAddressMutation();
  const profileState = useSelector((state: RootState) => state.profile);

  // Sync with API data
  const savedAddresses = React.useMemo(() => {
    if (addressesData) {
      const list = addressesData?.data?.addressList || addressesData?.data || [];
      if (Array.isArray(list)) {
        return list.map((addr: any) => ({
          ...addr,
          id: addr._id || addr.id,
          fullAddress:
            addr.fullAddress ||
            `${addr.houseOrFlatNo}, ${addr.locality}, ${addr.city} - ${addr.postalCode}`,
        }));
      }
    }
    return profileState?.addresses || [];
  }, [addressesData, profileState?.addresses]);

  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [expandedAddressId, setExpandedAddressId] = useState<string | null>(
    null,
  );

  const defaultAddressIdFromAPI = savedAddresses.find((a: any) => a.isDefault)?.id;
  const currentDefaultAddressId = defaultAddressIdFromAPI || profileState.defaultAddressId;

  const defaultAddress =
    savedAddresses.find((a: any) => a.id === currentDefaultAddressId) ||
    savedAddresses[0];

  // Effect to sync API default with local state
  useEffect(() => {
    if (defaultAddressIdFromAPI && defaultAddressIdFromAPI !== profileState.defaultAddressId) {
      dispatch(setDefaultAddress(defaultAddressIdFromAPI));
    }
  }, [defaultAddressIdFromAPI, profileState.defaultAddressId, dispatch]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (isAdmin) {
          router.replace("/dashboard");
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => subscription.remove();
    }, [isAdmin]),
  );

  useEffect(() => {
    if (showLogout) {
      RNAnimated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      RNAnimated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      RNAnimated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        translateY.setValue(height);
      });
    }
  }, [showLogout, overlayOpacity, translateY]);

  useEffect(() => {
    if (showEditProfileModal) {
      RNAnimated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      RNAnimated.spring(profileTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      RNAnimated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        profileTranslateY.setValue(-height);
      });
    }
  }, [showEditProfileModal, overlayOpacity, profileTranslateY]);

  useEffect(() => {
    if (showEditProfileModal) {
      setTempName(profileState.name || userData?.name || "");
    }
  }, [showEditProfileModal, profileState.name, userData?.name]);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfileAPI({
        name: tempName,
        // email: tempEmail, // Email is not allowed to be updated here
      }).unwrap();

      dispatch(updateUser({ name: tempName }));
      dispatch(updateProfile({ key: "name", value: tempName }));
      // dispatch(updateProfile({ key: "email", value: tempEmail }));

      setShowEditProfileModal(false);
      setTimeout(() => {
        toast.success("Success", "Profile updated successfully");
      }, 500);
    } catch (error: any) {
      showAlert({
        title: "Error",
        message: error?.data?.message || "Failed to update profile",
        type: "error",
      });
    }
  };

  const handleLogout = () => {
    setShowLogout(false);
    setTimeout(() => {
      dispatch(logout());
      router.replace("/(tabs)/home");
    }, 100);
  };

  const handleDeleteAccount = () => {
    showAlert({
      title: "Delete Account",
      message:
        "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      type: "error",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccountAPI({}).unwrap();
              toast.success("Success", "Your account has been deleted.");
              handleLogout();
            } catch (error: any) {
              setTimeout(() => {
                toast.error(
                  "Error",
                  error?.data?.message || "Failed to delete account",
                );
              }, 500);
            }
          },
        },
      ],
    });
  };

  return (
    <ScreenWrapper
      style={{ flex: 1 }}
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
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
        {/* HEADER */}
        <Animated.View
          entering={FadeInUp.delay(100).duration(600)}
          className="flex-row items-center justify-between px-5 mb-5 mt-[10px]"
        >
          <InteractivePressable
            className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
            onPress={() => {
              if (isAdmin) {
                router.replace("/dashboard");
              } else {
                router.back();
              }
            }}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </InteractivePressable>
          <Text className="text-[20px] font-[700] text-text">Your Profile</Text>
          <View className="w-9" />
        </Animated.View>

        {/* PROFILE CARD */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          className="mx-5 mb-6 p-5 rounded-[24px] bg-card flex-row items-center justify-between border border-border shadow-lg elevation-4"
        >
          <View className="flex-row items-center gap-4">
            <View className="w-16 h-16 rounded-full border-2 border-border bg-[#1A1A1A] items-center justify-center">
              <Text className="text-primary font-[900] text-2xl">
                {(profileState?.name || userData?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>
            <View>
              <InteractivePressable
                onPress={() => setShowEditProfileModal(true)}
              >
                <View className="flex-row items-center">
                  <Text className="text-[18px] font-[700] text-text mb-1">
                    {profileState?.name || userData?.name || "Your Name"}
                  </Text>
                  <Ionicons
                    name="pencil-sharp"
                    size={16}
                    color={Colors.textSecondary}
                    className="ml-2"
                  />
                  {/* Premium Badge */}
                  {isPremiumUser && (
                    <View className="bg-primary px-1 py-0.5 rounded-xl ml-2">
                      <Text className="text-black text-[10px] font-bold">
                        PREMIUM
                      </Text>
                    </View>
                  )}
                </View>
              </InteractivePressable>
              <Text className="text-sm color-textSecondary font-[500]">
                {userData?.phone || profileState?.phone
                  ? `+91 ${userData?.phone || profileState?.phone}`
                  : "Phone number"}
              </Text>
              {(profileState?.email || userData?.email) && (
                <Text className="text-sm color-textSecondary font-[500]">
                  {profileState?.email || userData?.email}
                </Text>
              )}
            </View>
          </View>
        </Animated.View>

        {/* ADMIN ACTIONS */}
        {isAdmin && (
          <Animated.View
            entering={FadeInUp.delay(300).duration(600)}
            className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden"
          >
            <Text className="text-base font-[600] mb-[10px] px-4 text-text">
              Admin Dashboard
            </Text>
            <Row
              icon="sparkles-outline"
              title="Manage Add-ons"
              subtitle="Update add-on names and multi-frequency pricing"
              onPress={() => router.push("/(tabs)/admin/service-management")}
            />
            <Row
              icon="car-outline"
              title="Manage One-time Washes"
              subtitle="Update wash names and prices"
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/admin/wash-packages",
                  params: { type: "ONE_TIME" },
                })
              }
            />
            <Row
              icon="calendar-outline"
              title="Manage Subscription Plans"
              subtitle="Update plan names and pricing"
              onPress={() => router.push("/(tabs)/admin/subscription-plans")}
            />
            <Row
              icon="people-outline"
              title="Manage Professionals"
              subtitle="Manage all the workers"
              onPress={() => router.push("/dashboard")}
            />
            <Row
              icon="map-outline"
              title="Worker Tracking"
              subtitle="Track live deployments and schedules"
              onPress={() => router.push("/(tabs)/admin/worker-tracking")}
            />
            <Row
              icon="newspaper-outline"
              title="Manage Blogs & Updates"
              subtitle="Create and edit articles"
              onPress={() => router.push("/admin/blogs" as any)}
            />
            <Row
              icon="stats-chart-outline"
              title="Analytics"
              subtitle="View platform performance"
              onPress={() =>
                toast.info("Coming Soon", "Analytics is under development.")
              }
            />
          </Animated.View>
        )}

        {/* USER SECTIONS */}
        {!isAdmin && (
          <>
            {/* SAVED ADDRESSES */}
            <Animated.View
              entering={FadeInUp.delay(300).duration(600)}
              className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden"
            >
              <View className="px-4 py-2.5 border-b border-border flex-row justify-between items-center">
                <Text className="text-base font-[600] text-text">
                  Saved Addresses
                </Text>
                <InteractivePressable
                  className="flex-row items-center gap-1"
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/home/book-doorstep/enter-location",
                      params: { source: "profile" },
                    })
                  }
                >
                  <Ionicons
                    name="add-circle"
                    size={18}
                    color={Colors.primary}
                  />
                  <Text className="text-primary font-[600]">Add</Text>
                </InteractivePressable>
              </View>
              {savedAddresses.length === 0 ? (
                <View className="p-4">
                  <Text className="text-textSecondary">
                    No addresses saved yet.
                  </Text>
                </View>
              ) : (
                <View>
                  <InteractivePressable
                    className={`flex-row items-center py-3 px-4 ${
                      isAddressDropdownOpen ? "border-b border-border" : ""
                    }`}
                    onPress={() =>
                      setIsAddressDropdownOpen(!isAddressDropdownOpen)
                    }
                  >
                    <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-3.5 border border-border">
                      <Ionicons name="location" size={18} color={Colors.text} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-[600] text-text mb-[2px]">
                        {defaultAddress?.addressType || "Select Address"}
                      </Text>
                      <Text
                        className="text-[12px] color-textSecondary font-[500]"
                        numberOfLines={1}
                      >
                        {defaultAddress?.fullAddress ||
                          defaultAddress?.city ||
                          "No default address selected"}
                      </Text>
                    </View>
                    <Ionicons
                      name={
                        isAddressDropdownOpen ? "chevron-up" : "chevron-down"
                      }
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </InteractivePressable>

                  {/* Dropdown List */}
                  {isAddressDropdownOpen && (
                    <View className="bg-background">
                      {savedAddresses.map((addr: any, idx: number) => {
                        const isDefault =
                          currentDefaultAddressId === addr.id || addr.isDefault;
                        const isExpanded = expandedAddressId === addr.id;

                        const ViewWithKey = View as any;
                        return (
                          <ViewWithKey key={addr.id || `addr-${idx}`}>
                            <InteractivePressable
                              className={`flex-row items-center py-3 px-4 pl-6 ${
                                isDefault ? "bg-primary/10" : "bg-background"
                              } ${isExpanded ? "" : "border-b border-border"}`}
                              onPress={() => {
                                setExpandedAddressId(
                                  isExpanded ? null : addr.id,
                                );
                              }}
                            >
                              <View
                                className={`w-10 h-10 rounded-xl items-center justify-center mr-3.5 border border-border ${
                                  isDefault ? "bg-primary/20" : "bg-border"
                                }`}
                              >
                                <Ionicons
                                  name={
                                    isDefault ? "checkmark" : "location-outline"
                                  }
                                  size={16}
                                  color={
                                    isDefault
                                      ? Colors.primary
                                      : Colors.textSecondary
                                  }
                                />
                              </View>
                              <View className="flex-1">
                                <Text
                                  className={`text-base font-[600] mb-[2px] ${
                                    isDefault ? "text-primary" : "text-text"
                                  }`}
                                >
                                  {addr.addressType || "Home"}
                                </Text>
                                <Text
                                  className="text-[12px] color-textSecondary font-[500]"
                                  numberOfLines={1}
                                >
                                  {addr.fullAddress ||
                                    `${addr.flatNumber}, ${addr.locality}, ${addr.city}`}
                                </Text>
                              </View>
                              <Ionicons
                                name={
                                  isExpanded ? "chevron-up" : "chevron-down"
                                }
                                size={16}
                                color={Colors.textSecondary}
                              />
                            </InteractivePressable>

                            {/* ACTIONS ROW (Visible if expanded) */}
                            {isExpanded && (
                              <View
                                className={`flex-row items-center pl-[60px] pb-3 pr-4 gap-4 border-b border-border ${
                                  isDefault ? "bg-primary/5" : "bg-background"
                                }`}
                              >
                                {!isDefault && (
                                  <InteractivePressable
                                    className="flex-row items-center gap-1.5"
                                    onPress={async () => {
                                      try {
                                        await setDefaultAddressAPI(addr.id).unwrap();
                                        dispatch(setDefaultAddress(addr.id));
                                        setExpandedAddressId(null);
                                        setIsAddressDropdownOpen(false);
                                        toast.success("Success", "Default address updated");
                                      } catch (error) {
                                        toast.error("Error", "Failed to set default address");
                                      }
                                    }}
                                  >
                                    <Ionicons
                                      name="checkmark-circle-outline"
                                      size={18}
                                      color={Colors.primary}
                                    />
                                    <Text className="text-sm color-primary font-[500]">
                                      Make Default
                                    </Text>
                                  </InteractivePressable>
                                )}

                                <InteractivePressable
                                  className="flex-row items-center gap-1.5"
                                  onPress={() => {
                                    showAlert({
                                      title: "Delete Address",
                                      message:
                                        "Are you sure you want to remove this address?",
                                      type: "error",
                                      buttons: [
                                        { text: "Cancel", style: "cancel" },
                                        {
                                          text: "Delete",
                                          style: "destructive",
                                          onPress: async () => {
                                            try {
                                              await deleteAddress(
                                                addr.id,
                                              ).unwrap();
                                              dispatch(
                                                removeAddresses(addr.id),
                                              );
                                              setExpandedAddressId(null);
                                              setTimeout(() => {
                                                toast.success(
                                                  "Success",
                                                  "Address deleted successfully",
                                                );
                                              }, 500);
                                            } catch (error: any) {
                                              if (
                                                error?.status === 404 ||
                                                error?.originalStatus === 404
                                              ) {
                                                dispatch(
                                                  removeAddresses(addr.id),
                                                );
                                                setExpandedAddressId(null);
                                                toast.info(
                                                  "Notice",
                                                  "Address was already removed from server.",
                                                );
                                              } else {
                                                dispatch(
                                                  removeAddresses(addr.id),
                                                );
                                                setExpandedAddressId(null);
                                              }
                                            }
                                          },
                                        },
                                      ],
                                    });
                                  }}
                                >
                                  <Ionicons
                                    name="trash-outline"
                                    size={18}
                                    color="#EF4444"
                                  />
                                  <Text className="text-sm color-[#EF4444] font-[500]">
                                    Delete
                                  </Text>
                                </InteractivePressable>
                              </View>
                            )}
                          </ViewWithKey>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </Animated.View>

            {/* ACCOUNT CARD */}
            <Animated.View
              entering={FadeInUp.delay(400).duration(600)}
              className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden"
            >
              <Text className="text-base font-[600] mb-[10px] px-4 text-text">
                Account Settings
              </Text>
              <Row
                icon="wallet-outline"
                title="Payment Methods"
                subtitle="View your added payments methods"
                onPress={() => router.push("/profile/payment-methods")}
              />
              <Row
                icon="car-outline"
                title="My Cars"
                subtitle="Manage your vehicles"
                onPress={() => router.push("/garage")}
              />
              {/* <Row
                icon="notifications-outline"
                title="Notifications"
                subtitle="Manage your alerts and updates"
                onPress={() => router.push("/profile/notifications")}
              /> */}
            </Animated.View>

            {/* SUPPORT CARD */}
            <Animated.View
              entering={FadeInUp.delay(500).duration(600)}
              className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden"
            >
              <Text className="text-base font-[600] mb-[10px] px-4 text-text">
                Support & Info
              </Text>
              <Row
                icon="help-circle-outline"
                title="FAQs & Help"
                subtitle="Get help with your bookings"
                onPress={() => router.push("/profile/FAQs")}
              />
              <Row
                icon="mail-outline"
                title="Contact Support"
                subtitle="Talk to our support team"
                onPress={() =>
                  showAlert({
                    title: "Contact Support",
                    message:
                      "Email: support@cleanmywheels.com\nPhone: +91 99999 88888",
                    type: "info",
                  })
                }
              />
              <Row
                icon="newspaper-outline"
                title="Blogs & Updates"
                subtitle="Stay updated with our latest news"
                onPress={() => router.push("/profile/blogs" as any)}
              />
              <Row
                icon="information-circle-outline"
                title="Privacy Policy"
                subtitle="Read our privacy policy"
                onPress={() => router.push("/profile/privacy-policy" as any)}
              />
            </Animated.View>
          </>
        )}

        {/* LOGOUT ROW (always visible at bottom) */}
        <Animated.View
          entering={FadeInUp.delay(600).duration(600)}
          className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden"
        >
          <Row
            icon="log-out-outline"
            title="Logout"
            onPress={() => setShowLogout(true)}
            danger
          />
        </Animated.View>

        {/* LOGOUT MODAL */}
        <Modal
          visible={showLogout}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogout(false)}
        >
          <RNAnimated.View
            className="flex-1 bg-black/60"
            style={{ opacity: overlayOpacity }}
          >
            <InteractivePressable
              className="flex-1"
              onPress={() => setShowLogout(false)}
            />
          </RNAnimated.View>
          <RNAnimated.View
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 border border-border shadow-2xl elevation-20"
            style={[
              { transform: [{ translateY }] },
              { paddingBottom: Math.max(insets.bottom, 40) },
            ]}
          >
            <Text className="text-[22px] font-[700] text-text text-center mb-2">
              Logout
            </Text>
            <Text className="text-[15px] color-textSecondary text-center mb-6">
              Are you sure you want to logout? You&apos;ll need to sign in again
              to manage your bookings.
            </Text>
            <View className="flex-row gap-3">
              <InteractivePressable
                className="flex-1 py-4 rounded-2xl bg-background items-center justify-center border border-border"
                onPress={() => setShowLogout(false)}
              >
                <Text className="text-base font-[600] text-text">Cancel</Text>
              </InteractivePressable>
              <InteractivePressable
                className="flex-1 py-4 rounded-2xl bg-primary items-center justify-center shadow shadow-primary"
                onPress={handleLogout}
              >
                <Text className="text-base font-[700] text-black">Logout</Text>
              </InteractivePressable>
            </View>
          </RNAnimated.View>
        </Modal>

        {/* EDIT PROFILE MODAL */}
        <Modal
          visible={showEditProfileModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEditProfileModal(false)}
        >
          <RNAnimated.View
            className="flex-1 bg-black/60"
            style={{ opacity: overlayOpacity }}
          >
            <InteractivePressable
              className="flex-1"
              onPress={() => setShowEditProfileModal(false)}
            />
          </RNAnimated.View>
          <RNAnimated.View
            className="absolute top-0 left-0 right-0 bg-card rounded-b-[40px] p-8 border-b border-border shadow-2xl elevation-20"
            style={[
              { transform: [{ translateY: profileTranslateY }] },
              { paddingTop: insets.top + 20 },
            ]}
          >
            <View className="items-center mb-6">
              <View className="w-12 h-1 bg-border rounded-full mb-6" />
              <Text className="text-[22px] font-[700] text-text">
                Edit Profile
              </Text>
              <Text className="text-[15px] color-textSecondary">
                Update your personal information
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-[600] color-textSecondary mb-2 ml-1">
                Full Name
              </Text>
              <TextInput
                className="bg-background rounded-2xl px-4 py-3.5 text-base text-text border border-border"
                value={tempName}
                onChangeText={(text) => {
                  if (/[^a-zA-Z\s]/.test(text)) {
                    setIsNameWarningVisible(true);
                    setTimeout(() => setIsNameWarningVisible(false), 3000);
                  }
                  const val = text.replace(/[^a-zA-Z\s]/g, "");
                  setTempName(val);
                }}
                maxLength={40}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textSecondary}
              />
              <View className="flex-row justify-between mt-1.5 px-1">
                <View className="flex-1">
                  <Text className="text-[11px] font-[600] color-textSecondary">
                    * Only letters and spaces allowed
                  </Text>
                </View>
                <Text
                  className={`text-[11px] font-[700] ${tempName.length >= 35 ? "text-primary" : "text-textSecondary"}`}
                >
                  {tempName.length} / 40
                </Text>
              </View>
            </View>

            {/* Read-only Mobile Number */}
            <View className="mb-6">
              <Text className="text-sm font-[600] color-textSecondary mb-2 ml-1">
                Mobile Number
              </Text>
              <View className="flex-row items-center bg-background rounded-2xl px-4 py-3.5 border border-border opacity-70">
                <Text className="text-base text-text font-[600] mr-2">+91</Text>
                <View className="w-[1px] h-5 bg-border mr-3" />
                <TextInput
                  value={userData?.phone || profileState?.phone || ""}
                  editable={false}
                  className="flex-1 text-base text-text"
                />
              </View>
              <Text className="text-[11px] text-textSecondary mt-2 ml-1">
                Mobile number cannot be changed
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl bg-background items-center justify-center border border-border"
                onPress={() => setShowEditProfileModal(false)}
              >
                <Text className="text-base font-[600] text-text">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl bg-primary items-center justify-center shadow shadow-primary"
                onPress={handleSaveProfile}
              >
                <Text className="text-base font-[700] text-black">
                  Save Changes
                </Text>
              </TouchableOpacity>
            </View>

            {/* SUBTLE DELETE ACCOUNT OPTION */}
            <TouchableOpacity
              onPress={handleDeleteAccount}
              className="mt-8 mb-2 self-center opacity-20"
            >
              <Text className="text-gray-200 text-[15px] font-[500] tracking-tighter">
                Delete Account
              </Text>
            </TouchableOpacity>
          </RNAnimated.View>
        </Modal>
      </ScrollView>
    </ScreenWrapper>
  );
}

const Row = ({
  icon,
  title,
  subtitle,
  onPress,
  danger,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => (scale.value = withSpring(0.96))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onPress}
    >
      <Animated.View
        className="flex-row items-center py-3.5 px-4"
        style={animatedStyle}
      >
        <View
          className={`w-10 h-10 rounded-xl items-center justify-center mr-3.5 border border-border ${
            danger ? "bg-red-500/10 border-red-500/20" : "bg-background"
          }`}
        >
          <Ionicons
            name={icon}
            size={20}
            color={danger ? Colors.error : Colors.text}
          />
        </View>
        <View className="flex-1">
          <Text
            className={`text-base font-[600] text-text mb-[2px] ${
              danger ? "text-error" : ""
            }`}
          >
            {title}
          </Text>
          {subtitle && (
            <Text className="text-[12px] color-textSecondary font-[500]">
              {subtitle}
            </Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.textSecondary}
        />
      </Animated.View>
    </Pressable>
  );
};
