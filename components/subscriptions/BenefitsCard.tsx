import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface BenefitsCardProps {
  onExplore: () => void;
}

export const BenefitsCard = ({ onExplore }: BenefitsCardProps) => {
  const benefits = [
    {
      icon: "water",
      title: "Daily Car Wash",
      desc: "Expert cleaning every morning",
    },
    {
      icon: "sparkles",
      title: "Monthly Polishing",
      desc: "Keep your car looking showroom new",
    },
    {
      icon: "shield-checkmark",
      title: "Premium Care",
      desc: "Eco-friendly products & towels",
    },
  ];

  return (
    <View className="mb-6 bg-card rounded-[32px] border border-border overflow-hidden shadow-sm">
      <View className="p-6">
        <View className="flex-row items-center mb-5">
          <View className="w-12 h-12 rounded-full bg-background items-center justify-center mr-4 border border-border/50">
            <Ionicons name="car-sport" size={24} color={Colors.text} />
          </View>
          <View>
            <Text className="text-[18px] font-[800] text-text mb-0.5 tracking-tight">
              Premium Car Care
            </Text>
            <Text className="text-[13px] color-textSecondary font-[500]">
              Daily service at your doorstep
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-border/50 mb-6" />

        <View className="gap-5 mb-8">
          {benefits.map((benefit, index) => (
            <View key={index} className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-background items-center justify-center mr-4 border border-border/50">
                <Ionicons
                  name={benefit.icon as any}
                  size={16}
                  color={Colors.text}
                />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-[700] text-text mb-0.5">
                  {benefit.title}
                </Text>
                <Text className="text-[12px] color-textSecondary font-[500]">
                  {benefit.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          className="bg-primary rounded-2xl py-4 flex-row items-center justify-center shadow-lg shadow-primary/30"
          onPress={onExplore}
          activeOpacity={0.9}
        >
          <Text className="text-black text-[15px] font-[800]">View Plans</Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color="#000"
            className="ml-1.5"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};
