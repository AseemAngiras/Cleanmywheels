import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface HeroSectionProps {
  isLoggedIn?: boolean;
}

export const HeroSection = ({ isLoggedIn = false }: HeroSectionProps) => {
  const router = useRouter();
  const isNavigating = useRef(false);

  const handlePress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    router.push(
      isLoggedIn
        ? "/(tabs)/subscriptions"
        : "/(tabs)/home/book-doorstep/enter-location",
    );

    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  return (
    <View className="mb-6">
      <View className="w-full items-center px-4">
        <ImageBackground
          source={require("../../assets/images/hero_premium.jpg")}
          className="w-full h-[220px] overflow-hidden rounded-[24px] border border-white/10"
          style={{ overflow: "hidden" }} 
          imageStyle={{ borderRadius: 24 }}
          resizeMode="cover"
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)", "rgba(0,0,0,0.9)"]}
            className="flex-1 justify-end p-5"
          >
            <View className="items-start">
              <Text className="text-white text-[28px] italic font-[800] tracking-[1px] leading-[32px]">
                ELITE
              </Text>
              <Text className="text-white text-[28px] italic font-[800] tracking-[1px] leading-[32px] mb-5">
                <Text className="text-primary">SHINE</Text> SYSTEM
              </Text>

              <TouchableOpacity
                className="bg-primary py-[12px] px-8 rounded-[16px] shadow-xl shadow-primary/30"
                activeOpacity={0.8}
                onPress={handlePress}
              >
                <Text className="text-black text-lg font-[900] italic tracking-[0.5px]">
                  BOOK A WASH
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </View>
  );
};
