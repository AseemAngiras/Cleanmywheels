import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";

interface MiniRingProps {
  progress: number;
  size: number;
  color: string;
  trackColor?: string;
}

const MiniRing = ({
  progress,
  size,
  color,
  trackColor = "rgba(255,255,255,0.04)",
}: MiniRingProps) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(progress, 100)) / 100;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </Svg>
  );
};

interface StatItemProps {
  icon: string;
  iconColor: string;
  ringProgress: number;
  value: string;
  label: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({
  icon,
  iconColor,
  ringProgress,
  value,
  label,
  delay,
}) => (
  <Animated.View
    entering={FadeInUp.delay(delay).duration(600).springify()}
    style={{
      flex: 1,
      alignItems: "center",
    }}
  >
    {/* Ring with icon inside */}
    <View style={{ width: 52, height: 52, alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
      <MiniRing progress={ringProgress} size={52} color={iconColor} />
      <View style={{ position: "absolute" }}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
    </View>

    <Text
      style={{
        fontSize: 20,
        fontWeight: "900",
        color: Colors.text,
        letterSpacing: -0.5,
        lineHeight: 24,
      }}
    >
      {value}
    </Text>
    <Text
      style={{
        fontSize: 9,
        fontWeight: "700",
        color: Colors.textSecondary,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginTop: 3,
      }}
    >
      {label}
    </Text>
  </Animated.View>
);

export const SavingsCard = () => {
  return (
    <Animated.View
      entering={FadeInUp.duration(500)}
      style={{
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: `${Colors.primary}15`,
      }}
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={[`${Colors.primary}15`, `${Colors.primary}05`, Colors.card]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          paddingTop: 22,
          paddingBottom: 24,
          paddingHorizontal: 16,
        }}
      >
        {/* Glowing top edge */}
        <LinearGradient
          colors={[Colors.primary, `${Colors.primary}00`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
          }}
        />

        {/* Title with icon */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: `${Colors.primary}15`,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
              borderWidth: 1,
              borderColor: `${Colors.primary}25`,
            }}
          >
            <Ionicons name="trending-up" size={14} color={Colors.primary} />
          </View>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: Colors.text,
              letterSpacing: 0.5,
            }}
          >
            Your Savings
          </Text>
        </View>

        {/* Stats Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <StatItem
            icon="time-outline"
            iconColor="#4ADE80"
            ringProgress={80}
            value="4 hrs"
            label="Time Saved"
            delay={100}
          />

          {/* Divider */}
          <View
            style={{
              width: 1,
              height: 60,
              marginTop: 6,
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
              style={{ flex: 1 }}
            />
          </View>

          <StatItem
            icon="wallet-outline"
            iconColor="#FACC15"
            ringProgress={65}
            value="₹1,200"
            label="Money Saved"
            delay={200}
          />

          {/* Divider */}
          <View
            style={{
              width: 1,
              height: 60,
              marginTop: 6,
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]}
              style={{ flex: 1 }}
            />
          </View>

          <StatItem
            icon="car-sport-outline"
            iconColor="#38BDF8"
            ringProgress={75}
            value="24"
            label="Washes"
            delay={300}
          />
        </View>

        {/* Bottom tag line */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 18,
            paddingVertical: 8,
            paddingHorizontal: 14,
            backgroundColor: "rgba(255,255,255,0.03)",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.04)",
          }}
        >
          <Ionicons name="leaf-outline" size={12} color="#4ADE80" style={{ marginRight: 6 }} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: Colors.textSecondary,
              letterSpacing: 0.3,
            }}
          >
            You're saving ₹40 per wash on average
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
