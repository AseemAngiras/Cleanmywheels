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

export default function ProfileHome() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(
    "https://i.pravatar.cc/150?img=3"
  );

  const handlePickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Please allow access to your photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: profileImage }}
            style={styles.avatar}
          />

          {/* PENCIL ICON */}
          <TouchableOpacity
            style={styles.editAvatar}
            onPress={handlePickImage}
          >
            <Ionicons name="pencil" size={14} color="#000" />
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.phone}>+91 98765 43210</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <MenuItem
          title="Edit Personal Details"
          onPress={() => router.push("/profile/edit-profile")}
        />
        <MenuItem
          title="Payment Methods"
          onPress={() => router.push("/profile/payment-methods")}
        />
        <MenuItem
          title="Notifications"
          onPress={() => router.push("/profile/notifications")}
        />
        <MenuItem title="Privacy Settings" />
        <MenuItem title="Help & Support" />
      </View>

      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 2.4.0</Text>
    </View>
  );
}

const MenuItem = ({ title, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={styles.menuText}>{title}</Text>
    <Ionicons name="chevron-forward" size={20} color="#999" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFF" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  profileCard: {
    backgroundColor: "#FFF7E6",
    borderRadius: 20,
    alignItems: "center",
    padding: 24,
    marginBottom: 24,
  },
  avatarWrapper: { position: "relative" },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  editAvatar: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFD400",
    borderRadius: 14,
    padding: 6,
  },
  name: { fontSize: 18, fontWeight: "600", marginTop: 10 },
  phone: { color: "#777", marginTop: 4 },
  menu: { marginTop: 10 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  menuText: { fontSize: 16 },
  logout: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 14,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 30,
  },
  logoutText: { color: "red", fontWeight: "600" },
  version: { textAlign: "center", marginTop: 14, color: "#999" },
});
