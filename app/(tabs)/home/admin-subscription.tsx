import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useGetAllSubscriptionsQuery } from "@/store/api/subscriptionApi";
import { UserSubscription } from "@/types/subscription";

export default function AdminSubscriptionScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(
    undefined,
  );
  const perPage = 20;

  const { data, isLoading, isFetching, refetch } = useGetAllSubscriptionsQuery({
    page,
    perPage,
    status: filterStatus,
  });

  const subscriptions = data?.subscriptions || [];
  const total = data?.total || 0;

  const [selectedSub, setSelectedSub] = useState<UserSubscription | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const openDetails = (sub: UserSubscription) => {
    setSelectedSub(sub);
    setDetailsVisible(true);
  };

  const closeDetails = () => {
    setDetailsVisible(false);
    setSelectedSub(null);
  };

  const renderStatusBadge = (status: string) => {
    let color = "#6B7280";
    let bg = "#F3F4F6";

    switch (status) {
      case "active":
        color = "#10B981";
        bg = "#D1FAE5";
        break;
      case "pending":
        color = "#F59E0B";
        bg = "#FEF3C7";
        break;
      case "expired":
        color = "#EF4444";
        bg = "#FEE2E2";
        break;
      case "cancelled":
        color = "#6B7280";
        bg = "#E5E7EB";
        break;
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusText, { color }]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: UserSubscription }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openDetails(item)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          {/* If user object exists in item (it should from population), use it */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(item as any).user?.name?.charAt(0) || "U"}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>
              {(item as any).user?.name || "Unknown User"}
            </Text>
            <Text style={styles.userPhone}>
              {(item as any).user?.phone || ""}
            </Text>
          </View>
        </View>
        {renderStatusBadge(item.status)}
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Vehicle:</Text>
          <Text style={styles.value}>
            {item.vehicle
              ? `${item.vehicle.brand} ${item.vehicle.model} (${item.vehicle.vehicleNo})`
              : "N/A"}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Plan:</Text>
          <Text style={styles.value}>{item.plan?.name || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Valid Until:</Text>
          <Text style={styles.value}>
            {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Subscription Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage all user subscriptions
          </Text>
        </View>
        <TouchableOpacity onPress={() => refetch()} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filters (Optional - simplified for now) */}
      <View style={styles.filterContainer}>
        {["active", "pending", "expired", undefined].map((status) => (
          <TouchableOpacity
            key={status || "all"}
            style={[
              styles.filterChip,
              filterStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setFilterStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                filterStatus === status && styles.filterTextActive,
              ]}
            >
              {status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : "All"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshing={isFetching}
        onRefresh={refetch}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Ionicons name="documents-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No subscriptions found.</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          isLoading ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#2563EB" />
          ) : null
        }
      />

      {/* Details Modal */}
      <Modal
        visible={detailsVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeDetails}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Subscription Details</Text>
            <TouchableOpacity onPress={closeDetails}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          {selectedSub && (
            <View style={styles.modalContent}>
              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Reference ID</Text>
                <Text style={styles.detailText}>{selectedSub._id}</Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>User Details</Text>
                <Text style={styles.detailText}>
                  Name: {(selectedSub as any).user?.name}
                </Text>
                <Text style={styles.detailText}>
                  Phone: {(selectedSub as any).user?.phone}
                </Text>
                <Text style={styles.detailText}>
                  Email: {(selectedSub as any).user?.email}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Vehicle</Text>
                <Text style={styles.detailText}>
                  {selectedSub.vehicle?.brand} {selectedSub.vehicle?.model}
                </Text>
                <Text style={styles.detailText}>
                  {selectedSub.vehicle?.vehicleNo}
                </Text>
                <Text style={styles.detailText}>
                  Color: {selectedSub.vehicle?.color}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailTitle}>Plan Info</Text>
                <Text style={styles.detailText}>
                  {selectedSub.plan?.name} - ₹{selectedSub.plan?.price} / month
                </Text>
                <Text style={styles.detailText}>
                  Start: {new Date(selectedSub.startDate).toDateString()}
                </Text>
                <Text style={styles.detailText}>
                  End: {new Date(selectedSub.endDate).toDateString()}
                </Text>
                <Text style={styles.detailText}>
                  Services Completed: {selectedSub.servicesCompleted}/
                  {selectedSub.servicesTotal}
                </Text>
              </View>

              <View style={[styles.detailSection, { borderBottomWidth: 0 }]}>
                <Text style={styles.detailTitle}>Assigned Worker</Text>
                <Text style={styles.detailText}>
                  {selectedSub.worker
                    ? selectedSub.worker.name
                    : "Not Assigned"}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  filterChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  filterText: {
    fontSize: 13,
    color: "#4B5563",
  },
  filterTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    padding: 15,
    paddingTop: 0,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 16,
  },
  userName: {
    fontWeight: "600",
    color: "#1F2937",
    fontSize: 15,
  },
  userPhone: {
    fontSize: 12,
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  cardBody: {
    gap: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
  },
  value: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    marginTop: 50,
    gap: 10,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  modalContent: {
    gap: 20,
  },
  detailSection: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 5,
  },
  detailTitle: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 5,
  },
  detailText: {
    fontSize: 16,
    color: "#1F2937",
  },
});
