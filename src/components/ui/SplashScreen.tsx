import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { Image } from "expo-image";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) }),
      withTiming(1, { duration: 1500 }),
      withTiming(
        0,
        { duration: 500, easing: Easing.in(Easing.exp) },
        (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        },
      ),
    );

    scale.value = withSequence(
      withTiming(1, { duration: 1000, easing: Easing.out(Easing.exp) }),
      withTiming(1.1, { duration: 1500 }),
      withTiming(1.5, { duration: 1500 }),
    );
  }, []);

  return (
    <View className="absolute inset-0 bg-[#ffffff] justify-center items-center z-[99999]">
      <Animated.View
        className="w-[200px] h-[200px] justify-center items-center"
        style={[animatedStyle]}
      >
        <Image
          source={require("../../../assets/images/splash-icon.jpg")}
          className="w-full h-full"
          contentFit="contain"
        />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;
