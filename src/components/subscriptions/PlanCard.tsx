import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import React from "react";
import { Dimensions, Text, View } from "react-native";
import { InteractivePressable } from "@/components/ui/InteractivePressable";
import { formatPrice } from "@/utils/formatPrice";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInUp } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
export const PLAN_CARD_WIDTH = SCREEN_WIDTH - 56;
export const PLAN_CARD_SNAP = PLAN_CARD_WIDTH + 14;

interface PlanCardProps {
  plan: any;
  onSubscribe: (plan: any) => void;
  isPopular?: boolean;
  index?: number;
}

const FeatureRow: React.FC<{ feature: string; color: string }> = ({
  feature,
  color,
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 7,
    }}
  >
    <View
      style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        backgroundColor: `${color}12`,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
      }}
    >
      <Ionicons name="checkmark" size={12} color={color} />
    </View>
    <Text
      style={{
        fontSize: 13,
        fontWeight: "600",
        color: "rgba(255,255,255,0.7)",
        flex: 1,
      }}
      numberOfLines={1}
    >
      {feature}
    </Text>
  </View>
);

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  onSubscribe,
  isPopular = false,
  index = 0,
}) => {
  const sedanPrice =
    plan.prices?.sedan?.TWICE_MONTHLY ||
    plan.prices?.sedan?.WEEKLY ||
    plan.prices?.sedan?.BIWEEKLY ||
    plan.prices?.sedan?.ALTERNATE_DAY ||
    plan.price ||
    0;

  const regularPrice = Math.round(sedanPrice * 1.4);
  const discount = Math.round(
    ((regularPrice - sedanPrice) / regularPrice) * 100,
  );
  const frequencyLabel = plan.frequencies?.[0]?.label || "2 Times a Month";
  const servicesPerMonth = plan.frequencies?.[0]?.services || 8;

  const accentColor = isPopular ? Colors.primary : "#A78BFA";

  return (
    <Animated.View
      entering={FadeInUp.delay(100 + index * 120)
        .duration(500)
        .springify()}
      style={{
        width: PLAN_CARD_WIDTH,
        marginRight: 14,
      }}
    >
      <InteractivePressable
        onPress={() => onSubscribe(plan)}
        scaleTo={0.97}
        style={{
          borderRadius: 28,
          overflow: "hidden",
          borderWidth: isPopular ? 1.5 : 1,
          borderColor: isPopular
            ? `${Colors.primary}40`
            : "rgba(255,255,255,0.06)",
          // Glow for popular
          shadowColor: "transparent",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isPopular ? 0.15 : 0,
          shadowRadius: 20,
          elevation: isPopular ? 8 : 0,
        }}
      >
        {/* ===== TOP SECTION: Gradient Header ===== */}
        <LinearGradient
          colors={
            isPopular
              ? [`${Colors.primary}18`, `${Colors.primary}08`, Colors.card]
              : [
                  "rgba(167, 139, 250, 0.08)",
                  "rgba(167, 139, 250, 0.02)",
                  Colors.card,
                ]
          }
          style={{
            paddingTop: 24,
            paddingHorizontal: 22,
            paddingBottom: 20,
          }}
        >
          {/* Glowing top edge */}
          <LinearGradient
            colors={
              isPopular
                ? [Colors.primary, "#86C700", `${Colors.primary}00`]
                : [`${accentColor}60`, `${accentColor}00`]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 2.5,
            }}
          />

          {/* Popular badge */}
          {isPopular && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                backgroundColor: Colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 5,
                borderRadius: 10,
                marginBottom: 14,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Ionicons
                name="star"
                size={10}
                color="#000"
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: "900",
                  color: "#000",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}
              >
                {plan.tag || "Most Popular"}
              </Text>
            </View>
          )}

          {/* Plan Name + Frequency */}
          <Text
            style={{
              fontSize: 24,
              fontWeight: "900",
              color: Colors.text,
              letterSpacing: -0.5,
              marginBottom: 6,
            }}
          >
            {plan.name}
          </Text>

          {/* <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                backgroundColor: `${accentColor}12`,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: `${accentColor}20`,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: accentColor,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {frequencyLabel}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: Colors.textSecondary,
              }}
            >
              · {servicesPerMonth} services/mo
            </Text>
          </View> */}
        </LinearGradient>

        {/* ===== MIDDLE SECTION: Price ===== */}
        <View
          style={{
            paddingHorizontal: 22,
            paddingTop: 4,
            paddingBottom: 20,
            backgroundColor: Colors.card,
          }}
        >
          {/* Price Block */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: Colors.textSecondary,
                  textDecorationLine: "line-through",
                  marginBottom: 2,
                }}
              >
                ₹{formatPrice(regularPrice)}/mo
              </Text>
              <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: Colors.textSecondary,
                  }}
                >
                  ₹
                </Text>
                <Text
                  style={{
                    fontSize: 38,
                    fontWeight: "900",
                    color: Colors.text,
                    letterSpacing: -1.5,
                    lineHeight: 44,
                  }}
                >
                  {formatPrice(sedanPrice)}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: Colors.textSecondary,
                    marginLeft: 3,
                    marginBottom: 5,
                  }}
                >
                  /mo
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  color: Colors.textSecondary,
                  letterSpacing: 0.3,
                  marginTop: 2,
                }}
              >
                Starting price · Sedan
              </Text>
            </View>

            {/* Discount badge */}
            <View
              style={{
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: "rgba(74, 222, 128, 0.1)",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(74, 222, 128, 0.15)",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "900",
                    color: "#4ADE80",
                    letterSpacing: -0.5,
                  }}
                >
                  {discount}%
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: "800",
                    color: "#4ADE80",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginTop: 1,
                  }}
                >
                  OFF
                </Text>
              </View>
            </View>
          </View>

          {/* Gradient divider */}
          <View
            style={{
              height: 1,
              marginBottom: 14,
              overflow: "hidden",
              borderRadius: 1,
            }}
          >
            <LinearGradient
              colors={[
                "rgba(255,255,255,0)",
                `${accentColor}20`,
                "rgba(255,255,255,0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1 }}
            />
          </View>

          {/* ===== Features List ===== */}
          <View style={{ marginBottom: 18 }}>
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color: Colors.textSecondary,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              What&apos;s Included
            </Text>
            {plan.features?.slice(0, 4).map((feature: string, idx: number) => (
              <FeatureRow key={idx} feature={feature} color={accentColor} />
            ))}
            {plan.features?.length > 4 && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 5,
                  marginTop: 2,
                }}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={14}
                  color={accentColor}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: accentColor,
                  }}
                >
                  {plan.features.length - 4} more features included
                </Text>
              </View>
            )}
          </View>

          {/* ===== CTA Button ===== */}
          {isPopular ? (
            <LinearGradient
              colors={[Colors.primary, "#A8D000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <InteractivePressable
                onPress={() => onSubscribe(plan)}
                style={{
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name="flash"
                  size={16}
                  color="#000"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "900",
                    color: "#000",
                    letterSpacing: 0.5,
                  }}
                >
                  Get Started Now
                </Text>
              </InteractivePressable>
            </LinearGradient>
          ) : (
            <InteractivePressable
              onPress={() => onSubscribe(plan)}
              style={{
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255,255,255,0.03)",
                borderWidth: 1,
                borderColor: `${accentColor}20`,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: Colors.text,
                }}
              >
                Select Plan
              </Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={Colors.text}
                style={{ marginLeft: 6 }}
              />
            </InteractivePressable>
          )}

          {/* Money-back line */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 12,
            }}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={11}
              color={Colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                fontSize: 10,
                fontWeight: "600",
                color: Colors.textSecondary,
                letterSpacing: 0.2,
              }}
            >
              {isPopular
                ? "Cancel anytime · No questions asked"
                : "7-day satisfaction guarantee"}
            </Text>
          </View>
        </View>
      </InteractivePressable>
    </Animated.View>
  );
};
