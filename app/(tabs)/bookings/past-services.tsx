"use client"

import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"

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
    status: "COMPLETED",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "2",
    carImage: "https://images.pexels.com/photos/244206/pexels-photo-244206.jpeg",
    center: "Auto Care Plus",
    date: "2023-07-22",
    car: "Honda Accord",
    service: "Tire Rotation",
    time: "2:30 PM",
    address: "456 Oak Avenue, Springfield",
    plate: "XYZ789",
    price: "$75",
    status: "COMPLETED",
    phone: "+1 (555) 987-6543",
  },
  {
    id: "3",
    carImage: "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg",
    center: "Premium Motors Service",
    date: "2023-09-10",
    car: "BMW 3 Series",
    service: "Full Service",
    time: "9:00 AM",
    address: "789 Elm Street, Downtown",
    plate: "LMN456",
    price: "$150",
    status: "COMPLETED",
    phone: "+1 (555) 456-7890",
  },
]

export default function PastServices() {
  const [bookings] = useState(initialBookings)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const renderItem = ({ item }: { item: (typeof initialBookings)[0] }) => {
    const isExpanded = expandedId === item.id

    return (
      <TouchableOpacity activeOpacity={0.8} onPress={() => toggleExpand(item.id)} style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            {/* Car Image on Left */}
            <Image source={{ uri: item.carImage }} style={styles.carImage} />

            {/* Center Content */}
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
            </View>

            {/* Icon on Right */}
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} style={{marginBottom: 50}} color="#888" />
          </View>

          {/* Expanded details */}
          {isExpanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />

              <View
                style={[
                  styles.statusBadge,
                  item.status === "COMPLETED" && styles.completedBadge,
                  item.status === "CANCELLED" && styles.cancelledBadge,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    item.status === "COMPLETED" && styles.completedDot,
                    item.status === "CANCELLED" && styles.cancelledDot,
                  ]}
                />
                <Text
                  style={[
                    styles.status,
                    item.status === "COMPLETED" && styles.completedStatus,
                    item.status === "CANCELLED" && styles.cancelledStatus,
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="construct-outline" size={16} color="#888" />
                    <Text style={styles.label}>Service</Text>
                  </View>
                  <Text style={styles.value}>{item.service}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="time-outline" size={16} color="#888" />
                    <Text style={styles.label}>Time</Text>
                  </View>
                  <Text style={styles.value}>{item.time}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="location-outline" size={16} color="#888" />
                    <Text style={styles.label}>Address</Text>
                  </View>
                  <Text style={[styles.value, styles.addressValue]}>{item.address}</Text>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Ionicons name="card-outline" size={16} color="#888" />
                    <Text style={styles.label}>Plate</Text>
                  </View>
                  <Text style={styles.value}>{item.plate}</Text>
                </View>
              </View>

              <View style={styles.footer}>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Total Amount</Text>
                  <Text style={styles.price}>{item.price}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      renderItem={renderItem}
    />
  )
}

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 96,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  carImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  centerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: "#666",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#CCC",
    marginHorizontal: 4,
  },
  expandedContent: {
    marginTop: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
    gap: 6,
  },
  completedBadge: {
    backgroundColor: "#E8F8ED",
  },
  cancelledBadge: {
    backgroundColor: "#FFE8E8",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  completedDot: {
    backgroundColor: "#34C759",
  },
  cancelledDot: {
    backgroundColor: "#FF3B30",
  },
  status: {
    fontSize: 12,
    fontWeight: "700",
  },
  completedStatus: {
    color: "#34C759",
  },
  cancelledStatus: {
    color: "#FF3B30",
  },
  detailsContainer: {
    gap: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  detailLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 100,
  },
  label: {
    fontSize: 14,
    color: "#888",
  },
  value: {
    fontSize: 14,
    color: "#1A1A1A",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  addressValue: {
    maxWidth: "60%",
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
})
