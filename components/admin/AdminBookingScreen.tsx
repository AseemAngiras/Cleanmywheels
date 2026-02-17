import React, { useState } from "react";
import {
  View,
  Text,
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
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

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
    <View className="bg-card p-5 rounded-[24px] mb-4 border border-border shadow-sm">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-[16px] font-[800] color-text">
          {item.washPackage?.name || "Service"}
        </Text>
        <View
          className={`px-3 py-1 rounded-full border ${getStatusBg(item.status)}`}
        >
          <Text
            className={`text-[10px] font-[900] uppercase tracking-wider ${getStatusColor(item.status)}`}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View className="gap-2 mb-5">
        <View className="flex-row items-center">
          <Ionicons
            name="calendar-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text className="text-[13px] color-textSecondary ml-2 font-[500]">
            {new Date(item.bookingDate).toDateString()}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons
            name="time-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text className="text-[13px] color-textSecondary ml-2 font-[500]">
            {formatTime(item.bookingTime)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="car-outline" size={14} color={Colors.textSecondary} />
          <Text className="text-[13px] color-textSecondary ml-2 font-[500]">
            {item.vehicleNo || "N/A"}
          </Text>
        </View>
      </View>

      <View className="pt-4 border-t border-border/50 flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-widest mb-1">
            Worker
          </Text>
          <Text className="text-[14px] font-[700] color-text">
            {item.worker
              ? workers.find((w: any) => w._id === item.worker)?.name ||
                "Assigned"
              : "Unassigned"}
          </Text>
        </View>
        <TouchableOpacity
          className="bg-primary px-5 py-3 rounded-xl shadow-md shadow-primary/20"
          onPress={() => handleAssignWorker(item)}
        >
          <Text className="text-black font-[800] text-[13px]">
            {item.worker ? "Reassign" : "Assign"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background p-4">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item._id}
          renderItem={renderBookingItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-20 bg-card rounded-[32px] border border-border border-dashed">
              <Ionicons
                name="document-text-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text className="text-[15px] font-[600] color-textSecondary mt-4">
                No bookings found
              </Text>
            </View>
          }
        />
      )}

      {/* Worker Selection Modal */}
      <Modal visible={isWorkerModalVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/70 justify-center p-6">
          <View className="bg-card rounded-[32px] p-6 shadow-2xl border border-border max-h-[80%]">
            <Text className="text-[20px] font-[800] color-text mb-6 text-center">
              Select Worker
            </Text>
            <FlatList
              data={workers}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center py-4 px-2 border-b border-border/50"
                  onPress={() => confirmAssignment(item)}
                >
                  <View className="flex-1">
                    <Text className="text-[16px] font-[700] color-text">
                      {item.name}
                    </Text>
                    <Text className="text-[12px] color-textSecondary mt-0.5">
                      {item.phone || "No Phone"}
                    </Text>
                  </View>
                  <View
                    className={`px-2.5 py-1 rounded-full ${item.status === "Busy" ? "bg-orange-500/10" : "bg-green-500/10"}`}
                  >
                    <Text
                      className={`text-[10px] font-[800] uppercase ${item.status === "Busy" ? "color-orange-500" : "color-green-500"}`}
                    >
                      {item.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              className="mt-6 py-4 bg-background border border-border rounded-2xl items-center"
              onPress={() => setWorkerModalVisible(false)}
            >
              <Text className="text-[16px] font-[800] color-text">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper functions
const getStatusBg = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "bg-green-500/10 border-green-500/20";
    case "pending":
      return "bg-orange-500/10 border-orange-500/20";
    case "cancelled":
      return "bg-red-500/10 border-red-500/20";
    default:
      return "bg-background border-border";
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "text-green-500";
    case "pending":
      return "text-orange-500";
    case "cancelled":
      return "text-red-500";
    default:
      return "text-textSecondary";
  }
};

const formatTime = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const p = h >= 12 ? "PM" : "AM";
  const hd = h % 12 || 12;
  return `${hd}:${m.toString().padStart(2, "0")} ${p}`;
};

export default AdminBookingScreen;
