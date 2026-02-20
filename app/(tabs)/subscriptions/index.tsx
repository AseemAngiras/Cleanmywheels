import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React, { useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
} from "../../../store/api/subscriptionApi";
import { ActiveSubscriptionCard } from "../../../components/subscriptions/ActiveSubscriptionCard";
import { PlanCard } from "../../../components/subscriptions/PlanCard";
import { BenefitsCard } from "../../../components/subscriptions/BenefitsCard";
import { SavingsCard } from "../../../components/subscriptions/SavingsCard";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import AdminSubscriptionScreen from "../admin/subscriptions";

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  const [arePlansVisible, setArePlansVisible] = useState(false);

  const {
    data: plans,
    isLoading: isPlansLoading,
    error: plansError,
  } = useGetPlansQuery();
  const { data: subscriptions, isLoading: isSubLoading } =
    useGetMySubscriptionQuery();

  if (isAdmin) return <AdminSubscriptionScreen />;

  const handleSubscribe = (plan: any) => {
    router.push({
      pathname: "/subscription/configure",
      params: { planId: plan._id },
    });
  };

  const togglePlans = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setArePlansVisible(!arePlansVisible);
  };

  const isLoading = isPlansLoading || isSubLoading;

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (plansError) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-10">
        <View className="w-20 h-20 rounded-full bg-red-500/10 items-center justify-center mb-6">
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={Colors.error}
          />
        </View>
        <Text className="text-[18px] font-[800] color-text text-center">
          Failed to load plans
        </Text>
        <Text className="text-[14px] color-textSecondary text-center mt-2 mb-8">
          Please check your internet connection and try again.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-card px-8 py-3 rounded-full border border-border/50"
        >
          <Text className="text-[14px] font-[800] color-text">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeSubs = Array.isArray(subscriptions)
    ? subscriptions
    : subscriptions
      ? [subscriptions]
      : [];
  const hasActiveSubs = activeSubs.length > 0;

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="flex-row justify-between items-center px-6 py-5 bg-background border-b border-border/10">
        <View className="flex-row items-center">
          {arePlansVisible && (
            <TouchableOpacity
              onPress={togglePlans}
              className="mr-3 p-2 bg-card rounded-xl border border-border/50"
            >
              <Ionicons name="chevron-back" size={20} color={Colors.text} />
            </TouchableOpacity>
          )}
          <View>
            <Text className="text-[22px] font-[900] color-text tracking-tighter">
              {arePlansVisible ? "Select Plan" : "My Subscriptions"}
            </Text>
            {!arePlansVisible && (
              <Text className="text-[11px] color-textSecondary font-[800] uppercase tracking-widest mt-1">
                Manage your clean rides
              </Text>
            )}
          </View>
        </View>
        {!arePlansVisible && hasActiveSubs && (
          <TouchableOpacity
            onPress={togglePlans}
            className="bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
          >
            <Text className="text-[11px] font-[900] color-primary uppercase">
              Add Plan
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTIVE SUBSCRIPTIONS */}
        {hasActiveSubs && !arePlansVisible && (
          <View className="mb-8">
            <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px] mb-4 px-1">
              Active Subscriptions
            </Text>
            {activeSubs.map((sub: any) => (
              <View key={sub._id}>
                <ActiveSubscriptionCard subscription={sub} />
              </View>
            ))}
          </View>
        )}

        {!arePlansVisible && (
          <View>
            {hasActiveSubs && (
              <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px] mb-4 px-1">
                Exclusive Benefits
              </Text>
            )}
            <SavingsCard />
            <BenefitsCard onExplore={togglePlans} />
          </View>
        )}

        {arePlansVisible && (
          <View>
            <View className="mb-6">
              {plans?.map((plan: any, index: number) => (
                <View key={plan._id}>
                  <PlanCard
                    plan={plan}
                    onSubscribe={handleSubscribe}
                    isPopular={index === 1}
                  />
                </View>
              ))}
            </View>
            <View className="bg-primary/5 p-6 rounded-[32px] border border-primary/20 items-center">
              <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mb-4">
                <Ionicons name="sparkles" size={24} color={Colors.primary} />
              </View>
              <Text className="text-[16px] font-[800] color-text text-center">
                Subscribe & Save
              </Text>
              <Text className="text-[13px] color-textSecondary text-center mt-1 leading-[18px]">
                Enjoy priority scheduling and significant savings on every wash
                with our premium plans.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
