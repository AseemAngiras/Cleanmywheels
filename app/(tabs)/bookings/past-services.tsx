"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  FlatList,
  Image,
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
    center: "Service Center A",
    date: "2023-08-15",
    car: "Toyota Camry",
    service: "Oil Change",
    time: "10:00 AM",
    address: "123 Main St, Anytown",
    plate: "ABC123",
    price: "$50",
  },
]

export default function PastServices() {
  const [bookings] = useState(initialBookings)
  const [activeBooking, setActiveBooking] = useState<any | null>(null)

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

            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#1E8E3E" />
              <Text style={styles.completedText}>Completed</Text>
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
        showsVerticalScrollIndicator={false}
      />

      {/* =============== BOTTOM SHEET =============== */}
      <Modal visible={!!activeBooking} transparent animationType="none">
        <TouchableOpacity style={styles.backdrop} onPress={closeSheet} />

        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Service Details</Text>
            <TouchableOpacity onPress={closeSheet}>
              <Ionicons name="close" size={26} />
            </TouchableOpacity>
          </View>

          {activeBooking && (
            <>
              {/* SERVICE SUMMARY */}
              <View style={styles.summaryCard}>
                <Ionicons name="construct-outline" size={26} color="#1A1A1A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.serviceName}>
                    {activeBooking.service}
                  </Text>
                  <Text style={styles.summaryMeta}>
                    {activeBooking.date} • {activeBooking.time}
                  </Text>
                </View>
                <View style={styles.completedPill}>
                  <Text style={styles.completedPillText}>COMPLETED</Text>
                </View>
              </View>

              {/* CAR INFO */}
              <View style={styles.infoCard}>
                <Ionicons name="car-sport-outline" size={22} color="#555" />
                <View>
                  <Text style={styles.infoTitle}>{activeBooking.car}</Text>
                  <Text style={styles.infoSub}>{activeBooking.plate}</Text>
                </View>
              </View>

              {/* LOCATION */}
              <View style={styles.infoCard}>
                <Ionicons name="location-outline" size={22} color="#555" />
                <Text style={styles.locationText}>
                  {activeBooking.address}
                </Text>
              </View>

              {/* PAYMENT */}
              <View style={styles.paymentCard}>
                <Text style={styles.paymentLabel}>Total Paid</Text>
                <Text style={styles.paymentAmount}>
                  {activeBooking.price}
                </Text>
              </View>
            </>
          )}
        </Animated.View>
      </Modal>
    </>
  )
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  cardContainer: { marginBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    elevation: 4,
  },
  headerRow: { flexDirection: "row", gap: 16},
  carImage: { width: 100, height: 120, borderRadius: 12 },
  centerName: { fontSize: 18, fontWeight: "500" },
  metaRow: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    marginTop: 4,
  },
  metaText: { color: "#666", fontSize: 14 },
  dot: { width: 3, height: 3, borderRadius: 3, backgroundColor: "#CCC" },

  completedBadge: {
    marginTop: 10,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: "#E6F4EA",
    alignSelf: "flex-start",
  },
  completedText: { fontSize: 12, fontWeight: "600", color: "#1E8E3E" },

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

  summaryCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  serviceName: { fontSize: 16, fontWeight: "700" },
  summaryMeta: { color: "#666", marginTop: 2 },

  completedPill: {
    backgroundColor: "#E6F4EA",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  completedPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1E8E3E",
  },

  infoCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#EEE",
    marginBottom: 12,
  },
  infoTitle: { fontWeight: "600" },
  infoSub: { color: "#666", fontSize: 13 },
  locationText: { flex: 1, color: "#444" },

  paymentCard: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  paymentLabel: { color: "#888" },
  paymentAmount: { fontSize: 22, fontWeight: "700" },
})
