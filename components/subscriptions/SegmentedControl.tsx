import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

interface SegmentedControlProps {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export const SegmentedControl = ({
  segments,
  activeIndex,
  onChange,
}: SegmentedControlProps) => {
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withSpring(activeIndex, {
      damping: 18,
      stiffness: 180,
      mass: 0.8,
    });
  }, [activeIndex]);

  const indicatorStyle = useAnimatedStyle(() => {
    const segmentWidth = 100 / segments.length;
    return {
      left: `${translateX.value * segmentWidth}%` as any,
      width: `${segmentWidth}%` as any,
    };
  });

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 16,
        padding: 3,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      {/* Sliding indicator */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 3,
            bottom: 3,
            borderRadius: 13,
            backgroundColor: Colors.primary,
          },
          indicatorStyle,
        ]}
      />

      {segments.map((segment, index) => (
        <TouchableOpacity
          key={segment}
          activeOpacity={0.7}
          onPress={() => onChange(index)}
          style={{
            flex: 1,
            paddingVertical: 11,
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "800",
              letterSpacing: 0.3,
              color: activeIndex === index ? "#000000" : "#888888",
            }}
          >
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
