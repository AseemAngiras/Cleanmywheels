"use client";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useFocusEffect, useRouter } from "expo-router";

import type { RootState } from "../../../store";
import { useGetBookingsQuery } from "../../../store/api/bookingApi";
import {
  useAssignSubscriptionWorkerMutation,
  useGetMySubscriptionQuery,
} from "../../../store/api/subscriptionApi";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  type Booking,
  cancelBooking,
} from "../../../store/slices/bookingSlice";

// Helper to map backend booking to display format
const mapBackendBooking = (booking: any): Booking => ({
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
  carImage: "https://cdn-icons-png.flaticon.com/512/743/743007.png",
  status:
    booking.status?.toLowerCase() === "completed" ? "completed" : "upcoming",
  serviceName: booking.serviceName || booking.washPackage?.name || "Car Wash",
  price: booking.price || 0,
  plate: booking.vehicleNo || booking.vehicle?.number || "N/A",
  address: booking.locality
    ? `${booking.houseOrFlatNo || ""}, ${booking.locality}, ${
        booking.city || ""
      }`.replace(/^, /, "")
    : "Address not provided",
  phone: booking.user?.phone || "",
  workerName: booking.workerName,
  workerPhone: booking.workerPhone,
});

export default function UpcomingServices() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const {
    data: bookingsResponse,
    isLoading,
    isFetching,
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
      const status = b.status?.toLowerCase();
      return !["completed", "cancelled", "pending", "failed"].includes(status);
    })
    .map(mapBackendBooking);

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const user = useAppSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  const MOCK_WORKERS = [
    {
      id: "65a1234567890abcdef12345",
      name: "Amit Sharma",
      phone: "+919876543210",
    },
    {
      id: "65a1234567890abcdef12346",
      name: "Rahul Verma",
      phone: "+918765432109",
    },
    {
      id: "65a1234567890abcdef12347",
      name: "Suresh Singh",
      phone: "+917654321098",
    },
    {
      id: "65a1234567890abcdef12348",
      name: "Vikram Yadav",
      phone: "+916543210987",
    },
  ];

  const [workerModalVisible, setWorkerModalVisible] = useState(false);
  const [assignSubscriptionWorker] = useAssignSubscriptionWorkerMutation();
  const [isAssigningSubWorker, setIsAssigningSubWorker] = useState(false);

  const sendUserConfirmation = (worker: any, booking: any) => {
    const isSubscription = !!booking.plan;
    const serviceName = isSubscription
      ? booking.plan.name
      : booking.serviceName;
    const id = isSubscription ? booking._id : booking.id;
    const time = isSubscription ? "Daily Service" : booking.timeSlot;

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
        Alert.alert("Error", "WhatsApp is not installed");
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
          workerId: worker.id,
        }).unwrap();

        Alert.alert("Success", `Assigned ${worker.name} to subscription!`);
        setWorkerModalVisible(false);
        setIsAssigningSubWorker(false);
      } catch (err) {
        Alert.alert("Error", "Failed to assign worker");
      }
      return;
    }

    if (!activeBooking) return;

    Alert.alert(
      "Confirm Assignment",
      `Assign ${worker.name} to this job? This will open WhatsApp to notify both parties.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign & Notify",
          onPress: () => {
            sendUserConfirmation(worker, activeBooking);

            setTimeout(() => {
              sendWorkerJobDetails(worker, activeBooking);
            }, 1500);

            setWorkerModalVisible(false);
            closeSheet();
            Alert.alert(
              "Success",
              "Worker assigned and notifications initiated!",
            );
          },
        },
      ],
    );
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
  }, [activeBooking]);

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

  const handleDelete = (id: string) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          dispatch(cancelBooking(id));
          closeSheet();
        },
      },
    ]);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const renderItem = ({ item }: any) => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cardContainer}
        onPress={() => setActiveBooking(item)}
      >
        <LinearGradient
          colors={["#FFFFFF", "#F5F8FF", "#F7FAE6"]}
          style={styles.sessionCard}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.sessionTitle}>{item.center}</Text>
            <Text style={styles.sessionSubtitle}>
              {item.date} - {item.timeSlot}
            </Text>
            <Text style={styles.sessionDuration}>{item.car}</Text>
          </View>

          <Image
            source={{ uri: item.carImage }}
            style={{ width: 90, height: 90, borderRadius: 12, marginLeft: 16 }}
          />

          {/* ACTION ROW */}
          <View style={styles.sessionActionRow}>
            <TouchableOpacity
              style={styles.sessionButton}
              onPress={() => setActiveBooking(item)}
            >
              <Text style={styles.sessionButtonText}>Review details</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
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
    <>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={() => {
          return (
            <>
              {activeSubs.map((sub: any) => (
                <TouchableOpacity
                  key={sub._id}
                  style={{ marginBottom: 24, marginHorizontal: 20 }}
                  activeOpacity={0.9}
                  onPress={() =>
                    router.push(`/subscription/details/${sub._id}` as any)
                  }
                >
                  <View
                    style={{
                      backgroundColor: "#fff",
                      borderRadius: 16,
                      padding: 16,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 4,
                      borderWidth: 1,
                      borderColor: "#F0F0F0",
                    }}
                  >
                    {/* Header */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "#E8F5E9",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: "#2E7D32",
                            fontSize: 10,
                            fontWeight: "800",
                            letterSpacing: 0.5,
                          }}
                        >
                          SUBSCRIPTION
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor:
                            sub.status === "ongoing" ? "#DBEAFE" : "#FFF7ED", // Blue for Ongoing, Orange for Waiting
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 3,
                        }}
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
                          style={{
                            color:
                              sub.status === "ongoing" ? "#1E40AF" : "#C2410C",
                            fontSize: 10,
                            fontWeight: "700",
                          }}
                        >
                          {sub.status === "ongoing"
                            ? "ONGOING"
                            : "WAITING FOR WORKER"}
                        </Text>
                      </View>
                    </View>

                    {/* Worker Info (If Assigned) */}
                    {(sub.worker && sub.worker.name) || sub.workerName ? (
                      <View
                        style={{
                          marginBottom: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#F0F9FF",
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Ionicons
                          name="person-circle"
                          size={24}
                          color="#0284C7"
                        />
                        <View style={{ marginLeft: 8 }}>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#0F172A",
                            }}
                          >
                            {sub.worker?.name || sub.workerName}
                          </Text>
                          <Text style={{ fontSize: 11, color: "#64748B" }}>
                            Assigned Valet
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() =>
                            Linking.openURL(
                              `tel:${sub.worker?.phone || sub.workerPhone}`,
                            )
                          }
                          style={{
                            marginLeft: "auto",
                            backgroundColor: "#fff",
                            padding: 6,
                            borderRadius: 20,
                          }}
                        >
                          <Ionicons name="call" size={16} color="#0284C7" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      /* Unassigned Warning */
                      <View
                        style={{
                          marginBottom: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: "#FFF7ED",
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <Ionicons
                          name="alert-circle"
                          size={20}
                          color="#EA580C"
                        />
                        <View style={{ marginLeft: 8, flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color: "#9A3412",
                            }}
                          >
                            Worker Assignment Pending
                          </Text>
                          <Text style={{ fontSize: 11, color: "#C2410C" }}>
                            You will see the valet details here once assigned.
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Vehicle Info */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: "#F8F9FA",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                          borderWidth: 1,
                          borderColor: "#eee",
                        }}
                      >
                        <Ionicons name="car-sport" size={22} color="#1a1a1a" />
                      </View>
                      <View>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "700",
                            color: "#1a1a1a",
                            marginBottom: 2,
                          }}
                        >
                          {sub.vehicle?.vehicleType || "Vehicle"}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: "#666",
                            fontWeight: "500",
                          }}
                        >
                          {sub.vehicle?.vehicleNo || "No Number"}
                        </Text>
                      </View>
                    </View>

                    {/* Divider */}
                    <View
                      style={{
                        height: 1,
                        backgroundColor: "#F0F0F0",
                        marginBottom: 12,
                      }}
                    />

                    {/* Schedule Info */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#888",
                            marginBottom: 4,
                          }}
                        >
                          NEXT SERVICE
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={14}
                            color="#1a1a1a"
                          />
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#1a1a1a",
                            }}
                          >
                            {(() => {
                              const startDate = new Date(
                                sub.startDate || new Date(),
                              );
                              const completed = sub.servicesCompleted || 0;
                              const nextServiceDate = new Date(startDate);
                              nextServiceDate.setDate(
                                startDate.getDate() + completed,
                              );

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
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#888",
                            marginBottom: 4,
                          }}
                        >
                          TIME SLOT
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color="#1a1a1a"
                          />
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: "#1a1a1a",
                            }}
                          >
                            {sub.timeSlot || "09:00 AM"}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Add-ons Section */}
                    {sub.nextServiceAddons &&
                      sub.nextServiceAddons.length > 0 && (
                        <View
                          style={{
                            marginBottom: 12,
                            backgroundColor: "#FAFAFA",
                            padding: 8,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: "#EEE",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 10,
                              color: "#888",
                              marginBottom: 6,
                              fontWeight: "700",
                              letterSpacing: 0.5,
                            }}
                          >
                            ADD-ONS INCLUDED IN NEXT SERVICE
                          </Text>
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 4,
                            }}
                          >
                            {(() => {
                              const startDate = new Date(
                                sub.startDate || new Date(),
                              );
                              const completed = sub.servicesCompleted || 0;
                              const nextServiceDate = new Date(startDate);
                              nextServiceDate.setDate(
                                startDate.getDate() + completed,
                              );

                              const targetDateStr =
                                nextServiceDate.toDateString();

                              const displayAddons = (
                                sub.nextServiceAddons || []
                              ).filter((a: any) => {
                                if (!a.serviceDate) return true;

                                return (
                                  new Date(a.serviceDate).toDateString() ===
                                  targetDateStr
                                );
                              });

                              if (displayAddons.length === 0) return null;

                              return displayAddons.map(
                                (addon: any, idx: number) => (
                                  <View
                                    key={idx}
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      backgroundColor: "#fff",
                                      paddingHorizontal: 8,
                                      paddingVertical: 4,
                                      borderRadius: 6,
                                      borderWidth: 1,
                                      borderColor: "#E0E0E0",
                                    }}
                                  >
                                    <Ionicons
                                      name="add-circle"
                                      size={14}
                                      color="#2E7D32"
                                      style={{ marginRight: 4 }}
                                    />
                                    <Text
                                      style={{
                                        fontSize: 12,
                                        color: "#1a1a1a",
                                        fontWeight: "600",
                                      }}
                                    >
                                      {addon.name}
                                    </Text>
                                  </View>
                                ),
                              );
                            })()}
                          </View>
                        </View>
                      )}

                    {/* Action Button */}
                    <View
                      style={{
                        backgroundColor: "#1a1a1a",
                        paddingVertical: 10,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: "700",
                          marginRight: 6,
                        }}
                      >
                        View Full Schedule
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color="#D1F803"
                      />
                    </View>
                  </View>
                </TouchableOpacity>
                /* End Subscription Card */
              ))}
            </>
          );
        }}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={isFetching}
        ListEmptyComponent={() => {
          if (activeSubs.length > 0) return null;
          return (
            <View style={{ alignItems: "center", marginTop: 80 }}>
              <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
              <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 16 }}>
                No upcoming bookings
              </Text>
              <Text style={{ color: "#64748B", marginTop: 6 }}>
                Book a service to see it here
              </Text>
            </View>
          );
        }}
      />

      {/* Bottom Sheet */}
      <Modal visible={!!activeBooking} transparent animationType="none">
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <TouchableOpacity
            style={styles.backdropTouchable}
            onPress={closeSheet}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {activeBooking && (
            <View style={{ flex: 1, overflow: "hidden" }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <View style={styles.limeCard}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        paddingRight: 12,
                        justifyContent: "space-between",
                      }}
                    >
                      <View>
                        <Text style={styles.limeName}>
                          {activeBooking.workerName || "Valet Assigning..."}
                        </Text>

                        <View style={styles.limeTagsRow}>
                          <View style={styles.limeTag}>
                            <Ionicons
                              name="location"
                              size={12}
                              color="#1a1a1a"
                            />
                            <Text style={styles.limeTagText}>
                              {activeBooking.address.split(",")[0]}
                            </Text>
                          </View>
                          <View style={styles.limeTag}>
                            <Ionicons name="time" size={12} color="#1a1a1a" />
                            <Text style={styles.limeTagText}>
                              {activeBooking.status}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View>
                        <Text style={styles.limeRoleText}>Service Type</Text>
                        <Text style={styles.limeServiceTitle}>
                          {activeBooking.serviceName}
                        </Text>
                        <Text style={styles.limePrice}>
                          ₹{activeBooking.price}
                        </Text>
                      </View>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <View style={styles.limeHeaderActions}>
                        {!isAdmin &&
                          activeBooking.workerName &&
                          activeBooking.workerPhone && (
                            <TouchableOpacity
                              style={styles.limeIconBtn}
                              onPress={() =>
                                handleCall(activeBooking.workerPhone)
                              }
                            >
                              <Ionicons name="call" size={20} color="#1a1a1a" />
                            </TouchableOpacity>
                          )}
                        <TouchableOpacity
                          style={styles.limeIconBtn}
                          onPress={closeSheet}
                        >
                          <Ionicons name="close" size={20} color="#1a1a1a" />
                        </TouchableOpacity>
                      </View>

                      <Image
                        source={{ uri: activeBooking.carImage }}
                        style={[styles.limeAvatar, { marginTop: 12 }]}
                      />
                    </View>
                  </View>

                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.limeActionBtn}
                      onPress={() => setWorkerModalVisible(true)}
                    >
                      <Text style={styles.limeActionBtnText}>
                        {activeBooking.workerName
                          ? "Reassign Worker"
                          : "Assign Worker"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.darkCard}>
                  <View style={styles.darkHeader}>
                    <Text style={styles.darkTitle}>Service Schedule</Text>
                    <Ionicons name="calendar" size={20} color="#a78bfa" />
                  </View>

                  <Text style={styles.darkDate}>
                    {activeBooking.date} — {activeBooking.timeSlot}
                  </Text>

                  <Text style={styles.darkDescLabel}>Location</Text>
                  <Text style={styles.darkDesc} numberOfLines={2}>
                    {activeBooking.address}
                  </Text>

                  <View style={styles.darkStatsRow}>
                    <View style={styles.darkStatItem}>
                      <Text style={styles.darkStatLabel}>Vehicle</Text>
                      <View style={styles.darkStatValueRow}>
                        <Text style={styles.darkStatValue}>
                          {activeBooking.car}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.darkStatItem}>
                      <Text style={styles.darkStatLabel}>Plate No.</Text>
                      <Text style={styles.darkStatValue}>
                        {activeBooking.plate}
                      </Text>
                    </View>

                    <View style={styles.darkStatItem}>
                      <Text style={styles.darkStatLabel}>Booking ID</Text>
                      <Text style={styles.darkStatValue}>
                        #{activeBooking.id.slice(-4)}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
        </Animated.View>
      </Modal>

      {/* Worker Selection Modal */}
      <Modal visible={workerModalVisible} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => setWorkerModalVisible(false)}
        />
        <View style={styles.workerModalContainer}>
          <View style={styles.workerHeader}>
            <Text style={styles.sheetTitle}>Select Worker</Text>
            <TouchableOpacity onPress={() => setWorkerModalVisible(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={MOCK_WORKERS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.workerRow}
                onPress={() => handleAssignWorker(item)}
              >
                <View style={styles.workerAvatar}>
                  <Text style={styles.workerInitials}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.workerName}>{item.name}</Text>
                  <Text style={styles.workerPhone}>{item.phone}</Text>
                </View>
                <View style={styles.assignBtn}>
                  <Text style={styles.assignBtnText}>Assign</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  cardContainer: {
    marginBottom: 20,
  },
  sessionCard: {
    borderRadius: 20,
    paddingBottom: 80,
    padding: 20,
    margin: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sessionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  sessionSubtitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },

  sessionDuration: {
    marginTop: 6,
    fontSize: 14,
    color: "#64748B",
  },

  sessionActionRow: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  sessionButton: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  sessionButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropTouchable: { flex: 1 },

  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    maxHeight: "60%",
    elevation: 0,
    overflow: "hidden",
    paddingBottom: 40,
  },

  // --- LIME CARD STYLES ---
  limeCard: {
    backgroundColor: "#D1F803",
    borderRadius: 20,
    padding: 12,
    marginBottom: 8,
    zIndex: 2,
  },
  limeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  limeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.1)",
    marginRight: 7,
  },
  limeHeaderActions: {
    flexDirection: "row",
    gap: 8,
  },
  limeIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 7,
  },
  limeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 0,
    letterSpacing: -0.5,
  },
  limeTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
    marginTop: 4,
  },
  limeTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    gap: 4,
  },
  limeTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  limeRoleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0,0,0,0.6)",
    marginBottom: 0,
  },
  limeServiceTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
    marginBottom: 0,
  },
  limePrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  limePerMonth: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(0,0,0,0.6)",
  },
  limeActionBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  limeActionBtnText: {
    color: "#D1F803",
    fontWeight: "600",
    fontSize: 14,
  },

  // --- DARK CARD STYLES ---
  darkCard: {
    backgroundColor: "#27272a",
    borderRadius: 24,
    padding: 16,
    paddingBottom: 20,
  },
  darkHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  darkTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e2e8f0",
  },
  darkDate: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  darkDescLabel: {
    fontSize: 12,
    color: "#a1a1aa",
    marginBottom: 2,
  },
  darkDesc: {
    fontSize: 13,
    color: "#e4e4e7",
    lineHeight: 16,
    marginBottom: 12,
  },
  darkStatsRow: {
    flexDirection: "row",
    gap: 8,
  },
  darkStatItem: {
    flex: 1,
    backgroundColor: "#3f3f46",
    borderRadius: 12,
    padding: 10,
  },
  darkStatLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 4,
  },
  darkStatValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  darkStatValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  label: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "500",
  },
  value: {
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },

  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 12,
    marginVertical: 10,
  },
  callText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },

  sheetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: "500",
    color: "#111",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },
  cancelText: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "600",
  },

  scannerContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  permissionText: {
    fontSize: 18,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
  },
  allowButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  allowText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanBoxContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  scanBox: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: "#22C55E",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 4,
    backgroundColor: "#22C55E",
  },
  scanHint: {
    marginTop: 20,
    color: "#FFF",
    fontSize: 15,
    textAlign: "center",
    opacity: 0.9,
  },
  scannerCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0, 0, 0, 0.31)",
    borderRadius: 10,
    padding: 8,
  },

  flashButton: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 16,
    borderRadius: 50,
    borderWidth: 2,
  },

  // WORKER MODAL STYLES
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
  workerRow: {
    flexDirection: "row",
    alignItems: "center",
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
