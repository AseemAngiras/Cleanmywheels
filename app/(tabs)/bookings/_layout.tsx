import { Slot, usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BookingsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const isUpcoming = pathname.includes("upcoming");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} >
          <Ionicons name="chevron-back" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Bookings</Text>

        <View style={{ width: 26 }} />
      </View>

      {/* Toggle */}
      <View style={styles.toggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, isUpcoming && styles.activeToggle]}
          onPress={() => router.replace("/bookings/upcoming-services")}
        >
          <Text style={isUpcoming ? styles.activeText : styles.inactiveText}>
            Upcoming
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, !isUpcoming && styles.activeToggle]}
          onPress={() => router.replace("/bookings/past-services")}
        >
          <Text style={!isUpcoming ? styles.activeText : styles.inactiveText}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F6",
    paddingTop: 80,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 19,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
  },

  toggle: {
    flexDirection: "row",
    borderRadius: 50,
    marginHorizontal: 16,
    padding: 4,
    marginBottom: 8,
    backgroundColor: "#ffffffff",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: "#000",
  },
  activeText: {
    fontSize: 15,
    color: "#ebebebff",
  },
  inactiveText: {
    color: "#000",
    fontSize: 15,
  },
});

