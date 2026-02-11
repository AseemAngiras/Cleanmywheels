import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import RazorpayCheckout from "react-native-razorpay";
import {
  useCreateSubscriptionMutation,
  useGetPlansQuery,
  useVerifySubscriptionMutation,
} from "../../store/api/subscriptionApi";
import { useGetVehiclesQuery } from "../../store/api/vehicleApi";
import { useGetAddressesQuery } from "../../store/api/addressApi";

const APP_NAME = "CleanMyWheels";
const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "";

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
          setTimeout(async () => {
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
          }, 5000); // Wait 5 seconds for webhook to process
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
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper style={styles.container} backgroundColor={Colors.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
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
                  color={Colors.primary}
                />
                <Text style={styles.addressInfoText}>
                  This subscription uses your{" "}
                  <Text style={{ fontWeight: "700" }}>Default Address</Text>. To
                  change it, please go to your Profile section.
                </Text>
              </View>
              <View style={styles.selectedAddressCard}>
                <Ionicons name="location" size={24} color={Colors.primary} />
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    color: Colors.text,
  },
  content: { padding: 12 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.text,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: { fontSize: 13, color: Colors.textSecondary },
  value: { fontSize: 13, fontWeight: "600", color: Colors.text },
  addressText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  priceContainer: { marginTop: 4, paddingHorizontal: 4 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  priceLabel: { fontSize: 13, color: Colors.textSecondary },
  priceValue: { fontSize: 13, fontWeight: "600", color: Colors.text },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: "bold", color: Colors.text },
  totalPrice: { fontSize: 16, fontWeight: "bold", color: Colors.primary },
  footer: {
    padding: 12,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  payBtn: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  payBtnText: { color: Colors.black, fontSize: 15, fontWeight: "bold" },
  disabledBtn: { opacity: 0.7 },
  addressInfoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(37, 99, 235, 0.1)", // Light blue tint
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: "center",
  },
  addressInfoText: {
    fontSize: 11,
    color: Colors.text,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
  },
  selectedAddressCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.background,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressDetails: {
    marginLeft: 8,
    flex: 1,
  },
  addressLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
    fontWeight: "600",
  },
});
