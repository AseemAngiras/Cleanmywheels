import React, { useState, useEffect } from "react";
import { View, Text, Modal, Dimensions, StyleSheet } from "react-native";
import Animated, { 
  FadeIn, 
  FadeOut, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  useSharedValue
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { InteractivePressable } from "../ui/InteractivePressable";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

interface OnboardingTourProps {
  isVisible: boolean;
  onClose: () => void;
}

export const OnboardingTour = ({ isVisible, onClose }: OnboardingTourProps) => {
  const [step, setStep] = useState(1);
  const insets = useSafeAreaInsets();
  const pulseScale = useSharedValue(1);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.2, { duration: 1000 })
      ),
      -1,
      true
    ),
  }));

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      onClose();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    onClose();
  };

  if (!isVisible) return null;

  return (
    <Modal transparent visible={isVisible} animationType="fade">
      <View className="flex-1 bg-black/80">
        {step === 1 && (
          <Animated.View 
            entering={FadeIn} 
            exit={FadeOut}
            className="flex-1 items-center justify-center"
          >
            {/* Highlight Area (Book Wash) */}
            <View 
              className="absolute w-full px-5"
              style={{ top: height * 0.44 }}
            >
              {/* <Animated.View 
                style={pulseStyle}
                className="absolute inset-0 rounded-[24px] border-2 border-primary"
              /> */}
              <View className="h-[100px] rounded-[24px] border-2 border-primary border-dashed" />
              
              <View className="mt-8 items-center">
                <View className="bg-primary p-4 rounded-2xl shadow-2xl">
                  <Text className="text-black font-[900] text-center text-lg italic uppercase">
                    Book   Now
                  </Text>
                  <Text className="text-black/70 font-[700] text-center text-sm">
                    Your doorstep wash is just one tap away.
                  </Text>
                </View>
                <View className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-primary -mt-[60px] rotate-180 mb-10" />
              </View>
            </View>
          </Animated.View>
        )}

        {step === 2 && (
          <Animated.View 
            entering={FadeIn} 
            exit={FadeOut}
            className="flex-1"
          >
            {/* Highlight Area (Login Button) */}
            <View 
              className="absolute right-5"
              style={{ top: insets.top + 15, left: insets.left + 317 }}
            >
              {/* <Animated.View 
                style={pulseStyle}
                className="absolute inset-0 rounded-lg border-2 border-primary"
              /> */}
              <View className="w-[80px] h-[38px] rounded-lg border-2 border-primary border-dashed" />
              
              <View className="mt-4 items-end">
                <View className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-primary mr-8" />
                <View className="bg-primary p-4 rounded-2xl shadow-2xl w-[220px]">
                  <Text className="text-black font-[900] text-center text-lg italic uppercase">
                    Welcome Back!
                  </Text>
                  <Text className="text-black/70 font-[700] text-center text-xs">
                    Already a member? Log in here to manage your elite care plans.
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Navigation Buttons */}
        <View 
          className="absolute left-0 right-0 px-10 flex-row justify-between items-center"
          style={{ bottom: Math.max(insets.bottom + 20, 40) }}
        >
          <InteractivePressable onPress={handleSkip}>
            <Text className="text-gray-400 font-[700] text-base">Skip</Text>
          </InteractivePressable>
          
          <InteractivePressable 
            onPress={handleNext}
            className="bg-primary px-8 py-3 rounded-full shadow-lg shadow-primary/30"
          >
            <Text className="text-black font-[900] uppercase italic">
              {step === 2 ? "Finish" : "Next"}
            </Text>
          </InteractivePressable>
        </View>
      </View>
    </Modal>
  );
};
