import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const pastBookings = [
  {
    id: "1",
    service: "Interior Detailing",
    price: "$85.00",
    center: "GlowWash Hub",
    address: "45 Tech Park Road",
    date: "Oct 10, 2024",
    time: "02:30 PM",
    car: "Honda CR-V",
    plate: "DL-3C-5678",
  },
];

export default function PastServices() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <FlatList
      data={pastBookings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => {
        const expanded = expandedId === item.id;

        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.service}>{item.service}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>

            {expanded && (
              <>
                <Text style={styles.meta}>{item.center}</Text>
                <Text style={styles.meta}>{item.address}</Text>
                <Text style={styles.meta}>
                  {item.date} • {item.time}
                </Text>
                <Text style={styles.meta}>
                  {item.car} • {item.plate}
                </Text>
              </>
            )}

            <TouchableOpacity
              onPress={() =>
                setExpandedId(expanded ? null : item.id)
              }
              style={styles.detailsBtn}
            >
              <Text style={styles.detailsText}>
                {expanded ? "Hide Details" : "Details"}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }}
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
  detailsBtn: {
    marginTop: 12,
  },
  detailsText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
