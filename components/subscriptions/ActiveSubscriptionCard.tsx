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
      WEEKLY: "Weekly",
      BIWEEKLY: "Bi-weekly",
      ALTERNATE_DAY: "Alternate Day",
    }[subscription.frequencyType as string] || "Daily";

  return (
    <InteractivePressable
      onPress={() =>
        router.push(`/subscription-flow/details/${subscription._id}` as any)
      }
      className={`mb-3 rounded-[20px] border overflow-hidden shadow-sm ${
        isPast
          ? "bg-card/40 border-border/20 opacity-90"
          : isExpired
            ? "bg-card/50 border-border/30 opacity-80"
            : "bg-card border-border"
      }`}
    >
      <View className={isPast ? "p-4" : "p-5"}>
        <View className="flex-row justify-between items-center">
          <View className="flex-1 mr-4">
            <Text
              className={`text-[16px] font-[700] mb-0.5 ${isExpired || isPast ? "color-textSecondary" : "text-text"}`}
              numberOfLines={1}
            >
              {subscription.plan?.name || "Premium Plan"}
            </Text>
            <View className="flex-row items-center">
              <Text className="text-[10px] color-textSecondary font-mono opacity-60">
                #{subscription._id.slice(-6).toUpperCase()}
              </Text>
              {isPast && (
                <>
                  <View className="w-1 h-1 rounded-full bg-border mx-2" />
                  <Text className="text-[10px] color-textSecondary font-[600]">
                    Completed {formatDate(subscription.endDate)}
                  </Text>
                </>
              )}
            </View>
          </View>

          <View className="items-end">
            <View
              className={`flex-row items-center px-2 py-1 rounded-full border ${
                isExpired || isPast
                  ? "bg-red-500/5 border-red-500/10"
                  : "bg-green-500/10 border-green-500/20"
              }`}
            >
              <View
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isExpired || isPast ? "bg-red-400" : "bg-green-500"}`}
              />
              <Text
                className={`text-[9px] font-[800] tracking-wider uppercase ${
                  isExpired || isPast ? "color-red-500" : "color-green-500"
                }`}
              >
                {subscription.status?.toUpperCase() || "ACTIVE"}
              </Text>
            </View>
          </View>
        </View>

        {!isPast && (
          <>
            <View className="h-[1px] bg-border/50 my-4" />

            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-[10px] color-textSecondary font-[700] mb-1.5 tracking-widest uppercase">
                  VEHICLE
                </Text>
                <Text
                  className={`text-[15px] font-[700] mb-0.5 ${isExpired ? "color-textSecondary" : "text-text"}`}
                  numberOfLines={1}
                >
                  {subscription.vehicle?.vehicleType || "-"}
                </Text>
                <Text className="text-[12px] color-textSecondary font-[500]">
                  {subscription.vehicle?.vehicleNo ||
                    subscription.vehicle?.number ||
                    "-"}
                </Text>
              </View>

              <View className="flex-1 items-end">
                <Text className="text-[10px] color-textSecondary font-[700] mb-1.5 tracking-widest uppercase">
                  {isExpired ? "COMPLETED" : "EXPIRES"}
                </Text>
                <Text
                  className={`text-[15px] font-[700] mb-0.5 ${isExpired ? "color-textSecondary" : "text-text"}`}
                >
                  {formatDate(subscription.endDate)}
                </Text>
                {isExpired ? (
                  <Text className="text-[12px] font-[600] color-red-500">
                    Service limit reached
                  </Text>
                ) : (
                  <Text
                    className={`text-[12px] font-[600] ${
                      daysLeft < 5 ? "color-red-500" : "color-textSecondary"
                    }`}
                  >
                    {daysLeft} days left
                  </Text>
                )}
              </View>
            </View>

            <View className="mt-6 mb-2">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-[10px] color-textSecondary font-[700] tracking-widest uppercase">
                  SERVICE PROGRESS
                </Text>
                <Text className="text-[11px] font-[800] color-text">
                  {subscription.servicesCompleted} / {totalServices} WASHES
                </Text>
              </View>
              <View className="h-2 bg-background rounded-full overflow-hidden border border-border/30">
                <View
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
            </View>

            <View className="flex-row items-center justify-center mt-5 bg-background py-3.5 rounded-2xl border border-border/50">
              <Text className="text-[13px] font-[700] text-text mr-2">
                View Details
              </Text>
              <Ionicons name="arrow-forward" size={14} color={Colors.text} />
            </View>
          </>
        )}

        {isPast && (
          <View className="flex-row items-center justify-end mt-2">
            <Text className="text-[11px] font-[700] color-primary mr-1">
              View Log
            </Text>
            <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
          </View>
        )}
      </View>
    </InteractivePressable>
  );
};
