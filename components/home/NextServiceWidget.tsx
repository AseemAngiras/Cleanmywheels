import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface NextServiceWidgetProps {
  date: string;
  vehicleNo: string;
  progress?: number;
}

export const NextServiceWidget = ({
  date,
  vehicleNo,
  progress = 0.6,
}: NextServiceWidgetProps) => {
  const router = useRouter();
  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <View className="px-5 mb-5">
      <TouchableOpacity
        className="bg-[#1C1C1C] rounded-[20px] p-5 flex-row justify-between items-center shadow-lg elevation-8"
        activeOpacity={0.95}
        onPress={() => router.push("/(tabs)/subscriptions")}
      >
        <View className="gap-[10px]">
          <View className="w-9 h-9 rounded-full bg-white justify-center items-center">
            <Ionicons name="calendar-sharp" size={18} color="#1C1C1C" />
          </View>
          <View>
            <Text className="text-[11px] text-[#9CA3AF] font-[500]">
              Next Service
            </Text>
            <Text className="text-lg font-[700] text-white">
              {formattedDate}
            </Text>
          </View>
        </View>

        <View className="items-end justify-between h-[70px] pt-1">
          <View className="w-[100px] h-1 bg-[#333] rounded-[2px]">
            <View
              className="h-full bg-[#F59E0B] rounded-[2px]"
              style={[
                { width: `${Math.min(100, Math.max(0, progress * 100))}%` },
              ]}
            />
          </View>
          <View className="items-end">
            <Text className="text-white text-[12px] font-[600] mb-[2px]">
              Your vehicle no.
            </Text>
            <Text className="text-primary text-sm font-[700] tracking-[0.5px]">
              {vehicleNo}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
