import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { InteractivePressable } from "@/components/ui/InteractivePressable";

interface ActiveSubscriptionCardProps {
  subscription: any;
}

export const ActiveSubscriptionCard = ({
  subscription,
}: ActiveSubscriptionCardProps) => {
  const router = useRouter();

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
      className="mb-4 bg-card rounded-[24px] border border-border overflow-hidden shadow-sm"
    >
      <View className="p-5">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-[18px] font-[700] text-text mb-1">
              {subscription.plan?.name || "Premium Plan"}
            </Text>
            <Text className="text-[12px] color-textSecondary font-mono">
              #{subscription._id.slice(-6).toUpperCase()}
            </Text>
          </View>
          <View className="items-end">
            <View className="flex-row items-center bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
              <View className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2" />
              <Text className="text-[10px] font-[800] color-green-500 tracking-widest uppercase">
                {subscription.status || "ACTIVE"}
              </Text>
            </View>
            <Text className="text-[11px] font-[800] color-primary uppercase tracking-widest mt-2 px-1">
              {frequencyLabel}
            </Text>
          </View>
        </View>

        <View className="h-[1px] bg-border/50 my-4" />

        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text className="text-[10px] color-textSecondary font-[700] mb-1.5 tracking-widest uppercase">
              VEHICLE
            </Text>
            <Text
              className="text-[15px] font-[700] text-text mb-0.5"
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
              EXPIRES
            </Text>
            <Text className="text-[15px] font-[700] text-text mb-0.5">
              {formatDate(subscription.endDate)}
            </Text>
            <Text
              className={`text-[12px] font-[600] ${
                daysLeft < 5 ? "color-red-500" : "color-textSecondary"
              }`}
            >
              {daysLeft} days left
            </Text>
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
      </View>
    </InteractivePressable>
  );
};
