import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Linking,
  Modal,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/Colors";

import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useUpdateProfileMutation } from "../../../store/api/authApi";
import {
  useGetAddressesQuery,
  useDeleteAddressMutation,
} from "../../../store/api/addressApi";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logout } from "../../../store/slices/authSlice";
import {
  removeAddresses,
  setAvatar,
  setDefaultAddress,
  updateProfile,
} from "../../../store/slices/profileSlice";
import { updateUser } from "../../../store/slices/userSlice";

import { useGetMySubscriptionQuery } from "../../../store/api/subscriptionApi";

import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

const { height } = Dimensions.get("window");

export default function ProfileHome() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);
  const { data: subscriptions } = useGetMySubscriptionQuery(undefined);

  const activeSub = Array.isArray(subscriptions)
    ? subscriptions.find((s: any) => s.status === "active")
    : (subscriptions as any)?.status === "active"
      ? subscriptions
      : null;

  const isPremiumUser = !!activeSub;

  const [showLogout, setShowLogout] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const avatarTranslateY = useRef(new Animated.Value(height)).current;
  const avatarOverlayOpacity = useRef(new Animated.Value(0)).current;

  // Edit Profile Animations
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [isNameWarningVisible, setIsNameWarningVisible] = useState(false);
  const editProfileTranslateY = useRef(new Animated.Value(height)).current;
  const editProfileOverlayOpacity = useRef(new Animated.Value(0)).current;

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

  console.log(" [Profile] User Data:", userData);
  console.log(" [Profile] Saved Addresses:", savedAddresses);

  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [expandedAddressId, setExpandedAddressId] = useState<string | null>(
    null,
  );

  const defaultAddress =
    savedAddresses.find((a: any) => a.id === profileState.defaultAddressId) ||
    savedAddresses[0];

  useEffect(() => {
    if (showLogout) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showLogout]);

  useEffect(() => {
    if (showAvatarModal) {
      Animated.parallel([
        Animated.timing(avatarTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(avatarOverlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showAvatarModal, avatarTranslateY, avatarOverlayOpacity]);

  useEffect(() => {
    if (showEditProfileModal) {
      setTempName(profileState.name || userData?.name || "");
      Animated.parallel([
        Animated.timing(editProfileTranslateY, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(editProfileOverlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [
    showEditProfileModal,
    editProfileTranslateY,
    editProfileOverlayOpacity,
    profileState.name,
    userData?.name,
  ]);

  const closeEditProfileSheet = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(editProfileTranslateY, {
        toValue: height,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(editProfileOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowEditProfileModal(false);
      if (typeof callback === "function") {
        callback();
      }
    });
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfileAPI({
        name: tempName,
      }).unwrap();

      dispatch(updateUser({ name: tempName }));
      dispatch(updateProfile({ key: "name", value: tempName }));

      Alert.alert("Success", "Profile updated successfully");
      closeEditProfileSheet();
    } catch (error: any) {
      Alert.alert("Error", error?.data?.message || "Failed to update profile");
    }
  };

  const closeSheet = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowLogout(false);
      if (typeof callback === "function") {
        callback();
      }
    });
  };

  const closeAvatarSheet = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(avatarTranslateY, {
        toValue: height,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(avatarOverlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAvatarModal(false);
      if (typeof callback === "function") {
        callback();
      }
    });
  };

  const handleLogout = () => {
    closeSheet(() => {
      setTimeout(() => {
        dispatch(logout());
        router.replace("/(tabs)/home");
      }, 100);
    });
  };

  return (
    <ScreenWrapper
      style={styles.container}
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.header}>Your Profile</Text>
          <View style={{ width: 36 }} />
        </View>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.profileLeft}>
            <TouchableOpacity
              onPress={() => setShowAvatarModal(true)}
              activeOpacity={0.8}
            >
              <Image
                source={{
                  uri:
                    profileState?.avatar || "https://i.pravatar.cc/150?img=12",
                }}
                style={styles.avatar}
              />
              {/* Edit badge */}
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 4,
                  backgroundColor: Colors.card,
                  borderRadius: 15,
                  width: 20,
                  height: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: Colors.border,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Ionicons name="pencil" size={10} color={Colors.text} />
              </View>
            </TouchableOpacity>
            <View>
              <TouchableOpacity onPress={() => setShowEditProfileModal(true)}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.profileName}>
                    {profileState?.name || userData?.name || "Your Name"}
                  </Text>
                  <Ionicons
                    name="pencil-sharp"
                    size={16}
                    color={Colors.textSecondary}
                    style={{ marginLeft: 8 }}
                  />
                  {/* Premium Badge */}
                  {isPremiumUser && (
                    <View
                      style={{
                        backgroundColor: Colors.primary,
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 12,
                        marginLeft: 10,
                      }}
                    >
                      <Text
                        style={{
                          color: "#1a1a1a",
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      >
                        PREMIUM
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <Text style={styles.profileSubtitle}>
                {userData?.phone || profileState?.phone
                  ? `+91 ${userData?.phone || profileState?.phone}`
                  : "Phone number"}
              </Text>
              {profileState?.email || userData?.email ? (
                <Text style={styles.profileSubtitle}>
                  {profileState?.email || userData?.email}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
        {/* ADMIN ACTIONS */}
        {isAdmin && (
          <View style={styles.card}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 10,
                paddingHorizontal: 16,
                color: Colors.text,
              }}
            >
              Admin Dashboard
            </Text>
            <Row
              icon="calendar-outline"
              title="Manage Bookings"
              subtitle="View and assign active bookings"
              onPress={() => router.push("/(tabs)/bookings")}
            />
            {/* <Row
            icon="alert-circle-outline"
            title="Complaints & Refunds"
            subtitle="View user tickets and refund requests"
            onPress={() => router.push("/(tabs)/admin/subscriptions")}
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
            <View style={styles.card}>
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: Colors.text,
                  }}
                >
                  Saved Addresses
                </Text>
                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
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
                  <Text style={{ color: Colors.primary, fontWeight: "600" }}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
              {savedAddresses.length === 0 ? (
                <View style={{ padding: 16 }}>
                  <Text style={{ color: Colors.textSecondary }}>
                    No addresses saved yet.
                  </Text>
                </View>
              ) : (
                <View>
                  <TouchableOpacity
                    style={[
                      styles.addressRow,
                      {
                        borderBottomWidth: isAddressDropdownOpen ? 1 : 0,
                        borderColor: Colors.border,
                      },
                    ]}
                    onPress={() =>
                      setIsAddressDropdownOpen(!isAddressDropdownOpen)
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconBox}>
                      <Ionicons name="location" size={18} color={Colors.text} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle}>
                        {defaultAddress?.addressType || "Select Address"}
                      </Text>
                      <Text style={styles.rowSubtitle} numberOfLines={1}>
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
                    <View style={{ backgroundColor: Colors.background }}>
                      {savedAddresses.map((addr: any, idx: number) => {
                        const isDefault =
                          profileState.defaultAddressId === addr.id;
                        const isExpanded = expandedAddressId === addr.id;

                        return (
                          <View key={addr.id || idx}>
                            <TouchableOpacity
                              style={[
                                styles.addressRow,
                                {
                                  paddingLeft: 24,
                                  backgroundColor: isDefault
                                    ? "rgba(200, 240, 0, 0.1)" // Slight primary tint
                                    : Colors.background,
                                  borderBottomWidth: isExpanded ? 0 : 1,
                                  borderColor: Colors.border,
                                },
                              ]}
                              activeOpacity={0.7}
                              onPress={() => {
                                setExpandedAddressId(
                                  isExpanded ? null : addr.id,
                                );
                              }}
                            >
                              <View
                                style={[
                                  styles.iconBox,
                                  {
                                    backgroundColor: isDefault
                                      ? "rgba(200, 240, 0, 0.2)"
                                      : Colors.border,
                                  },
                                ]}
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
                              <View style={{ flex: 1 }}>
                                <Text
                                  style={[
                                    styles.rowTitle,
                                    isDefault && { color: Colors.primary },
                                  ]}
                                >
                                  {addr.addressType || "Home"}
                                </Text>
                                <Text
                                  style={styles.rowSubtitle}
                                  numberOfLines={1}
                                >
                                  {addr.fullAddress ||
                                    `${addr.flatNumber}, ${addr.locality}, ${addr.city}`}
                                </Text>
                              </View>

                              {/* Dropdown arrow to indicate expandability */}
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
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  backgroundColor: isDefault
                                    ? "rgba(200, 240, 0, 0.05)"
                                    : Colors.background,
                                  paddingLeft: 60,
                                  paddingBottom: 12,
                                  paddingRight: 16,
                                  gap: 16,
                                  borderBottomWidth: 1,
                                  borderBottomColor: Colors.border,
                                }}
                              >
                                {!isDefault && (
                                  <TouchableOpacity
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
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
                                    <Text
                                      style={{
                                        fontSize: 14,
                                        color: Colors.primary,
                                        fontWeight: "500",
                                      }}
                                    >
                                      Make Default
                                    </Text>
                                  </TouchableOpacity>
                                )}

                                <TouchableOpacity
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
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
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      color: "#EF4444",
                                      fontWeight: "500",
                                    }}
                                  >
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
            <View style={styles.card}>
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
                title="Manage Notifications"
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
            </View>
          </>
        )}
        {/* SUPPORT CARD */}
        <View style={styles.card}>
          {!isAdmin && (
            <>
              <Row
                icon="help-circle-outline"
                title="FAQs"
                onPress={() => router.push("/profile/FAQs")}
              />
              <Row
                icon="call-outline"
                title="Contact Us"
                onPress={() => {
                  const adminPhone = "+919876543210";
                  const text = "Hello, I need help with CleanMyWheels.";
                  const url = `whatsapp://send?text=${text}&phone=${adminPhone}`;
                  Linking.openURL(url).catch(() => {
                    Linking.openURL(
                      `https://wa.me/${adminPhone.replace("+", "")}`,
                    );
                  });
                }}
              />
            </>
          )}
          <Row
            icon="log-out-outline"
            title="Log out"
            danger
            onPress={() => setShowLogout(true)}
          />
        </View>
        {/* LOGOUT MODAL */}
        <Modal
          transparent
          visible={showLogout}
          animationType="none"
          onRequestClose={() => closeSheet()}
        >
          <Animated.View
            style={[styles.modalOverlay, { opacity: overlayOpacity }]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => closeSheet()}
            />
          </Animated.View>

          <Animated.View
            style={[styles.bottomSheet, { transform: [{ translateY }] }]}
          >
            <Text style={styles.logoutTitle}>Logout</Text>
            <Text style={styles.logoutSubtitle}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.logoutActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => closeSheet()}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutText}>Yes, Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Modal>
        {/* AVATAR SELECTION MODAL */}
        <Modal
          transparent
          visible={showAvatarModal}
          animationType="none"
          onRequestClose={() => closeAvatarSheet()}
        >
          <Animated.View
            style={[styles.modalOverlay, { opacity: avatarOverlayOpacity }]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => closeAvatarSheet()}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: avatarTranslateY }] },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose Avatar</Text>
              <Text style={styles.sheetSubtitle}>
                Select a persona for your profile
              </Text>
            </View>

            <View style={styles.avatarGrid}>
              {[
                "https://i.pravatar.cc/150?img=12",
                "https://i.pravatar.cc/150?img=5",
                "https://i.pravatar.cc/150?img=3",
                "https://i.pravatar.cc/150?img=9",
                "https://i.pravatar.cc/150?img=60",
                "https://i.pravatar.cc/150?img=68",
              ].map((uri, idx) => {
                const isSelected = profileState?.avatar === uri;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      closeAvatarSheet(() => {
                        dispatch(setAvatar(uri));
                      });
                    }}
                    activeOpacity={0.8}
                    style={[
                      styles.avatarOption,
                      isSelected && styles.avatarOptionSelected,
                    ]}
                  >
                    <Image source={{ uri }} style={styles.avatarImage} />
                    {isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => closeAvatarSheet()}
            >
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </Modal>
        {/* EDIT PROFILE MODAL */}
        <Modal
          transparent
          visible={showEditProfileModal}
          animationType="none"
          onRequestClose={() => closeEditProfileSheet()}
        >
          <Animated.View
            style={[
              styles.modalOverlay,
              { opacity: editProfileOverlayOpacity },
            ]}
          >
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              onPress={() => closeEditProfileSheet()}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: editProfileTranslateY }] },
            ]}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Profile</Text>
              <Text style={styles.sheetSubtitle}>
                Update your personal details
              </Text>
            </View>

            <View style={{ alignItems: "center", marginBottom: 24 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowAvatarModal(true);
                }}
                style={{ position: "relative" }}
              >
                <Image
                  source={{
                    uri:
                      profileState?.avatar ||
                      "https://i.pravatar.cc/150?img=12",
                  }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
                <View
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    backgroundColor: Colors.primary,
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 2,
                    borderColor: Colors.card,
                  }}
                >
                  <Ionicons name="camera" size={14} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ width: "100%", marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={tempName}
                onChangeText={(text) => {
                  if (/[^a-zA-Z\s]/.test(text)) {
                    setIsNameWarningVisible(true);
                    setTimeout(() => setIsNameWarningVisible(false), 3000);
                  }
                  // Allow only letters and spaces
                  const val = text.replace(/[^a-zA-Z\s]/g, "");
                  setTempName(val);
                }}
                placeholder="Enter your name"
                placeholderTextColor={Colors.textSecondary}
              />
              {isNameWarningVisible && (
                <Text style={styles.warningText}>
                  Only letters and spaces are allowed
                </Text>
              )}
            </View>

            <View style={{ width: "100%", marginBottom: 20 }}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <View
                style={[
                  styles.textInput,
                  {
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: Colors.background, // clearly disabled/read-only look
                    opacity: 0.7,
                  },
                ]}
              >
                <Text style={{ color: Colors.text, marginRight: 8 }}>+91</Text>
                <View
                  style={{
                    width: 1,
                    height: 16,
                    backgroundColor: Colors.textSecondary,
                    marginRight: 8,
                  }}
                />
                <Text style={{ color: Colors.textSecondary, fontSize: 16 }}>
                  {userData?.phone || profileState?.phone || ""}
                </Text>
              </View>
            </View>

            <View style={styles.logoutActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => closeEditProfileSheet()}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.logoutText}>Save Changes</Text>
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
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <View style={[styles.iconBox, danger && styles.dangerIconBox]}>
      <Ionicons
        name={icon}
        size={20}
        color={danger ? Colors.error : Colors.text}
      />
    </View>
    <View style={styles.rowContent}>
      <Text style={[styles.rowTitle, danger && styles.dangerText]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    backgroundColor: Colors.card,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  profileSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dangerIconBox: {
    backgroundColor: "rgba(239, 68, 68, 0.1)", // Red tint
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  dangerText: {
    color: Colors.error,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  logoutTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  logoutSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  logoutActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  logoutBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000", // Maintain black text on primary button
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
  },
  gridAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: Colors.border,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  warningText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
