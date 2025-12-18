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
  expandedContent: {
    marginTop: 18,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEE",
    marginBottom: 14,
  },
  detailsContainer: {
    marginTop: 10,
    gap: 5,
  },
  detailLabel: {
  flexDirection: "row", 
  alignItems: "center", 
  gap: 6,               
  minWidth: 100,
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
  footer: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  price: {
    fontSize: 22,
    fontWeight: "400",
  },
});
