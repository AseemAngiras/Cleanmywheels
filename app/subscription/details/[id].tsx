import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

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
        <ActivityIndicator size="large" color={Colors.primary} />
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
            {(() => {
              const uniqueAddonsMap = new Map();
              item.addons.forEach((addon: any) => {
                uniqueAddonsMap.set(addon.name, addon);
              });
              const uniqueAddons = Array.from(uniqueAddonsMap.values());

              return uniqueAddons.map((addon: any, idx: number) => (
                <View key={String(idx)} style={styles.addonRow}>
                  <Ionicons
                    name="add-circle-outline"
                    size={16}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.addonText}>
                    {addon.name} - ₹{addon.price}
                  </Text>
                </View>
              ));
            })()}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScreenWrapper style={styles.container} backgroundColor={Colors.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Details</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.carRow}>
          <View style={styles.iconBox}>
            <Ionicons name="car-sport" size={24} color={Colors.black} />
          </View>
          <View>
            <Text style={styles.vehicleType}>
              {subscription.vehicle?.brand || "Vehicle"}
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: Colors.text },

  summaryCard: {
    margin: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  carRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  vehicleType: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  vehicleNo: { fontSize: 14, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 16 },
  statRow: { flexDirection: "row", justifyContent: "space-between" },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: "600", color: Colors.text },

  sectionTitle: {
    marginLeft: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 16,
  },

  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  logCard: { flexDirection: "row", marginBottom: 0 },
  logLeft: { alignItems: "center", marginRight: 16, width: 20 },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border,
    zIndex: 2,
  },
  dotActive: { backgroundColor: Colors.primary },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },

  logContent: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  logDate: { fontSize: 14, fontWeight: "bold", color: Colors.text },
  statusTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  bgGreen: { backgroundColor: "rgba(76, 175, 80, 0.1)" },
  bgGrey: { backgroundColor: Colors.background },
  statusText: { fontSize: 10, fontWeight: "bold", color: Colors.text },
  serviceName: { fontSize: 16, color: Colors.text, fontWeight: "500" },

  addonsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  addonsLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6 },
  addonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  addonText: { fontSize: 13, color: Colors.text },
});
