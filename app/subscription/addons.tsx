import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useCreateBookingMutation } from "@/store/api/bookingApi";
import { useGetWashPackagesQuery } from "@/store/api/washPackageApi";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";

const SLOTS = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

export default function AddonsScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const profileAddress = useSelector(
    (state: RootState) =>
      state.profile.addresses.find(
        (a) => a.id === state.profile.defaultAddressId
      ) || state.profile.addresses[0]
  );

  // Default to first car if available
  const subscribedCar = user?.cars?.[0]
    ? `${user.cars[0].brand} ${user.cars[0].model} - ${user.cars[0].number}`
    : "No Vehicle Selected";

  const { data: subscription, isLoading: isSubLoading } =
    useGetMySubscriptionQuery();
  const { data: packagesData, isLoading: isPackagesLoading } =
    useGetWashPackagesQuery();
  const [createBooking, { isLoading: isBooking }] = useCreateBookingMutation();

  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1); // Start from tomorrow? or today? Let's say today + future
    return d;
  });

  const handleBookPress = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedPackage || !selectedSlot) {
      Alert.alert("Missing Details", "Please select a time slot.");
      return;
    }

    if (!profileAddress) {
      Alert.alert(
        "Address Needed",
        "Please add an address in your profile first."
      );
      return;
    }

    try {
      // Prepare Payload
      const payload = {
        serviceId: selectedPackage._id,
        serviceName: selectedPackage.name,
        price: selectedPackage.price,
        date: selectedDate.toISOString(),
        timeSlot: selectedSlot,
        address: profileAddress,
        car: subscribedCar,
        status: "pending",
        user: user?._id,
      };

      await createBooking(payload).unwrap();

      Alert.alert("Success", "Add-on service booked successfully!", [
        {
          text: "OK",
          onPress: () => {
            setShowBookingModal(false);
            router.back();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert(
        "Booking Failed",
        err?.data?.message || "Something went wrong."
      );
    }
  };

  const renderDateItem = (date: Date) => {
    const isSelected = date.toDateString() === selectedDate.toDateString();
    return (
      <TouchableOpacity
        key={date.toISOString()}
        style={[styles.dateCard, isSelected && styles.dateCardSelected]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[styles.dayText, isSelected && styles.textSelected]}>
          {date.toLocaleDateString("en-US", { weekday: "short" })}
        </Text>
        <Text style={[styles.dateText, isSelected && styles.textSelected]}>
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription & Add-ons</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Subscription Card */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subHeader}>
            <View>
              <Text style={styles.subTitle}>My Premium Plan</Text>
              <Text style={styles.subCar}>{subscribedCar}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {subscription?.status === "active" ? "ACTIVE" : "INACTIVE"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.subDetails}>
            <View>
              <Text style={styles.detailLabel}>Plan</Text>
              <Text style={styles.detailValue}>
                {subscription?.plan?.name || "Gold Plan"}
              </Text>
            </View>
            <View>
              <Text style={styles.detailLabel}>Expires On</Text>
              <Text style={styles.detailValue}>
                {subscription?.endDate
                  ? new Date(subscription.endDate).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Add-ons List */}
        <Text style={styles.sectionTitle}>Available Add-ons</Text>
        <Text style={styles.sectionSubtitle}>Extra care for your ride</Text>

        {isPackagesLoading ? (
          <ActivityIndicator
            size="large"
            color="#C8F000"
            style={{ marginTop: 20 }}
          />
        ) : (
          <View style={styles.packageList}>
            {packagesData?.data?.washPackageList.map((pkg: any) => (
              <View key={pkg._id} style={styles.addonCard}>
                <Image
                  source={{
                    uri:
                      pkg.logo ||
                      "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=200",
                  }}
                  style={styles.addonImage}
                />
                <View style={styles.addonInfo}>
                  <Text style={styles.addonName}>{pkg.name}</Text>
                  <Text style={styles.addonPrice}>₹{pkg.price}</Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleBookPress(pkg)}
                >
                  <Text style={styles.addButtonText}>Add +</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Book {selectedPackage?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.datesScroll}
            >
              {dates.map(renderDateItem)}
            </ScrollView>

            <Text style={styles.modalLabel}>Select Slot</Text>
            <View style={styles.slotsGrid}>
              {SLOTS.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.slotItem,
                    selectedSlot === slot && styles.slotSelected,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      selectedSlot === slot && styles.textSelected,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmBooking}
              disabled={isBooking}
            >
              {isBooking ? (
                <ActivityIndicator color="#1a1a1a" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Confirm Booking • ₹{selectedPackage?.price}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    color: "#1a1a1a",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subscriptionCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  subHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  subTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subCar: {
    color: "#aaa",
    fontSize: 14,
  },
  statusBadge: {
    backgroundColor: "#C8F000",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    marginTop: 16,
    marginBottom: 16,
  },
  subDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    color: "#888",
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  packageList: {
    gap: 12,
  },
  addonCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addonImage: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  addonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addonName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  addonPrice: {
    fontSize: 14,
    color: "#84c95c",
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#C8F000",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
    marginTop: 16,
    marginBottom: 12,
  },
  datesScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  dateCard: {
    width: 60,
    height: 70,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#fafafa",
  },
  dateCardSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  dayText: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  textSelected: {
    color: "#C8F000",
  },

  slotsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  slotItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fafafa",
  },
  slotSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  slotText: {
    fontSize: 12,
    color: "#333",
  },
  confirmButton: {
    backgroundColor: "#C8F000",
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#1a1a1a",
    fontWeight: "bold",
    fontSize: 16,
  },
});
