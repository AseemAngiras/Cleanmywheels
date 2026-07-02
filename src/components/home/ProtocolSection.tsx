import React, { useEffect, useRef, useState } from "react";
import { View, Text, FlatList, Dimensions, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Reanimated, { FadeInRight } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;

const protocols = [
  {
    icon: "search-outline",
    title: "1. ELITE INSPECTION",
    desc: "360° deep-dive check for paint health, iron contamination & surface integrity.",
    color: "#C8F000",
  },
  {
    icon: "water-outline",
    title: "2. NANO-PRESSURE WASH",
    desc: "Advanced scratch-free lifting using eco-tech solutions and high-density foam.",
    color: "#C8F000",
  },
  {
    icon: "sparkles-outline",
    title: "3. DIAMOND FINISH",
    desc: "Micro-fiber buffing with graphene-infused sealant for a showroom reflection.",
    color: "#C8F000",
  },
];

export const ProtocolSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % protocols.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 2500);

    return () => clearInterval(interval);
  }, [activeIndex]);

  const renderItem = ({ item, index }: { item: typeof protocols[0], index: number }) => (
    <View 
      style={{ width: CARD_WIDTH }} 
      className="mr-4 rounded-[32px] border border-white/5 overflow-hidden"
    >
      <LinearGradient
        colors={["#1A1A1A", "#0D0D0D"]}
        className="p-6 h-[180px] justify-between"
      >
        <View className="flex-row justify-between items-start">
          <View className="w-14 h-14 rounded-2xl bg-primary/10 items-center justify-center border border-primary/20">
            <Ionicons name={item.icon as any} size={30} color={item.color} />
          </View>
          <View className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
            <Text className="text-primary text-[10px] font-[900]">STEP {index + 1}</Text>
          </View>
        </View>

        <View>
          <Text className="text-white font-[900] text-xl italic mb-1 uppercase tracking-tight">
            {item.title}
          </Text>
          <Text className="text-[#666] text-[13px] font-[600] leading-[18px]">
            {item.desc}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View className="mb-8">
      <View className="px-5 mb-5 flex-row items-center justify-between">
        <Text className="text-2xl font-[900] text-white italic">
          OUR <Text className="text-primary">ELITE</Text> SYSTEM
        </Text>
        
        <View className="flex-row gap-1">
          {protocols.map((_, i) => (
            <View 
              key={i} 
              className={`h-1 rounded-full ${i === activeIndex ? "w-6 bg-primary" : "w-2 bg-white/10"}`} 
            />
          ))}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={protocols}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
          setActiveIndex(index);
        }}
      />
    </View>
  );
};
