"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";

import {
  useAssignSubscriptionWorkerMutation,
  useGetAllSubscriptionsQuery,
  useMarkSubscriptionDailyDoneMutation,
} from "../../../store/api/subscriptionApi";

const MOCK_WORKERS = [
  {
    id: "65a000000000000000000001",
    name: "Amit Sharma",
    phone: "+919876543210",
  },
  {
    id: "65a000000000000000000002",
    name: "Rahul Verma",
    phone: "+918765432109",
  },
  {
    id: "65a000000000000000000003",
    name: "Suresh Singh",
    phone: "+917654321098",
  },
  {
    id: "65a000000000000000000004",
    name: "Vikram Yadav",
    phone: "+916543210987",
  },
];

export default function AdminSubscriptionsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState("Requests");
  const [workerModalVisible, setWorkerModalVisible] = useState(false);
  const [selectedSub, setSelectedSub] = useState<any>(null);

  const getStatusQuery = (label: string) => {
    switch (label) {
      case "Requests":
        return "active";
      case "Ongoing":
        return "ongoing";
      default:
        return undefined;
    }
  };

  const {
    data: subsResponse,
    isLoading,
    refetch,
    isFetching,
  } = useGetAllSubscriptionsQuery({
    page: 1,
    perPage: 100,
    status: getStatusQuery(filter),
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const [assignWorker, { isLoading: isAssigning }] =
    useAssignSubscriptionWorkerMutation();

  const subscriptions = subsResponse?.subscriptions || [];

  const handleAssignWorker = async (worker: any) => {
    setWorkerModalVisible(false);
    if (!selectedSub) return;

    Alert.alert(
      "Confirm Assignment",
      `Assign ${worker.name} to ${selectedSub.user?.name}'s subscription?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await assignWorker({
                subscriptionId: selectedSub._id,
                workerId: worker.id,
                workerName: worker.name,
                workerPhone: worker.phone,
              }).unwrap();

              Alert.alert("Success", "Worker assigned successfully!");
              refetch();
            } catch (err: any) {
              if (err?.data?.message) Alert.alert("Error", err.data.message);
              else Alert.alert("Error", "Failed to assign worker.");
            }
          },
        },
      ],
    );
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const [markDailyDone] = useMarkSubscriptionDailyDoneMutation();

  const handleMarkDone = async (id: string) => {
    Alert.alert(
      "Confirm Service",
      "Are you sure you want to mark today's service as done?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await markDailyDone({ subscriptionId: id }).unwrap();
              Alert.alert("Success", "Service marked as done for today!");
              refetch();
            } catch (err) {
              Alert.alert("Error", "Failed to mark service as done.");
            }
          },
        },
      ],
    );
  };

  const handleNotifyWorker = (item: any) => {
    const workerPhone = item.worker?.phone || item.workerPhone;
    if (!workerPhone) return Alert.alert("Error", "Worker phone not found");

    const startDate = new Date(item.startDate);
    const completed = item.servicesCompleted || 0;
    const nextServiceDate = new Date(startDate);
    nextServiceDate.setDate(startDate.getDate() + completed);

    const dateStr = nextServiceDate.toDateString();

    const addons = (item.nextServiceAddons || []).filter((a: any) => {
      if (!a.serviceDate) return true;
      const sDate = new Date(a.serviceDate).toDateString();
      const todayStr = new Date().toDateString();
      return sDate === dateStr || sDate === todayStr;
    });

    const formattedAddons = addons.map((a: any) => `- ${a.name} (Paid)`);
    const addonText =
      addons.length > 0
        ? `\n\n*⭐ Add-ons for Today:*\n${formattedAddons.join("\n")}`
        : "";

    const message = `🚗 *Daily Service Alert*\n\nDate: ${dateStr}\n\nCustomer: ${item.user?.name}\nPhone: ${item.user?.phone}\nAddress: ${item.vehicle?.address?.locality || "As per record"}\nVehicle: ${item.vehicle?.type} (${item.vehicle?.number})${addonText}\n\nPlease proceed with the service.`;

    const url = `whatsapp://send?phone=${workerPhone}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp is not installed");
      }
    });
  };

  const renderCard = ({ item }: { item: any }) => {
    const passedDays = 30 - getDaysRemaining(item.endDate);
    const progress = Math.min(Math.max(passedDays / 30, 0), 1);
    const isAssigned = !!(item.worker || item.workerName);

    const startDate = new Date(item.startDate);
    const completed = item.servicesCompleted || 0;
    const nextServiceDate = new Date(startDate);
    nextServiceDate.setDate(startDate.getDate() + completed);

    const isTodayDone = nextServiceDate > new Date();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {item.user?.name?.charAt(0) || "U"}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>
                {item.user?.name || "Unknown User"}
              </Text>
              <Text style={styles.userPhone}>+91 {item.user?.phone}</Text>
            </View>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.status === "active"
                ? { backgroundColor: "#DCFCE7" }
                : item.status === "ongoing"
                  ? { backgroundColor: "#DBEAFE" }
                  : { backgroundColor: "#F3F4F6" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.status === "active"
                  ? { color: "#166534" }
                  : item.status === "ongoing"
                    ? { color: "#1E40AF" }
                    : { color: "#6B7280" },
              ]}
            >
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Vehicle & Plan Info */}
        <View style={styles.detailsContainer}>
          <Text style={styles.planName}>
            {item.plan?.name || "Subscription Plan"}
          </Text>
          <Text style={styles.vehicleInfo}>
            {item.vehicle?.type || "Car"} - {item.vehicle?.number || "No Plate"}
          </Text>
          <Text style={styles.addressInfo}>
            {item.vehicle?.address?.locality || "Doorstep"}
          </Text>
        </View>

        {/* Next Service Info */}
        {item.status === "ongoing" && (
          <View style={styles.nextServiceRow}>
            <Ionicons name="calendar" size={16} color="#4B5563" />
            <Text style={styles.nextServiceText}>
              Next Service: {nextServiceDate.toDateString()}
            </Text>
          </View>
        )}

        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {item.servicesCompleted}/{item.servicesTotal} Services Done
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${(item.servicesCompleted / item.servicesTotal) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.expiryText}>
            Expires locally in {getDaysRemaining(item.endDate)} days
          </Text>
        </View>

        {/* Worker & Actions */}
        <View style={styles.workerSection}>
          {isAssigned ? (
            <View style={{ gap: 10 }}>
              <View style={styles.assignedRow}>
                <Ionicons name="person-circle" size={20} color="#007BFF" />
                <Text style={styles.assignedText}>
                  Assigned to:{" "}
                  {item.worker?.name || item.workerName || "Worker"}
                </Text>
              </View>

              {/* Notify Worker Button */}
              {item.status === "ongoing" && (
                <TouchableOpacity
                  style={styles.notifyButton}
                  onPress={() => handleNotifyWorker(item)}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                  <Text style={styles.notifyButtonText}>Notify Worker</Text>
                </TouchableOpacity>
              )}

              {/* Mark Done Button for Ongoing */}
              {item.status === "ongoing" && (
                <TouchableOpacity
                  style={styles.markDoneButton}
                  onPress={() => handleMarkDone(item._id)}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.markDoneText}>
                    Mark Today&apos;s Service Done
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => {
                setSelectedSub(item);
                setWorkerModalVisible(true);
              }}
            >
              <Ionicons name="person-add" size={16} color="#fff" />
              <Text style={styles.assignButtonText}>Assign Worker</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Management</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {["Requests", "Ongoing", "All"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.activeFilterTab]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.activeFilterText,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="#1a1a1a"
          style={{ marginTop: 50 }}
        />
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={renderCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No subscriptions found.</Text>
            </View>
          }
        />
      )}

      {/* Worker Modal */}
      <Modal
        visible={workerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWorkerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setWorkerModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Worker</Text>
            {MOCK_WORKERS.map((worker) => (
              <TouchableOpacity
                key={worker.id}
                style={styles.workerRow}
                onPress={() => handleAssignWorker(worker)}
              >
                <View style={styles.workerInitial}>
                  <Text style={{ fontWeight: "bold" }}>
                    {worker.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.workerName}>{worker.name}</Text>
                  <Text style={styles.workerPhone}>{worker.phone}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setWorkerModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  filterRow: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#E5E7EB",
  },
  activeFilterTab: { backgroundColor: "#1a1a1a" },
  filterText: { fontSize: 14, color: "#4B5563" },
  activeFilterText: { color: "#fff", fontWeight: "600" },
  listContent: { padding: 16, gap: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userInfo: { flexDirection: "row", gap: 10, alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "bold", color: "#666" },
  userName: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  userPhone: { fontSize: 12, color: "#6B7280" },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  statusText: { fontSize: 10, fontWeight: "bold" },
  detailsContainer: { marginBottom: 12 },
  planName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  vehicleInfo: { fontSize: 14, color: "#4B5563" },
  addressInfo: { fontSize: 12, color: "#9CA3AF" },
  progressContainer: { marginBottom: 12 },
  progressText: { fontSize: 12, color: "#4B5563", marginBottom: 4 },
  progressBarBg: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 4,
  },
  progressBarFill: { height: "100%", backgroundColor: "#10B981" },
  expiryText: { fontSize: 11, color: "#9CA3AF" },
  workerSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  assignedRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  assignedText: { fontSize: 14, color: "#1a1a1a", fontWeight: "500" },
  assignButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a1a",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  assignButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  emptyState: { alignItems: "center", padding: 40 },
  emptyText: { color: "#9CA3AF" },
  // Modal
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  workerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    gap: 12,
  },
  workerInitial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  workerName: { fontSize: 16, fontWeight: "500" },
  workerPhone: { fontSize: 12, color: "#666" },
  closeBtn: { marginTop: 20, alignItems: "center", padding: 12 },
  closeBtnText: { color: "#EF4444", fontWeight: "600" },
  markDoneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  markDoneText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  nextServiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
    backgroundColor: "#F0F9FF",
    padding: 8,
    borderRadius: 8,
  },
  nextServiceText: { fontSize: 13, color: "#0369A1", fontWeight: "600" },
  notifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#25D366",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  notifyButtonText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
