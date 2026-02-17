import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export const CoreProtocols = () => {
  return (
    <View className="px-5 mb-10">
      <Text className="text-white text-sm font-[800] italic tracking-[1px] mb-2 text-uppercase">
        CORE PROTOCOLS
      </Text>
      <View className="h-[1px] bg-[#333] w-full mb-5" />

      <View className="flex-row gap-3">
        <View className="flex-1 bg-[#1A1A1A] rounded-[24px] p-5 border border-[#333] min-h-[140px] justify-center">
          <View className="mb-4">
            <Ionicons name="shield-checkmark" size={24} color="#C8F000" />
          </View>
          <Text className="text-white text-base font-[800] italic mb-1">
            VERIFIED
          </Text>
          <Text className="text-[#888] text-[12px] font-[500]">
            Elite trained professionals.
          </Text>
        </View>

        <View className="flex-1 bg-[#1A1A1A] rounded-[24px] p-5 border border-[#333] min-h-[140px] justify-center">
          <View className="mb-4">
            <Ionicons name="leaf" size={24} color="#C8F000" />
          </View>
          <Text className="text-white text-base font-[800] italic mb-1">
            WATERLESS
          </Text>
          <Text className="text-[#888] text-[12px] font-[500]">
            Eco-tech solutions.
          </Text>
        </View>
      </View>
    </View>
  );
};
