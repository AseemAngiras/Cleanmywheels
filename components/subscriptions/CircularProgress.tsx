import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  progress: number; // 0–100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
}

export const CircularProgress = ({
  progress,
  size = 80,
  strokeWidth = 6,
  color = "#C8F000",
  trackColor = "rgba(255,255,255,0.06)",
  label,
  sublabel,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [clampedProgress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (circumference * animatedProgress.value) / 100;
    return {
      strokeDashoffset,
    };
  });

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
        />
      </Svg>
      {/* Center Label */}
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        <Text
          style={{
            fontSize: size * 0.22,
            fontWeight: "900",
            color: "#FFFFFF",
            letterSpacing: -0.5,
          }}
        >
          {label ?? `${Math.round(clampedProgress)}%`}
        </Text>
        {sublabel && (
          <Text
            style={{
              fontSize: size * 0.11,
              fontWeight: "600",
              color: "#888888",
              marginTop: 1,
            }}
          >
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
};
