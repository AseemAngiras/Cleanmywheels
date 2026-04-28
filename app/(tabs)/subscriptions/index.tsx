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
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
} from "../../../store/api/subscriptionApi";
import { ActiveSubscriptionCard } from "../../../components/subscriptions/ActiveSubscriptionCard";
import { PlanCard } from "../../../components/subscriptions/PlanCard";
import { BenefitsCard } from "../../../components/subscriptions/BenefitsCard";
import { SavingsCard } from "../../../components/subscriptions/SavingsCard";
import { InteractivePressable } from "@/components/ui/InteractivePressable";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import AdminSubscriptionScreen from "../admin/subscriptions";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  const [arePlansVisible, setArePlansVisible] = useState(false);
  const [showPastSubs, setShowPastSubs] = useState(false);

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
      pathname: "/subscription-flow/configure",
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

  const allSubs = Array.isArray(subscriptions)
    ? subscriptions
    : subscriptions
      ? [subscriptions]
      : [];

  const actuallyActive = allSubs.filter((sub: any) => sub.status !== "expired");
  const pastSubs = allSubs.filter((sub: any) => sub.status === "expired");
  const hasAnySubs = actuallyActive.length > 0 || pastSubs.length > 0;

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      {/* Header */}
      <View className="flex-row justify-between items-center px-6 py-5 bg-background">
        <View className="flex-row items-center">
          {arePlansVisible && (
            <TouchableOpacity
              onPress={togglePlans}
              className="mr-3 w-10 h-10 rounded-full bg-card items-center justify-center border border-border/50"
            >
              <Ionicons name="chevron-back" size={20} color={Colors.text} />
            </TouchableOpacity>
          )}
          <View>
            <Text className="text-[24px] font-[900] color-text tracking-tighter">
              {arePlansVisible ? "Choose a Plan" : "Subscriptions"}
            </Text>
            {!arePlansVisible && (
              <Text className="text-[12px] color-textSecondary font-[600] mt-0.5">
                Keep your ride spotless
              </Text>
            )}
          </View>
        </View>
        {!arePlansVisible && actuallyActive.length > 0 && (
          <InteractivePressable
            onPress={togglePlans}
            className="bg-primary px-4 py-2.5 rounded-xl shadow-sm shadow-primary/20"
          >
            <Text className="text-[11px] font-[900] color-black uppercase tracking-wider">
              + Add Plan
            </Text>
          </InteractivePressable>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* ========== MY SUBSCRIPTIONS VIEW ========== */}
        {!arePlansVisible && (
          <>
            {/* Hero Section (only when no active subs) */}
            {!hasAnySubs && (
              <Animated.View
                entering={FadeInUp.duration(600)}
                className="mb-8 rounded-[32px] overflow-hidden border border-primary/20"
              >
                <View className="bg-primary/5 p-7 items-center">
                  <View className="w-20 h-20 rounded-full bg-primary/15 items-center justify-center mb-5 border border-primary/20">
                    <Ionicons name="sparkles" size={36} color={Colors.primary} />
                  </View>
                  <Text className="text-[24px] font-[900] color-text text-center tracking-tight mb-2">
                    Elevate Your Ride
                  </Text>
                  <Text className="text-[14px] color-textSecondary text-center leading-5 font-[500] mb-6 px-4">
                    Subscribe and enjoy hassle-free car care delivered to your doorstep. Save time and money every month.
                  </Text>
                  <InteractivePressable
                    onPress={togglePlans}
                    className="bg-primary px-8 py-4 rounded-2xl shadow-lg shadow-primary/30 flex-row items-center"
                  >
                    <Text className="text-black text-[15px] font-[800]">
                      Browse Plans
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#000" style={{ marginLeft: 6 }} />
                  </InteractivePressable>
                </View>
              </Animated.View>
            )}

            {/* Active Subscriptions */}
            {actuallyActive.length > 0 && (
              <Animated.View entering={FadeInUp.delay(100).duration(500)} className="mb-6">
                <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px] mb-4 px-1">
                  Active Plans
                </Text>
                {actuallyActive.map((sub: any) => (
                  <ActiveSubscriptionCard key={sub._id} subscription={sub} />
                ))}
              </Animated.View>
            )}

            {/* Past Subscriptions (Collapsible) */}
            {pastSubs.length > 0 && (
              <Animated.View entering={FadeInUp.delay(200).duration(500)} className="mb-6">
                <InteractivePressable
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setShowPastSubs(!showPastSubs);
                  }}
                  className="flex-row items-center justify-between mb-4 px-1"
                >
                  <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px]">
                    Past Services ({pastSubs.length})
                  </Text>
                  <Ionicons
                    name={showPastSubs ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={Colors.textSecondary}
                  />
                </InteractivePressable>
                {showPastSubs &&
                  pastSubs.map((sub: any) => (
                    <ActiveSubscriptionCard
                      key={sub._id}
                      subscription={sub}
                      variant="past"
                    />
                  ))}
              </Animated.View>
            )}

            {/* Savings + Benefits (always visible) */}
            <Animated.View entering={FadeInUp.delay(300).duration(500)}>
              {hasAnySubs && (
                <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px] mb-4 px-1">
                  Why Subscribe?
                </Text>
              )}
              <SavingsCard />
              <BenefitsCard onExplore={togglePlans} />
            </Animated.View>
          </>
        )}

        {/* ========== PLAN SELECTION VIEW ========== */}
        {arePlansVisible && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <View className="mb-2">
              {plans?.map((plan: any, index: number) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  isPopular={index === 1}
                />
              ))}
            </View>

            {/* Bottom CTA */}
            <View className="bg-card p-6 rounded-[28px] border border-border/50 items-center shadow-sm">
              <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mb-4 border border-primary/15">
                <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
              </View>
              <Text className="text-[16px] font-[800] color-text text-center">
                Subscribe & Save
              </Text>
              <Text className="text-[13px] color-textSecondary text-center mt-1 leading-[18px] px-4">
                Enjoy priority scheduling and significant savings on every wash
                with our premium plans.
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
