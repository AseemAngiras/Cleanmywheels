import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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
    <View className="px-4 mb-5 flex-row gap-3">
      {/* Primary: Book Wash */}
      <TouchableOpacity
        className="flex-[1.2] rounded-[24px] shadow-lg elevation-5 h-[140px]"
        activeOpacity={0.9}
        onPress={handleBookPress}
      >
        <LinearGradient
          colors={["#1A1A1A", "#111111"]}
          className="flex-1 p-4 rounded-[24px] border border-[#333] justify-between"
        >
          <View>
            <Text className="text-primary text-[10px] font-[700] tracking-[1px] mb-1 uppercase">
              DISPATCH
            </Text>
            <Text className="text-white text-xl font-[800] italic tracking-[0.5px] leading-[22px]">
              BOOK A{"\n"}WASH
            </Text>
          </View>

          <View className="w-11 h-11 rounded-[14px] bg-primary items-center justify-center self-end shadow-md shadow-primary">
            <Ionicons name="flash" size={24} color="#000" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Secondary: Subscription - Only if logged in */}
      {isLoggedIn && (
        <TouchableOpacity
          className="flex-[0.8] rounded-[24px] shadow-lg elevation-5 h-[140px]"
          activeOpacity={0.9}
          onPress={handleSubPress}
        >
          <LinearGradient
            colors={["#1A1A1A", "#111111"]}
            className="flex-1 p-4 rounded-[24px] border border-[#333] justify-between"
          >
            <View>
              <Text className="text-primary text-[10px] font-[700] tracking-[1px] mb-1 uppercase">
                {hasActiveSubscription ? "UPGRADE" : "MEMBERSHIP"}
              </Text>
              <Text className="text-white text-lg font-[800] italic tracking-[0.5px] leading-[20px]">
                {hasActiveSubscription ? "ADD-ONS" : "BUY PLAN"}
              </Text>
            </View>

            <View
              className={`w-11 h-11 rounded-[14px] items-center justify-center self-end shadow-md ${
                hasActiveSubscription
                  ? "bg-white shadow-white"
                  : "bg-white shadow-white"
              }`}
            >
              <Ionicons
                name={hasActiveSubscription ? "add" : "star"}
                size={20}
                color="#000"
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};
