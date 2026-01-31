import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
} from "@/store/api/bookingApi";
import { useGetWorkersQuery } from "@/store/api/workerApi";

const Colors = {
  primary: "#3b82f6",
};

const AdminBookingScreen = () => {
  const { data, isLoading, refetch } = useGetBookingsQuery({
    page: 1,
    perPage: 50,
  });
  const [updateBooking] = useUpdateBookingStatusMutation();
  const { data: workersData } = useGetWorkersQuery({ page: 1, limit: 100 });

  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isWorkerModalVisible, setWorkerModalVisible] = useState(false);

  const bookings = data?.data?.bookingList || [];
  const workers = workersData?.workers || [];

  const handleAssignWorker = (booking: any) => {
    setSelectedBooking(booking);
    setWorkerModalVisible(true);
  };

  const confirmAssignment = async (worker: any) => {
    if (!selectedBooking) return;

    try {
      await updateBooking({
        id: selectedBooking._id,
        worker: worker._id,
        // Optional: Update status to confirmed if generic
        status: "confirmed",
      }).unwrap();

      Alert.alert("Success", `Assigned ${worker.name} to booking`);
      setWorkerModalVisible(false);
      setSelectedBooking(null);
      refetch();
    } catch (error) {
      Alert.alert("Error", "Failed to assign worker");
    }
  };

  const renderBookingItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.serviceName}>
          {item.washPackage?.name || "Service"}
        </Text>
        <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
          {item.status}
        </Text>
      </View>
      <Text style={styles.detail}>
        Date: {new Date(item.bookingDate).toDateString()}
      </Text>
      <Text style={styles.detail}>Time: {formatTime(item.bookingTime)}</Text>
      <Text style={styles.detail}>Vehicle: {item.vehicleNo || "N/A"}</Text>

      <View style={styles.workerContainer}>
        <Text style={styles.workerLabel}>
          Worker:{" "}
          {item.worker
            ? workers.find((w: any) => w._id === item.worker)?.name ||
              "Assigned"
            : "Unassigned"}
        </Text>
        <TouchableOpacity
          style={styles.assignBtn}
          onPress={() => handleAssignWorker(item)}
        >
          <Text style={styles.assignBtnText}>
            {item.worker ? "Reassign" : "Assign Worker"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No bookings found</Text>
          }
        />
      )}

      {/* Worker Selection Modal */}
      <Modal visible={isWorkerModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Worker</Text>
            <FlatList
              data={workers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.workerItem}
                  onPress={() => confirmAssignment(item)}
                >
                  <Text style={styles.workerName}>{item.name}</Text>
                  <Text
                    style={[
                      styles.workerStatus,
                      { color: item.status === "Busy" ? "orange" : "green" },
                    ]}
                  >
                    {item.status}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setWorkerModalVisible(false)}
            >
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper functions (simplified)
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "green";
    case "pending":
      return "orange";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
};

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const p = h >= 12 ? "PM" : "AM";
  const hd = h % 12 || 12;
  return `${hd}:${m.toString().padStart(2, "0")} ${p}`;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 10 },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  serviceName: { fontSize: 16, fontWeight: "bold" },
  status: { fontWeight: "bold", textTransform: "uppercase" },
  detail: { color: "#555", marginBottom: 5 },
  workerContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  workerLabel: { fontWeight: "600" },
  assignBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  assignBtnText: { color: "white", fontWeight: "bold" },
  emptyText: { textAlign: "center", marginTop: 20, color: "#888" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  workerItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  workerName: { fontSize: 16 },
  workerStatus: { fontSize: 14, fontWeight: "bold" },
  closeBtn: {
    marginTop: 15,
    padding: 10,
    backgroundColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
  },
  closeBtnText: { fontWeight: "bold" },
});

export default AdminBookingScreen;
