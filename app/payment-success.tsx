import { useLazyGetBookingByIdQuery } from "@/store/api/bookingApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, ActivityIndicator } from "react-native";
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
        console.log("Bridge Error:", err);
        setError("Failed to verify booking status.");
      }
    };

    fetchAndRedirect();
  }, [bookingId]);

  if (error) {
    return (
      <ScreenWrapper className="bg-background" statusBarStyle="light-content">
        <View className="flex-1 justify-center items-center p-5">
          <Ionicons name="alert-circle" size={60} color="#EF4444" />
          <Text className="mt-5 text-lg text-text text-center">{error}</Text>
          <Text
            className="mt-5 text-base text-primary underline"
            onPress={() => router.replace("/(tabs)/home")}
          >
            Go back to Home
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper className="bg-background" statusBarStyle="light-content">
      <View className="flex-1 justify-center items-center p-5">
        <ActivityIndicator size="large" color="#C8F000" />
        <Text className="mt-5 text-base text-text">
          Finalizing your booking...
        </Text>
      </View>
    </ScreenWrapper>
  );
}
