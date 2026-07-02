import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInLeft, FadeInRight, FadeInUp } from "react-native-reanimated";
import { InteractivePressable } from "../ui/InteractivePressable";

interface ServiceActionGridProps {
  isLoggedIn: boolean;
  hasActiveSubscription?: boolean;
}

export const ServiceActionGrid = ({
  isLoggedIn,
  hasActiveSubscription,
}: ServiceActionGridProps) => {
  const router = useRouter();
  const isNavigating = useRef(false);

  const handleBookPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.push("/(tabs)/home/book-doorstep/enter-location");
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  const handleSubPress = () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    if (hasActiveSubscription) {
      router.push("/subscription-flow/addons");
    } else {
      router.push("/(tabs)/subscriptions");
    }
    setTimeout(() => {
      isNavigating.current = false;
    }, 1000);
  };

  return (
    <View className="px-5 mb-8">
      {/* Primary: Instant Wash */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(500)}
        className="w-full"
      >
        <InteractivePressable
          className="rounded-[24px] bg-[#1A1A1A] border border-white/5 shadow-lg flex-row items-center justify-between p-5 h-[100px]"
          onPress={handleBookPress}
        >
          <View>
            <Text className="text-primary text-[10px] font-[700] tracking-[1px] mb-1 uppercase">
              INSTANT CARE
            </Text>
            <Text className="text-white text-2xl font-[900] italic tracking-[0.5px]">
              BOOK A <Text className="text-primary">WASH</Text>
            </Text>
          </View>

          <View className="w-12 h-12 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/20">
            <Ionicons name="flash" size={24} color="#000" />
          </View>
        </InteractivePressable>
      </Animated.View>

      {/* Secondary: Membership - Only for logged in */}
      {isLoggedIn && (
        <Animated.View
          entering={FadeInRight.delay(300).duration(500)}
          className="mt-4"
        >
          <InteractivePressable
            className="rounded-[20px] bg-[#141414] border border-white/5 p-4 flex-row items-center justify-between"
            onPress={handleSubPress}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-3">
                <Ionicons name={hasActiveSubscription ? "add" : "star"} size={18} color="#C8F000" />
              </View>
              <View>
                <Text className="text-white text-base font-[700]">
                  {hasActiveSubscription ? "Add Add-ons on your subscriptions" : "Elite Membership"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#333" />
          </InteractivePressable>
        </Animated.View>
      )}
    </View>
  );
};
