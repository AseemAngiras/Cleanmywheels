import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, View } from "react-native";

export const SavingsCard = () => {
  return (
    <View className="bg-card rounded-[28px] p-6 mb-5 border border-border/50 shadow-sm overflow-hidden">
      {/* Subtle accent line at top */}
      <View className="absolute top-0 left-0 right-0 h-1 bg-primary/30" />

      <Text className="text-[13px] font-[700] color-textSecondary mb-5 text-center tracking-wide">
        Monthly savings with subscription
      </Text>

      <View className="flex-row items-center justify-evenly">
        <View className="items-center flex-1">
          <View className="w-14 h-14 rounded-2xl bg-green-500/10 items-center justify-center mb-3 border border-green-500/15">
            <Ionicons name="time-outline" size={26} color="#4ADE80" />
          </View>
          <Text className="text-[24px] font-[900] text-text tracking-tight">
            4 hrs
          </Text>
          <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-widest mt-1">
            Time Saved
          </Text>
        </View>

        <View className="w-[1.5px] h-16 bg-border/40 rounded-full" />

        <View className="items-center flex-1">
          <View className="w-14 h-14 rounded-2xl bg-yellow-500/10 items-center justify-center mb-3 border border-yellow-500/15">
            <Ionicons name="wallet-outline" size={26} color="#FACC15" />
          </View>
          <Text className="text-[24px] font-[900] text-text tracking-tight">
            ₹1,200
          </Text>
          <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-widest mt-1">
            Money Saved
          </Text>
        </View>
      </View>
    </View>
  );
};
