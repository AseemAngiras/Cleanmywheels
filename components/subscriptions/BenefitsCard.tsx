import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

interface BenefitItem {
  icon: string;
  color: string;
  gradientColors: [string, string];
  title: string;
  desc: string;
  stat?: string;
}

const benefits: BenefitItem[] = [
  {
    icon: "water",
    color: "#38BDF8",
    gradientColors: ["rgba(56, 189, 248, 0.12)", "rgba(56, 189, 248, 0.03)"],
    title: "Regular Wash",
    desc: "Expert cleaning at your scheduled time, every time",
    stat: "Daily",
  },
  {
    icon: "sparkles",
    color: "#A78BFA",
    gradientColors: ["rgba(167, 139, 250, 0.12)", "rgba(167, 139, 250, 0.03)"],
    title: "Monthly Polish",
    desc: "Keep your car looking showroom-fresh",
    stat: "Monthly",
  },
  {
    icon: "shield-checkmark",
    color: "#4ADE80",
    gradientColors: ["rgba(74, 222, 128, 0.12)", "rgba(74, 222, 128, 0.03)"],
    title: "Premium Care",
    desc: "Eco-friendly products & microfiber towels",
    stat: "100%",
  },
  {
    icon: "calendar",
    color: "#FB923C",
    gradientColors: ["rgba(251, 146, 60, 0.12)", "rgba(251, 146, 60, 0.03)"],
    title: "Priority Slots",
    desc: "Book your preferred time before anyone else",
    stat: "VIP",
  },
];

const BenefitTile: React.FC<{
  benefit: BenefitItem;
  index: number;
}> = ({ benefit, index }) => (
  <Animated.View
    entering={FadeInUp.delay(200 + index * 100)
      .duration(500)
      .springify()}
    style={{
      width: "48%",
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: 10,
      borderWidth: 1,
      borderColor: `${benefit.color}12`,
    }}
  >
    <LinearGradient
      colors={benefit.gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        padding: 16,
        paddingBottom: 18,
      }}
    >
      {/* Top row: icon + stat badge */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: `${benefit.color}15`,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: `${benefit.color}20`,
            // Glow effect
            shadowColor: benefit.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Ionicons name={benefit.icon as any} size={20} color={benefit.color} />
        </View>

        {benefit.stat && (
          <View
            style={{
              backgroundColor: `${benefit.color}12`,
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: `${benefit.color}18`,
            }}
          >
            <Text
              style={{
                fontSize: 8,
                fontWeight: "900",
                color: benefit.color,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {benefit.stat}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={{
          fontSize: 15,
          fontWeight: "800",
          color: Colors.text,
          marginBottom: 4,
          letterSpacing: -0.2,
        }}
      >
        {benefit.title}
      </Text>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "500",
          color: Colors.textSecondary,
          lineHeight: 16,
        }}
        numberOfLines={2}
      >
        {benefit.desc}
      </Text>
    </LinearGradient>
  </Animated.View>
);

export const BenefitsCard = () => {
  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(500)}
      style={{
        marginBottom: 20,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <LinearGradient
        colors={[Colors.card, "rgba(24, 24, 24, 0.6)"]}
        style={{
          padding: 20,
          paddingBottom: 16,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: `${Colors.primary}10`,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
                borderWidth: 1,
                borderColor: `${Colors.primary}20`,
              }}
            >
              <Ionicons name="diamond-outline" size={18} color={Colors.primary} />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "900",
                  color: Colors.text,
                  letterSpacing: -0.3,
                }}
              >
                Why Subscribe?
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: Colors.textSecondary,
                  marginTop: 1,
                  letterSpacing: 0.2,
                }}
              >
                Premium perks included
              </Text>
            </View>
          </View>

          {/* Pill badge */}
          <View
            style={{
              backgroundColor: `${Colors.primary}10`,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: `${Colors.primary}15`,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: "900",
                color: Colors.primary,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              All Plans
            </Text>
          </View>
        </View>

        {/* Subtle divider */}
        <View
          style={{
            height: 1,
            marginBottom: 16,
            borderRadius: 1,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.06)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </View>

        {/* 2×2 Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          {benefits.map((benefit, index) => (
            <BenefitTile key={benefit.title} benefit={benefit} index={index} />
          ))}
        </View>

        {/* Bottom trust line */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 8,
            paddingVertical: 10,
            paddingHorizontal: 14,
            backgroundColor: "rgba(255,255,255,0.02)",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.04)",
          }}
        >
          <Ionicons
            name="checkmark-circle"
            size={14}
            color={Colors.primary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: Colors.textSecondary,
              letterSpacing: 0.2,
            }}
          >
            All included with every subscription plan
          </Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};
