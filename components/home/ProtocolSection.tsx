import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInRight } from "react-native-reanimated";

const protocols = [
  {
    icon: "search-outline",
    title: "1. Inspection",
    desc: "360° point check for paint health & contamination.",
    color: "#C8F000",
  },
  {
    icon: "water-outline",
    title: "2. Nano-Wash",
    desc: "Scratch-free lifting using eco-tech solutions.",
    color: "#C8F000",
  },
  {
    icon: "sparkles-outline",
    title: "3. Diamond Finish",
    desc: "Micro-fiber buffing for a showroom reflection.",
    color: "#C8F000",
  },
];

export const ProtocolSection = () => {
  return (
    <View className="px-5 mb-8">
      <View className="mb-6">
        {/* <Text className="text-primary text-[10px] font-[700] tracking-[2px] uppercase mb-1">
          THE METHODOLOGY
        </Text> */}
        <Text className="text-2xl font-[800] text-white italic">
          OUR CORE <Text className="text-primary">PROTOCOLS</Text>
        </Text>
      </View>

      <View className="gap-4">
        {protocols.map((p, i) => (
          <Animated.View 
            key={i}
            entering={FadeInRight.delay(400 + i * 150).duration(500)}
          >
            <LinearGradient
              colors={["#1A1A1A", "#111111"]}
              className="flex-row items-center p-4 rounded-[20px] border border-white/5"
            >
              <View className="w-12 h-12 rounded-[14px] bg-primary/10 items-center justify-center mr-4 border border-primary/20">
                <Ionicons name={p.icon as any} size={24} color={p.color} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-[700] text-base mb-1">{p.title}</Text>
                <Text className="text-[#888] text-[12px] font-[500] leading-[16px]">
                  {p.desc}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};
