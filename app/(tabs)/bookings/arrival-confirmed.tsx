"use client";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function ArrivalConfirmed() {
  return (
    <View className="flex-1 bg-background px-6 pt-20">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-6">
        <Ionicons name="checkmark" size={20} color="#1E8E3E" />
        <Text className="text-sm font-[600] text-[#1E8E3E]">
          Arrival confirmed
        </Text>
      </View>

      {/* Main content */}
      <Text className="text-[22px] font-[700] mb-3 text-text">
        The service center has been notified
      </Text>

      <Text className="text-[15px] text-textSecondary leading-[22px] mb-6">
        Your arrival has been registered. A staff member will assist you
        shortly.
      </Text>

      <View className="flex-row gap-[10px] bg-card p-3.5 rounded-xl border border-border">
        <Ionicons name="time-outline" size={18} color="#666" />
        <Text className="text-sm text-textSecondary flex-1 leading-5">
          Please remain nearby in case the provider needs additional details.
        </Text>
      </View>

      {/* Footer actions */}
      <View className="mt-auto pb-10">
        <TouchableOpacity
          className="bg-primary py-[15px] rounded-[14px] items-center mb-[150px]"
          onPress={() => router.replace("/bookings/past-services")}
          activeOpacity={0.85}
        >
          <Text className="text-[19px] font-[500] text-black">
            Back to bookings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
