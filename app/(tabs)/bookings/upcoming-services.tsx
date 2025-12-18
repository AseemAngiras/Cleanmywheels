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
  {
    id: "2",
    carImage: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
    center: "Prime Auto Service",
    date: "2023-10-12",
    car: "Toyota Camry",
    service: "Full Car Wash",
    time: "10:00 AM",
    address: "789 Maple Street, Riverside",
    plate: "CAM456",
    price: "$40",
    phone: "+1 (555) 321-7788",
  },
  {
    id: "3",
    carImage: "https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg",
    center: "Elite Motors",
    date: "2023-10-20",
    car: "BMW 3 Series",
    service: "Brake Inspection",
    time: "4:15 PM",
    address: "123 Luxury Drive, Downtown",
    plate: "BMW903",
    price: "$120",
    phone: "+1 (555) 654-9981",
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
  }

  const renderItem = ({ item }: { item: (typeof initialBookings)[0] }) => {
    const isExpanded = expandedId === item.id

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => toggleExpand(item.id)}
        style={styles.cardContainer}
      >
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Image source={{ uri: item.carImage }} style={styles.carImage} />

            <View style={styles.textContainer}>
              <Text style={styles.centerName}>{item.center}</Text>

              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={15} color="#888" />
                <Text style={styles.metaText}>{item.date}</Text>
                <View style={styles.dot} />
                <Ionicons name="time-outline" size={15} color="#888" />
                <Text style={styles.metaText}>{item.time}</Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="car-outline" size={15} color="#888" />
                <Text style={styles.metaText}>{item.car}</Text>
              </View>

              <View style={styles.confirmedBadge}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#1E8E3E"
                />
                <Text style={styles.confirmedText}>Confirmed</Text>
              </View>
            </View>

            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={22}
              color="#888"
            />
          </View>

          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />

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

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 96,
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    minHeight: 170,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  headerRow: {
    flexDirection: "row",
    gap: 18,
  },
  carImage: {
    width: 110,
    height: 135,
    borderRadius: 10,
  },
  textContainer: {
    flex: 1,
  },
  centerName: {
    fontSize: 20,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
    marginTop: 4,
  },
  metaText: {
    color: "#666",
    fontSize: 14,
  },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 2,
    backgroundColor: "#CCC",
  },
  confirmedBadge: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#E6F4EA",
  },
  confirmedText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E8E3E",
  },
  expandedContent: {
    marginTop: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginBottom: 14,
  },
  qrButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    backgroundColor: "#FFF7CC",
    borderRadius: 14,
    marginBottom: 14,
  },
  qrText: {
    fontWeight: "700",
    fontSize: 15,
  },
  detailsContainer: {
    gap: 12,
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
    marginTop: 18,
    padding: 14,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
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
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 22,
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
