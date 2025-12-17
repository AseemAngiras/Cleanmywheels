"use client"

import { Ionicons } from "@expo/vector-icons"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useState } from "react"
import {
  Alert,
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [scannerVisible, setScannerVisible] = useState(false)
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null)
  const [permission, requestPermission] = useCameraPermissions()

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleDelete = (id: string) => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?\n\n• Cancellation may be subject to provider policies\n• Refund eligibility depends on timing",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () =>
            setBookings((prev) => prev.filter((b) => b.id !== id)),
        },
      ],
    )
  }

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
  }

  const handleOpenScanner = (bookingId: string) => {
    setActiveBookingId(bookingId)
    setScannerVisible(true)
  }

  const handleQrScanned = ({ data }: { data: string }) => {
    setScannerVisible(false)

    Alert.alert(
      "Arrival Confirmed",
      "You have successfully checked in at the service center.",
    )

    // 🔥 Backend call
    // bookingId -> activeBookingId
    // qr payload -> data
  }

  const renderItem = ({ item }: { item: (typeof initialBookings)[0] }) => {
    const isExpanded = expandedId === item.id

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => toggleExpand(item.id)}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Image source={{ uri: item.carImage }} style={styles.carImage} />

            <View style={styles.textContainer}>
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

              {/* CONFIRMED TEXT */}
              <Text style={styles.confirmedText}>Confirmed</Text>
            </View>

            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#888"
            />
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />

              {/* QR SCAN BUTTON */}
              <TouchableOpacity
                style={styles.qrButton}
                onPress={() => handleOpenScanner(item.id)}
              >
                <Ionicons
                  name="qr-code-outline"
                  size={22}
                  color="#1A1A1A"
                />
                <Text style={styles.qrText}>Scan QR to Check-In</Text>
              </TouchableOpacity>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Service</Text>
                  <Text style={styles.value}>{item.service}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Address</Text>
                  <Text style={styles.value}>{item.address}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Plate</Text>
                  <Text style={styles.value}>{item.plate}</Text>
                </View>
              </View>

              <View style={styles.contactSection}>
                <Text style={styles.contactHeader}>Workshop Contact</Text>
                <TouchableOpacity
                  style={styles.contactBtn}
                  onPress={() => handleCall(item.phone)}
                >
                  <Ionicons name="call-outline" size={18} color="#007AFF" />
                  <Text style={styles.contactBtnText}>{item.phone}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.footer}>
                <Text style={styles.price}>{item.price}</Text>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(item.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color="#FF3B30"
                  />
                  <Text style={styles.deleteText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <>
      {/* QR SCANNER MODAL */}
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

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
      />
    </>
  )
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 96,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  headerRow: {
    flexDirection: "row",
    gap: 16,
  },
  carImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
  textContainer: {
    flex: 1,
  },
  centerName: {
    fontSize: 18,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  metaText: {
    color: "#666",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CCC",
  },
  confirmedText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#34C759",
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginBottom: 12,
  },
  qrButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    padding: 14,
    backgroundColor: "#FFF7CC",
    borderRadius: 12,
    marginBottom: 12,
  },
  qrText: {
    fontWeight: "700",
  },
  detailsContainer: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: "#888",
  },
  value: {
    fontWeight: "500",
  },
  contactSection: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
  },
  contactHeader: {
    fontWeight: "600",
    marginBottom: 8,
  },
  contactBtn: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  contactBtnText: {
    color: "#007AFF",
  },
  footer: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
  },
  deleteBtn: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  deleteText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
  permissionView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  allowText: {
    color: "#007AFF",
    marginTop: 10,
  },
  closeScanner: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 20,
  },
})
