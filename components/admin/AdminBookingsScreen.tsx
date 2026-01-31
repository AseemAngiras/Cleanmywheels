import { RootState } from "@/store";
import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useAssignWorkerAndNotifyMutation,
} from "@/store/api/bookingApi";
import { useGetAllSubscriptionsQuery } from "@/store/api/subscriptionApi";
import { useGetWorkersQuery } from "@/store/api/workerApi";
import { Ionicons } from "@expo/vector-icons";
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
import { useSelector } from "react-redux";
import BookingDetailsModal from "./BookingDetailsModal";

const formatTime = (hour: number): string => {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  if (hour < 12) return `${hour}:00 AM`;
  return `${hour - 12}:00 PM`;
};

const mapBookingToUI = (booking: any) => {
  const serviceName =
    booking.serviceName ||
    booking.washPackage?.name ||
    (typeof booking.washPackage === "string"
      ? null
      : booking.washPackage?.name) ||
    "Unknown Service";

  return {
    id: booking._id,
    customerName: booking.user?.name || "Customer",
    time: formatTime(booking.bookingTime),
    status: booking.status?.toUpperCase() || "PENDING",
    car: `${booking.vehicleType || booking.vehicle?.type || "Car"} (${
      booking.vehicleNo || booking.vehicle?.number || "N/A"
    })`,
    license: booking.vehicleNo || booking.vehicle?.number || "N/A",
    service: serviceName,
    avatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
    phone: booking.user?.phone ? `${booking.user.phone}` : "",
    address: booking.locality
      ? `${booking.houseOrFlatNo || ""}, ${booking.locality}, ${
          booking.city || ""
        }`.replace(/^, /, "")
      : booking.address?.locality
        ? `${booking.address.houseOrFlatNo || ""}, ${booking.address.locality}`
        : "Address not provided",
    price: booking.price,
    bookingDate: booking.bookingDate,
    bookingTime: booking.bookingTime,
    workerId: booking.worker?._id || booking.worker,
  };
};

const parseSubTimeSlotToHour = (slot: string): number | null => {
  if (!slot) return null;
  // Format: "9 AM - 10 AM" or "6 PM - 7 PM"
  const startPart = slot.split("-")[0].trim();
  const [time, modifier] = startPart.split(" ");
  let hour = parseInt(time, 10);
  if (modifier === "PM" && hour < 12) hour += 12;
  if (modifier === "AM" && hour === 12) hour = 0;
  return hour;
};

export default function AdminBookingsScreen() {
  const [filter, setFilter] = useState("All");
  const [workerModalVisible, setWorkerModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { data: workersData } = useGetWorkersQuery({});
  const workers = workersData?.workers || [];

  const { data: subsData } = useGetAllSubscriptionsQuery({
    page: 1,
    perPage: 1000,
    status: "active",
  });
  const allActiveSubs = subsData?.subscriptions || [];

  const {
    data: bookingsResponse,
    isLoading,
    error,
    refetch,
  } = useGetBookingsQuery({ page: 1, perPage: 100 });
  const [updateBookingStatus, { isLoading: isUpdatingStatus }] =
    useUpdateBookingStatusMutation();

  const [assignWorkerAndNotify] = useAssignWorkerAndNotifyMutation();

  const bookingList = bookingsResponse?.data?.bookingList || [];
  const bookings = bookingList.map((booking: any) => mapBookingToUI(booking));

  const filteredBookings = bookings.filter(
    (booking: ReturnType<typeof mapBookingToUI>) => {
      if (filter === "All")
        return (
          booking.status === "PENDING" ||
          booking.status === "IN-PROGRESS" ||
          booking.status === "CONFIRMED" ||
          booking.status === "COMPLETED"
        );
      if (filter === "Completed") return booking.status === "COMPLETED";
      if (filter === "Pending") return booking.status === "PENDING";
      return true;
    },
  );

  const availableWorkers = workers.filter((worker: any) => {
    if (!selectedBooking) return true;

    const isBusyWithBooking = bookingList.some((b: any) => {
      if (b._id === selectedBooking.id) return false;

      const status = b.status?.toUpperCase();
      const isActive = ["PENDING", "IN-PROGRESS", "CONFIRMED"].includes(status);
      if (!isActive) return false;

      const bDateStr = new Date(b.bookingDate).toDateString();
      const sDateStr = new Date(selectedBooking.bookingDate).toDateString();
      const sameDate = bDateStr === sDateStr;
      const sameTime = b.bookingTime === selectedBooking.bookingTime;
      const bWorkerId = b.worker?._id || b.worker;
      const sameWorker = bWorkerId === worker._id;

      return sameDate && sameTime && sameWorker;
    });

    if (isBusyWithBooking) return false;

    // 2. Check for Subscription Overlaps (New)
    const isBusyWithSubscription = allActiveSubs.some((sub: any) => {
      const subWorkerId = sub.worker?._id || sub.worker;
      if (!subWorkerId || subWorkerId !== worker._id) return false;

      // Check if current booking date falls within subscription range
      const bDate = new Date(selectedBooking.bookingDate);
      const subStart = new Date(sub.startDate);
      const subEnd = new Date(sub.endDate);

      // Reset hours to compare dates only
      bDate.setHours(0, 0, 0, 0);
      subStart.setHours(0, 0, 0, 0);
      subEnd.setHours(0, 0, 0, 0);

      const inDateRange = bDate >= subStart && bDate <= subEnd;
      if (!inDateRange) return false;

      // Check for time slot overlap
      const subStartHour = parseSubTimeSlotToHour(sub.timeSlot);
      const isOverlap = subStartHour === selectedBooking.bookingTime;

      return isOverlap;
    });

    return !isBusyWithSubscription;
  });

  const handleAssignWorker = async (worker: any) => {
    setWorkerModalVisible(false);

    Alert.alert(
      "Confirm Assignment",
      `Assign ${worker.name} to ${selectedBooking?.customerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm & Notify",
          onPress: async () => {
            try {
              await assignWorkerAndNotify({
                bookingId: selectedBooking.id,
                workerId: worker._id,
              }).unwrap();
              Alert.alert("Success", "Worker assigned and notifications sent!");
              refetch();
            } catch (err) {
              console.error("Failed to assign worker:", err);
              Alert.alert(
                "Error",
                "Failed to assign worker. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const handleMarkComplete = async (
    booking: ReturnType<typeof mapBookingToUI>,
  ) => {
    Alert.alert(
      "Mark as Complete",
      `Mark this booking for ${booking.customerName} as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          onPress: async () => {
            try {
              await updateBookingStatus({
                id: booking.id,
                status: "Completed",
              }).unwrap();
              Alert.alert("Success", "Booking marked as completed!");
              refetch();
            } catch (err) {
              console.error("Failed to mark complete:", err);
              Alert.alert("Error", "Failed to update booking status.");
            }
          },
        },
      ],
    );
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { backgroundColor: "#dcfce7", borderColor: "#86efac" };
      case "PENDING":
      case "IN-PROGRESS":
        return { backgroundColor: "#fef9c3", borderColor: "#fde047" };
      default:
        return { backgroundColor: "#e8f5e9", borderColor: "#a5d6a7" }; // CONFIRMED
    }
  };

  const renderCard = ({
    item,
  }: {
    item: ReturnType<typeof mapBookingToUI>;
  }) => {
    const isAssigned =
      item.status === "PENDING" || item.status === "IN-PROGRESS";
    const isCompleted = item.status === "COMPLETED";

    return (
      <TouchableOpacity
        style={adminStyles.card}
        activeOpacity={0.9}
        onPress={() => {
          setSelectedBooking(item);
          setDetailsModalVisible(true);
        }}
      >
        <View style={adminStyles.cardHeader}>
          <View style={adminStyles.userInfo}>
            <Image source={{ uri: item.avatar }} style={adminStyles.avatar} />
            <View>
              <Text style={adminStyles.userName}>{item.customerName}</Text>
              <View style={adminStyles.timeRow}>
                <Ionicons name="calendar-outline" size={12} color="#007BFF" />
                <Text style={adminStyles.timeText}>
                  {new Date(item.bookingDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  {" • "}
                  {item.time}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={[adminStyles.statusBadge, getStatusBadgeStyle(item.status)]}
          >
            <View
              style={[
                adminStyles.statusDot,
                isCompleted && { backgroundColor: "#22c55e" },
                isAssigned && { backgroundColor: "#eab308" },
              ]}
            />
            <Text style={adminStyles.statusText}>{item.status}</Text>
          </View>
        </View>

        <View style={adminStyles.detailsContainer}>
          <View style={adminStyles.detailRow}>
            <Ionicons
              name="car-sport-outline"
              size={16}
              color="#666"
              style={adminStyles.detailIcon}
            />
            <View>
              <Text style={adminStyles.detailTitle}>{item.car}</Text>
              <Text style={adminStyles.detailSub}>{item.license}</Text>
            </View>
          </View>
          <View style={[adminStyles.detailRow, { marginTop: 12 }]}>
            <Ionicons
              name="water-outline"
              size={16}
              color="#666"
              style={adminStyles.detailIcon}
            />
            <Text style={adminStyles.detailTitle}>{item.service}</Text>
          </View>
          <View style={[adminStyles.detailRow, { marginTop: 12 }]}>
            <Ionicons
              name="location-outline"
              size={16}
              color="#666"
              style={adminStyles.detailIcon}
            />
            <Text
              style={[adminStyles.detailTitle, { flex: 1 }]}
              numberOfLines={2}
            >
              {item.address}
            </Text>
          </View>
          {item.phone && (
            <TouchableOpacity
              style={[adminStyles.detailRow, { marginTop: 12 }]}
              onPress={() => {
                const phoneUrl = `tel:+${item.phone}`;
                Linking.openURL(phoneUrl).catch(() =>
                  Alert.alert("Error", "Could not open dialer"),
                );
              }}
            >
              <Ionicons
                name="call-outline"
                size={16}
                color="#007BFF"
                style={adminStyles.detailIcon}
              />
              <Text style={[adminStyles.detailTitle, { color: "#007BFF" }]}>
                +{item.phone}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!isAssigned && !isCompleted && (
          <TouchableOpacity
            style={[adminStyles.whatsappButton, { backgroundColor: "#1a1a1a" }]}
            onPress={() => {
              setSelectedBooking(item);
              setWorkerModalVisible(true);
            }}
          >
            <Ionicons name="person-add" size={18} color="#fff" />
            <Text style={adminStyles.whatsappButtonText}>Assign Worker</Text>
          </TouchableOpacity>
        )}

        {isAssigned && (
          <TouchableOpacity
            style={[adminStyles.whatsappButton, { backgroundColor: "#22c55e" }]}
            onPress={() => handleMarkComplete(item)}
            disabled={isUpdatingStatus}
          >
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={adminStyles.whatsappButtonText}>
              {isUpdatingStatus ? "Updating..." : "Mark Complete"}
            </Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View
            style={[adminStyles.whatsappButton, { backgroundColor: "#e5e7eb" }]}
          >
            <Ionicons name="checkmark-done" size={18} color="#6b7280" />
            <Text
              style={[adminStyles.whatsappButtonText, { color: "#6b7280" }]}
            >
              Completed
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={adminStyles.container}>
      <View style={adminStyles.titleHeader}>
        <Text style={adminStyles.titleText}>Bookings Management</Text>
      </View>

      <View style={adminStyles.filterContainer}>
        {["All", "Pending", "Completed"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              adminStyles.filterTab,
              filter === f && adminStyles.activeFilterTab,
            ]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                adminStyles.filterText,
                filter === f && adminStyles.activeFilterText,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={adminStyles.emptyContainer}>
          <ActivityIndicator size="large" color="#1a1a1a" />
          <Text style={[adminStyles.emptyText, { marginTop: 10 }]}>
            Loading bookings...
          </Text>
        </View>
      ) : error ? (
        <View style={adminStyles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#ff6b6b" />
          <Text
            style={[adminStyles.emptyText, { marginTop: 10, color: "#ff6b6b" }]}
          >
            Failed to load bookings
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              marginTop: 10,
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: "#1a1a1a",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={adminStyles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
          ListEmptyComponent={
            <View style={adminStyles.emptyContainer}>
              <Ionicons name="calendar-outline" size={40} color="#ccc" />
              <Text style={[adminStyles.emptyText, { marginTop: 10 }]}>
                No {filter.toLowerCase()} bookings
              </Text>
            </View>
          }
        />
      )}

      <Modal
        visible={workerModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWorkerModalVisible(false)}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={() => setWorkerModalVisible(false)}
          />
          <View style={styles.workerModalContainer}>
            <View style={styles.workerHeader}>
              <Text style={styles.sheetTitle}>Select Worker</Text>
              <TouchableOpacity onPress={() => setWorkerModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableWorkers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.workerRow}
                  onPress={() => handleAssignWorker(item)}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={styles.workerAvatar}>
                      {item.profileImage ? (
                        <Image
                          source={{ uri: item.profileImage }}
                          style={{ width: 40, height: 40, borderRadius: 20 }}
                        />
                      ) : (
                        <Text style={styles.workerInitials}>
                          {item.name.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <View>
                      <Text style={styles.workerName}>{item.name}</Text>
                      <Text style={styles.workerPhone}>{item.phone}</Text>
                      <Text
                        style={[
                          styles.workerPhone,
                          {
                            fontSize: 10,
                            color: item.status === "Active" ? "green" : "gray",
                          },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.assignBtn}>
                    <Text style={styles.assignBtnText}>Assign</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <BookingDetailsModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        booking={selectedBooking}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropTouchable: { flex: 1 },
  workerModalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    height: "50%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  workerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  workerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  workerInitials: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  workerPhone: {
    fontSize: 12,
    color: "#6B7280",
  },
  assignBtn: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  assignBtnText: {
    color: "#0284c7",
    fontWeight: "600",
    fontSize: 12,
  },
});

const adminStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  titleHeader: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: 0.5,
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 4,
    borderRadius: 30,
    marginVertical: 15,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 25,
  },
  activeFilterTab: {
    backgroundColor: "#1a1a1a",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
  },
  activeFilterText: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#1a1a1a",
  },
  statusText: { fontSize: 10, fontWeight: "700", color: "#1a1a1a" },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIcon: {
    width: 20,
    textAlign: "center",
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  detailSub: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
    paddingVertical: 14,
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#25D366",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
});
