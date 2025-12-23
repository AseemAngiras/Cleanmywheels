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

import { RootState } from "../../../store";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  Booking,
  cancelBooking,
  completeBooking,
} from "../../../store/slices/bookingSlice";

export default function UpcomingServices() {
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

              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(activeBooking.phone)}
              >
                <Ionicons name="call-outline" size={18} />
                <Text style={styles.callText}>{activeBooking.phone}</Text>
              </TouchableOpacity>

              <View style={styles.sheetFooter}>
                <Text style={styles.price}>{activeBooking.price}</Text>
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
    paddingBottom: 50,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
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
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  qrText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  label: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    color: "#1E293B",
    fontSize: 15,
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
    padding: 16,
    marginVertical: 16,
  },
  callText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "600",
  },

  sheetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  price: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },
  cancelText: {
    color: "#B91C1C",
    fontSize: 16,
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
});
