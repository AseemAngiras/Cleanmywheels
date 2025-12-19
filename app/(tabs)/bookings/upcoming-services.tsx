"use client"

import { Ionicons } from "@expo/vector-icons"
import { CameraView, useCameraPermissions } from "expo-camera"
import { router } from "expo-router"
import { useEffect, useRef, useState } from "react"

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
} from "react-native"

const initialBookings = [
  {
    id: "1",
    carImage: "https://images.pexels.com/photos/4906936/pexels-photo-4906936.jpeg",
    center: "Auto Care Plus",
    date: "2023-10-05",
    car: "Honda Accord",
    service: "Tire Rotation",
    time: "2:30 PM",
    address: "456 Oak Avenue, Springfield",
    plate: "XYZ789",
    price: "$75",
    phone: "+1 (555) 987-6543",
  },
]

export default function UpcomingServices() {
  const [bookings, setBookings] = useState(initialBookings)
  const [activeBooking, setActiveBooking] = useState<any | null>(null)

  const [scannerVisible, setScannerVisible] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const [torchOn, setTorchOn] = useState(false)

  // Animations
  const slideAnim = useRef(new Animated.Value(300)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

  const scanLineAnim = useRef(new Animated.Value(0)).current

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
      ]).start()
    }
  }, [activeBooking])

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
      ).start()
    }
  }, [scannerVisible])

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
    ]).start(() => setActiveBooking(null))
  }

  const handleQrScanned = ({ data }: { data: string }) => {
    setScannerVisible(false)
    setTorchOn(false)
    router.push("/bookings/arrival-confirmed")
  }

  const handleDelete = (id: string) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          setBookings((prev) => prev.filter((b) => b.id !== id))
          closeSheet()
        },
      },
    ])
  }

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={() => setActiveBooking(item)}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Image source={{ uri: item.carImage }} style={styles.carImage} />
          <View style={styles.cardContent}>
            <Text style={styles.centerName}>{item.center}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{item.date}</Text>
              <View style={styles.dot} />
              <Ionicons name="time-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{item.time}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="car-outline" size={14} color="#666" />
              <Text style={styles.metaText}>{item.car}</Text>
            </View>

            <View style={styles.confirmedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
              <Text style={styles.confirmedText}>Confirmed</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Sheet Modal */}
      <Modal visible={!!activeBooking} transparent animationType="none">
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <TouchableOpacity style={styles.backdropTouchable} onPress={closeSheet} />
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
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {activeBooking && (
            <>
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() => setScannerVisible(true)}
              >
                <Ionicons name="qr-code-outline" size={22} color="#000" />
                <Text style={styles.qrText}>Scan QR to Check-In</Text>
              </TouchableOpacity>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Service</Text>
                <Text style={styles.value}>{activeBooking.service}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Address</Text>
                <Text style={styles.value}>{activeBooking.address}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Plate</Text>
                <Text style={styles.value}>{activeBooking.plate}</Text>
              </View>

              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(activeBooking.phone)}
              >
                <Ionicons name="call-outline" size={18} color="#2563EB" />
                <Text style={styles.callText}>{activeBooking.phone}</Text>
              </TouchableOpacity>

              <View style={styles.sheetFooter}>
                <Text style={styles.price}>{activeBooking.price}</Text>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleDelete(activeBooking.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
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
              <Text style={styles.permissionText}>Camera permission required</Text>
              <TouchableOpacity style={styles.allowButton} onPress={requestPermission}>
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

              {/* Overlay */}
              <View style={styles.overlay}>
                <View style={styles.overlayCenter}>
                  <View style={styles.overlaySide} />
                  <View style={styles.scanBoxContainer}>
                    <View style={styles.scanBox}>

                      {/* Animated scan line */}
                      <Animated.View
                        style={[
                          styles.scanLine,
                          {
                            transform: [
                              {
                                translateY: scanLineAnim.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0, 250 - 4],
                                }),
                              },
                            ],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.scanHint}>
                      Position the device at the level of QR code
                    </Text>
                  </View>
                  <View style={styles.overlaySide} />
                </View>
              </View>

              {/* Header */}
              <View style={styles.scannerHeader}>
                <TouchableOpacity onPress={() => setScannerVisible(false)}>
                  <Ionicons name="close" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.scanTitle}>Scan QR Code</Text>
                <View style={{ width: 28 }} />
              </View>

              {/* Flashlight */}
              <TouchableOpacity
                style={styles.flashButton}
                onPress={() => setTorchOn((prev) => !prev)}
              >
                <Ionicons
                  name={torchOn ? "flashlight" : "flashlight-outline"}
                  size={24}
                  color="#FFF"
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  carImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  cardContent: {
    flex: 1,
  },
  centerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    color: "#64748B",
    fontSize: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  confirmedBadge: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignSelf: "flex-start",
  },
  confirmedText: {
    color: "#15803D",
    fontSize: 13,
    fontWeight: "600",
  },

  // Bottom Sheet
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: "absolute",
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
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  qrText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E40AF",
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
    // backgroundColor: "rgba(0,0,0,0.6)",
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
  topLeft: { top: 0, left: 0, borderTopLeftRadius: 8, },
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
})