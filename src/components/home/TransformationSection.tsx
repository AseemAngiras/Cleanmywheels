import React from "react";
import { View, Text, Image, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export const TransformationSection = () => {
  return (
    <View className="px-5 mb-8">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-xl font-[800] text-white italic">
          THE <Text className="text-primary">TRANSFORMATION</Text>
        </Text>
        <View className="bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
          <Text className="text-primary text-[10px] font-[700]">ELITE SHINE</Text>
        </View>
      </View>

      <Animated.View 
        entering={FadeInUp.delay(200).duration(600)}
        className="flex-row gap-3"
      >
        <View className="flex-1">
          <View className="relative h-[200px] rounded-[20px] overflow-hidden border border-white/10">
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?q=80&w=1000&auto=format&fit=crop" }} 
              className="w-full h-full"
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              className="absolute inset-0 justify-end p-3"
            >
              <Text className="text-white text-xs font-[700] uppercase tracking-wider">Before</Text>
            </LinearGradient>
          </View>
        </View>

        <View className="flex-1">
          <View className="relative h-[200px] rounded-[20px] overflow-hidden border border-primary/30">
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1000&auto=format&fit=crop" }} 
              className="w-full h-full"
              resizeMode="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(200,240,0,0.3)"]}
              className="absolute inset-0"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              className="absolute inset-0 justify-end p-3"
            >
              <Text className="text-primary text-xs font-[700] uppercase tracking-wider">After</Text>
            </LinearGradient>
          </View>
        </View>
      </Animated.View>

      <Text className="text-[#888] text-[12px] mt-3 font-[500] text-center italic">
        *Actual results from our "Diamond Polish" protocol
      </Text>
    </View>
  );
};
