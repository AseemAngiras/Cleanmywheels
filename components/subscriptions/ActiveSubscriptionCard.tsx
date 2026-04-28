import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { InteractivePressable } from "@/components/ui/InteractivePressable";

interface ActiveSubscriptionCardProps {
  subscription: any;
  variant?: "active" | "past";
}

export const ActiveSubscriptionCard = ({
  subscription,
  variant = "active",
}: ActiveSubscriptionCardProps) => {
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
      ALTERNATE_DAY: "Alternate Day",
    }[subscription.frequencyType as string] || "2x / Month";

  const statusColor = isExpired || isPast
    ? { bg: "bg-red-500/8", border: "border-red-500/15", dot: "bg-red-400", text: "color-red-400" }
    : { bg: "bg-green-500/10", border: "border-green-500/20", dot: "bg-green-500", text: "color-green-500" };

  return (
    <InteractivePressable
      onPress={() =>
        router.push(`/subscription-flow/details/${subscription._id}` as any)
      }
      className={`mb-4 rounded-[24px] border overflow-hidden shadow-sm ${
        isPast
          ? "bg-card/50 border-border/20"
          : isExpired
            ? "bg-card/60 border-border/30"
            : "bg-card border-border/50"
      }`}
    >
      {/* Active Accent Bar */}
      {!isPast && !isExpired && (
        <View className="h-1 bg-primary" />
      )}

      <View className={isPast ? "p-4" : "p-5"}>
        {/* Header Row */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-4">
            <Text
              className={`text-[18px] font-[800] tracking-tight ${isExpired || isPast ? "color-textSecondary" : "text-text"}`}
              numberOfLines={1}
            >
              {subscription.plan?.name || "Premium Plan"}
            </Text>
            <View className="flex-row items-center mt-1.5 gap-2">
              <Text className="text-[10px] color-textSecondary font-mono opacity-50">
                #{subscription._id.slice(-6).toUpperCase()}
              </Text>
              {!isPast && (
                <View className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/15">
                  <Text className="text-[9px] font-[800] color-primary uppercase tracking-wider">
                    {frequencyLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Status Badge */}
          <View
            className={`flex-row items-center px-2.5 py-1 rounded-full border ${statusColor.bg} ${statusColor.border}`}
          >
            <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusColor.dot}`} />
            <Text className={`text-[9px] font-[800] tracking-wider uppercase ${statusColor.text}`}>
              {subscription.status?.toUpperCase() || "ACTIVE"}
            </Text>
          </View>
        </View>

        {!isPast && (
          <>
            {/* Info Row */}
            <View className="flex-row mt-5 bg-background rounded-2xl border border-border/30 overflow-hidden">
              <View className="flex-1 p-3.5 items-center border-r border-border/30">
                <Text className="text-[9px] color-textSecondary font-[700] tracking-widest uppercase mb-1">
                  Vehicle
                </Text>
                <Text
                  className={`text-[14px] font-[800] ${isExpired ? "color-textSecondary" : "text-text"}`}
                  numberOfLines={1}
                >
                  {subscription.vehicle?.vehicleType || "-"}
                </Text>
                <Text className="text-[11px] color-textSecondary font-[500] mt-0.5">
                  {subscription.vehicle?.vehicleNo || subscription.vehicle?.number || "-"}
                </Text>
              </View>

              <View className="flex-1 p-3.5 items-center">
                <Text className="text-[9px] color-textSecondary font-[700] tracking-widest uppercase mb-1">
                  {isExpired ? "Ended" : "Expires"}
                </Text>
                <Text
                  className={`text-[14px] font-[800] ${isExpired ? "color-textSecondary" : "text-text"}`}
                >
                  {formatDate(subscription.endDate)}
                </Text>
                {isExpired ? (
                  <Text className="text-[11px] font-[600] color-red-400 mt-0.5">
                    Limit reached
                  </Text>
                ) : (
                  <Text
                    className={`text-[11px] font-[600] mt-0.5 ${
                      daysLeft < 5 ? "color-red-400" : "color-textSecondary"
                    }`}
                  >
                    {daysLeft} days left
                  </Text>
                )}
              </View>
            </View>

            {/* Progress Bar */}
            <View className="mt-5">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[10px] color-textSecondary font-[700] tracking-widest uppercase">
                  Progress
                </Text>
                <Text className="text-[12px] font-[800] color-text">
                  {subscription.servicesCompleted}/{totalServices}
                  <Text className="text-[10px] font-[600] color-textSecondary"> washes</Text>
                </Text>
              </View>
              <View className="h-2.5 bg-background rounded-full overflow-hidden border border-border/30">
                <View
                  className={`h-full rounded-full ${isExpired ? "bg-red-400" : "bg-primary"}`}
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>

            {/* View Details CTA */}
            <InteractivePressable
              onPress={() =>
                router.push(`/subscription-flow/details/${subscription._id}` as any)
              }
              className="flex-row items-center justify-center mt-5 bg-background py-3.5 rounded-2xl border border-border/40"
            >
              <Text className="text-[13px] font-[700] text-text mr-2">
                View Details
              </Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.text} />
            </InteractivePressable>
          </>
        )}

        {isPast && (
          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-[11px] color-textSecondary font-[500]">
              Completed {formatDate(subscription.endDate)}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-[11px] font-[700] color-primary mr-1">
                View Log
              </Text>
              <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
            </View>
          </View>
        )}
      </View>
    </InteractivePressable>
  );
};
