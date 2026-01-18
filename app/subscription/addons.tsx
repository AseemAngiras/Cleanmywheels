import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  useGetAddonsQuery,
  useCreateAddonOrderMutation,
  useVerifyAddonPaymentMutation,
  useGetMySubscriptionQuery,
} from "@/store/api/subscriptionApi";

const RAZORPAY_KEY =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_KEY_ID ||
  "rzp_test_1DP5mmOlF5G5ag";
const APP_NAME = "CleanMyWheels";

export default function AddonsScreen() {
  const router = useRouter();

  const { data: subscriptions, isLoading: isSubLoading } =
    useGetMySubscriptionQuery(undefined);

  const activeSubscriptions = Array.isArray(subscriptions)
    ? subscriptions.filter((s: any) => s.status === "active")
    : (subscriptions as any)?.status === "active"
      ? [subscriptions]
      : [];

  const { data: addonsList, isLoading: isAddonsLoading } =
    useGetAddonsQuery(undefined);

  const [createAddonOrder, { isLoading: isCreatingOrder }] =
    useCreateAddonOrderMutation();
  const [verifyAddonPayment, { isLoading: isVerifying }] =
    useVerifyAddonPaymentMutation();
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [serviceDate, setServiceDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  useEffect(() => {
    if (activeSubscriptions.length > 0 && !selectedSubId) {
      setSelectedSubId(activeSubscriptions[0]?._id ?? null);
    }
  }, [activeSubscriptions, selectedSubId]);

  const activeSubscription = activeSubscriptions.find(
    (s: any) => s._id === selectedSubId,
  );

  const toggleAddon = (addon: any) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a._id === addon._id);
      if (exists) {
        return prev.filter((a) => a._id !== addon._id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const totalAmount = selectedAddons.reduce(
    (sum, item) => sum + (item.price || 0),
    0,
  );

  const handlePayment = async () => {
    if (!activeSubscription) {
      Alert.alert("Error", "No active subscription selected.");
      return;
    }
    if (selectedAddons.length === 0) {
      Alert.alert("Select Add-ons", "Please select at least one add-on.");
      return;
    }

    const now = new Date();
    if (serviceDate < new Date(now.setHours(0, 0, 0, 0))) {
      Alert.alert("Invalid Date", "Please select a future date or today.");
      return;
    }
    const subEnd = new Date(activeSubscription.endDate);
    if (serviceDate > subEnd) {
      Alert.alert("Invalid Date", "Date cannot be after subscription expiry.");
      return;
    }

    try {
      const orderPayload = {
        amount: totalAmount,
        subscriptionId: activeSubscription._id,
        addons: selectedAddons,
        serviceDate: serviceDate.toISOString(),
      };

      console.log("Creating Addon Order:", orderPayload);
      const response = await createAddonOrder(orderPayload).unwrap();
      const { paymentLinkUrl, subscriptionId, referenceId } = response;
      console.log("Order Created:", response);

      if (paymentLinkUrl) {
        router.push({
          pathname: "/(tabs)/home/book-doorstep/payment-webview",
          params: {
            url: paymentLinkUrl,
            bookingId: referenceId,
            type: "ADDON",
            subscriptionId: subscriptionId,
            addons: JSON.stringify(selectedAddons),
            grandTotal: totalAmount,
            vehicleType: activeSubscription.vehicle?.brand || "Vehicle",
            vehicleNumber: activeSubscription.vehicle?.vehicleNo || "",
            serviceDate: serviceDate.toISOString(),
            serviceName: "Add-on Services",
            address: "Your Location",
          },
        } as any);
        return;
      }

      Alert.alert("Error", "Failed to generate payment link.");
    } catch (err: any) {
      console.error("Payment Start Error:", err);
      Alert.alert("Error", err?.data?.message || "Failed to create order");
    }
  };

  const processVerification = async (
    paymentId: string,
    orderId: string,
    signature: string,
  ) => {
    try {
      console.log("Verifying Payment:", { paymentId, orderId, signature });
      await verifyAddonPayment({
        razorpay_payment_id: paymentId,
        razorpay_order_id: orderId,
        razorpay_signature: signature,
        subscriptionId: activeSubscription!._id,
        addons: selectedAddons,
      }).unwrap();

      Alert.alert("Success!", "Add-ons added to your upcoming service.", [
        {
          text: "OK",
          onPress: () => {
            setSelectedAddons([]);
            router.back();
          },
        },
      ]);
    } catch (err: any) {
      console.error("Verification Error:", err);
      Alert.alert(
        "Verification Failed",
        `Payment verification failed: ${err?.data?.message || "Unknown error"}. Please contact support.`,
      );
    }
  };

  if (isSubLoading || isAddonsLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#C8F000" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add-ons</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Car Selection */}
        <Text style={styles.sectionTitle}>Select Vehicle</Text>
        <Text style={styles.sectionSubtitle}>
          Which car would you like to add services for?
        </Text>

        {activeSubscriptions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="car-sport-outline" size={40} color="#666" />
            <Text style={styles.emptyText}>No Active Subscriptions Found</Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.carList}
            contentContainerStyle={{ gap: 12 }}
          >
            {activeSubscriptions.map((sub: any) => {
              const isSelected = sub._id === selectedSubId;
              const vehicleName = sub.vehicle?.vehicleType || "Vehicle";
              const vehicleNo = sub.vehicle?.vehicleNo || "No Number";

              return (
                <TouchableOpacity
                  key={sub._id}
                  style={[styles.carCard, isSelected && styles.carCardSelected]}
                  onPress={() => setSelectedSubId(sub._id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name="car"
                      size={24}
                      color={isSelected ? "#C8F000" : "#666"}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.carName,
                        isSelected && styles.textSelected,
                      ]}
                    >
                      {vehicleName}
                    </Text>
                    <Text
                      style={[
                        styles.carNumber,
                        isSelected && styles.textDetailSelected,
                      ]}
                    >
                      {vehicleNo}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={12} color="#000" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Date Selection */}
        {activeSubscription && (
          <View style={{ marginTop: 24 }}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <Text style={styles.sectionSubtitle}>
              When do you want this service?
            </Text>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#1a1a1a" />
              <Text style={styles.dateText}>{serviceDate.toDateString()}</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={serviceDate}
                mode="date"
                display="default"
                minimumDate={new Date()}
                maximumDate={new Date(activeSubscription.endDate)}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setServiceDate(date);
                }}
              />
            )}
          </View>
        )}

        {/* Add-ons List */}
        {activeSubscription && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
              Select Services
            </Text>
            <Text style={styles.sectionSubtitle}>
              For {activeSubscription.vehicle?.brand || "your vehicle"}
            </Text>

            <View style={styles.listContainer}>
              {addonsList?.map((addon: any) => {
                const isSelected = selectedAddons.some(
                  (a) => a._id === addon._id,
                );
                return (
                  <TouchableOpacity
                    key={addon._id}
                    style={[
                      styles.addonCard,
                      isSelected && styles.addonCardSelected,
                    ]}
                    onPress={() => toggleAddon(addon)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{
                        uri:
                          addon.icon ||
                          "https://cdn-icons-png.flaticon.com/512/2099/2099192.png",
                      }}
                      style={styles.addonIcon}
                    />
                    <View style={styles.addonContent}>
                      <Text
                        style={[
                          styles.addonName,
                          isSelected && styles.textSelected,
                        ]}
                      >
                        {addon.name}
                      </Text>
                      <Text
                        style={[
                          styles.addonDesc,
                          isSelected && styles.textDetailSelected,
                        ]}
                        numberOfLines={2}
                      >
                        {addon.description}
                      </Text>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text
                        style={[
                          styles.addonPrice,
                          isSelected && styles.textSelected,
                        ]}
                      >
                        ₹{addon.price}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#C8F000"
                          style={{ marginTop: 4 }}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Spacer for bottom bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Bar */}
      {selectedAddons.length > 0 && activeSubscription && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{totalAmount}</Text>
          </View>
          <TouchableOpacity
            style={styles.payButton}
            onPress={handlePayment}
            disabled={isCreatingOrder || isVerifying}
          >
            {isCreatingOrder || isVerifying ? (
              <ActivityIndicator color="#1a1a1a" />
            ) : (
              <Text style={styles.payButtonText}>Proceed to Pay</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  center: { justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    color: "#1a1a1a",
  },
  scrollContent: { padding: 20 },

  carList: {
    flexGrow: 0,
    marginBottom: 10,
  },
  carCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    width: 220,
    borderWidth: 1,
    borderColor: "#eee",
    marginRight: 10,
  },
  carCardSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  carName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  carNumber: {
    fontSize: 12,
    color: "#666",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#C8F000",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCard: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  emptyText: {
    marginTop: 10,
    color: "#666",
    fontWeight: "500",
  },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    marginTop: 4,
  },

  listContainer: { gap: 12 },
  addonCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  addonCardSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  addonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  addonContent: { flex: 1, marginLeft: 12 },
  addonName: { fontSize: 16, fontWeight: "600", color: "#1a1a1a" },
  addonDesc: { fontSize: 12, color: "#666", marginTop: 2 },
  textSelected: { color: "#fff" },
  textDetailSelected: { color: "#ccc" },

  priceContainer: { alignItems: "flex-end", minWidth: 60 },
  addonPrice: { fontSize: 16, fontWeight: "bold", color: "#1a1a1a" },

  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    gap: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "500",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 12, color: "#666" },
  totalValue: { fontSize: 24, fontWeight: "bold", color: "#1a1a1a" },
  payButton: {
    backgroundColor: "#C8F000",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  payButtonText: { fontSize: 16, fontWeight: "bold", color: "#1a1a1a" },
});
