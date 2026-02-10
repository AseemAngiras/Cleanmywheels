import { RootState } from "@/store";
import { Ionicons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

export default function BookingsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  if (isAdmin) {
    // Admins get the AdminBookingsScreen via index.tsx, rendered inside this Slot.
    // We return ONLY Slot to avoid wrapping it in the seeker's Header/Layout.
    return <Slot />;
  }

  const isUpcoming = pathname.includes("upcoming");
  const isPast = pathname.includes("past");

  return (
    <ScreenWrapper
      style={styles.container}
      backgroundColor="#f5f5f5"
      statusBarStyle="dark-content"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
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
          style={[styles.toggleBtn, isPast && styles.activeToggle]}
          onPress={() => router.replace("/bookings/past-services")}
        >
          <Text style={isPast ? styles.activeText : styles.inactiveText}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <Slot />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 19,
    paddingTop: 10,
    zIndex: 10,
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
    backgroundColor: "#fff",
    zIndex: 10,
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
    color: "#ebebeb",
  },
  inactiveText: {
    color: "#000",
    fontSize: 15,
  },
});
