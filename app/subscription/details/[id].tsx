import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";

export default function SubscriptionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: subscriptions, isLoading } =
    useGetMySubscriptionQuery(undefined);

  const subscription = useMemo(() => {
    if (!subscriptions) return null;
    return Array.isArray(subscriptions)
      ? subscriptions.find((s: any) => s._id === id)
      : (subscriptions as any)._id === id
        ? subscriptions
        : null;
  }, [subscriptions, id]);

  const dailyLogs = useMemo(() => {
    if (!subscription) return [];

    const history = (subscription as any).serviceHistory || [];
    const addons = subscription.nextServiceAddons || [];
    const logs: any[] = [];
    const startDate = new Date(subscription.startDate);

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const historyEntry = history.find(
        (h: any) => new Date(h.date).toDateString() === date.toDateString(),
      );

      let status = "Scheduled";
      if (historyEntry) {
        status = "Completed";
      } else if (
        date < new Date() &&
        date.toDateString() !== new Date().toDateString()
      ) {
        status = "Skipped";
      }

      logs.push({
        id: `log-${i}`,
        day: i + 1,
        date: date,
        status: status,
        addons: [],
      });
    }

    addons.forEach((addon: any) => {
      let log;
      if (addon.serviceDate) {
        const sDate = new Date(addon.serviceDate).toDateString();
        log = logs.find((l) => l.date.toDateString() === sDate);
      } else {
        const addedDate = new Date(addon.dateAdded).toDateString();
        log = logs.find((l) => l.date.toDateString() === addedDate);
      }

      if (log) {
        log.addons.push(addon);
      }
    });

    const sortedLogs = logs.sort((a, b) => a.date.getTime() - b.date.getTime());
    const nextService = sortedLogs.find((l) => l.status === "Scheduled");

    if (nextService) {
      nextService.isNext = true;
    }

    return sortedLogs.sort((a, b) => a.date.getTime() - b.date.getTime()); // Return Oldest first for display
  }, [subscription]);

  if (isLoading || !subscription) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#D1F803" />
      </View>
    );
  }

  const renderLogItem = ({ item }: { item: any }) => (
    <View style={styles.logCard}>
      <View style={styles.logLeft}>
        <View
          style={[
            styles.timelineDot,
            (item.status === "Completed" || item.isNext) && styles.dotActive,
          ]}
        />
        <View style={styles.timelineLine} />
      </View>
      <View style={styles.logContent}>
        <View style={styles.logHeader}>
          <Text style={styles.logDate}>{item.date.toDateString()}</Text>
          <View
            style={[
              styles.statusTag,
              item.status === "Completed" ? styles.bgGreen : styles.bgGrey,
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.serviceName}>Daily Wash Service</Text>

        {item.addons && item.addons.length > 0 && (
          <View style={styles.addonsContainer}>
            <Text style={styles.addonsLabel}>Add-ons Purchased:</Text>
            {item.addons.map((addon: any, idx: number) => (
              <View key={idx} style={styles.addonRow}>
                <Ionicons name="add-circle-outline" size={16} color="#444" />
                <Text style={styles.addonText}>
                  {addon.name} - ₹{addon.price}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Details</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.carRow}>
          <View style={styles.iconBox}>
            <Ionicons name="car-sport" size={24} color="#000" />
          </View>
          <View>
            <Text style={styles.vehicleType}>
              {subscription.vehicle?.vehicleType || "Vehicle"}
            </Text>
            <Text style={styles.vehicleNo}>
              {subscription.vehicle?.vehicleNo || "No Number"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <View>
            <Text style={styles.statLabel}>Plan</Text>
            <Text style={styles.statValue}>
              {subscription.plan?.name || "Monthly"}
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Expiring On</Text>
            <Text style={styles.statValue}>
              {new Date(subscription.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Service History</Text>

      <FlatList
        data={dailyLogs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1a1a1a" },

  summaryCard: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  carRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1F803",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  vehicleType: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
  vehicleNo: { fontSize: 14, color: "#666" },
  divider: { height: 1, backgroundColor: "#eee", marginBottom: 16 },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statLabel: { fontSize: 12, color: "#888", marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },

  sectionTitle: {
    marginLeft: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 16,
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  logCard: { flexDirection: "row", marginBottom: 0 },
  logLeft: { alignItems: "center", marginRight: 16, width: 20 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ddd",
    zIndex: 2,
  },
  dotActive: { backgroundColor: "#D1F803" },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },

  logContent: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  logDate: { fontSize: 14, fontWeight: "bold", color: "#444" },
  statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  bgGreen: { backgroundColor: "#eaffea" },
  bgGrey: { backgroundColor: "#f0f0f0" },
  statusText: { fontSize: 10, fontWeight: "bold", color: "#333" },
  serviceName: { fontSize: 16, color: "#1a1a1a", fontWeight: "500" },

  addonsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  addonsLabel: { fontSize: 12, color: "#888", marginBottom: 6 },
  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  addonText: { fontSize: 13, color: "#1a1a1a" },
});
