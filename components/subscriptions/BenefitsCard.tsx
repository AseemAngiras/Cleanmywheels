import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, View } from "react-native";
import { InteractivePressable } from "@/components/ui/InteractivePressable";

interface BenefitsCardProps {
  onExplore: () => void;
}

export const BenefitsCard = ({ onExplore }: BenefitsCardProps) => {
  const benefits = [
    {
      icon: "water",
      color: "#38BDF8",
      bg: "bg-sky-500/10",
      borderColor: "border-sky-500/15",
      title: "Regular Car Wash",
      desc: "Expert cleaning at your schedule",
    },
    {
      icon: "sparkles",
      color: "#A78BFA",
      bg: "bg-violet-500/10",
      borderColor: "border-violet-500/15",
      title: "Monthly Polishing",
      desc: "Keep your car looking showroom new",
    },
    {
      icon: "shield-checkmark",
      color: "#4ADE80",
      bg: "bg-green-500/10",
      borderColor: "border-green-500/15",
      title: "Premium Care",
      desc: "Eco-friendly products & towels",
    },
  ];

  return (
    <View className="mb-6 bg-card rounded-[28px] border border-border/50 overflow-hidden shadow-sm">
      <View className="p-6">
        <View className="flex-row items-center mb-6">
          <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4 border border-primary/15">
            <Ionicons name="car-sport" size={24} color={Colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-[18px] font-[800] text-text tracking-tight">
              Premium Car Care
            </Text>
            <Text className="text-[12px] color-textSecondary font-[500] mt-0.5">
              Daily service at your doorstep
            </Text>
          </View>
        </View>

        <View className="gap-4 mb-7">
          {benefits.map((benefit, index) => (
            <View key={index} className="flex-row items-center">
              <View
                className={`w-11 h-11 rounded-xl ${benefit.bg} items-center justify-center mr-4 border ${benefit.borderColor}`}
              >
                <Ionicons
                  name={benefit.icon as any}
                  size={20}
                  color={benefit.color}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-[700] text-text">
                  {benefit.title}
                </Text>
                <Text className="text-[12px] color-textSecondary font-[500] mt-0.5">
                  {benefit.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <InteractivePressable
          className="bg-primary rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-primary/30"
          onPress={onExplore}
        >
          <Text className="text-black text-[15px] font-[800]">
            Explore Plans
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#000" style={{ marginLeft: 6 }} />
        </InteractivePressable>
      </View>
    </View>
  );
};
