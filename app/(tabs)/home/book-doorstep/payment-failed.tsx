import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, TouchableOpacity, View, ScrollView } from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatPrice } from "@/utils/formatPrice";

export default function PaymentFailedScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { grandTotal } = params;

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 + insets.bottom }}
      >
        {/* Status Header */}
        <View className="bg-card rounded-b-[44px] items-center pt-16 pb-12 px-6 shadow-xl border-b border-border/30">
          <View className="w-20 h-20 rounded-full bg-red-500/20 items-center justify-center mb-6 shadow-lg shadow-red-500/20">
            <View className="w-14 h-14 rounded-full bg-red-500 items-center justify-center">
              <Ionicons name="close" size={32} color="white" />
            </View>
          </View>
          <Text className="text-[28px] font-[900] color-text tracking-tighter">
            Payment Failed
          </Text>
          <Text className="text-[14px] color-textSecondary font-[600] mt-2 text-center px-4">
            We couldn&apos;t process your payment. Please try again or choose a
            different payment method.
          </Text>
        </View>

        {/* Possible Reasons */}
        <View className="px-6 mt-10">
          <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2.5px] mb-6">
            Common reasons
          </Text>

          <View className="space-y-4">
            <View className="flex-row items-center bg-card p-4 rounded-2xl border border-border/50">
              <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center mr-4">
                <Ionicons name="card-outline" size={20} color="#EF4444" />
              </View>
              <Text className="text-[13px] font-[600] color-text flex-1">
                Insufficient funds or card limit reached
              </Text>
            </View>

            <View className="flex-row items-center bg-card p-4 rounded-2xl border border-border/50">
              <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center mr-4">
                <Ionicons name="wifi-outline" size={20} color="#EF4444" />
              </View>
              <Text className="text-[13px] font-[600] color-text flex-1">
                Unstable internet connection
              </Text>
            </View>

            <View className="flex-row items-center bg-card p-4 rounded-2xl border border-border/50">
              <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center mr-4">
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color="#EF4444"
                />
              </View>
              <Text className="text-[13px] font-[600] color-text flex-1">
                Bank or payment gateway downtime
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction Summary */}
        <View className="mx-6 mt-10">
          <View className="bg-card rounded-[32px] p-8 border border-border/50 shadow-sm">
            <Text className="text-[16px] font-[800] color-text mb-6 uppercase tracking-tight">
              Transaction Details
            </Text>

            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[13px] font-[600] color-textSecondary">
                Amount
              </Text>
              <Text className="text-[18px] font-[900] color-text">
              ₹{formatPrice(grandTotal || "0")}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-[13px] font-[600] color-textSecondary">
                Status
              </Text>
              <View className="bg-red-500/10 px-3 py-1 rounded-full">
                <Text className="text-[10px] font-[900] color-red-500 uppercase">
                  Declined
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View
        className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t border-border/30 space-y-3"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <TouchableOpacity
          className="bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/30"
          onPress={() => router.back()}
        >
          <Text className="text-[16px] font-[900] color-black">Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-card h-14 rounded-2xl items-center justify-center border border-border/50"
          onPress={() => router.push("/(tabs)/home")}
        >
          <Text className="text-[16px] font-[800] color-text">
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
