import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import {
  useCreateSubscriptionMutation,
  useGetPlansQuery,
  useVerifySubscriptionMutation,
} from "../../store/api/subscriptionApi";
import { useGetVehiclesQuery } from "../../store/api/vehicleApi";
import { useGetAddressesQuery } from "../../store/api/addressApi";

const APP_NAME = "CleanMyWheels";
const RAZORPAY_KEY = process.env.RAZORPAY_KEY_ID || "";

export default function SubscriptionSummaryScreen() {
  const router = useRouter();
  const { planId, vehicleId, timeSlot, startDate, isAutoPay } =
    useLocalSearchParams();

  const { data: plans } = useGetPlansQuery();
  const { data: vehicles } = useGetVehiclesQuery();
  const { data: addressesResponse, isLoading: isLoadingAddresses } =
    useGetAddressesQuery();

  const [createSubscription, { isLoading: isCreating }] =
    useCreateSubscriptionMutation();
  const [verifySubscription] = useVerifySubscriptionMutation();

  const selectedPlan = plans?.find((p) => p._id === planId);
  const selectedVehicle = vehicles?.find((v: any) => v._id === vehicleId);

  const addressList =
    addressesResponse?.data?.addressList || addressesResponse?.data || [];
  const defaultAddress =
    addressList.find((a: any) => a.isDefault) || addressList[0];

  const handlePayment = async () => {
    if (!selectedPlan || !selectedVehicle) {
      Alert.alert("Error", "Required selection data missing.");
      return;
    }

    try {
      const response = await createSubscription({
        planId: selectedPlan._id,
        vehicleId: selectedVehicle._id,
        timeSlot: timeSlot as string,
        startDate: startDate as string,
        isAutoPay: isAutoPay === "true",
      }).unwrap();

      const {
        subscriptionId,
        paymentLinkUrl,
        id: orderId,
        razorpaySubscriptionId,
      } = response;

      if (paymentLinkUrl) {
        // Pass extra params for confirmation screen
        const confirmationParams = {
          addons: "[]",
          grandTotal: String(selectedPlan.price),
          vehicleType: selectedVehicle.vehicleType,
          vehicleNumber: selectedVehicle.vehicleNo,
          serviceDate: startDate as string,
          serviceName: selectedPlan.name,
          address:
            defaultAddress?.fullAddress ||
            (defaultAddress
              ? `${defaultAddress.houseOrFlatNo}, ${defaultAddress.locality}, ${defaultAddress.city}`
              : "Your Registered Address"),
          timeSlot: timeSlot as string,
        };

        if (!NativeModules.RazorpayCheckout || !razorpaySubscriptionId) {
          router.push({
            pathname: "/(tabs)/home/book-doorstep/payment-webview",
            params: {
              url: paymentLinkUrl,
              bookingId: subscriptionId,
              type: "SUBSCRIPTION",
              ...confirmationParams,
            },
          } as any);
          return;
        }
      }

      const options = {
        description: `Subscription for ${selectedPlan.name}`,
        image: "https://your-logo-url.png",
        currency: "INR",
        key: RAZORPAY_KEY,
        amount: response.amount || selectedPlan.price * 100,
        name: APP_NAME,
        order_id: orderId,
        subscription_id: razorpaySubscriptionId,
        theme: { color: "#84c95c" },
        recurring: isAutoPay === "true",
      };

      if (!NativeModules.RazorpayCheckout) {
        Alert.alert(
          "Error",
          "Native Payment Module Missing and no Web Link provided.",
        );
        return;
      }

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          await verifySubscription({
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
            razorpay_subscription_id: data.razorpay_subscription_id,
            subscriptionId,
          }).unwrap();

          router.replace({
            pathname: "/subscription/order-confirmation",
            params: {
              status: "success",
              grandTotal: String(selectedPlan.price),
              vehicleType: selectedVehicle.vehicleType,
              vehicleNumber: selectedVehicle.vehicleNo,
              serviceDate: startDate as string,
              serviceName: selectedPlan.name,
              address:
                defaultAddress?.fullAddress ||
                (defaultAddress
                  ? `${defaultAddress.houseOrFlatNo}, ${defaultAddress.locality}, ${defaultAddress.city}`
                  : "Your Registered Address"),
              paymentMethod: "Online",
              selectedDate: startDate as string,
              selectedTime: timeSlot as string,
            },
          } as any);
        })
        .catch((error: any) => {
          console.log(error);
          Alert.alert(
            "Payment Cancelled",
            error.description || "Payment failed",
          );
        });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.data?.message || "Failed to initiate subscription",
      );
    }
  };

  if (!selectedPlan || !selectedVehicle) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#84c95c" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Summary</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.compactRow}>
          <View style={[styles.card, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.sectionTitle}>Plan</Text>
            <Text style={styles.value} numberOfLines={1}>
              {selectedPlan.name}
            </Text>
            <Text style={styles.label}>₹{selectedPlan.price}</Text>
          </View>
          <View style={[styles.card, { flex: 1.2 }]}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <Text style={styles.value} numberOfLines={1}>
              {selectedVehicle.vehicleNo}
            </Text>
            <Text style={styles.label}>{selectedVehicle.vehicleType}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Timing</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Time Slot</Text>
            <Text style={styles.value}>{timeSlot}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Starts From</Text>
            <Text style={styles.value}>
              {new Date(startDate as string).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Service Address</Text>
          {isLoadingAddresses ? (
            <ActivityIndicator />
          ) : (
            <View>
              <View style={styles.addressInfoBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#1a73e8"
                />
                <Text style={styles.addressInfoText}>
                  This subscription uses your{" "}
                  <Text style={{ fontWeight: "700" }}>Default Address</Text>. To
                  change it, please go to your Profile section.
                </Text>
              </View>
              <View style={styles.selectedAddressCard}>
                <Ionicons name="location" size={24} color="#84c95c" />
                <View style={styles.addressDetails}>
                  <Text style={styles.addressLabel}>
                    Current Default Address
                  </Text>
                  <Text style={styles.addressText}>
                    {defaultAddress
                      ? `${defaultAddress.houseOrFlatNo}, ${defaultAddress.locality}, ${defaultAddress.city} - ${defaultAddress.postalCode}`
                      : "No default address found. Service will be provided at your registered location."}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>₹{selectedPlan.price}</Text>
          </View>
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalPrice}>₹{selectedPlan.price}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payBtn, isCreating && styles.disabledBtn]}
          onPress={handlePayment}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.payBtnText}>Pay ₹{selectedPlan.price}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 16 },
  content: { padding: 12 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: { fontSize: 13, color: "#666" },
  value: { fontSize: 13, fontWeight: "600", color: "#1a1a1a" },
  addressText: { fontSize: 13, color: "#444", lineHeight: 18 },
  priceContainer: { marginTop: 4, paddingHorizontal: 4 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  priceLabel: { fontSize: 13, color: "#666" },
  priceValue: { fontSize: 13, fontWeight: "600" },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: "bold", color: "#1a1a1a" },
  totalPrice: { fontSize: 16, fontWeight: "bold", color: "#2e7d32" },
  footer: {
    padding: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  payBtn: {
    backgroundColor: "#1a1a1a",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  payBtnText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  disabledBtn: { opacity: 0.7 },
  addressInfoBox: {
    flexDirection: "row",
    backgroundColor: "#e8f0fe",
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  addressInfoText: {
    fontSize: 11,
    color: "#1a73e8",
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  selectedAddressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8f9fa",
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addressDetails: {
    marginLeft: 8,
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
    fontWeight: "600",
  },
});
