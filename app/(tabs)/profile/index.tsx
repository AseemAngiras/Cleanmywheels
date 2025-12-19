import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router"; // <-- corrected import
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProfileHome() {

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
            <Text style={styles.profileName}>Mr. Abel Tesfaye</Text>
            <Text style={styles.profileSubtitle}>Chandigarh</Text>
          </View>
        </View>

        {/* <TouchableOpacity style={styles.editButton}>
          <Ionicons name="pencil" size={16} color="#111" />
        </TouchableOpacity> */}
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
        <Row
          icon="settings-outline"
          title="Settings"
          // onPress={() => router.push("/settings")}
        />
      </View>

      {/* SUPPORT CARD */}
      <View style={styles.card}>
        <Row
          icon="shield-checkmark-outline"
          title="Privacy Policy"
          onPress={() => router.push("/profile/privacy-settings")}
        />
        <Row
          icon="call-outline"
          title="Contact Us"
          // onPress={() => router.push("/contact-us")}
        />
        <Row
          icon="help-circle-outline"
          title="Get Help"
          // onPress={() => router.push("/get-help")}
        />
        <Row
          icon="log-out-outline"
          title="Log out"
          danger
          onPress={() => {
            // router.push("/logout");
          }}
        />
      </View>
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
  onPress?: () => void;  // <-- added onPress prop
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

  /* HEADER */
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

  /* PROFILE CARD */
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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

  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F1F1",
    justifyContent: "center",
    alignItems: "center",
  },

  /* CARDS */
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 16,
    paddingVertical: 4,
  },

  /* ROW */
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
});
