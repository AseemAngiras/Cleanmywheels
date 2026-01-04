"use client";

import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import type { RootState } from "../../../store";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  type Booking,
  cancelBooking,
  completeBooking,
} from "../../../store/slices/bookingSlice";

export default function UpcomingServices() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const bookings = useAppSelector((state: RootState) =>
    state.bookings.bookings.filter((b: Booking) => b.status === "upcoming")
  );

  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  const [scannerVisible, setScannerVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  // --- ADMIN & WORKER LOGIC ---
  const userPhone = useAppSelector((state: RootState) => state.user.phone);

  // Ensure we handle potential undefined or different formats
  const isAdmin =
    userPhone &&
    (String(userPhone).endsWith("1234567890") ||
      String(userPhone).includes("1234567890"));

  const MOCK_WORKERS = [
    { id: "W1", name: "Amit Sharma", phone: "+919876543210" },
    { id: "W2", name: "Rahul Verma", phone: "+918765432109" },
    { id: "W3", name: "Suresh Singh", phone: "+917654321098" },
    { id: "W4", name: "Vikram Yadav", phone: "+916543210987" },
  ];

  const [workerModalVisible, setWorkerModalVisible] = useState(false);

  // Send WhatsApp to User ensuring them about the worker
  const sendUserConfirmation = (worker: any, booking: any) => {
    const message = `Hello, your booking for *${booking.serviceName}* is confirmed! 🚗✨\n\n*${worker.name}* will be arriving shortly to service your vehicle.\n\nBooking ID: ${booking.id}\nTime: ${booking.timeSlot}`;
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

  // Send WhatsApp to Worker with job details
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

  const handleAssignWorker = (worker: any) => {
    if (!activeBooking) return;

    Alert.alert(
      "Confirm Assignment",
      `Assign ${worker.name} to this job? This will open WhatsApp to notify both parties.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Assign & Notify",
          onPress: () => {
            // 1. Send to User
            sendUserConfirmation(worker, activeBooking);

            // 2. Send to Worker (slight delay or just open - linking might conflict if too fast, but usually valid)
            // Ideally we'd wait for user to return, but for simple flow we try:
            setTimeout(() => {
              sendWorkerJobDetails(worker, activeBooking);
            }, 1500);

            setWorkerModalVisible(false);
            closeSheet();
            Alert.alert(
              "Success",
              "Worker assigned and notifications initiated!"
            );
          },
        },
      ]
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

  useEffect(() => {
    if (scannerVisible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1800,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [scannerVisible]);

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

  const handleQrScanned = () => {
    if (!activeBooking) return;

    dispatch(completeBooking(activeBooking.id));

    setScannerVisible(false);
    setTorchOn(false);
    closeSheet();
    router.push("/(tabs)/bookings/arrival-confirmed");
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
              <Text style={styles.sessionButtonText}>I am at Workshop</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.qrIconButton}
              onPress={() => {
                setScannerVisible(true);
                setActiveBooking(item);
              }}
              hitSlop={10}
            >
              <Ionicons name="qr-code-outline" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 80 }}>
            <Ionicons name="calendar-outline" size={60} color="#CBD5E1" />
            <Text style={{ fontSize: 18, fontWeight: "600", marginTop: 16 }}>
              No upcoming bookings
            </Text>
            <Text style={{ color: "#64748B", marginTop: 6 }}>
              Book a service to see it here
            </Text>
          </View>
        )}
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
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Booking Details</Text>
            <TouchableOpacity onPress={closeSheet}>
              <Ionicons name="close" size={28} />
            </TouchableOpacity>
          </View>

          {activeBooking && (
            <>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() => setScannerVisible(true)}
              >
                <Ionicons name="qr-code-outline" size={22} />
                <Text style={styles.qrText}>Scan QR to Check-In</Text>
              </TouchableOpacity>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Service</Text>
                <Text style={styles.value}>{activeBooking.serviceName}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Center</Text>
                <Text style={styles.value}>{activeBooking.center}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{activeBooking.address}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.value}>{activeBooking.date}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Time</Text>
                <Text style={styles.value}>{activeBooking.timeSlot}</Text>
              </View>

              {/* Car */}
              <View style={styles.detailRow}>
                <Text style={styles.label}>Car</Text>
                <Text style={styles.value}>{activeBooking.car}</Text>
              </View>

              {/* Plate */}
              <View style={styles.detailRow}>
                <Text style={styles.label}>Plate No.</Text>
                <Text style={styles.value}>{activeBooking.plate}</Text>
              </View>

              {!isAdmin && (
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(activeBooking.phone)}
                >
                  <Ionicons name="call-outline" size={18} />
                  <Text style={styles.callText}>{activeBooking.phone}</Text>
                </TouchableOpacity>
              )}

              {isAdmin && (
                <TouchableOpacity
                  style={[
                    styles.qrButton,
                    {
                      backgroundColor: "#1a1a1a",
                      borderColor: "#000",
                      marginTop: 10,
                    },
                  ]}
                  onPress={() => setWorkerModalVisible(true)}
                >
                  <Ionicons name="person-add-outline" size={20} color="#FFF" />
                  <Text style={[styles.qrText, { color: "#FFF" }]}>
                    Assign Worker
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.sheetFooter}>
                <Text style={styles.price}>₹ {activeBooking.price}</Text>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleDelete(activeBooking.id)}
                >
                  <Ionicons name="trash-outline" size={18} />
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal visible={scannerVisible} animationType="slide">
        <TouchableOpacity
          style={styles.scannerCloseButton}
          onPress={() => setScannerVisible(false)}
        >
          <Ionicons name="close" size={28} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.scannerContainer}>
          {!permission?.granted ? (
            <View style={styles.permissionView}>
              <Text style={styles.permissionText}>
                Camera permission required
              </Text>
              <TouchableOpacity
                style={styles.allowButton}
                onPress={requestPermission}
              >
                <Text style={styles.allowText}>Allow Camera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <CameraView
                style={StyleSheet.absoluteFill}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                onBarcodeScanned={handleQrScanned}
                enableTorch={torchOn}
              />

              {/* Overlay with scan box and scan line */}
              <View style={styles.overlay}>
                <View style={styles.scanBoxContainer}>
                  <View style={styles.scanBox}>
                    <Animated.View
                      style={[
                        styles.scanLine,
                        {
                          transform: [
                            {
                              translateY: scanLineAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 260],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                </View>

                <Text style={styles.scanHint}>
                  Align QR code inside the frame
                </Text>

                <TouchableOpacity
                  style={styles.flashButton}
                  onPress={() => setTorchOn(!torchOn)}
                >
                  <Ionicons name="flashlight-outline" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
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
    paddingBottom: 90,
    padding: 20,
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
    fontSize: 20,
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
    bottom: 20,
    left: 20,
    right: 20,
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

  qrIconButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#C8F000",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
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
    paddingBottom: 30,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 16,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
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

  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#C8F000",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  qrText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
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
