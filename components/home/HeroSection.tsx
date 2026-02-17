import { useRouter } from "expo-router";
import React from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface HeroSectionProps {
  isLoggedIn?: boolean;
}

export const HeroSection = ({ isLoggedIn = false }: HeroSectionProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(
      isLoggedIn
        ? "/(tabs)/subscriptions"
        : "/(tabs)/home/book-doorstep/enter-location",
    );
  };

  return (
    <View className="mb-6">
      <View className="w-full items-center px-4">
        <ImageBackground
          source={{
            uri: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop",
          }}
          className="w-full h-[220px] overflow-hidden rounded-[24px] border border-white/10"
          style={{ overflow: "hidden" }} // imageStyle doesn't have a direct className equivalent easily for ImageBackground, but NativeWind usually handles style merging.
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
                className="border-2 border-primary py-[10px] px-6 rounded-[12px]"
                activeOpacity={0.8}
                onPress={handlePress}
              >
                <Text className="text-primary text-sm font-[900] italic tracking-[0.5px]">
                  EXPLORE SPECS
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>
    </View>
  );
};
