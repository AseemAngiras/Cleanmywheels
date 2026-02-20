import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { RootState } from "@/store";
import { useUpdateProfileMutation } from "@/store/api/authApi";
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
  const translateY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Edit Profile Animations
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  const [isNameWarningVisible, setIsNameWarningVisible] = useState(false);

  const [updateUserProfileAPI] = useUpdateProfileMutation();

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
    if (showLogout || showAvatarModal || showEditProfileModal) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 5,
      }).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        translateY.setValue(height);
      });
    }
  }, [
    showLogout,
    showAvatarModal,
    showEditProfileModal,
    overlayOpacity,
    translateY,
  ]);

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

      Alert.alert("Success", "Profile updated successfully");
      setShowEditProfileModal(false);
    } catch (error: any) {
      Alert.alert("Error", error?.data?.message || "Failed to update profile");
    }
  };

  const handleUpdateAvatar = async () => {
    try {
      await updateUserProfileAPI({
        avatar: selectedAvatar,
      }).unwrap();

      dispatch(updateUser({ avatar: selectedAvatar }));
      dispatch(setAvatar(selectedAvatar));

      Alert.alert("Success", "Avatar updated successfully");
      setShowAvatarModal(false);
    } catch (error: any) {
      Alert.alert("Error", error?.data?.message || "Failed to update avatar");
    }
  };

  const handleLogout = () => {
    setShowLogout(false);
    setTimeout(() => {
      dispatch(logout());
      router.replace("/(tabs)/home");
    }, 100);
  };

  return (
    <ScreenWrapper
      style={{ flex: 1 }}
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View className="flex-row items-center justify-between px-5 mb-5 mt-[10px]">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text className="text-[20px] font-[700] text-text">Your Profile</Text>
          <View className="w-9" />
        </View>

        {/* PROFILE CARD */}
        <View className="mx-5 mb-6 p-5 rounded-[24px] bg-card flex-row items-center justify-between border border-border shadow-lg elevation-4">
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
        </View>

        {/* ADMIN ACTIONS */}
        {isAdmin && (
          <View className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden">
            <Text className="text-base font-[600] mb-[10px] px-4 text-text">
              Admin Dashboard
            </Text>
            {/* <Row
              icon="calendar-outline"
              title="Manage Bookings"
              subtitle="View and assign active bookings"
              onPress={() => router.push("/(tabs)/pairings")}
            /> */}
            <Row
              icon="people-outline"
              title="Manage Users"
              subtitle="View registered users"
              onPress={() =>
                Alert.alert(
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
                Alert.alert("Coming Soon", "Analytics is under development.")
              }
            />
          </View>
        )}

        {/* USER SECTIONS */}
        {!isAdmin && (
          <>
            {/* SAVED ADDRESSES */}
            <View className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden">
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
                                              Alert.alert(
                                                "Success",
                                                "Address deleted successfully",
                                              );
                                            } catch (error: any) {
                                              console.log(
                                                "Delete error",
                                                error,
                                              );
                                              if (
                                                error?.status === 404 ||
                                                error?.originalStatus === 404
                                              ) {
                                                dispatch(
                                                  removeAddresses(addr.id),
                                                );
                                                setExpandedAddressId(null);
                                                Alert.alert(
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
            </View>

            {/* ACCOUNT CARD */}
            <View className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden">
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
              <Row
                icon="gift-outline"
                title="Refer & Earn"
                subtitle="Invite friends and earn rewards"
                onPress={() => {
                  Share.share({
                    message:
                      "Check out CleanMyWheels! The best car wash service at your doorstep. Download now: https://cleanmywheels.com",
                  });
                }}
              />
              {/* <Row
                icon="shield-checkmark-outline"
                title="Privacy & Security"
                subtitle="Manage your data and account"
                onPress={() =>
                  Alert.alert(
                    "Coming Soon",
                    "Privacy settings are under development.",
                  )
                }
              /> */}
            </View>

            {/* SUPPORT CARD */}
            <View className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden">
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
              {/* <Row
                icon="information-circle-outline"
                title="Terms & Privacy"
                subtitle="Read our legal policies"
                onPress={() =>
                  Alert.alert(
                    "Coming Soon",
                    "Legal documents are under development.",
                  )
                }
              /> */}
            </View>
          </>
        )}

        {/* LOGOUT ROW (always visible at bottom) */}
        <View className="mx-5 mb-5 py-3 rounded-[24px] bg-card border border-border overflow-hidden">
          <Row
            icon="log-out-outline"
            title="Logout"
            onPress={() => setShowLogout(true)}
            danger
          />
        </View>

        {/* LOGOUT MODAL */}
        <Modal visible={showLogout} transparent animationType="fade">
          <Animated.View
            className="flex-1 bg-black/60"
            style={{ opacity: overlayOpacity }}
          >
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setShowLogout(false)}
            />
          </Animated.View>
          <Animated.View
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 pb-10 border border-border shadow-2xl elevation-20"
            style={[{ transform: [{ translateY }] }]}
          >
            <Text className="text-[22px] font-[700] text-text text-center mb-2">
              Logout
            </Text>
            <Text className="text-[15px] color-textSecondary text-center mb-6">
              Are you sure you want to logout? You'll need to sign in again to
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
          </Animated.View>
        </Modal>

        {/* AVATAR SELECTION MODAL */}
        <Modal visible={showAvatarModal} transparent animationType="fade">
          <Animated.View
            className="flex-1 bg-black/60"
            style={{ opacity: overlayOpacity }}
          >
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setShowAvatarModal(false)}
            />
          </Animated.View>
          <Animated.View
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 pb-10 border border-border shadow-2xl elevation-20"
            style={[{ transform: [{ translateY }] }]}
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
          </Animated.View>
        </Modal>

        {/* EDIT PROFILE MODAL */}
        <Modal visible={showEditProfileModal} transparent animationType="fade">
          <Animated.View
            className="flex-1 bg-black/60"
            style={{ opacity: overlayOpacity }}
          >
            <TouchableOpacity
              className="flex-1"
              activeOpacity={1}
              onPress={() => setShowEditProfileModal(false)}
            />
          </Animated.View>
          <Animated.View
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[32px] p-6 pb-10 border border-border shadow-2xl elevation-20"
            style={[{ transform: [{ translateY }] }]}
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
          </Animated.View>
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
}) => (
  <TouchableOpacity
    className="flex-row items-center py-3.5 px-4"
    onPress={onPress}
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
  </TouchableOpacity>
);
