import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useGetMySubscriptionQuery } from "@/store/api/subscriptionApi";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

export default function SubscriptionDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data: subscriptions, isLoading } =
    useGetMySubscriptionQuery(undefined);

  const subscription = useMemo(() => {
    if (!subscriptions) return null;
    return Array.isArray(subscriptions)
      ? subscriptions.find((s: any) => s._id === id)
      : (subscriptions as any)._id === id
        ? subscriptions
        : null;
  }, [subscriptions, id]);

  const dailyLogs = useMemo(() => {
    if (!subscription) return [];

    const history = (subscription as any).serviceHistory || [];
    const serviceDates = (subscription as any).serviceDates || [];
    const addons = subscription.nextServiceAddons || [];
    const frequencyType = subscription.frequencyType || 'DAILY';
    const totalServices = subscription.servicesTotal || 30;
    const logs: any[] = [];

    if (serviceDates.length > 0) {
      serviceDates.forEach((sd: any, i: number) => {
        logs.push({
          id: `log-${i}`,
          day: i + 1,
          date: new Date(sd.date),
          status: sd.status === 'completed' ? 'Completed' : (sd.status === 'skipped' ? 'Skipped' : 'Scheduled'),
          addons: sd.addons || [],
        });
      });
    } else {
      // Fallback to manual generation based on frequency
      const startDate = new Date(subscription.startDate);
      for (let i = 0; i < totalServices; i++) {
        const date = new Date(startDate);
        
        if (frequencyType === 'DAILY') {
          date.setDate(startDate.getDate() + i);
        } else if (frequencyType === 'WEEKLY') {
          date.setDate(startDate.getDate() + (i * 7));
        } else if (frequencyType === 'BIWEEKLY') {
          date.setDate(startDate.getDate() + (i * 3.5)); // Approx
        } else if (frequencyType === 'ALTERNATE_DAY') {
          date.setDate(startDate.getDate() + (i * 2));
        }

        const historyEntry = history.find(
          (h: any) => new Date(h.date).toDateString() === date.toDateString(),
        );

        let status = "Scheduled";
        if (historyEntry) {
          status = "Completed";
        } else if (
          date < new Date() &&
          date.toDateString() !== new Date().toDateString()
        ) {
          status = "Skipped";
        }

        logs.push({
          id: `log-${i}`,
          day: i + 1,
          date: date,
          status: status,
          addons: [],
        });
      }
    }

    // Map nextServiceAddons if they aren't already included in serviceDates
    addons.forEach((addon: any) => {
      let log;
      const targetDate = addon.serviceDate || addon.dateAdded;
      if (targetDate) {
        const sDate = new Date(targetDate).toDateString();
        log = logs.find((l) => l.date.toDateString() === sDate);
      }

      if (log && !log.addons.some((a: any) => a.addonId === addon.addonId)) {
        log.addons.push(addon);
      }
    });

    const sortedLogs = logs.sort((a, b) => a.date.getTime() - b.date.getTime());
    const nextService = sortedLogs.find((l) => l.status === "Scheduled");

    if (nextService) {
      nextService.isNext = true;
    }

    return sortedLogs;
  }, [subscription]);

  if (isLoading || !subscription) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const renderLogItem = ({ item }: { item: any }) => (
    <View className="flex-row mb-0">
      <View className="items-center mr-4 w-5">
        <View
          className={`w-3 h-3 rounded-full z-10 ${
            item.status === "Completed" || item.isNext
              ? "bg-primary"
              : "bg-border"
          }`}
        />
        <View className="w-[2px] flex-1 bg-border my-1" />
      </View>
      <View className="flex-1 bg-card rounded-[24px] p-4 mb-4 border border-border">
        <View className="flex-row justify-between mb-2 items-center">
          <Text className="text-[14px] font-[700] color-text">
            {item.date.toDateString()}
          </Text>
          <View
            className={`px-2.5 py-1 rounded-full ${
              item.status === "Completed" ? "bg-green-500/10" : "bg-background"
            }`}
          >
            <Text
              className={`text-[10px] font-[800] uppercase ${item.status === "Completed" ? "color-green-500" : "color-textSecondary"}`}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <Text className="text-[15px] color-text font-[600]">
          Daily Wash Service
        </Text>

        {item.addons && item.addons.length > 0 && (
          <View className="mt-3 pt-3 border-t border-border/50">
            <Text className="text-[11px] font-[700] color-textSecondary mb-2 tracking-widest uppercase">
              Add-ons Purchased
            </Text>
            {(() => {
              const uniqueAddonsMap = new Map();
              item.addons.forEach((addon: any) => {
                uniqueAddonsMap.set(addon.name, addon);
              });
              const uniqueAddons = Array.from(uniqueAddonsMap.values());

              return (uniqueAddons as any[]).map((addon: any, idx: number) => (
                <React.Fragment key={addon?._id || `addon-${idx}`}>
                  <View className="flex-row items-center gap-2 mb-1">
                    <Ionicons name="sparkles" size={12} color={Colors.primary} />
                    <Text className="text-[13px] color-text font-[500]">
                      {addon.name} -{" "}
                      <Text className="color-primary font-[700]">
                        ₹{addon.price}
                      </Text>
                    </Text>
                  </View>
                </React.Fragment>
              ));
            })()}
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1 bg-background">
        <View className="flex-row items-center px-5 pt-4 pb-6 bg-card border-b border-border/50">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text className="text-[20px] font-[700] color-text ml-4">
            Subscription Log
          </Text>
        </View>

        <View className="m-5 bg-card rounded-[32px] p-5 shadow-sm border border-border">
          <View className="flex-row items-center mb-5">
            <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-4">
              <Ionicons name="car-sport" size={24} color="#000" />
            </View>
            <View>
              <Text className="text-[18px] font-[800] color-text">
                {subscription.vehicle?.brand || "Vehicle"}
              </Text>
              <Text className="text-[14px] font-[600] color-textSecondary">
                {subscription.vehicle?.vehicleNo || "No Number"}
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-border mb-5" />

          <View className="flex-row justify-between">
            <View>
              <Text className="text-[11px] font-[700] color-textSecondary mb-1 tracking-widest uppercase">
                Plan
              </Text>
              <Text className="text-[15px] font-[700] color-text">
                {subscription.plan?.name || "Monthly"}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[11px] font-[700] color-textSecondary mb-1 tracking-widest uppercase">
                Expiring On
              </Text>
              <Text className="text-[15px] font-[700] color-text">
                {new Date(subscription.endDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>
        </View>

        <Text className="ml-5 text-[18px] font-[700] color-text mb-4">
          Service Timeline
        </Text>

        <FlatList
          data={dailyLogs}
          renderItem={renderLogItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </ScreenWrapper>
  );
}
