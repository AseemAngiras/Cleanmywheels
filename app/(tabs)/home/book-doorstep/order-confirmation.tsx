import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useDispatch } from "react-redux";
import { addBooking } from "../../../../store/slices/bookingSlice";

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { selectedDate, selectedTime, paymentMethod, grandTotal } = params;

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
      }),
    );
  }, [dispatch, params]);

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* Status Header */}
        <View className="bg-card rounded-b-[44px] items-center pt-16 pb-12 px-6 shadow-xl border-b border-border/30">
          <View className="w-20 h-20 rounded-full bg-green-500/20 items-center justify-center mb-6 shadow-lg shadow-green-500/20">
            <View className="w-14 h-14 rounded-full bg-green-500 items-center justify-center">
              <Ionicons name="checkmark" size={32} color="white" />
            </View>
          </View>
          <Text className="text-[28px] font-[900] color-text tracking-tighter">
            Booking Confirmed!
          </Text>
          <Text className="text-[14px] color-textSecondary font-[600] mt-2 text-center">
            Your doorstep washing service has been scheduled.
          </Text>
        </View>

        {/* Process Steps */}
        <View className="px-6 mt-10">
          <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2.5px] mb-8">
            What happens next?
          </Text>

          <View className="flex-row items-start justify-between">
            <View className="items-center w-24">
              <View className="w-14 h-14 rounded-2xl bg-card border border-border/50 items-center justify-center mb-3">
                <MaterialCommunityIcons
                  name="account-search-outline"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <Text className="text-[10px] color-textSecondary font-[800] text-center uppercase leading-[14px]">
                Assigning{"\n"}Professional
              </Text>
            </View>

            <View className="flex-1 h-[2px] bg-border/50 mt-7 mx-1" />

            <View className="items-center w-24">
              <View className="w-14 h-14 rounded-2xl bg-card border border-border/50 items-center justify-center mb-3">
                <MaterialCommunityIcons
                  name="map-marker-distance"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <Text className="text-[10px] color-textSecondary font-[800] text-center uppercase leading-[14px]">
                Professional{"\n"}On Way
              </Text>
            </View>

            <View className="flex-1 h-[2px] bg-border/50 mt-7 mx-1" />

            <View className="items-center w-24">
              <View className="w-14 h-14 rounded-2xl bg-card border border-border/50 items-center justify-center mb-3">
                <Ionicons
                  name="sparkles-outline"
                  size={22}
                  color={Colors.primary}
                />
              </View>
              <Text className="text-[10px] color-textSecondary font-[800] text-center uppercase leading-[14px]">
                Service{"\n"}Completed
              </Text>
            </View>
          </View>
        </View>

        {/* Receipt Card */}
        <View className="mx-6 mt-12">
          <View className="bg-card rounded-[32px] overflow-hidden border border-border/50 shadow-sm relative pt-10 pb-8 px-8">
            {/* Decorative notches */}
            <View className="absolute top-[28px] -left-[12px] w-6 h-6 rounded-full bg-background" />
            <View className="absolute top-[28px] -right-[12px] w-6 h-6 rounded-full bg-background" />

            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[18px] font-[800] color-text">
                Booking Receipt
              </Text>
              <View className="bg-primary/10 px-3 py-1 rounded-full">
                <Text className="text-[10px] font-[900] color-primary">
                  #
                  {params.bookingId?.toString().slice(-6).toUpperCase() ||
                    "CONFIRMED"}
                </Text>
              </View>
            </View>

            <View className="space-y-5">
              <View className="flex-row justify-between items-start">
                <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-wider">
                  Service
                </Text>
                <Text className="text-[14px] font-[800] color-text text-right flex-1 ml-4">
                  {params.serviceName}
                </Text>
              </View>

              <View className="flex-row justify-between items-start py-4 border-y border-border/20 border-dashed">
                <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-wider">
                  Schedule
                </Text>
                <View className="items-end">
                  <Text className="text-[14px] font-[800] color-text">
                    {selectedDate
                      ? new Date(selectedDate as string).toLocaleDateString(
                          undefined,
                          { weekday: "short", day: "numeric", month: "short" },
                        )
                      : "Today"}
                  </Text>
                  <Text className="text-[12px] font-[700] color-primary mt-0.5">
                    {selectedTime}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-start pt-1">
                <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-wider">
                  Address
                </Text>
                <Text
                  className="text-[14px] font-[800] color-text text-right flex-1 ml-4"
                  numberOfLines={2}
                >
                  {params.address}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-4 border-y border-border/20 border-dashed">
                <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-wider">
                  Payment
                </Text>
                <View className="flex-row items-center">
                  <Ionicons
                    name="card-outline"
                    size={14}
                    color={Colors.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-[14px] font-[800] color-text uppercase">
                    {paymentMethod || "Online"}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between items-center pt-2">
                <Text className="text-[16px] font-[900] color-text uppercase tracking-tight">
                  Total Paid
                </Text>
                <Text className="text-[24px] font-[900] color-primary">
                  ₹{grandTotal}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-background border-t border-border/30">
        <TouchableOpacity
          className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/30"
          onPress={() => router.push("/(tabs)/home")}
        >
          <Text className="text-[16px] font-[900] color-black">
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
