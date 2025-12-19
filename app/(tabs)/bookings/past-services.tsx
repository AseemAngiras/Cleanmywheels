"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
  Animated,
  Easing,
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

  const slideAnim = useRef(new Animated.Value(300)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current
  const opacityAnim = useRef(new Animated.Value(0)).current

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

      <Modal visible={!!activeBooking} transparent animationType="none">
        {/* Backdrop with fade animation */}
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeSheet} />
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
            <Text style={styles.sheetTitle}>Service Details</Text>
            <TouchableOpacity onPress={closeSheet}>
              <Ionicons name="close" size={28} color="#333" />
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

const styles = StyleSheet.create({
  cardContainer: { marginBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  headerRow: { flexDirection: "row", gap: 16 },
  carImage: { width: 100, height: 100, borderRadius: 12, marginTop: 6 },
  centerName: { fontSize: 18, fontWeight: "600", color: "#111" },
  metaRow: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    marginTop: 6,
  },
  metaText: { color: "#64748B", fontSize: 14 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#CBD5E1" },

  completedBadge: {
    marginTop: 12,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignSelf: "flex-start",
  },
  completedText: { fontSize: 13, fontWeight: "600", color: "#15803D" },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
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
    paddingBottom: 50,
    maxHeight: "90%",
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
  sheetTitle: { fontSize: 20, fontWeight: "700", color: "#111" },

  summaryCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  serviceName: { fontSize: 17, fontWeight: "700", color: "#111" },
  summaryMeta: { color: "#64748B", marginTop: 4, fontSize: 14 },

  completedPill: {
    backgroundColor: "#BBF7D0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  completedPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },

  infoCard: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  infoTitle: { fontWeight: "600", fontSize: 15, color: "#1E293B" },
  infoSub: { color: "#64748B", fontSize: 14, marginTop: 2 },
  locationText: { flex: 1, color: "#444", fontSize: 15 },

  paymentCard: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentLabel: { color: "#64748B", fontSize: 16 },
  paymentAmount: { fontSize: 26, fontWeight: "700", color: "#111" },
})