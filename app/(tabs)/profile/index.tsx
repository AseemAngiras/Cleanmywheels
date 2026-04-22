import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { toast } from "@/utils/toast";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Animated as RNAnimated,
} from "react-native";
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
} from "@/store/api/authApi";
import {
  useDeleteAddressMutation,
  useGetAddressesQuery,
} from "@/store/api/addressApi";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import {
  removeAddresses,
  setAvatar,
  setDefaultAddress,
  updateProfile,
} from "@/store/slices/profileSlice";
import { updateUser } from "@/store/slices/userSlice";

const { height } = Dimensions.get("window");

const AVATARS = [
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=3",
  "https://i.pravatar.cc/150?img=9",
  "https://i.pravatar.cc/150?img=60",
  "https://i.pravatar.cc/150?img=68",
];

export default function ProfileHome() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { data: subscriptions } = useGetMySubscriptionQuery(undefined);

  const activeSub = Array.isArray(subscriptions)
    ? subscriptions.find((s: any) => s.status === "active")
    : (subscriptions as any)?.status === "active"
      ? subscriptions
      : null;

  const isPremiumUser = !!activeSub;

  const [showLogout, setShowLogout] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const translateY = useRef(new RNAnimated.Value(height)).current;
  const profileTranslateY = useRef(new RNAnimated.Value(-height)).current;
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

  // Edit Profile Animations
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [isNameWarningVisible, setIsNameWarningVisible] = useState(false);

  const [updateUserProfileAPI] = useUpdateProfileMutation();
  const [deleteAccountAPI] = useDeleteAccountMutation();

  const userState = useSelector((state: RootState) => state.user);
  const userData = userState.user;
  const isAdmin = userData?.accountType === "Super Admin";

  const { data: addressesData } = useGetAddressesQuery(undefined);
  const [deleteAddress] = useDeleteAddressMutation();
  const profileState = useSelector((state: RootState) => state.profile);

  // Defensive check & mapping
  let fetchedAddresses =
    addressesData?.data?.addressList || addressesData?.data || [];

  if (!Array.isArray(fetchedAddresses)) {
    fetchedAddresses = [];
  }

  const savedAddresses =
    fetchedAddresses.length > 0
      ? fetchedAddresses.map((addr: any) => ({
          ...addr,
          id: addr._id || addr.id,
          fullAddress:
            addr.fullAddress ||
            `${addr.houseOrFlatNo}, ${addr.locality}, ${addr.city} - ${addr.postalCode}`,
        }))
      : profileState?.addresses || [];

  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [expandedAddressId, setExpandedAddressId] = useState<string | null>(
    null,
  );

  const defaultAddress =
    savedAddresses.find((a: any) => a.id === profileState.defaultAddressId) ||
    savedAddresses[0];

  useEffect(() => {
    if (showLogout || showAvatarModal) {
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
  }, [showLogout, showAvatarModal, overlayOpacity, translateY]);

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
      setTempEmail(profileState.email || userData?.email || "");
    }
    if (showAvatarModal) {
      setSelectedAvatar(profileState?.avatar || AVATARS[0]);
    }
  }, [
    showEditProfileModal,
    showAvatarModal,
    profileState.name,
    profileState.email,
    profileState.avatar,
    userData?.name,
    userData?.email,
  ]);

  const handleSaveProfile = async () => {
    try {
      await updateUserProfileAPI({
        name: tempName,
        // email: tempEmail, // Email is not allowed to be updated here
      }).unwrap();

      dispatch(updateUser({ name: tempName }));
      dispatch(updateProfile({ key: "name", value: tempName }));
      // dispatch(updateProfile({ key: "email", value: tempEmail }));

      toast.success("Success", "Profile updated successfully");
      setShowEditProfileModal(false);
    } catch (error: any) {
      toast.error("Error", error?.data?.message || "Failed to update profile");
    }
  };

  const handleUpdateAvatar = async () => {
    try {
      await updateUserProfileAPI({
        avatar: selectedAvatar,
      }).unwrap();

      dispatch(updateUser({ avatar: selectedAvatar }));
      dispatch(setAvatar(selectedAvatar));

      toast.success("Success", "Avatar updated successfully");
      setShowAvatarModal(false);
    } catch (error: any) {
      toast.error("Error", error?.data?.message || "Failed to update avatar");
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
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
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
              toast.error(
                "Error",
                error?.data?.message || "Failed to delete account",
              );
            }
          },
        },
      ],
    );
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
      >
        {/* HEADER */}
        <Animated.View 
          entering={FadeInUp.delay(100).duration(600)}
          className="flex-row items-center justify-between px-5 mb-5 mt-[10px]"
        >
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
            onPress={() => {
              if (isAdmin) {
                router.replace("/(tabs)/dashboard");
              } else {
                router.back();
              }
            }}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text className="text-[20px] font-[700] text-text">Your Profile</Text>
          <View className="w-9" />
        </Animated.View>

        {/* PROFILE CARD */}
        <Animated.View 
          entering={FadeInUp.delay(200).duration(600)}
          className="mx-5 mb-6 p-5 rounded-[24px] bg-card flex-row items-center justify-between border border-border shadow-lg elevation-4"
        >
          <View className="flex-row items-center gap-4">
            <TouchableOpacity activeOpacity={1}>
              <Image
                source={{
                  uri:
                    profileState?.avatar || "https://i.pravatar.cc/150?img=12",
                }}
                className="w-16 h-16 rounded-full border-2 border-border bg-background"
              />
            </TouchableOpacity>
            <View>
              <TouchableOpacity onPress={() => setShowEditProfileModal(true)}>
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
              </TouchableOpacity>
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
              subtitle="View registered users"
              onPress={() =>
                toast.info(
                  "Coming Soon",
                  "User management is under development.",
                )
              }
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
                <TouchableOpacity
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
                </TouchableOpacity>
              </View>
              {savedAddresses.length === 0 ? (
                <View className="p-4">
                  <Text className="text-textSecondary">
                    No addresses saved yet.
                  </Text>
                </View>
              ) : (
                <View>
                  <TouchableOpacity
                    className={`flex-row items-center py-3 px-4 ${
                      isAddressDropdownOpen ? "border-b border-border" : ""
                    }`}
                    onPress={() =>
                      setIsAddressDropdownOpen(!isAddressDropdownOpen)
                    }
                    activeOpacity={0.7}
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
                  </TouchableOpacity>

                  {/* Dropdown List */}
                  {isAddressDropdownOpen && (
                    <View className="bg-background">
                      {savedAddresses.map((addr: any, idx: number) => {
                        const isDefault =
                          profileState.defaultAddressId === addr.id;
                        const isExpanded = expandedAddressId === addr.id;

                        return (
                          <View key={addr.id || idx}>
                            <TouchableOpacity
                              className={`flex-row items-center py-3 px-4 pl-6 ${
                                isDefault ? "bg-primary/10" : "bg-background"
                              } ${isExpanded ? "" : "border-b border-border"}`}
                              activeOpacity={0.7}
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
                            </TouchableOpacity>

                            {/* ACTIONS ROW (Visible if expanded) */}
                            {isExpanded && (
                              <View
                                className={`flex-row items-center pl-[60px] pb-3 pr-4 gap-4 border-b border-border ${
                                  isDefault ? "bg-primary/5" : "bg-background"
                                }`}
                              >
                                {!isDefault && (
                                  <TouchableOpacity
                                    className="flex-row items-center gap-1.5"
                                    onPress={() => {
                                      dispatch(setDefaultAddress(addr.id));
                                      setExpandedAddressId(null);
                                      setIsAddressDropdownOpen(false);
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
                                  </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                  className="flex-row items-center gap-1.5"
                                  onPress={() => {
                                    Alert.alert(
                                      "Delete Address",
                                      "Are you sure you want to remove this address?",
                                      [
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
                                              toast.success(
                                                "Success",
                                                "Address deleted successfully",
                                              );
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
                                    );
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
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
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
              <Row
                icon="notifications-outline"
                title="Notifications"
                subtitle="Manage your alerts and updates"
                onPress={() => router.push("/profile/notifications")}
              />
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
                  Alert.alert(
                    "Contact Support",
                    "Email: support@cleanmywheels.com\nPhone: +91 99999 88888",
                  )
                }
              />
              <Row
                icon="information-circle-outline"
                title="Privacy Policy"
                subtitle="Read our privacy policy"
                onPress={() => router.push("/profile/privacy-policy")}
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
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
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
              Are you sure you want to logout? You&apos;ll need to sign in again to
              manage your bookings.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl bg-background items-center justify-center border border-border"
                onPress={() => setShowLogout(false)}
              >
                <Text className="text-base font-[600] text-text">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl bg-primary items-center justify-center shadow shadow-primary"
                onPress={handleLogout}
              >
                <Text className="text-base font-[700] text-black">Logout</Text>
              </TouchableOpacity>
            </View>
          </RNAnimated.View>
        </Modal>

        {/* AVATAR SELECTION MODAL */}
        <Modal
          visible={showAvatarModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAvatarModal(false)}
        >
          <RNAnimated.View
            className="flex-1 bg-black/60"
            style={{ opacity: overlayOpacity }}
          >
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setShowAvatarModal(false)}
            />
          </RNAnimated.View>
          <RNAnimated.View
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 border border-border shadow-2xl elevation-20"
            style={[
              { transform: [{ translateY }] },
              { paddingBottom: Math.max(insets.bottom, 40) },
            ]}
          >
            <View className="items-center mb-6">
              <View className="w-12 h-1 bg-border rounded-full mb-6" />
              <Text className="text-[22px] font-[700] text-text">
                Choose Avatar
              </Text>
              <Text className="text-[15px] color-textSecondary text-center">
                Select an avatar that best represents you
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-center gap-4 mb-6">
              {AVATARS.map((avatar) => (
                <TouchableOpacity
                  key={avatar}
                  onPress={() => setSelectedAvatar(avatar)}
                  className={`w-[70px] h-[70px] rounded-full border-2 p-1 ${
                    selectedAvatar === avatar
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  <Image
                    source={{ uri: avatar }}
                    className="w-full h-full rounded-full"
                  />
                  {selectedAvatar === avatar && (
                    <View className="absolute -top-1 -right-1 bg-primary rounded-full w-5 h-5 items-center justify-center border border-card">
                      <Ionicons name="checkmark" size={12} color="black" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className="py-4 rounded-2xl bg-primary items-center justify-center shadow shadow-primary mb-3"
              onPress={handleUpdateAvatar}
            >
              <Text className="text-base font-[700] text-black">
                Save Avatar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="py-4 rounded-2xl items-center justify-center"
              onPress={() => setShowAvatarModal(false)}
            >
              <Text className="text-base font-[600] text-textSecondary">
                Cancel
              </Text>
            </TouchableOpacity>
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
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
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
                placeholder="Enter your name"
                placeholderTextColor={Colors.textSecondary}
              />
              {isNameWarningVisible && (
                <Text className="text-error text-[12px] mt-1.5 ml-1">
                  Only letters and spaces are allowed
                </Text>
              )}
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
        <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
      </Animated.View>
    </Pressable>
  );
};
