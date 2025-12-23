import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { logout } from "../../../store/slices/authSlice";

const { height } = Dimensions.get("window");

export default function ProfileHome() {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((state) => state.profile);

  const [showLogout, setShowLogout] = useState(false);
  const translateY = useRef(new Animated.Value(height)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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

  const closeSheet = () => {
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
    ]).start(() => setShowLogout(false));
  };

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/(tabs)/home");
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.moreButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#111" />
        </TouchableOpacity>
        <Text style={styles.header}>Your Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.profileLeft}>
          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=12" }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.profileName}>
              {profile.name || "Your Name"}
            </Text>
            <Text style={styles.profileSubtitle}>
              {profile.phone || "Phone number"}
            </Text>
          </View>
        </View>
      </View>

      {/* ACCOUNT CARD */}
      <View style={styles.card}>
        <Row
          icon="person-outline"
          title="Account Details"
          subtitle="Manage your Account Details"
          onPress={() => router.push("/profile/edit-profile")}
        />
        <Row
          icon="wallet-outline"
          title="Payment Methods"
          subtitle="View your added payments methods"
          onPress={() => router.push("/profile/payment-methods")}
        />
        <Row
          icon="notifications-outline"
          title="Manage Notifications"
          onPress={() => router.push("/profile/notifications")}
        />
        <Row icon="settings-outline" title="Settings" />
      </View>

      {/* SUPPORT CARD */}
      <View style={styles.card}>
        <Row
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          onPress={() => router.push("/profile/privacy-settings")}
        />
        <Row icon="call-outline" title="Contact Us" />
        <Row icon="help-circle-outline" title="Get Help" />
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
            onPress={closeSheet}
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
            <TouchableOpacity style={styles.cancelBtn} onPress={closeSheet}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Yes, Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>
    </View>
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
    paddingTop: 60,
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
});
