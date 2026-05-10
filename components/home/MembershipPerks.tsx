import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

const perks = [
  {
    title: "Save 40%",
    desc: "Per wash savings",
    icon: "trending-down",
  },
  {
    title: "Priority",
    desc: "Instant booking",
    icon: "time-outline",
  },
  {
    title: "VIP Care",
    desc: "Premium products",
    icon: "shield-checkmark-outline",
  },
  {
    title: "Free Add-ons",
    desc: "Monthly bonus",
    icon: "gift-outline",
  },
];

export const MembershipPerks = () => {
  return (
    <View className="mb-8">
      <View className="px-5 mb-4">
        <Text className="text-xl font-[800] text-white italic">
          ELITE <Text className="text-primary">MEMBERSHIPS</Text>
        </Text>
        <Text className="text-[#666] text-[12px] font-[600] mt-1 italic">
          We also offer professional monthly care plans
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
      >
        {perks.map((perk, i) => (
          <Animated.View 
            key={i}
            entering={FadeInUp.delay(600 + i * 100).duration(500)}
          >
            <LinearGradient
              colors={["#222", "#111"]}
              className="w-[140px] p-4 rounded-[24px] border border-white/10 items-center"
            >
              <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mb-3">
                <Ionicons name={perk.icon as any} size={20} color="#C8F000" />
              </View>
              <Text className="text-white font-[700] text-sm text-center mb-1">{perk.title}</Text>
              <Text className="text-[#888] text-[10px] text-center">{perk.desc}</Text>
            </LinearGradient>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
};
