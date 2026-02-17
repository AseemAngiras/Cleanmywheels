import { Colors } from "@/constants/Colors";
import { useLazyGetBookingByIdQuery } from "@/store/api/bookingApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, StyleSheet, ActivityIndicator } from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

export default function PaymentSuccessBridge() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [triggerGetBooking] = useLazyGetBookingByIdQuery();
  const [error, setError] = useState<string | null>(null);

  // The booking ID is passed as 'razorpay_payment_link_reference_id' by Razorpay
  const bookingId =
    (params.razorpay_payment_link_reference_id as string) ||
    (params.bookingId as string);

  useEffect(() => {
    if (!bookingId) {
      setError("No booking information found.");
      return;
    }

    const fetchAndRedirect = async () => {
      try {
        const result = await triggerGetBooking(bookingId).unwrap();
        if (result?.data) {
          const booking = result.data;

          // Map backend response to order-confirmation params
          router.replace({
            pathname: "/(tabs)/home/book-doorstep/order-confirmation",
            params: {
              bookingId: booking._id,
              selectedDate: booking.bookingDate,
              selectedTime: String(booking.bookingTime),
              paymentMethod: "razorpay",
              grandTotal: String(booking.price),
              serviceName: booking.washPackage?.name || "Car Wash",
              serviceId: booking.washPackage?._id,
              vehicleType: booking.vehicle?.type,
              vehicleNumber: booking.vehicleNo || booking.vehicle?.number,
              address: booking.address?.fullAddress || booking.locality,
              userPhone: booking.user?.phone,
            },
          });
        } else {
          setError("Booking not found.");
        }
      } catch (err: any) {
        console.error("Bridge Error:", err);
        setError("Failed to verify booking status.");
      }
    };

    fetchAndRedirect();
  }, [bookingId]);

  if (error) {
    return (
      <ScreenWrapper style={styles.container} statusBarStyle="light-content">
        <View style={styles.content}>
          <Ionicons name="alert-circle" size={60} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Text
            style={styles.retryText}
            onPress={() => router.replace("/(tabs)/home")}
          >
            Go back to Home
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper style={styles.container} statusBarStyle="light-content">
      <View style={styles.content}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Finalizing your booking...</Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    color: Colors.text,
    textAlign: "center",
  },
  retryText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
});
