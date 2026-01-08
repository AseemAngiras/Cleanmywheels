import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

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
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scale, opacity]);

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }]}>
      {/* Pulsing Ring */}
      <Animated.View
        style={[
          styles.ring,
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
        style={[
          styles.center,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: "#fff",
            elevation: 5,
          },
        ]}
      >
        <Ionicons name="card-outline" size={size * 0.5} color="#000" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    position: "absolute",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
