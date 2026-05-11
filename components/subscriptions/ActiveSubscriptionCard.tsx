import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Animated, {
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { InteractivePressable } from "@/components/ui/InteractivePressable";
import { CircularProgress } from "./CircularProgress";

interface ActiveSubscriptionCardProps {
  subscription: any;
  variant?: "active" | "past";
}

const PulsingDot = ({ color }: { color: string }) => {
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 1500 }),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={{ position: "relative", marginRight: 6 }}>
      {/* Glow ring */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: -2,
            left: -2,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
      {/* Solid dot */}
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
    </View>
  );
};

export const ActiveSubscriptionCard: React.FC<ActiveSubscriptionCardProps> = ({
  subscription,
  variant = "active",
}) => {
  const router = useRouter();
  const isPast = variant === "past";

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const daysLeft = subscription.endDate
    ? Math.ceil(
        (new Date(subscription.endDate).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const totalServices =
    subscription.totalServicesPlanned || subscription.servicesTotal || 30;
  const progress = Math.min(
    (subscription.servicesCompleted / totalServices) * 100,
    100,
  );

  const isExpired = subscription.status === "expired" || progress >= 100;

  const frequencyLabel =
    {
      DAILY: "Daily",
      TWICE_MONTHLY: "2x / Month",
      WEEKLY: "Weekly",
      BIWEEKLY: "Bi-weekly",
      ALTERNATE_DAY: "Alt. Day",
    }[subscription.frequencyType as string] || "2x / Month";

  const statusConfig = isExpired || isPast
    ? { color: "#EF4444", label: "Expired", dotColor: "#F87171" }
    : { color: "#4ADE80", label: "Active", dotColor: "#4ADE80" };

  const cardBorderColor = isExpired || isPast
    ? "rgba(239, 68, 68, 0.12)"
    : `${Colors.primary}15`;

  // Find next scheduled service
  const nextService = subscription.serviceDates?.find(
    (s: any) => s.status === "pending",
  );
  const nextServiceDate = nextService
    ? new Date(nextService.date)
    : null;
  const daysUntilNextWash = nextServiceDate
    ? Math.ceil((nextServiceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <InteractivePressable
      onPress={() =>
        router.push(`/subscription-flow/details/${subscription._id}` as any)
      }
      style={{
        marginBottom: 14,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: cardBorderColor,
        backgroundColor: isPast
          ? "rgba(24, 24, 24, 0.5)"
          : isExpired
            ? "rgba(24, 24, 24, 0.6)"
            : Colors.card,
      }}
    >
      {/* Active glow bar */}
      {!isPast && !isExpired && (
        <View
          style={{
            height: 2,
            backgroundColor: Colors.primary,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 4,
          }}
        />
      )}

      <View style={{ padding: isPast ? 16 : 20 }}>
        {/* Top Row: Plan name + Status badge */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text
              style={{
                fontSize: 19,
                fontWeight: "900",
                color: isExpired || isPast ? Colors.textSecondary : Colors.text,
                letterSpacing: -0.5,
              }}
              numberOfLines={1}
            >
              {subscription.plan?.name || "Premium Plan"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 }}>
              <Text
                style={{
                  fontSize: 10,
                  color: Colors.textSecondary,
                  fontFamily: "monospace",
                  opacity: 0.5,
                }}
              >
                #{subscription._id.slice(-6).toUpperCase()}
              </Text>
              {!isPast && (
                <View
                  style={{
                    backgroundColor: `${Colors.primary}12`,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 6,
                    borderWidth: 1,
                    borderColor: `${Colors.primary}20`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "800",
                      color: Colors.primary,
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {frequencyLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Status Badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              backgroundColor: `${statusConfig.color}10`,
              borderWidth: 1,
              borderColor: `${statusConfig.color}20`,
            }}
          >
            {!isExpired && !isPast ? (
              <PulsingDot color={statusConfig.dotColor} />
            ) : (
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: statusConfig.dotColor,
                  marginRight: 6,
                }}
              />
            )}
            <Text
              style={{
                fontSize: 9,
                fontWeight: "800",
                color: statusConfig.color,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {subscription.status?.toUpperCase() || statusConfig.label.toUpperCase()}
            </Text>
          </View>
        </View>

        {!isPast && (
          <>
            {/* Progress + Info Section */}
            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                alignItems: "center",
              }}
            >
              {/* Circular Progress */}
              <View style={{ marginRight: 18 }}>
                <CircularProgress
                  progress={progress}
                  size={78}
                  strokeWidth={5}
                  color={isExpired ? "#EF4444" : Colors.primary}
                  label={`${subscription.servicesCompleted}/${totalServices}`}
                  sublabel="washes"
                />
              </View>

              {/* Info Grid */}
              <View style={{ flex: 1, gap: 10 }}>
                {/* Vehicle */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Ionicons
                    name="car-sport"
                    size={16}
                    color={Colors.textSecondary}
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: isExpired ? Colors.textSecondary : Colors.text,
                      }}
                      numberOfLines={1}
                    >
                      {subscription.vehicle?.vehicleType || "-"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "500",
                        color: Colors.textSecondary,
                        marginTop: 1,
                      }}
                    >
                      {subscription.vehicle?.vehicleNo ||
                        subscription.vehicle?.number ||
                        "-"}
                    </Text>
                  </View>
                </View>

                {/* Expiry */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "rgba(255,255,255,0.03)",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={Colors.textSecondary}
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: isExpired ? Colors.textSecondary : Colors.text,
                      }}
                    >
                      {formatDate(subscription.endDate)}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: "600",
                        color:
                          isExpired || daysLeft < 5
                            ? "#F87171"
                            : Colors.textSecondary,
                        marginTop: 1,
                      }}
                    >
                      {isExpired ? "Limit reached" : `${daysLeft} days left`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Next Wash Chip */}
            {daysUntilNextWash !== null && daysUntilNextWash >= 0 && !isExpired && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 14,
                  backgroundColor: `${Colors.primary}08`,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${Colors.primary}15`,
                }}
              >
                <Ionicons
                  name="water"
                  size={14}
                  color={Colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: Colors.primary,
                  }}
                >
                  Next wash{" "}
                  {daysUntilNextWash === 0
                    ? "today"
                    : daysUntilNextWash === 1
                      ? "tomorrow"
                      : `in ${daysUntilNextWash} days`}
                </Text>
              </View>
            )}

            {/* View Details CTA */}
            <InteractivePressable
              onPress={() =>
                router.push(
                  `/subscription-flow/details/${subscription._id}` as any,
                )
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 14,
                backgroundColor: "rgba(255,255,255,0.03)",
                paddingVertical: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: Colors.text,
                  marginRight: 6,
                }}
              >
                View Details
              </Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.text} />
            </InteractivePressable>
          </>
        )}

        {isPast && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: Colors.textSecondary,
                fontWeight: "500",
              }}
            >
              Completed {formatDate(subscription.endDate)}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  color: Colors.primary,
                  marginRight: 4,
                }}
              >
                View Log
              </Text>
              <Ionicons
                name="chevron-forward"
                size={12}
                color={Colors.primary}
              />
            </View>
          </View>
        )}
      </View>
    </InteractivePressable>
  );
};
