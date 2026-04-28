"use client";

import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { InteractivePressable } from "@/components/ui/InteractivePressable";
import { formatPrice } from "@/utils/formatPrice";

import { useFocusEffect } from "expo-router";
import { useAlert } from "@/components/providers/AlertProvider";
import { useGetBookingsQuery } from "../../../store/api/bookingApi";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { type RootState } from "../../../store";
import { addTicket } from "../../../store/slices/bookingSlice";

// Helper to map backend booking to display format
const mapBackendBooking = (booking: any) => ({
  id: booking._id,
  center: booking.washPackage?.name || "Car Wash Service",
  date: new Date(booking.bookingDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  timeSlot: booking.bookingTime
    ? `${
        booking.bookingTime > 12
          ? booking.bookingTime - 12
          : booking.bookingTime
      }:00 ${booking.bookingTime >= 12 ? "PM" : "AM"}`
    : "N/A",
  car: booking.vehicleType || booking.vehicle?.type || "Car",
  carImage: "",
  status:
    booking.status?.toLowerCase() === "cancelled" ? "cancelled" : "completed",
  serviceName: booking.serviceName || booking.washPackage?.name || "Car Wash",
  price: booking.price || 0,
  plate: booking.vehicleNo || booking.vehicle?.number || "N/A",
  address: booking.locality
    ? `${booking.houseOrFlatNo || ""}, ${booking.locality}, ${
        booking.city || ""
      }`.replace(/^, /, "")
    : "Address not provided",
  phone: booking.user?.phone || "",
  workerName: booking.worker?.name,
  workerPhone: booking.worker?.phone,
  addons: booking.addons,
  addonsTotal: booking.addonsTotal,
});

export default function PastServices() {
  const dispatch = useAppDispatch();
  const { showAlert } = useAlert();

  const {
    data: bookingsResponse,
    isFetching,
    refetch,
  } = useGetBookingsQuery({ page: 1, perPage: 100 });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const user = useAppSelector((state: RootState) => state.user.user);
  const isAdmin =
    user?.accountType === "Super Admin" || user?.accountType === "Admin";

  const bookingList = bookingsResponse?.data?.bookingList || [];
  const bookings = bookingList
    .filter((b: any) => {
      // If not admin, only show own bookings
      if (!isAdmin && b.user?._id !== user?._id) {
        return false;
      }
      return ["Completed", "Cancelled"].includes(b.status);
    })
    .map(mapBackendBooking);

  const [activeBooking, setActiveBooking] = useState<any | null>(null);

  const [complaintModalVisible, setComplaintModalVisible] = useState(false);
  const [complaintBooking, setComplaintBooking] = useState<any | null>(null);
  const [complaintText, setComplaintText] = useState("");
  const [refundRequested, setRefundRequested] = useState(false);
  const [complaintImage, setComplaintImage] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (activeBooking) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [activeBooking, slideAnim, scaleAnim, opacityAnim]);

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 350,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => setActiveBooking(null));
  };

  const handleComplaint = (booking: any) => {
    setComplaintBooking(booking);
    setComplaintModalVisible(true);
  };

  const closeComplaintModal = () => {
    setComplaintModalVisible(false);
    setComplaintBooking(null);
    setComplaintText("");
    setRefundRequested(false);
    setComplaintImage(null);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setComplaintImage(result.assets[0].uri);
    }
  };

  const submitComplaint = () => {
    if (!complaintText.trim()) {
      showAlert({
        title: "Required",
        message: "Please describe your issue.",
        type: "error",
      });
      return;
    }

    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

    dispatch(
      addTicket({
        title: "Service Issue",
        description: complaintText,
        date: new Date().toLocaleDateString(),
        refundRequested: refundRequested,
      }),
    );

    showAlert({
      title: "Complaint Received",
      message: `Your ticket #${ticketId} has been created. Our support team will review it shortly.`,
      type: "success",
    });
    closeComplaintModal();
  };

  const renderItem = ({ item }: any) => {
    const isCompleted = item.status === "completed";

    return (
      <InteractivePressable
        className="mb-5 mx-4"
        onPress={() => setActiveBooking(item)}
      >
        <View className="bg-card rounded-[20px] p-5 shadow-lg shadow-black/10 border border-border flex-row items-center justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-xl font-[700] text-text">{item.center}</Text>

            <Text className="mt-1 text-base font-[600] text-textSecondary">
              {item.date} • {item.timeSlot}
            </Text>

            <Text className="mt-[6px] text-sm text-textSecondary">
              {item.car}
            </Text>

            {item.addons && item.addons.length > 0 && (
              <View className="flex-row items-center mt-2 bg-primary/10 self-start px-2 py-1 rounded-md border border-primary/20">
                <Ionicons name="add-circle" size={12} color={Colors.primary} />
                <Text className="text-[11px] font-[700] text-primary ml-1 uppercase">
                  +{item.addons.length} Add-on{item.addons.length > 1 ? "s" : ""}
                </Text>
              </View>
            )}

            <View
              className={`mt-3 flex-row items-center px-3 py-[6px] rounded-full self-start ${
                isCompleted ? "bg-success/10" : "bg-error/10"
              }`}
            >
              <Ionicons
                name={
                  isCompleted
                    ? "checkmark-circle-outline"
                    : "close-circle-outline"
                }
                size={14}
                color={isCompleted ? Colors.success : Colors.error}
              />
              <Text
                className={`ml-[6px] text-[13px] font-[600] ${
                  isCompleted ? "text-success" : "text-error"
                }`}
              >
                {isCompleted ? "Completed" : "Cancelled"}
              </Text>
            </View>
          </View>

          {/* Stylized Icon to fill space */}
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
            <Ionicons
              name={
                item.car.toLowerCase().includes("two")
                  ? "car-sport"
                  : "car-sport"
              }
              size={32}
              color={Colors.primary}
            />
          </View>
        </View>
      </InteractivePressable>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isFetching}
        ListEmptyComponent={
          <View className="mt-20 items-center">
            <Ionicons
              name="time-outline"
              size={48}
              color={Colors.textSecondary}
            />
            <Text className="mt-3 text-textSecondary text-base">
              No past services yet
            </Text>
          </View>
        }
      />

      {/* Bottom Sheet */}
      <Modal visible={!!activeBooking} transparent animationType="none">
        <Animated.View
          className="absolute inset-0 bg-black/70"
          style={[{ opacity: opacityAnim }]}
        >
          <InteractivePressable className="flex-1" onPress={closeSheet} scaleTo={1} />
        </Animated.View>

        <Animated.View
          className="absolute inset-x-0 bottom-0 bg-card rounded-t-[28px] p-4 pb-10 border-t border-border overflow-hidden"
          style={[
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {activeBooking && (
            <View className="flex-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {/* --- TOP CARD (LIME) --- */}
                <View className="bg-primary rounded-[20px] p-3 mb-2 z-[2]">
                  <View className="flex-row justify-between">
                    {/* --- LEFT COLUMN: INFO --- */}
                    <View className="flex-1 pr-3 justify-between">
                      <View>
                        <Text className="text-lg font-[700] text-black tracking-[-0.5px]">
                          {activeBooking.workerName || "Service Completed"}
                        </Text>

                        <View className="flex-row flex-wrap gap-[6px] mt-1 mb-2">
                          <View className="flex-row items-center bg-black/5 px-2 py-1 rounded-full gap-1">
                            <Ionicons
                              name="location"
                              size={12}
                              color="#1a1a1a"
                            />
                            <Text className="text-[12px] font-[600] text-black">
                              {activeBooking.address.split(",")[0]}
                            </Text>
                          </View>
                          <View className="flex-row items-center bg-black/5 px-2 py-1 rounded-full gap-1">
                            <Ionicons
                              name={
                                activeBooking.status === "completed"
                                  ? "checkmark-circle"
                                  : "close-circle"
                              }
                              size={12}
                              color="#1a1a1a"
                            />
                            <Text className="text-[12px] font-[600] text-black">
                              {activeBooking.status}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View>
                        <Text className="text-[12px] font-[600] text-black/60">
                          Service Type
                        </Text>
                        <Text className="text-lg font-[800] text-black tracking-[-0.5px]">
                          {activeBooking.serviceName}
                        </Text>
                        <Text className="text-xl font-[800] text-black tracking-[-0.5px]">
                          ₹{formatPrice(activeBooking.price)}
                        </Text>
                      </View>
                    </View>

                    {/* --- RIGHT COLUMN: ACTIONS & IMAGE --- */}
                    <View className="items-end">
                      <View className="flex-row gap-2">
                        <InteractivePressable
                          className="w-8 h-8 rounded-full bg-black/10 justify-center items-center mr-2"
                          onPress={closeSheet}
                        >
                          <Ionicons name="close" size={20} color="#1a1a1a" />
                        </InteractivePressable>
                      </View>

                      <View className="w-20 h-20 rounded-[30px] bg-black/5 items-center justify-center mt-3 mr-2 border border-black/10">
                        <Ionicons
                          name={
                            activeBooking.car.toLowerCase().includes("two")
                              ? "car-sport"
                              : "car-sport"
                          }
                          size={40}
                          color="#1a1a1a"
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {/* --- BOTTOM CARD (DARK) --- */}
                <View className="bg-background rounded-[24px] p-4 pb-5">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-[600] text-text">
                      Service Schedule
                    </Text>
                    <Ionicons name="calendar" size={20} color="#a78bfa" />
                  </View>

                  <Text className="text-lg font-[700] text-text mb-3">
                    {activeBooking.date} — {activeBooking.timeSlot}
                  </Text>

                  <Text className="text-[12px] text-textSecondary mb-[2px]">
                    Location
                  </Text>
                  <Text
                    className="text-[13px] text-textSecondary leading-4 mb-3"
                    numberOfLines={2}
                  >
                    {activeBooking.address}
                  </Text>

                  <View className="flex-row gap-2">
                    <View className="flex-1 bg-card rounded-[12px] p-2 pr-3 border border-border">
                      <Text className="text-[11px] text-textSecondary mb-1">
                        Vehicle
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Text className="text-[14px] font-[700] text-text">
                          {activeBooking.car}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-1 bg-card rounded-[12px] p-2 pr-3 border border-border">
                      <Text className="text-[11px] text-textSecondary mb-1">
                        Plate No.
                      </Text>
                      <Text className="text-[14px] font-[700] text-text">
                        {activeBooking.plate}
                      </Text>
                    </View>

                    <View className="flex-1 bg-card rounded-[12px] p-2 pr-3 border border-border">
                      <Text className="text-[11px] text-textSecondary mb-1">
                        Booking ID
                      </Text>
                      <Text className="text-[14px] font-[700] text-text">
                        #{activeBooking.id.slice(-4)}
                      </Text>
                    </View>
                  </View>

                  {/* Add-ons Section */}
                  {activeBooking.addons && activeBooking.addons.length > 0 && (
                    <View className="mt-4 bg-primary/5 p-4 rounded-[24px] border border-primary/10">
                      <View className="flex-row items-center mb-3">
                        <Ionicons name="add-circle" size={18} color={Colors.primary} />
                        <Text className="text-[15px] font-[700] color-text ml-2">Selected Add-ons</Text>
                      </View>
                      <View className="gap-2">
                        {activeBooking.addons.map((addon: any, index: number) => (
                          <View key={index} className="flex-row justify-between items-center bg-card p-3 rounded-xl border border-border/50">
                            <Text className="text-[14px] font-[600] color-text">
                              {addon.addOn?.name || "Extra Service"}
                            </Text>
                            <Text className="text-[14px] font-[700] color-primary">
                              ₹{formatPrice(addon.price)}
                            </Text>
                          </View>
                        ))}
                        <View className="h-[1px] bg-border/50 my-1" />
                        <View className="flex-row justify-between items-center px-1">
                          <Text className="text-[13px] font-[600] color-textSecondary">Add-ons Total</Text>
                          <Text className="text-[15px] font-[800] color-text">₹{formatPrice(activeBooking.addonsTotal || 0)}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </Modal>

      {/* Complaint Modal */}
      <Modal
        visible={complaintModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeComplaintModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-[20px] p-5 h-[80%]">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-xl font-bold text-gray-900">
                Raise Complaint
              </Text>
              <InteractivePressable onPress={closeComplaintModal}>
                <Ionicons name="close" size={24} color="#000" />
              </InteractivePressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              <Text className="text-sm text-gray-600 mb-5">
                Tell us about the issue with your service on{" "}
                {complaintBooking?.date}
              </Text>

              <Text className="text-sm font-[600] text-gray-900 mb-2 mt-2.5">
                Description
              </Text>
              <TextInput
                className="bg-gray-50 rounded-[12px] p-4 h-[120px] text-gray-900 border border-gray-100"
                style={{ textAlignVertical: "top" }}
                placeholder="Describe what went wrong..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                value={complaintText}
                onChangeText={setComplaintText}
              />

              <View className="flex-row justify-between items-center my-[15px] bg-white p-3 rounded-[12px] border border-gray-100">
                <Text className="text-base font-[600] text-gray-900">
                  Request Refund
                </Text>
                <Switch
                  value={refundRequested}
                  onValueChange={setRefundRequested}
                  trackColor={{ false: "#767577", true: "#EF4444" }}
                  thumbColor={refundRequested ? "#fff" : "#f4f3f4"}
                />
              </View>

              <Text className="text-sm font-[600] text-gray-900 mb-2 mt-2.5">
                Upload Photo (Optional)
              </Text>
              <InteractivePressable
                className="h-[150px] bg-gray-50 rounded-[12px] border border-gray-100 border-dashed items-center justify-center mt-1"
                onPress={pickImage}
              >
                {complaintImage ? (
                  <Image
                    source={{ uri: complaintImage }}
                    className="w-full h-full rounded-[12px]"
                  />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={24} color="#666" />
                    <Text className="mt-2 text-gray-600 text-sm">
                      Tap to select image
                    </Text>
                  </>
                )}
              </InteractivePressable>
            </ScrollView>

            <InteractivePressable
              className="bg-gray-900 py-4 rounded-full items-center mt-2.5 mb-5"
              onPress={submitComplaint}
            >
              <Text className="text-white text-base font-bold">
                Submit Complaint
              </Text>
            </InteractivePressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
