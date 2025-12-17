import { Slot, usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BookingsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const isUpcoming = pathname.includes("upcoming");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

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
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#EFEFEF",
    borderRadius: 25,
    marginHorizontal: 16,
    padding: 4,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 20,
  },
  activeToggle: {
    backgroundColor: "#fff",
  },
  activeText: {
    fontWeight: "700",
  },
  inactiveText: {
    color: "#777",
  },
});
