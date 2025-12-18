"use client"

import { Ionicons } from "@expo/vector-icons"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useEffect, useRef, useState } from "react"
import { router } from "expo-router"

import {
  Alert,
  Animated,
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

  const slideAnim = useRef(new Animated.Value(600)).current

  useEffect(() => {
    if (activeBooking) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [activeBooking])

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 600,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setActiveBooking(null))
  }

  const handleQrScanned = ({ data }: { data: string }) => {
  setScannerVisible(false)

  router.push("/bookings/arrival-confirmed")
}


  const handleDelete = (id: string) => {
    Alert.alert("Cancel Booking", "Are you sure?", [
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
      activeOpacity={0.85}
      style={styles.cardContainer}
      onPress={() => setActiveBooking(item)}
    >
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Image source={{ uri: item.carImage }} style={styles.carImage} />

          <View style={{ flex: 1 }}>
            <Text style={styles.centerName}>{item.center}</Text>

            <View style={styles.metaRow}>
              <Ionicons name="calendar-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{item.date}</Text>
              <View style={styles.dot} />
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{item.time}</Text>
            </View>

            <View style={styles.metaRow}>
              <Ionicons name="car-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{item.car}</Text>
            </View>

            <View style={styles.confirmedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#1E8E3E" />
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
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      />

      <Modal visible={!!activeBooking} transparent animationType="none">
        <TouchableOpacity style={styles.backdrop} onPress={closeSheet} />

        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Booking Details</Text>
            <TouchableOpacity onPress={closeSheet}>
              <Ionicons name="close" size={26} />
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
                <Text>{activeBooking.service}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Address</Text>
                <Text>{activeBooking.address}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.label}>Plate</Text>
                <Text>{activeBooking.plate}</Text>
              </View>

              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleCall(activeBooking.phone)}
              >
                <Ionicons name="call-outline" size={18} />
                <Text>{activeBooking.phone}</Text>
              </TouchableOpacity>

              <View style={styles.sheetFooter}>
                <Text style={styles.price}>{activeBooking.price}</Text>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleDelete(activeBooking.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Animated.View>
      </Modal>

      <Modal visible={scannerVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          {!permission?.granted ? (
            <View style={styles.permissionView}>
              <Text>Camera permission required</Text>
              <TouchableOpacity onPress={requestPermission}>
                <Text style={styles.allowText}>Allow Camera</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <CameraView
              style={{ flex: 1 }}
              barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              onBarcodeScanned={handleQrScanned}
            />
          )}

          <TouchableOpacity
            style={styles.closeScanner}
            onPress={() => setScannerVisible(false)}
          >
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  cardContainer: { marginBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },
  headerRow: { flexDirection: "row", gap: 16 },
  carImage: { width: 100, height: 120, borderRadius: 12 },
  centerName: { fontSize: 18, fontWeight: "700" },
  metaRow: { flexDirection: "row", gap: 4, alignItems: "center", marginTop: 4 },
  metaText: { color: "#666" },
  dot: { width: 3, height: 3, borderRadius: 3, backgroundColor: "#CCC" },
  confirmedBadge: {
    marginTop: 8,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#E6F4EA",
    alignSelf: "flex-start",
  },
  confirmedText: { color: "#1E8E3E", fontSize: 12, fontWeight: "600" },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 50,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: "700" },

  qrButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "#C8F000",
    borderRadius: 14,
    marginBottom: 16,
  },
  qrText: { fontWeight: "500", fontSize: 18, },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: { color: "#888" },

  callBtn: { flexDirection: "row", gap: 8, marginVertical: 14 },

  sheetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { fontSize: 22, fontWeight: "700" },
  cancelBtn: { flexDirection: "row", gap: 6, alignItems: "center" },
  cancelText: { color: "#FF3B30", fontWeight: "600" },

  permissionView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  allowText: { color: "#007AFF", marginTop: 10 },

  closeScanner: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 20,
  },
})
