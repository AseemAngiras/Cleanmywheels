import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const initialBookings = [
  {
    id: "1",
    status: "CONFIRMED",
    service: "Premium Foam Wash",
    price: "$35.00",
    center: "Speedy Wash Station",
    address: "123 Main St, Downtown",
    date: "Oct 25",
    time: "10:00 AM",
    car: "Toyota Camry",
    plate: "KA-01-MJ-1234",
  },
];

export default function UpcomingServices() {
  const [bookings, setBookings] = useState(initialBookings);

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
      ]
    );
  };

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.status}>{item.status}</Text>

          <View style={styles.row}>
            <Text style={styles.service}>{item.service}</Text>
            <Text style={styles.price}>{item.price}</Text>
          </View>

          <Text style={styles.meta}>{item.center}</Text>
          <Text style={styles.meta}>{item.address}</Text>
          <Text style={styles.meta}>
            {item.date} • {item.time}
          </Text>
          <Text style={styles.meta}>
            {item.car} • {item.plate}
          </Text>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
          >
            <Ionicons name="trash-outline" size={16} color="red" />
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  status: {
    color: "green",
    fontWeight: "700",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  service: {
    fontSize: 16,
    fontWeight: "700",
  },
  price: {
    fontWeight: "700",
  },
  meta: {
    color: "#777",
    marginTop: 4,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  deleteText: {
    color: "red",
    marginLeft: 6,
  },
});
