"use client";

import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList, Image, Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  cancelBooking,
  completeBooking,
} from "../../../store/slices/bookingSlice";

export default function UpcomingServices() {
  const dispatch = useAppDispatch();

  const bookings = useAppSelector((state) =>
    state.bookings.bookings.filter(
      (b) => b.status === "upcoming"
    )
  );

  const [activeBooking, setActiveBooking] = useState<any | null>(null);

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

  const renderItem = ({ item }: any) => (
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

        <View style={styles.sessionButton}>
          <Text style={styles.sessionButtonText}>I am at Workshop</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFF" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

      {/* Scanner Modal */}
      <Modal visible={scannerVisible} animationType="slide">
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
            <CameraView
              style={StyleSheet.absoluteFill}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleQrScanned}
              enableTorch={torchOn}
            />
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

  sessionButton: {
    marginTop: 18,
    backgroundColor: "#000",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
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
  backdropTouchable: {
    flex: 1,
  },
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

  // Scanner
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

  scannerHeader: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 10,
  },
  scanTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
  },
  overlayCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  overlaySide: {
    flex: 1,
    height: "100%",
  },
  scanBoxContainer: {
    alignItems: "center",
  },
  scanBox: {
    width: 260,
    height: 260,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  topLeft: { top: 0, left: 0, borderTopLeftRadius: 8 },
  topRight: { top: 0, right: 0, borderTopRightRadius: 8 },
  bottomLeft: { bottom: 0, left: 0, borderBottomLeftRadius: 8 },
  bottomRight: { bottom: 0, right: 0, borderBottomRightRadius: 8 },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 4,
    backgroundColor: "#22C55E",
    shadowColor: "#22C55E",
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  scanHint: {
    marginTop: 20,
    color: "#FFF",
    fontSize: 15,
    textAlign: "center",
    opacity: 0.9,
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
