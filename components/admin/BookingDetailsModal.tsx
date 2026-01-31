import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface BookingDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  booking: any;
}

export default function BookingDetailsModal({
  visible,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Could not open dialer"),
    );
  };

  const handleWhatsApp = (phone: string) => {
    const url = `whatsapp://send?phone=${phone}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "WhatsApp not installed"),
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Booking Details</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            {/* User Info */}
            <View style={styles.section}>
              <View style={styles.userRow}>
                <Image source={{ uri: booking.avatar }} style={styles.avatar} />
                <View>
                  <Text style={styles.userName}>{booking.customerName}</Text>
                  <Text style={styles.userPhone}>+91 {booking.phone}</Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    onPress={() => handleCall(booking.phone)}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="call" size={20} color="#007BFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleWhatsApp(booking.phone)}
                    style={styles.iconBtn}
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Service Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Service Details</Text>
              <View style={styles.detailRow}>
                <Ionicons name="car-sport-outline" size={18} color="#666" />
                <Text style={styles.detailText}>
                  {booking.car} ({booking.license})
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="water-outline" size={18} color="#666" />
                <Text style={styles.detailText}>{booking.service}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={styles.detailText}>{booking.time}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.detailText}>
                  {new Date(
                    booking.bookingDate || Date.now(),
                  ).toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Address */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.detailText}>{booking.address}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Status & Price */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Status</Text>
              <Text
                style={[
                  styles.statValue,
                  {
                    color: booking.status === "COMPLETED" ? "green" : "#eab308",
                  },
                ]}
              >
                {booking.status}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Price</Text>
              <Text style={styles.statValue}>₹{booking.price}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdropTouchable: { flex: 1 },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "70%",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  contactActions: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  iconBtn: {
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 50,
    marginLeft: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    fontSize: 15,
    color: "#444",
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
});
