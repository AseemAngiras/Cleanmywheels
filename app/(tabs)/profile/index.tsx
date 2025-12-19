import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

const RADIUS = 46;
const STROKE_WIDTH = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProfileHome() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(
    "https://i.pravatar.cc/150?img=3"
  );

  // 🔥 This will grow dynamically based on user data
  const profileCompletion = 60; // %

  const progressOffset =
    CIRCUMFERENCE - (CIRCUMFERENCE * profileCompletion) / 100;

  const handlePickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required", "Please allow access to your photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      {/* PROFILE CARD */}
      {/* PROFILE CARD */}
<View style={styles.profileCard}>
  {/* LEFT: Avatar + Progress */}
  <View style={styles.avatarContainer}>
    <Svg width={96} height={96}>
      <Circle
        cx="48"
        cy="48"
        r="42"
        stroke="#E6E6E6"
        strokeWidth="6"
        fill="none"
      />
      <Circle
        cx="48"
        cy="48"
        r="42"
        stroke="#6C47FF"
        strokeWidth="6"
        fill="none"
        strokeDasharray={264}
        strokeDashoffset={264 - (264 * 60) / 100}
        strokeLinecap="round"
      />
    </Svg>

    <Image source={{ uri: profileImage }} style={styles.avatar} />

    {/* EDIT */}
    <TouchableOpacity style={styles.editAvatar} onPress={handlePickImage}>
      <Ionicons name="pencil" size={13} color="#000" />
    </TouchableOpacity>

    {/* % BADGE */}
    <View style={styles.percentBadge}>
      <Text style={styles.percentText}>60%</Text>
    </View>
  </View>

  {/* RIGHT: INFO */}
  <View style={styles.infoSection}>
    <Text style={styles.name}>John, 37</Text>

    <View style={styles.chatBadge}>
      <Ionicons name="chatbubble-outline" size={14} color="#111" />
      <Text style={styles.chatText}>Open to chat</Text>
    </View>
  </View>
</View>


      {/* MENU */}
      <View style={styles.menu}>
        <MenuItem
          icon="person-outline"
          title="Edit Personal Details"
          onPress={() => router.push("/profile/edit-profile")}
        />
        <MenuItem
          icon="card-outline"
          title="Payment Methods"
          onPress={() => router.push("/profile/payment-methods")}
        />
        <MenuItem
          icon="notifications-outline"
          title="Notifications"
          onPress={() => router.push("/profile/notifications")}
        />
        <MenuItem
          icon="lock-closed-outline"
          title="Privacy Settings"
          onPress={() => router.push("/profile/privacy-settings")}
        />
        <MenuItem icon="help-circle-outline" title="Help & Support" />
      </View>

      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 2.4.0</Text>
    </View>
  );
}

const MenuItem = ({ title, icon, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuLeft}>
      <Ionicons name={icon} size={20} color="#444" />
      <Text style={styles.menuText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#999" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 80,
    backgroundColor: "#FFF",
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
profileCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F7F6FF",
  borderRadius: 18,
  padding: 18,
  marginBottom: 24,
},

avatarContainer: {
  width: 96,
  height: 96,
  justifyContent: "center",
  alignItems: "center",
},

avatar: {
  position: "absolute",
  width: 72,
  height: 72,
  borderRadius: 36,
},

editAvatar: {
  position: "absolute",
  bottom: 6,
  right: 6,
  backgroundColor: "#6C47FF",
  padding: 6,
  borderRadius: 12,
},

percentBadge: {
  position: "absolute",
  bottom: -6,
  backgroundColor: "#6C47FF",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 14,
},

percentText: {
  color: "#FFF",
  fontSize: 12,
  fontWeight: "600",
},

infoSection: {
  marginLeft: 16,
  flex: 1,
},

name: {
  fontSize: 18,
  fontWeight: "600",
  color: "#111",
  marginBottom: 6,
},

chatBadge: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#EDEDED",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  alignSelf: "flex-start",
},

chatText: {
  marginLeft: 6,
  fontSize: 13,
  color: "#111",
},


  menu: { marginTop: 10 },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuText: {
    fontSize: 16,
    marginLeft: 12,
  },

  logout: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 30,
  },

  logoutText: { color: "red", fontWeight: "600" },

  version: {
    textAlign: "center",
    marginTop: 14,
    color: "#999",
  },
});
