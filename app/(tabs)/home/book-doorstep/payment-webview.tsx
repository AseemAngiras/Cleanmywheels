import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import {
  useVerifyAddonPaymentMutation,
  useVerifySubscriptionMutation,
} from "@/store/api/subscriptionApi";
import { Colors } from "@/constants/Colors";

export default function PaymentWebViewScreen() {
  const router = useRouter();
  const {
    url,
    bookingId, // This is subscriptionId for subscriptions
    type,
    subscriptionId, // This is explicitly passed for addons
    addons,
    grandTotal,
    vehicleType,
    vehicleNumber,
    serviceDate,
    serviceName,
    address,
    timeSlot,
  } = useLocalSearchParams();

  const [verifyAddonPayment] = useVerifyAddonPaymentMutation();
  const [verifySubscription] = useVerifySubscriptionMutation();

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
        // Wait 5 seconds for webhook to process
        setTimeout(async () => {
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
                razorpay_payment_id:
                  (razorpay_payment_id as string) || "demo_id",
                razorpay_order_id:
                  (razorpay_order_id as string) || (bookingId as string), // Reference ID (AD_...)
                razorpay_payment_link_id: razorpay_payment_link_id as string, // Payment Link ID for signature verification
                razorpay_payment_link_status:
                  razorpay_payment_link_status as string,
                razorpay_signature:
                  (razorpay_signature as string) || "demo_sig",
                subscriptionId: subscriptionId as string,
                addons: parsedAddons,
                serviceDate: serviceDate
                  ? String(serviceDate)
                  : new Date().toISOString(),
              }).unwrap();
            }
          } else if (type === "SUBSCRIPTION") {
            // Logic for Subscription Verification
            const params = new URLSearchParams(
              url.includes("?") ? url.split("?")[1] : "",
            );

            const razorpay_payment_id = params.get("razorpay_payment_id");
            const razorpay_signature = params.get("razorpay_signature");
            const razorpay_payment_link_id = params.get(
              "razorpay_payment_link_id",
            );
            const razorpay_payment_link_status = params.get(
              "razorpay_payment_link_status",
            );
            // payment_link_reference_id is usually the order_id for payment links
            const razorpay_order_id = params.get(
              "razorpay_payment_link_reference_id",
            );

            await verifySubscription({
              razorpay_payment_id: (razorpay_payment_id as string) || "demo_id",
              razorpay_order_id: (razorpay_order_id as string) || "demo_order",
              razorpay_payment_link_id: razorpay_payment_link_id as string,
              razorpay_payment_link_status:
                razorpay_payment_link_status as string,
              razorpay_signature: (razorpay_signature as string) || "demo_sig",
              subscriptionId: bookingId as string, // bookingId is the subscriptionId here
            }).unwrap();
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
              addons: addons || "[]",
              grandTotal,
              vehicleType,
              vehicleNumber,
              serviceDate,
              serviceName,
              address,
              paymentMethod: "Online",
              selectedDate: serviceDate,
              selectedTime: (timeSlot as string) || "Anytime",
              shopName: "CleanMyWheels",
            },
          } as any);
        }, 5000);
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
    <ScreenWrapper
      className="flex-1 bg-background"
      statusBarStyle="dark-content"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-background border-b border-border/50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-card border border-border/50"
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Ionicons name="lock-closed" size={16} color={Colors.primary} />
          <Text className="text-[17px] font-[900] color-text tracking-tight">
            Secure Payment
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {/* WebView Container */}
      <View className="flex-1 bg-white">
        <WebView
          source={{ uri: paymentUrl }}
          style={{ flex: 1 }}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          originWhitelist={["*"]}
        />
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute inset-0 bg-background/80 items-center justify-center z-50">
          <View className="bg-card p-8 rounded-[40px] border border-border/50 items-center shadow-2xl">
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text className="text-[15px] font-[800] color-text mt-6 uppercase tracking-widest text-center">
              {verifying ? "Verifying Transaction" : "Loading Payment Hub"}
            </Text>
            <Text className="text-[11px] color-textSecondary font-[500] mt-2 text-center px-4">
              Please do not refresh or close the app
            </Text>
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
}
