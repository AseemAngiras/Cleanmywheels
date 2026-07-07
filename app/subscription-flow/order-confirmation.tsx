import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { addBooking } from "@/store/slices/bookingSlice";
import { formatPrice } from "@/utils/formatPrice";

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { selectedDate, serviceDate, selectedTime, timeSlot, paymentMethod, grandTotal, address } = params;
  const displayDate = selectedDate || serviceDate;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      addBooking({
        center: (params.shopName as string) || "CleanMyWheels",
        date: (displayDate as string) || new Date().toISOString(),
        timeSlot: (params.selectedTime as string) || (params.timeSlot as string) || "Anytime",
        car: params.vehicleType
          ? `${params.vehicleType} - ${params.vehicleNumber}`
          : "Vehicle",
        carImage: "",
        phone: (params.userPhone as string) || "",
        price: Number(params.grandTotal || 0),
        address: (params.address as string) || "Your Registered Address",
        plate: (params.vehicleNumber as string) || "",
        serviceName: (params.serviceName as string) || "Subscription",
        serviceId: (params.serviceId as string) || "",
      }),
    );
  }, [dispatch, params]);

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 + insets.bottom }}
      >
        {/* Status Header */}
        <View className="items-center py-10 bg-card rounded-b-[40px] shadow-sm border-b border-border/50">
          <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-5 shadow-lg shadow-primary/40">
            <Ionicons name="checkmark" size={48} color="#000" />
          </View>
          <Text className="text-[26px] font-[800] color-text mb-1">
            Success!
          </Text>
          <Text className="text-[14px] color-textSecondary font-[500]">
            Subscription Confirmed
          </Text>
        </View>

        {/* What Happens Next Section */}
        <View className="mx-5 my-8">
          <Text className="text-[18px] font-[700] color-text mb-6">
            What happens next?
          </Text>
          <View className="flex-row items-start justify-between">
            <View className="items-center w-20">
              <View className="w-12 h-12 rounded-full bg-background items-center justify-center mb-2.5 border border-border/50">
                <Ionicons
                  name="briefcase-outline"
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <Text className="text-[10px] color-textSecondary text-center font-[700] uppercase tracking-tighter leading-3">
                Assigning Professional
              </Text>
            </View>
            <View className="flex-1 h-[1.5px] bg-border/50 mt-6 mx-1" />
            <View className="items-center w-20">
              <View className="w-12 h-12 rounded-full bg-background items-center justify-center mb-2.5 border border-border/50">
                <Ionicons
                  name="navigate-outline"
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <Text className="text-[10px] color-textSecondary text-center font-[700] uppercase tracking-tighter leading-3">
                On the Way
              </Text>
            </View>
            <View className="flex-1 h-[1.5px] bg-border/50 mt-6 mx-1" />
            <View className="items-center w-20">
              <View className="w-12 h-12 rounded-full bg-background items-center justify-center mb-2.5 border border-border/50">
                <Ionicons
                  name="list-outline"
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <Text className="text-[10px] color-textSecondary text-center font-[700] uppercase tracking-tighter leading-3">
                Active Service
              </Text>
            </View>
          </View>
        </View>

        {/* Receipt Details Summary */}
        <View className="mx-5 bg-card rounded-[32px] p-6 pt-8 shadow-sm border border-border relative">
          {/* Receipt Aesthetic Holes */}
          <View className="absolute -top-3 left-0 right-0 flex-row justify-between px-6">
            <View className="w-6 h-6 rounded-full bg-background" />
            <View className="w-6 h-6 rounded-full bg-background" />
          </View>

          <Text className="text-[18px] font-[800] color-text mb-6">
            Receipt Details
          </Text>

          <View className="flex-row justify-between py-4 border-b border-border/50">
            <Text className="text-sm color-textSecondary font-[500]">
              Plan Name
            </Text>
            <Text className="text-sm font-[700] color-text flex-1 text-right ml-4">
              {params.serviceName || "Premium Wash"}
            </Text>
          </View>

          <View className="flex-row justify-between py-4 border-b border-border/50">
            <Text className="text-sm color-textSecondary font-[500]">
              Vehicle
            </Text>
            <Text className="text-sm font-[700] color-text flex-1 text-right ml-4">
              {params.vehicleType} ({params.vehicleNumber})
            </Text>
          </View>

          <View className="flex-row justify-between py-4 border-b border-border/50">
            <Text className="text-sm color-textSecondary font-[500]">
              Start Date
            </Text>
            <Text className="text-sm font-[700] color-text">
              {displayDate
                ? new Date(displayDate as string).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "Today"}
            </Text>
          </View>

          <View className="flex-row justify-between py-4 border-b border-border/50">
            <Text className="text-sm color-textSecondary font-[500]">
              Preferred Slot
            </Text>
            <Text className="text-sm font-[700] color-text">
              {selectedTime || timeSlot || "Anytime"}
            </Text>
          </View>

          <View className="flex-row justify-between py-4 border-b border-border/50">
            <Text className="text-sm color-textSecondary font-[500]">
              Address
            </Text>
            <Text className="text-sm font-[700] color-text flex-1 text-right ml-4 leading-5">
              {address || "Your Registered Address"}
            </Text>
          </View>

          {/* <View className="flex-row justify-between py-4 border-b border-border/50">
            <Text className="text-sm color-textSecondary font-[500]">
              Payment
            </Text>
            <Text className="text-sm font-[700] color-text">
              {paymentMethod as string}
            </Text>
          </View> */}

          <View className="flex-row justify-between pt-6 items-center">
            <Text className="text-base font-[800] color-text">Total Paid</Text>
            <Text className="text-[20px] font-[900] color-primary">
              ₹{formatPrice(grandTotal || "0")}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t border-border/50 shadow-2xl"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity
          className="bg-primary py-5 rounded-2xl items-center shadow-lg shadow-primary/30"
          onPress={() => router.push("/home")}
        >
          <Text className="color-black text-[16px] font-[800]">
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
