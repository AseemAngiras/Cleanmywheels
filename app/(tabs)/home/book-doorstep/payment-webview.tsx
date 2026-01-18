import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useVerifyAddonPaymentMutation } from "@/store/api/subscriptionApi";

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const {
    url,
    bookingId,
    type,
    subscriptionId,
    addons,
    grandTotal,
    vehicleType,
    vehicleNumber,
    serviceDate,
    serviceName,
    address,
  } = useLocalSearchParams();

  const [verifyAddonPayment] = useVerifyAddonPaymentMutation();

  const [isLoading, setIsLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const paymentUrl = url as string;

  const handlePaymentCompletion = async (url: string) => {
    if (
      url.includes("razorpay_payment_link_status=paid") ||
      url.includes("status=paid") ||
      url.includes("payment_status=credit") ||
      url.startsWith("cleanmywheels://")
    ) {
      if (verifying) return; // Prevent double trigger
      setVerifying(true);
      setIsLoading(true);

      try {
        if (type === "ADDON") {
          const params = new URLSearchParams(
            url.includes("?") ? url.split("?")[1] : "",
          );

          const razorpay_payment_id = params.get("razorpay_payment_id");
          const razorpay_payment_link_id = params.get(
            "razorpay_payment_link_id",
          );
          const razorpay_payment_link_status = params.get(
            "razorpay_payment_link_status",
          );
          const razorpay_order_id = params.get(
            "razorpay_payment_link_reference_id",
          );
          const razorpay_signature = params.get("razorpay_signature");

          // Verify with Backend
          if (addons) {
            const parsedAddons = JSON.parse(addons as string);
            await verifyAddonPayment({
              razorpay_payment_id: (razorpay_payment_id as string) || "demo_id",
              razorpay_order_id:
                (razorpay_order_id as string) || (bookingId as string), // Reference ID (AD_...)
              razorpay_payment_link_id: razorpay_payment_link_id as string, // Payment Link ID for signature verification
              razorpay_payment_link_status:
                razorpay_payment_link_status as string,
              razorpay_signature: (razorpay_signature as string) || "demo_sig",
              subscriptionId: subscriptionId as string,
              addons: parsedAddons,
            }).unwrap();
          }
        }

        // Redirect to Order Confirmation
        const targetPath =
          type === "ADDON" || type === "SUBSCRIPTION"
            ? "/subscription/order-confirmation"
            : "/(tabs)/home/book-doorstep/order-confirmation";

        router.replace({
          pathname: targetPath,
          params: {
            bookingId: bookingId,
            status: "success",
            addons: addons,
            grandTotal,
            vehicleType,
            vehicleNumber,
            serviceDate,
            serviceName,
            address,
            paymentMethod: "Online",
            selectedDate: serviceDate,
            selectedTime: "Anytime",
            shopName: "CleanMyWheels",
          },
        } as any);
      } catch (error) {
        console.error("Verification failed", error);
        Alert.alert(
          "Verification Failed",
          "Payment successful but verification failed.",
        );
        setIsLoading(false);
        setVerifying(false);
      }
    }
  };

  const handleNavigationStateChange = (navState: any) => {
    handlePaymentCompletion(navState.url);
  };

  const onShouldStartLoadWithRequest = (request: any) => {
    const { url } = request;
    if (
      url.startsWith("cleanmywheels://") ||
      url.includes("razorpay_payment_link_status=paid") ||
      url.includes("status=paid") ||
      url.includes("payment_status=credit")
    ) {
      handlePaymentCompletion(url);
      return false;
    }
    return true;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Secure Payment</Text>
        <View style={{ width: 26 }} />
      </View>

      <WebView
        source={{ uri: paymentUrl }}
        style={{ flex: 1 }}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        originWhitelist={["*"]}
      />

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#C8F000" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  closeBtn: { padding: 5 },
  title: { fontSize: 18, fontWeight: "bold" },
  loader: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D1F803",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
