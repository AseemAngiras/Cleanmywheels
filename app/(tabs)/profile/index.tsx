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

import { RootState } from "@/store";
import { useSelector } from "react-redux";
import { useUpdateProfileMutation } from "../../../store/api/authApi";
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
  const editProfileTranslateY = useRef(new Animated.Value(height)).current;
  const editProfileOverlayOpacity = useRef(new Animated.Value(0)).current;

  const [updateUserProfileAPI] = useUpdateProfileMutation();

  const userState = useSelector((state: RootState) => state.user);
  const userData = userState.user;
  const isAdmin = userData?.accountType === "Super Admin";

  const profileState = useSelector((state: RootState) => state.profile);
  const savedAddresses = profileState?.addresses || [];

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color="#111" />
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
                uri: profileState?.avatar || "https://i.pravatar.cc/150?img=12",
              }}
              style={styles.avatar}
            />
            {/* Edit badge */}
            <View
              style={{
                position: "absolute",
                bottom: -2,
                right: 8,
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: 2,
              }}
            >
              <Ionicons name="pencil-sharp" size={12} color="#111" />
            </View>
          </TouchableOpacity>
          <View>
            <TouchableOpacity onPress={() => setShowEditProfileModal(true)}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={styles.profileName}>
                  {profileState?.name || userData?.name || "Your Name"}
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color="#777"
                    style={{ marginLeft: 6 }}
                  />
                </Text>
                {/* Premium Badge */}
                {isPremiumUser && (
                  <View
                    style={{
                      backgroundColor: "#D1F803",
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
              {profileState?.phone || userData?.phone || "Phone number"}
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
              color: "#1a1a1a",
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
          <Row
            icon="alert-circle-outline"
            title="Complaints & Refunds"
            subtitle="View user tickets and refund requests"
            onPress={() => router.push("/(tabs)/home")}
          />
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
                borderBottomColor: "#f0f0f0",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
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
                <Ionicons name="add-circle" size={18} color="#84c95c" />
                <Text style={{ color: "#84c95c", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>
            {savedAddresses.length === 0 ? (
              <View style={{ padding: 16 }}>
                <Text style={{ color: "#888" }}>No addresses saved yet.</Text>
              </View>
            ) : (
              <View>
                <TouchableOpacity
                  style={[
                    styles.addressRow,
                    { borderBottomWidth: isAddressDropdownOpen ? 1 : 0 },
                  ]}
                  onPress={() =>
                    setIsAddressDropdownOpen(!isAddressDropdownOpen)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.iconBox}>
                    <Ionicons name="location" size={18} color="#1a1a1a" />
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
                    name={isAddressDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                {/* Dropdown List */}
                {isAddressDropdownOpen && (
                  <View style={{ backgroundColor: "#F9F9F9" }}>
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
                                  ? "#F0FDF4"
                                  : "#F9F9F9",
                                borderBottomWidth: isExpanded ? 0 : 1,
                              },
                            ]}
                            activeOpacity={0.7}
                            onPress={() => {
                              setExpandedAddressId(isExpanded ? null : addr.id);
                            }}
                          >
                            <View
                              style={[
                                styles.iconBox,
                                {
                                  backgroundColor: isDefault
                                    ? "#DCFCE7"
                                    : "#EEEEEE",
                                },
                              ]}
                            >
                              <Ionicons
                                name={
                                  isDefault ? "checkmark" : "location-outline"
                                }
                                size={16}
                                color={isDefault ? "#166534" : "#666"}
                              />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text
                                style={[
                                  styles.rowTitle,
                                  isDefault && { color: "#166534" },
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
                              name={isExpanded ? "chevron-up" : "chevron-down"}
                              size={16}
                              color="#999"
                            />
                          </TouchableOpacity>

                          {/* ACTIONS ROW (Visible if expanded) */}
                          {isExpanded && (
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: isDefault
                                  ? "#F0FDF4"
                                  : "#F9F9F9",
                                paddingLeft: 60,
                                paddingBottom: 12,
                                paddingRight: 16,
                                gap: 16,
                                borderBottomWidth: 1,
                                borderBottomColor: "#f0f0f0",
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
                                    color="#166534"
                                  />
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      color: "#166534",
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
                                        onPress: () => {
                                          dispatch(removeAddresses(addr.id));
                                          setExpandedAddressId(null);
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
              icon="star-outline"
              title="My Subscription"
              subtitle="Manage your premium plan"
              onPress={() => router.push("/subscription/plans")}
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
      <Modal transparent visible={showLogout} animationType="none">
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
      <Modal transparent visible={showAvatarModal} animationType="none">
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
      <Modal transparent visible={showEditProfileModal} animationType="none">
        <Animated.View
          style={[styles.modalOverlay, { opacity: editProfileOverlayOpacity }]}
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
                    profileState?.avatar || "https://i.pravatar.cc/150?img=12",
                }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#84c95c",
                  padding: 6,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: "#FFF",
                }}
              >
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your name"
            />
          </View>

          <View style={{ marginBottom: 24 }}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View
              style={[
                styles.textInput,
                { backgroundColor: "#f0f0f0", justifyContent: "center" },
              ]}
            >
              <Text style={{ color: "#888" }}>
                {profileState?.phone ||
                  userData?.phone ||
                  userState?.user?.phone ||
                  "N/A"}
              </Text>
              <Ionicons
                name="lock-closed"
                size={16}
                color="#aaa"
                style={{ position: "absolute", right: 12 }}
              />
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
  );
}

const Row = ({
  icon,
  title,
  subtitle,
  danger,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  danger?: boolean;
  onPress?: () => void;
}) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowLeft}>
      <Ionicons
        name={icon}
        size={20}
        color={danger ? "#E53935" : "#111"}
        style={styles.rowIcon}
      />
      <View>
        <Text style={[styles.rowTitle, danger && { color: "#E53935" }]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
    </View>

    <Ionicons name="chevron-forward" size={18} color="#999" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F7",
    paddingHorizontal: 16,
    // paddingTop: 30,
    marginTop: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "500",
  },
  moreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
  },
  profileSubtitle: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    padding: 20,
    paddingBottom: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  logoutTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  logoutSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  logoutActions: {
    flexDirection: "row",
    gap: 12,
  },
  logoutBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#B6E388",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#C8F000",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "500",
    color: "#111",
  },
  logoutText: {
    fontWeight: "600",
    color: "#111",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sheetHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30,
  },
  avatarOption: {
    padding: 3,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "transparent",
  },
  avatarOptionSelected: {
    borderColor: "#84c95c",
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0f0f0",
  },
  checkmarkBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#84c95c",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  closeBtn: {
    backgroundColor: "#F3F4F7",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
    marginBottom: 6,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
  },
});
