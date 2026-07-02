import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

interface PulseLoaderProps {
  size?: number;
  color?: string;
}

export default function PulseLoader({
  size = 50,
  color = "#C8F000",
}: PulseLoaderProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, opacity]);

  return (
    <View
      className="justify-center items-center"
      style={[{ width: size * 2, height: size * 2 }]}
    >
      {/* Pulsing Ring */}
      <Animated.View
        className="absolute"
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: opacity,
            transform: [{ scale: scale }],
          },
        ]}
      />
      {/* Static Icon or Inner Circle */}
      <View
        className="justify-center items-center z-10 bg-white shadow-sm"
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            elevation: 5,
          },
        ]}
      >
        <Ionicons name="card-outline" size={size * 0.5} color="#000" />
      </View>
    </View>
  );
}
