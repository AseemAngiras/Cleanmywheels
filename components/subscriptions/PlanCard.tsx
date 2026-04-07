import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface PlanCardProps {
  plan: any;
  onSubscribe: (plan: any) => void;
  isPopular?: boolean;
}

export const PlanCard = ({
  plan,
  onSubscribe,
  isPopular = false,
}: PlanCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onSubscribe(plan)}
      className={`w-full bg-card rounded-[24px] p-5 mb-4 border shadow-sm ${
        isPopular ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      {isPopular && (
        <View className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 rounded-full z-10 shadow-sm">
          <Text className="text-[10px] font-black color-black tracking-widest">
            BEST VALUE
          </Text>
        </View>
      )}

      <View className="items-center mb-4 mt-1">
        <Text className="text-[18px] font-[700] text-text mb-1 text-center">
          {plan.name}
        </Text>
        <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-widest mb-1">
          Sedan Price
        </Text>
        <View className="flex-row items-baseline justify-center">
          <Text className="text-sm font-[600] text-textSecondary mr-1">₹</Text>
          <Text className="text-3xl font-[800] text-text">
            {plan.prices?.sedan?.DAILY || 
             plan.prices?.sedan?.WEEKLY || 
             plan.prices?.sedan?.BIWEEKLY ||
             plan.prices?.sedan?.ALTERNATE_DAY ||
             plan.price || 
             0}
          </Text>
          <Text className="text-sm font-[600] text-textSecondary ml-1">
            / month
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-border/50 w-full mb-4" />

      <View className="gap-2.5 flex-1">
        {plan.features?.slice(0, 3).map((feature: string, idx: number) => (
          <View key={idx} className="flex-row items-center">
            <Ionicons
              name="checkmark-circle"
              size={14}
              color={Colors.primary}
            />
            <Text
              className="ml-2 color-textSecondary text-[13px] font-[500]"
              numberOfLines={1}
            >
              {feature}
            </Text>
          </View>
        ))}
      </View>

      <View className="mt-5 bg-primary rounded-2xl py-3.5 flex-row items-center justify-center shadow-lg shadow-primary/30">
        <Text className="text-black text-[14px] font-[800]">Select Plan</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="#000"
          className="ml-1"
        />
      </View>
    </TouchableOpacity>
  );
};
