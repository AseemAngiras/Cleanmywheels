import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface NextServiceWidgetProps {
  key?: string | number;
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const formattedDate = new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  let statusBadgeColor = "bg-primary/10 border border-primary/20";
  let statusTextColor = "text-primary";
  let statusText = "Upcoming";

  if (diffDays === 0) {
    statusBadgeColor = "bg-green-500/10 border border-green-500/20";
    statusTextColor = "text-green-500";
    statusText = "TODAY";
  } else if (diffDays === 1) {
    statusBadgeColor = "bg-primary/10 border border-primary/20";
    statusTextColor = "text-primary";
    statusText = "TOMORROW";
  } else if (diffDays < 0) {
    statusBadgeColor = "bg-red-500/10 border border-red-500/20";
    statusTextColor = "text-red-500";
    statusText = "PAST DUE";
  } else {
    statusBadgeColor = "bg-white/5 border border-white/10";
    statusTextColor = "text-[#9CA3AF]";
    statusText = `IN ${diffDays} DAYS`;
  }

  return (
    <View className="px-5 mb-5">
      <TouchableOpacity
        className="bg-[#1C1C1C] rounded-[20px] p-5 flex-row justify-between items-center shadow-lg elevation-8"
        activeOpacity={0.95}
        onPress={() => router.push("/(tabs)/subscriptions")}
      >
        <View className="gap-[10px] flex-1 mr-4">
          <View className="flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-white justify-center items-center">
              <Ionicons name="calendar-sharp" size={18} color="#1C1C1C" />
            </View>
            <View className={`px-2 py-0.5 rounded-[6px] ${statusBadgeColor}`}>
              <Text className={`text-[9px] font-[800] tracking-wider ${statusTextColor}`}>
                {statusText}
              </Text>
            </View>
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
