import {
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useAssignWorkerAndNotifyMutation,
} from "@/store/api/bookingApi";
import { useGetAllSubscriptionsQuery } from "@/store/api/subscriptionApi";
import { useGetWorkersQuery } from "@/store/api/workerApi";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "@/constants/Colors";

import BookingDetailsModal from "./BookingDetailsModal";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

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

    const isBusyWithSubscription = allActiveSubs.some((sub: any) => {
      const subWorkerId = sub.worker?._id || sub.worker;
      if (!subWorkerId || subWorkerId !== worker._id) return false;

      const bDate = new Date(selectedBooking.bookingDate);
      const subStart = new Date(sub.startDate);
      const subEnd = new Date(sub.endDate);

      bDate.setHours(0, 0, 0, 0);
      subStart.setHours(0, 0, 0, 0);
      subEnd.setHours(0, 0, 0, 0);

      const inDateRange = bDate >= subStart && bDate <= subEnd;
      if (!inDateRange) return false;

      const subStartHour = parseSubTimeSlotToHour(sub.timeSlot);
      return subStartHour === selectedBooking.bookingTime;
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
              Alert.alert("Error", "Failed to update booking status.");
            }
          },
        },
      ],
    );
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
        className="bg-card rounded-[32px] p-5 mb-5 shadow-sm border border-border"
        activeOpacity={0.9}
        onPress={() => {
          setSelectedBooking(item);
          setDetailsModalVisible(true);
        }}
      >
        <View className="flex-row justify-between items-start mb-5">
          <View className="flex-1">
            <Text className="text-[17px] font-[800] color-text mb-1">
              {item.customerName}
            </Text>
            <View className="flex-row items-center">
              <Ionicons
                name="calendar-outline"
                size={13}
                color={Colors.primary}
              />
              <Text className="text-[13px] text-textSecondary font-[600] ml-2">
                {new Date(item.bookingDate).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                })}
                {" • "}
                {item.time}
              </Text>
            </View>
          </View>
          <View
            className={`px-3 py-1.5 rounded-full flex-row items-center border ${
              isCompleted
                ? "bg-green-500/10 border-green-500/20"
                : isAssigned
                  ? "bg-orange-500/10 border-orange-500/20"
                  : "bg-blue-500/10 border-blue-500/20"
            }`}
          >
            <View
              className={`w-1.5 h-1.5 rounded-full mr-2 ${
                isCompleted
                  ? "bg-green-500"
                  : isAssigned
                    ? "bg-orange-500"
                    : "bg-blue-500"
              }`}
            />
            <Text
              className={`text-[10px] font-[900] uppercase tracking-wider ${
                isCompleted
                  ? "text-green-500"
                  : isAssigned
                    ? "text-orange-500"
                    : "text-blue-500"
              }`}
            >
              {item.status}
            </Text>
          </View>
        </View>

        <View className="bg-background/50 p-4 rounded-2xl border border-border/50 mb-5 gap-3">
          <View className="flex-row items-center">
            <Ionicons
              name="car-sport-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <View className="ml-3">
              <Text className="text-sm font-[700] color-text">{item.car}</Text>
              <Text className="text-[11px] color-textSecondary font-[500] uppercase tracking-tighter">
                Plate: {item.license}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Ionicons
              name="sparkles-outline"
              size={16}
              color={Colors.textSecondary}
            />
            <Text className="text-sm font-[600] color-textSecondary ml-3">
              {item.service}
            </Text>
          </View>

          <View className="flex-row items-start">
            <Ionicons
              name="location-outline"
              size={16}
              color={Colors.textSecondary}
              className="mt-0.5"
            />
            <Text
              className="text-sm font-[600] color-textSecondary ml-3 flex-1 leading-5"
              numberOfLines={2}
            >
              {item.address}
            </Text>
          </View>
        </View>

        {item.phone && (
          <TouchableOpacity
            className="flex-row items-center mb-5 px-1"
            onPress={() => {
              const phoneUrl = `tel:+${item.phone}`;
              Linking.openURL(phoneUrl).catch(() =>
                Alert.alert("Error", "Could not open dialer"),
              );
            }}
          >
            <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center mr-3 border border-blue-500/20">
              <Ionicons name="call" size={14} color="#3B82F6" />
            </View>
            <Text className="text-sm font-[700] color-blue-500">
              +91 {item.phone}
            </Text>
          </TouchableOpacity>
        )}

        {!isAssigned && !isCompleted && (
          <TouchableOpacity
            className="bg-primary py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-primary/30"
            onPress={() => {
              setSelectedBooking(item);
              setWorkerModalVisible(true);
            }}
          >
            <Ionicons
              name="person-add"
              size={18}
              color="#000"
              className="mr-2"
            />
            <Text className="text-black font-[800] text-[15px]">
              Assign Professional
            </Text>
          </TouchableOpacity>
        )}

        {isAssigned && (
          <TouchableOpacity
            className="bg-green-500 py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-green-500/30"
            onPress={() => handleMarkComplete(item)}
            disabled={isUpdatingStatus}
          >
            <Ionicons
              name="checkmark-circle"
              size={18}
              color="#fff"
              className="mr-2"
            />
            <Text className="text-white font-[800] text-[15px]">
              {isUpdatingStatus ? "Updating..." : "Mark Complete"}
            </Text>
          </TouchableOpacity>
        )}

        {isCompleted && (
          <View className="bg-background border border-border py-4 rounded-2xl flex-row justify-center items-center">
            <Ionicons
              name="checkmark-done"
              size={18}
              color={Colors.textSecondary}
              className="mr-2"
            />
            <Text className="text-textSecondary font-[800] text-[15px]">
              Completed
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1 bg-background">
        <View className="items-center py-5 bg-card border-b border-border/50">
          <Text className="text-[18px] font-[800] color-text tracking-tight">
            Booking Requests
          </Text>
        </View>

        <View className="flex-row bg-card mx-5 p-1.5 rounded-[24px] my-6 border border-border">
          {["All", "Pending", "Completed"].map((f) => (
            <TouchableOpacity
              key={f}
              className={`flex-1 py-3 items-center rounded-2xl ${
                filter === f ? "bg-primary shadow-sm" : ""
              }`}
              onPress={() => setFilter(f)}
            >
              <Text
                className={`text-[13px] font-[800] ${
                  filter === f ? "text-black" : "text-textSecondary"
                }`}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : error ? (
          <View className="items-center justify-center py-20 bg-card rounded-[32px] mx-5 border border-red-500/20">
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text className="text-red-500 font-[700] mt-4">
              Failed to load bookings
            </Text>
            <TouchableOpacity
              onPress={() => refetch()}
              className="mt-6 py-3 px-8 bg-primary rounded-xl"
            >
              <Text className="text-black font-[800]">Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredBookings}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 120,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refetch}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={
              <View className="items-center py-20 bg-card rounded-[32px] border border-border border-dashed">
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color={Colors.textSecondary}
                />
                <Text className="text-[15px] font-[600] color-textSecondary mt-4">
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
          <View className="flex-1 justify-end">
            <TouchableOpacity
              className="absolute inset-0 bg-black/70"
              activeOpacity={1}
              onPress={() => setWorkerModalVisible(false)}
            />
            <View className="bg-card rounded-t-[40px] p-6 pb-12 shadow-2xl border-t border-border">
              <View className="w-12 h-1.5 bg-border/50 rounded-full self-center mb-6" />
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-[22px] font-[800] color-text">
                  Select Professional
                </Text>
                <TouchableOpacity
                  onPress={() => setWorkerModalVisible(false)}
                  className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
                >
                  <Ionicons name="close" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={availableWorkers}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 400 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="flex-row items-center justify-between py-4 border-b border-border/50"
                    onPress={() => handleAssignWorker(item)}
                  >
                    <View className="flex-row items-center">
                      <View className="w-11 h-11 rounded-full bg-background items-center justify-center mr-4 border border-border/50 overflow-hidden">
                        {item.profileImage ? (
                          <Image
                            source={{ uri: item.profileImage }}
                            className="w-11 h-11"
                          />
                        ) : (
                          <Text className="text-[18px] font-[800] color-textSecondary">
                            {item.name.charAt(0)}
                          </Text>
                        )}
                      </View>
                      <View>
                        <Text className="text-[16px] font-[700] color-text">
                          {item.name}
                        </Text>
                        <Text className="text-[12px] color-textSecondary mt-0.5 font-[500]">
                          +91 {item.phone}
                        </Text>
                      </View>
                    </View>
                    <View
                      className={`px-2.5 py-1 rounded-full ${item.status === "Active" ? "bg-green-500/10" : "bg-background"}`}
                    >
                      <Text
                        className={`text-[10px] font-[800] ${item.status === "Active" ? "color-green-500" : "color-textSecondary"}`}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                className="mt-8 py-4.5 bg-background border border-border rounded-2xl items-center"
                onPress={() => setWorkerModalVisible(false)}
              >
                <Text className="text-[16px] font-[800] color-text">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <BookingDetailsModal
          visible={detailsModalVisible}
          onClose={() => setDetailsModalVisible(false)}
          booking={selectedBooking}
        />
      </View>
    </ScreenWrapper>
  );
}
