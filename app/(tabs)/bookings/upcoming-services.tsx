import {
  Animated,
  Easing,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Colors";
import { useCallback, useEffect, useRef, useState } from "react";
import { InteractivePressable } from "../../../components/ui/InteractivePressable";
import { formatPrice } from "@/utils/formatPrice";

import { useFocusEffect, useRouter } from "expo-router";
import { useAlert } from "@/components/providers/AlertProvider";

import type { RootState } from "../../../store";
import {
  useGetBookingsQuery,
  useAssignWorkerAndNotifyMutation,
} from "../../../store/api/bookingApi";
import { useGetWorkersQuery } from "../../../store/api/workerApi";
import {
  useAssignSubscriptionWorkerMutation,
  useGetMySubscriptionQuery,
} from "../../../store/api/subscriptionApi";
import { useAppSelector } from "../../../store/hooks";
import { type BookingStatus } from "../../../store/slices/bookingSlice";
import { type Booking } from "../../../types";

// Helper to map backend booking to display format
const mapBackendBooking = (booking: any): Booking => {
  const rawStatus = booking.status?.toLowerCase();
  let displayStatus: BookingStatus = "upcoming";

  if (rawStatus === "completed") {
    displayStatus = "completed";
  } else if (rawStatus === "cancelled" || rawStatus === "failed") {
    displayStatus = "cancelled";
  } else if (rawStatus === "pending") {
    displayStatus = "pending";
  } else if (rawStatus === "confirmed") {
    displayStatus = "confirmed";
  }

  return {
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
    status: displayStatus,
    realStatus: booking.status,
    serviceName: booking.serviceName || booking.washPackage?.name || "Car Wash",
    price:
      typeof booking.price === "object"
        ? booking.price.ONE_TIME || 0
        : booking.price || 0,
    plate: booking.vehicleNo || booking.vehicle?.number || "N/A",
    address: booking.locality
      ? `${booking.houseOrFlatNo || ""}, ${booking.locality}, ${
          booking.city || ""
        }`.replace(/^, /, "")
      : "Address not provided",
    phone: booking.user?.phone || "",
    workerName: booking.worker?.name || booking.workerName,
    workerPhone: booking.worker?.phone || booking.workerPhone,
    addons: booking.addons,
    addonsTotal: booking.addonsTotal,
  };
};

export default function UpcomingServices() {
  const router = useRouter();
  const { showAlert } = useAlert();

  const user = useAppSelector((state: RootState) => state.user.user);
  const isAdmin =
    user?.accountType === "Super Admin" || user?.accountType === "Admin";

  const {
    data: bookingsResponse,
    isFetching,
    error,
    refetch,
  } = useGetBookingsQuery({ page: 1, perPage: 100 });

  const { data: subscription, refetch: refetchSubscription } =
    useGetMySubscriptionQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchSubscription();
    }, [refetch, refetchSubscription]),
  );

  const bookingList = bookingsResponse?.data?.bookingList || [];
  const bookings = bookingList
    .filter((b: any) => {
      const bUserId = (b.user?._id || b.user || b.userId)?.toString();
      const currentUserId = user?._id?.toString();

      // If not admin, only show own bookings
      if (!isAdmin && bUserId && currentUserId && bUserId !== currentUserId) {
        return false;
      }

      const status = (b.status || "").toLowerCase().trim();

      // Always show confirmed or upcoming bookings to their owners
      if (status === "confirmed" || status === "upcoming") {
        return true;
      }

      // For admins, show pending bookings (so they can assign a worker)
      if (isAdmin && status === "pending") {
        return true;
      }

      // Hide pending bookings for regular users
      if (status === "pending" || status === "payment pending") {
        return false;
      }

      // Skip completed or failed
      return !["completed", "cancelled", "failed"].includes(status);
    })
    .map(mapBackendBooking);

  const insets = useSafeAreaInsets();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const { data: workersData } = useGetWorkersQuery({});
  const workers = workersData?.workers || [];
  const [workerModalVisible, setWorkerModalVisible] = useState(false);
  const [assignSubscriptionWorker] = useAssignSubscriptionWorkerMutation();
  const [assignWorkerAndNotify] = useAssignWorkerAndNotifyMutation();
  const [isAssigningSubWorker, setIsAssigningSubWorker] = useState(false);

  const sendUserConfirmation = (worker: any, booking: any) => {
    const isSubscription = !!booking.plan;
    const serviceName = isSubscription
      ? booking.plan.name
      : booking.serviceName;
    const id = isSubscription ? booking._id : booking.id;
    const time = isSubscription ? "Wash Service" : booking.timeSlot;

    const message = `Hello, your ${
      isSubscription ? "subscription" : "booking"
    } for *${serviceName}* is confirmed! 🚗✨\n\n*${
      worker.name
    }* has been assigned as your valet.\n\nID: ${id}\nTime: ${time}`;

    const url = `whatsapp://send?phone=${
      booking.phone
    }&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        showAlert({
          title: "Error",
          message: "WhatsApp is not installed",
          type: "error",
        });
      }
    });
  };

  const sendWorkerJobDetails = (worker: any, booking: any) => {
    const message = `🛠️ *New Job Assigned!*\n\nCustomer: ${
      booking.user || "Valued Customer"
    }\nPhone: ${booking.phone}\nAddress: ${booking.address}\n\nService: ${
      booking.serviceName
    }\nCar: ${booking.car} (${booking.plate})\nTime: ${
      booking.timeSlot
    }\n\nPlease reach on time.`;
    const url = `whatsapp://send?phone=${
      worker.phone
    }&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      }
    });
  };

  const handleAssignWorker = async (worker: any) => {
    if (isAssigningSubWorker && subscription && subscription.length > 0) {
      try {
        await assignSubscriptionWorker({
          subscriptionId: subscription[0]._id,
          workerId: worker._id,
        }).unwrap();

        showAlert({
          title: "Success",
          message: `Assigned ${worker.name} to subscription!`,
          type: "success",
        });
        setWorkerModalVisible(false);
        setIsAssigningSubWorker(false);
      } catch {
        showAlert({
          title: "Error",
          message: "Failed to assign worker",
          type: "error",
        });
      }
      return;
    }

    if (!activeBooking) return;

    showAlert({
      title: "Confirm Assignment",
      message: `Assign ${worker.name} to this job? This will notify both parties and update the booking.`,
      type: "info",
      buttons: [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign & Notify",
          onPress: async () => {
            try {
              await assignWorkerAndNotify({
                bookingId: activeBooking.id,
                workerId: worker._id,
              }).unwrap();

              // Fallback manual notification if needed, though backend handles it
              sendUserConfirmation(worker, activeBooking);
              setTimeout(() => {
                sendWorkerJobDetails(worker, activeBooking);
              }, 1500);

              setWorkerModalVisible(false);
              closeSheet();
              showAlert({
                title: "Success",
                message: "Worker assigned and notified successfully!",
                type: "success",
              });
            } catch (error) {
              console.error("Assignment error:", error);
              showAlert({
                title: "Error",
                message: "Failed to assign worker. Please try again.",
                type: "error",
              });
            }
          },
        },
      ],
    });
  };

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

  console.log("active bookings :", activeBooking);

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

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const subsArray = Array.isArray(subscription)
    ? subscription
    : subscription
      ? [subscription]
      : [];
  const activeSubs = subsArray.filter((s: any) =>
    ["active", "ongoing"].includes(s.status),
  );

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={() => {
          return (
            <>
              {activeSubs.map((sub: any) => (
                <InteractivePressable
                  key={sub._id}
                  className="mb-6 mx-5"
                  onPress={() =>
                    router.push(`/subscription-flow/details/${sub._id}` as any)
                  }
                >
                  <View className="bg-card rounded-[16px] p-4 shadow-md shadow-black/10 border border-border">
                    {/* Header */}
                    <View className="flex-row justify-between mb-3">
                      <View className="bg-success/10 px-2 py-[3px] rounded-md">
                        <Text className="text-success text-[10px] font-[800] tracking-[0.5px]">
                          SUBSCRIPTION
                        </Text>
                      </View>
                      <View
                        className={`px-2 py-[3px] rounded-md flex-row items-center gap-[3px] ${
                          sub.status === "ongoing"
                            ? "bg-[#DBEAFE]"
                            : "bg-[#FFF7ED]"
                        }`}
                      >
                        <Ionicons
                          name={
                            sub.status === "ongoing"
                              ? "time"
                              : "hourglass-outline"
                          }
                          size={10}
                          color={
                            sub.status === "ongoing" ? "#1E40AF" : "#C2410C"
                          }
                        />
                        <Text
                          className={`text-[10px] font-[700] ${
                            sub.status === "ongoing"
                              ? "text-[#1E40AF]"
                              : "text-[#C2410C]"
                          }`}
                        >
                          {sub.status === "ongoing"
                            ? "ONGOING"
                            : "WAITING FOR WORKER"}
                        </Text>
                      </View>
                    </View>

                    {/* Worker Info (If Assigned) */}
                    {(sub.worker && sub.worker.name) || sub.workerName ? (
                      <View className="mb-3 flex-row items-center bg-background p-2 rounded-lg">
                        <Ionicons
                          name="person-circle"
                          size={24}
                          color="#0284C7"
                        />
                        <View className="ml-2 flex-1">
                          <Text className="text-[13px] font-[600] text-text">
                            {sub.worker?.name || sub.workerName}
                          </Text>
                          <Text className="text-[11px] text-textSecondary">
                            Assigned Valet
                          </Text>
                        </View>
                        <InteractivePressable
                          onPress={() =>
                            Linking.openURL(
                              `tel:${sub.worker?.phone || sub.workerPhone}`,
                            )
                          }
                          className="bg-card p-[6px] rounded-full"
                        >
                          <Ionicons
                            name="call"
                            size={16}
                            color={Colors.primary}
                          />
                        </InteractivePressable>
                      </View>
                    ) : (
                      <View className="mb-3 flex-row items-center bg-[#FFF7ED] p-2 rounded-lg">
                        <Ionicons
                          name="alert-circle"
                          size={20}
                          color="#EA580C"
                        />
                        <View className="ml-2 flex-1">
                          <Text className="text-[12px] font-[600] text-[#9A3412]">
                            Worker Assignment Pending
                          </Text>
                          <Text className="text-[11px] text-[#C2410C]">
                            You will see the valet details here once assigned.
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Vehicle Info */}
                    <View className="flex-row items-center mb-3">
                      <View className="w-11 h-11 rounded-full bg-[#F8F9FA] items-center justify-center mr-3 border border-[#eee]">
                        <Ionicons name="car-sport" size={22} color="#1a1a1a" />
                      </View>
                      <View>
                        <Text className="text-base font-[700] text-text mb-[2px]">
                          {sub.vehicle?.vehicleType || "Vehicle"}
                        </Text>
                        <Text className="text-[13px] text-textSecondary font-[500]">
                          {sub.vehicle?.vehicleNo || "No Number"}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View className="h-[1px] bg-border mb-3" />

                    {/* Schedule Info */}
                    <View className="flex-row justify-between mb-3">
                      <View>
                        <Text className="text-[11px] text-[#888] mb-1">
                          NEXT SERVICE
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#FFFFFF"
                          />
                          <Text className="text-[13px] font-[600] text-white">
                            {(() => {
                              const startDate = new Date(
                                sub.startDate || new Date(),
                              );
                              const completed = sub.servicesCompleted || 0;
                              const nextServiceDate = new Date(startDate);
                              const freq = sub.frequencyType || 'TWICE_MONTHLY';
                              
                              if (freq === 'TWICE_MONTHLY') {
                                nextServiceDate.setDate(startDate.getDate() + completed * 15);
                              } else {
                                nextServiceDate.setDate(startDate.getDate() + completed);
                              }

                              return nextServiceDate.toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              );
                            })()}
                          </Text>
                        </View>
                      </View>
                      <View>
                        <Text className="text-[11px] text-[#888] mb-1">
                          TIME SLOT
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#FFFFFF"
                          />
                          <Text className="text-[13px] font-[600] text-white">
                            {sub.timeSlot || "09:00 AM"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Add-ons Section */}
                    {(() => {
                      const startDate = new Date(sub.startDate || new Date());
                      const completed = sub.servicesCompleted || 0;
                      const nextServiceDate = new Date(startDate);
                      nextServiceDate.setDate(startDate.getDate() + completed);

                      const displayAddons = (
                        sub.nextServiceAddons || []
                      ).filter((a: any) => {
                        if (!a.serviceDate) return false;
                        const addonDate = new Date(
                          a.serviceDate,
                        ).toDateString();
                        const serviceDate = nextServiceDate.toDateString();
                        return addonDate === serviceDate;
                      });

                      // Deduplicate by name
                      const uniqueAddonsMap = new Map();
                      displayAddons.forEach((addon: any) => {
                        uniqueAddonsMap.set(addon.name, addon);
                      });
                      const uniqueAddons = Array.from(uniqueAddonsMap.values());

                      if (!uniqueAddons || uniqueAddons.length === 0)
                        return null;

                      return (
                        <View className="mb-3 bg-[#FAFAFA] p-2 rounded-lg border border-[#EEE]">
                          <Text className="text-[10px] text-[#888] mb-[6px] font-[700] tracking-[0.5px]">
                            ADD-ONS INCLUDED IN NEXT SERVICE
                          </Text>
                          <View className="flex-row flex-wrap gap-1">
                            {uniqueAddons.map((addon: any, idx: number) => (
                              <View
                                key={`addon-${idx}`}
                                className="flex-row items-center bg-white px-2 py-1 rounded-md border border-[#E0E0E0]"
                              >
                                <Ionicons
                                  name="add-circle"
                                  size={14}
                                  color="#2E7D32"
                                  className="mr-1"
                                />
                                <Text className="text-[12px] text-[#1a1a1a] font-[600]">
                                  {addon.name}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      );
                    })()}

                    {/* Action Button */}
                    <View className="bg-primary py-[10px] rounded-[12px] flex-row items-center justify-center">
                      <Text className="text-black text-[13px] font-[700] mr-[6px]">
                        View Full Schedule
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color="#000000"
                      />
                    </View>
                  </View>
                </InteractivePressable>
              ))}
            </>
          );
        }}
        renderItem={({ item }: any) => {
          return (
            <InteractivePressable
              className="mb-[10px]"
              onPress={() => setActiveBooking(item)}
            >
              <View className="bg-card rounded-[20px] p-5 pb-20 m-3 border border-border shadow-lg shadow-black/10 flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-lg font-[700] text-text">
                    {item.center}
                  </Text>
                  <Text className="mt-1 text-base font-[600] text-textSecondary">
                    {item.date} - {item.timeSlot}
                  </Text>
                  <Text className="mt-[6px] text-sm text-textSecondary">
                    {item.car}
                  </Text>

                  {/* Worker Badge */}
                  <View className="flex-row items-center mt-2">
                    <View
                      className={`flex-row items-center px-2 py-1 rounded-md border ${
                        item.workerName
                          ? "bg-success/5 border-success/20"
                          : "bg-warning/5 border-warning/20"
                      }`}
                    >
                      <Ionicons
                        name={item.workerName ? "person" : "hourglass-outline"}
                        size={12}
                        color={item.workerName ? "#10B981" : "#F59E0B"}
                      />
                      <Text
                        className={`text-[11px] font-[700] ml-1 uppercase text-white ${
                          item.workerName ? "text-success" : "text-warning"
                        }`}
                      >
                        {item.workerName
                          ? `Valet: ${item.workerName}`
                          : "Assignment Pending"}
                      </Text>
                    </View>
                  </View>

                  {item.addons && item.addons.length > 0 && (
                    <View className="flex-row items-center mt-2 bg-primary/10 self-start px-2 py-1 rounded-md border border-primary/20">
                      <Ionicons
                        name="add-circle"
                        size={12}
                        color={Colors.primary}
                      />
                      <Text className="text-[11px] font-[700] text-primary ml-1 uppercase">
                        +{item.addons.length} Add-on
                        {item.addons.length > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
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

                {/* ACTION ROW */}
                <View className="absolute bottom-4 left-4 right-4 flex-row items-center gap-3">
                  <InteractivePressable
                    className="flex-1 bg-primary rounded-[28px] py-[14px] px-5 flex-row items-center justify-center gap-[10px]"
                    onPress={() => setActiveBooking(item)}
                  >
                    <Text className="text-black text-base font-[600]">
                      Review details
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#000" />
                  </InteractivePressable>
                </View>
              </View>
            </InteractivePressable>
          );
        }}
        ListEmptyComponent={() => {
          if (isFetching && !bookings.length) {
            return (
              <View className="items-center mt-20">
                <Text className="text-textSecondary">Loading bookings...</Text>
              </View>
            );
          }
          if (error) {
            return (
              <View className="items-center mt-20 px-5">
                <Ionicons name="alert-circle-outline" size={60} color={Colors.error} />
                <Text className="text-lg font-[600] mt-4 text-text">Failed to load bookings</Text>
                <Text className="text-textSecondary mt-[6px] text-center">
                  {typeof error === 'object' && 'data' in error 
                    ? (error.data as any)?.message 
                    : "Please check your internet connection"}
                </Text>
              </View>
            );
          }
          if (activeSubs.length > 0) return null;
          return (
            <View className="items-center mt-20">
              <Ionicons
                name="calendar-outline"
                size={60}
                color={Colors.textSecondary}
              />
              <Text className="text-lg font-[600] mt-4 text-text">
                No upcoming bookings
              </Text>
              <Text className="text-textSecondary mt-[6px]">
                Book a service to see it here
              </Text>
            </View>
          );
        }}
      />

      {/* Bottom Sheet */}
      <Modal visible={!!activeBooking} transparent animationType="none">
        <Animated.View
          className="absolute inset-0 bg-black/70"
          style={[{ opacity: opacityAnim }]}
        >
          <InteractivePressable className="flex-1" onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          className="absolute left-0 right-0 bottom-0 bg-card rounded-t-[28px] p-4 pb-10 border-t border-border overflow-hidden"
          style={[
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              maxHeight: "60%",
            },
          ]}
        >
          {activeBooking && (
            <View className="flex-1">
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View className="bg-primary rounded-[20px] p-3 mb-2 z-[2]">
                  <View className="flex-row justify-between">
                    <View className="flex-1 pr-3 justify-between">
                      <View>
                        <Text className="text-lg font-[700] text-black tracking-[-0.5px]">
                          {activeBooking.workerName || "Assignment Pending"}
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
                          <View
                            className={`flex-row items-center px-2 py-1 rounded-full gap-1 ${
                              activeBooking.workerName
                                ? "bg-black/10"
                                : "bg-white/40"
                            }`}
                          >
                            <Ionicons
                              name={
                                activeBooking.workerName
                                  ? "checkmark-circle"
                                  : "time"
                              }
                              size={12}
                              color="#1a1a1a"
                            />
                            <Text className="text-[12px] font-[600] text-black">
                              {activeBooking.workerName
                                ? "Valet Assigned"
                                : "Finding Valet"}
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

                    <View className="items-end">
                      <View className="flex-row gap-2">
                        {!isAdmin &&
                          activeBooking.workerName &&
                          activeBooking.workerPhone && (
                            <InteractivePressable
                              className="w-8 h-8 rounded-full bg-black/10 justify-center items-center mr-2"
                              onPress={() =>
                                handleCall(activeBooking.workerPhone)
                              }
                            >
                              <Ionicons name="call" size={20} color="#1a1a1a" />
                            </InteractivePressable>
                          )}
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

                  {isAdmin && (
                    <InteractivePressable
                      className="absolute bottom-4 right-4 bg-black px-4 py-2 rounded-full"
                      onPress={() => setWorkerModalVisible(true)}
                    >
                      <Text className="text-primary font-[600] text-[14px]">
                        {activeBooking.workerName
                          ? "Reassign Worker"
                          : "Assign Worker"}
                      </Text>
                    </InteractivePressable>
                  )}
                </View>

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
                        <Ionicons
                          name="add-circle"
                          size={18}
                          color={Colors.primary}
                        />
                        <Text className="text-[15px] font-[700] color-text ml-2">
                          Selected Add-ons
                        </Text>
                      </View>
                      <View className="gap-2">
                        {activeBooking.addons.map(
                          (addon: any, index: number) => (
                            <View
                              key={index}
                              className="flex-row justify-between items-center bg-card p-3 rounded-xl border border-border/50"
                            >
                              <Text className="text-[14px] font-[600] color-text">
                                {addon.addOn?.name || "Extra Service"}
                              </Text>
                              <Text className="text-[14px] font-[700] color-primary">
                                ₹{formatPrice(addon.price)}
                              </Text>
                            </View>
                          ),
                        )}
                        <View className="h-[1px] bg-border/50 my-1" />
                        <View className="flex-row justify-between items-center px-1">
                          <Text className="text-[13px] font-[600] color-textSecondary">
                            Add-ons Total
                          </Text>
                          <Text className="text-[15px] font-[800] color-text">
                            ₹{formatPrice(activeBooking.addonsTotal || 0)}
                          </Text>
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

      {/* Worker Selection Modal */}
      <Modal visible={workerModalVisible} animationType="slide" transparent>
        <InteractivePressable
          className="flex-1 bg-black/70"
          onPress={() => setWorkerModalVisible(false)}
          scaleTo={1}
        />
        <View
          className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[24px] p-5 h-1/2 shadow-2xl border border-border"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <View className="flex-row justify-between items-center mb-5">
            <Text className="text-lg font-[700] text-text">Select Worker</Text>
            <InteractivePressable onPress={() => setWorkerModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </InteractivePressable>
          </View>
          <FlatList
            data={workers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => {
              return (
                <InteractivePressable
                  className="flex-row items-center py-3 border-b border-border"
                  onPress={() => handleAssignWorker(item)}
                >
                  <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3">
                    {item.profileImage ? (
                      <Image
                        source={{ uri: item.profileImage }}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <Text className="text-base font-[600] text-textSecondary">
                        {item.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-[600] text-text">
                      {item.name}
                    </Text>
                    <Text className="text-[12px] text-textSecondary">
                      {item.phone}
                    </Text>
                    <Text
                      className={`text-[10px] ${
                        item.status === "Active"
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <View className="bg-primary px-3 py-[6px] rounded-lg">
                    <Text className="text-black font-[600] text-[12px]">
                      Assign
                    </Text>
                  </View>
                </InteractivePressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
