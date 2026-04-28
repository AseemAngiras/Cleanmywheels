import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, View } from "react-native";
import { InteractivePressable } from "@/components/ui/InteractivePressable";
import { formatPrice } from "@/utils/formatPrice";

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
  const sedanPrice =
    plan.prices?.sedan?.DAILY ||
    plan.prices?.sedan?.TWICE_MONTHLY ||
    plan.prices?.sedan?.WEEKLY ||
    plan.prices?.sedan?.BIWEEKLY ||
    plan.prices?.sedan?.ALTERNATE_DAY ||
    plan.price ||
    0;

  // Estimate a "regular" price as 40% more for the strikethrough effect
  const regularPrice = Math.round(sedanPrice * 1.4);

  const frequencyLabel =
    plan.frequencies?.[0]?.label || "2 Times a Month";

  return (
    <InteractivePressable
      onPress={() => onSubscribe(plan)}
      className={`w-full rounded-[28px] mb-5 overflow-hidden border shadow-sm ${
        isPopular ? "border-primary shadow-primary/10" : "border-border/50"
      }`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <View className="bg-primary py-2 items-center">
          <Text className="text-[10px] font-[900] color-black tracking-[3px] uppercase">
            ★ MOST POPULAR ★
          </Text>
        </View>
      )}

      <View className={`bg-card p-6 ${isPopular ? "" : ""}`}>
        {/* Plan Name + Frequency */}
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1">
            <Text className="text-[20px] font-[800] text-text tracking-tight">
              {plan.name}
            </Text>
            <View className="flex-row items-center mt-1.5">
              <View className="bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/15">
                <Text className="text-[10px] font-[800] color-primary uppercase tracking-wider">
                  {frequencyLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Price Block */}
          <View className="items-end">
            <Text className="text-[11px] color-textSecondary font-[600] line-through mb-0.5">
              ₹{formatPrice(regularPrice)}
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-[14px] font-[700] color-textSecondary">₹</Text>
              <Text className="text-[28px] font-[900] text-text leading-[34px]">
                {formatPrice(sedanPrice)}
              </Text>
            </View>
            <Text className="text-[10px] color-textSecondary font-[600] uppercase tracking-wider">
              / month · Sedan
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="h-[1px] bg-border/40 mb-4" />

        {/* Features */}
        <View className="gap-2.5 mb-5">
          {plan.features?.slice(0, 4).map((feature: string, idx: number) => (
            <View key={idx} className="flex-row items-center">
              <View className="w-5 h-5 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Ionicons name="checkmark" size={12} color={Colors.primary} />
              </View>
              <Text
                className="color-textSecondary text-[13px] font-[500] flex-1"
                numberOfLines={1}
              >
                {feature}
              </Text>
            </View>
          ))}
          {plan.features?.length > 4 && (
            <Text className="text-[12px] font-[700] color-primary ml-8">
              +{plan.features.length - 4} more features
            </Text>
          )}
        </View>

        {/* CTA */}
        <InteractivePressable
          onPress={() => onSubscribe(plan)}
          className={`rounded-2xl py-4 flex-row items-center justify-center shadow-lg ${
            isPopular
              ? "bg-primary shadow-primary/30"
              : "bg-background border border-border/50"
          }`}
        >
          <Text
            className={`text-[14px] font-[800] ${
              isPopular ? "text-black" : "text-text"
            }`}
          >
            {isPopular ? "Get Started" : "Select Plan"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={isPopular ? "#000" : Colors.text}
            style={{ marginLeft: 4 }}
          />
        </InteractivePressable>
      </View>
    </InteractivePressable>
  );
};
