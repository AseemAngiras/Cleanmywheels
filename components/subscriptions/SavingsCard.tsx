import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, View } from "react-native";

export const SavingsCard = () => {
  return (
    <View className="bg-card rounded-[24px] p-5 mb-5 border border-border shadow-sm">
      <Text className="text-[13px] font-[600] color-textSecondary mb-5 text-center px-4">
        With subscription you save monthly:
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center justify-center">
          <View className="w-9 h-9 rounded-full bg-green-500/10 items-center justify-center mr-3 border border-green-500/20">
            <Ionicons name="time" size={18} color="#4ADE80" />
          </View>
          <View>
            <Text className="text-[16px] font-[800] text-text">4 hrs</Text>
          </View>
        </View>

        <View className="w-[1px] h-8 bg-border/50" />

        <View className="flex-1 flex-row items-center justify-center">
          <View className="w-9 h-9 rounded-full bg-yellow-500/10 items-center justify-center mr-3 border border-yellow-500/20">
            <Ionicons name="wallet" size={18} color="#FACC15" />
          </View>
          <View>
            <Text className="text-[16px] font-[800] text-text">₹1,200</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
