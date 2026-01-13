import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { addBooking } from "../../../../store/slices/bookingSlice";

const { width } = Dimensions.get("window");

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    shopName,
    shopAddress,
    shopImage,
    shopRating,
    selectedDate,
    selectedTime,
    paymentMethod,
    grandTotal,
  } = params;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      addBooking({
        center: (params.shopName as string) || "Your Location",
        date: params.selectedDate as string,
        timeSlot: params.selectedTime as string,
        car: params.vehicleType
          ? `${params.vehicleType} - ${params.vehicleNumber}`
          : "Vehicle",
        carImage: "https://cdn-icons-png.flaticon.com/512/743/743007.png",
        phone: params.userPhone as string,
        price: Number(params.grandTotal),
        address: params.address as string,
        plate: params.vehicleNumber as string,
        serviceName: params.serviceName as string,
        serviceId: params.serviceId as string,
      })
    );
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark" size={50} color="#1a1a1a" />
          </View>
          <Text style={styles.statusTitle}>Booking Confirmed!</Text>
          {/* <Text style={styles.statusSubtitle}>
            Ticket #CMW-{Math.floor(Math.random() * 10000)}
          </Text> */}
        </View>

        {/* What Happens Next Section */}
        <View style={styles.nextStepsContainer}>
          <Text style={styles.sectionTitle}>What happens next?</Text>
          <View style={styles.stepsRow}>
            <View style={styles.stepItem}>
              <View style={styles.stepIconBox}>
                <Ionicons name="briefcase-outline" size={24} color="#1a1a1a" />
              </View>
              <Text style={styles.stepText}>Assigning Professional</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={styles.stepIconBox}>
                <Ionicons name="navigate-outline" size={24} color="#1a1a1a" />
              </View>
              <Text style={styles.stepText}>On the Way</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View style={styles.stepIconBox}>
                <Ionicons name="list-outline" size={24} color="#1a1a1a" />
              </View>
              <Text style={styles.stepText}>Your Service </Text>
            </View>
          </View>
        </View>

        {/* Booking Details Summary */}
        <View style={styles.detailsCard}>
          <View style={styles.receiptTop}>
            <View style={styles.receiptHole} />
            <View
              style={[styles.receiptHole, { right: -10, left: undefined }]}
            />
          </View>
          <Text style={styles.sectionTitle}>Receipt</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Service</Text>
            <Text style={styles.detailValue}>
              {params.serviceName || "Premium Wash"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date & Time</Text>
            <Text style={styles.detailValue}>
              {selectedDate
                ? new Date(selectedDate as string).toLocaleDateString()
                : "Today"}
              , {selectedTime}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValueVisible}>
              {params.address || "No address provided"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValueVisible}>
              {paymentMethod as string}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.push("/(tabs)/home")}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  statusHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#f9f9f9",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    // marginBottom: 10,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 5,
  },
  statusSubtitle: { fontSize: 14, color: "#888" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 15,
  },

  nextStepsContainer: {
    marginHorizontal: 20,
    marginBottom: 25,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  stepItem: {
    alignItems: "center",
    width: 80,
  },
  stepIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  stepText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 14,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#EEE",
    marginTop: 24,
    marginHorizontal: 5,
  },

  detailsCard: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 0,
    padding: 24,
    paddingTop: 30,
    marginBottom: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  receiptTop: {
    position: "absolute",
    top: -10,
    left: 0,
    right: 0,
    height: 20,
    overflow: "hidden",
  },
  receiptHole: {
    position: "absolute",
    top: 0,
    left: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f3f3",
  },
  detailLabel: { fontSize: 14, color: "#666", width: "30%" },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    flexShrink: 1,
    textAlign: "right",
  },
  detailValueVisible: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    flexShrink: 1,
    textAlign: "right",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
  },
  totalLabel: { fontSize: 16, fontWeight: "bold", color: "#1a1a1a" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#4CAF50" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  homeButton: {
    backgroundColor: "#1a1a1a",
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
  },
  homeButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
