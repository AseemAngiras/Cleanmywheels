import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React, { useState, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Dimensions,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
} from "../../../store/api/subscriptionApi";
import { ActiveSubscriptionCard } from "../../../components/subscriptions/ActiveSubscriptionCard";
import { PlanCard, PLAN_CARD_SNAP } from "../../../components/subscriptions/PlanCard";
import { BenefitsCard } from "../../../components/subscriptions/BenefitsCard";
import { SavingsCard } from "../../../components/subscriptions/SavingsCard";
import { SegmentedControl } from "../../../components/subscriptions/SegmentedControl";
import { InteractivePressable } from "@/components/ui/InteractivePressable";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import AdminSubscriptionScreen from "../admin/subscriptions";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  const [activeSegment, setActiveSegment] = useState(0); // 0 = My Plans, 1 = Browse
  const [showPastSubs, setShowPastSubs] = useState(false);
  const [activePlanIndex, setActivePlanIndex] = useState(0);

  const onCarouselScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / PLAN_CARD_SNAP);
      setActivePlanIndex(index);
    },
    [],
  );

  const {
    data: plans,
    isLoading: isPlansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = useGetPlansQuery();
  const {
    data: subscriptions,
    isLoading: isSubLoading,
    refetch: refetchSubscriptions,
  } = useGetMySubscriptionQuery();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchPlans(), refetchSubscriptions()]);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [refetchPlans, refetchSubscriptions]);

  if (isAdmin) return <AdminSubscriptionScreen />;

  const handleSubscribe = (plan: any) => {
    router.push({
      pathname: "/subscription-flow/configure",
      params: { planId: plan._id },
    });
  };

  const isLoading = isPlansLoading || isSubLoading;

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (plansError) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.background,
          paddingHorizontal: 40,
        }}
      >
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Ionicons
            name="alert-circle-outline"
            size={36}
            color={Colors.error}
          />
        </View>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "800",
            color: Colors.text,
            textAlign: "center",
          }}
        >
          Failed to load plans
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: Colors.textSecondary,
            textAlign: "center",
            marginTop: 8,
            marginBottom: 28,
          }}
        >
          Please check your internet connection and try again.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: Colors.card,
            paddingHorizontal: 28,
            paddingVertical: 12,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "800",
              color: Colors.text,
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const allSubs = Array.isArray(subscriptions)
    ? subscriptions
    : subscriptions
      ? [subscriptions]
      : [];

  const actuallyActive = allSubs.filter((sub: any) => sub.status !== "expired" && sub.status !== "cancelled");
  const pastSubs = allSubs.filter((sub: any) => sub.status === "expired" || sub.status === "cancelled");
  const hasAnySubs = actuallyActive.length > 0 || pastSubs.length > 0;

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      {/* ============ GRADIENT HEADER ============ */}
      <LinearGradient
        colors={
          activeSegment === 1
            ? [`${Colors.primary}12`, Colors.background]
            : ["rgba(255,255,255,0.03)", Colors.background]
        }
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 16,
        }}
      >
        {/* Title Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "900",
                color: Colors.text,
                letterSpacing: -0.5,
              }}
            >
              Subscriptions
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: Colors.textSecondary,
                marginTop: 2,
              }}
            >
              Premium car care, always
            </Text>
          </View>

          {/* Quick action for subscribers */}
          {actuallyActive.length > 0 && activeSegment === 0 && (
            <InteractivePressable
              onPress={() => setActiveSegment(1)}
              style={{
                backgroundColor: Colors.primary,
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 14,
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "900",
                  color: "#000",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                + Add Plan
              </Text>
            </InteractivePressable>
          )}
        </View>

        {/* Segmented Control */}
        <SegmentedControl
          segments={["My Plans", "Browse"]}
          activeIndex={activeSegment}
          onChange={setActiveSegment}
        />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: 120 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* ============ MY PLANS VIEW ============ */}
        {activeSegment === 0 && (
          <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
            {/* Empty State Hero */}
            {!hasAnySubs && (
              <Animated.View
                entering={FadeInUp.duration(600)}
                style={{
                  marginBottom: 28,
                  borderRadius: 28,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: `${Colors.primary}20`,
                }}
              >
                <LinearGradient
                  colors={[`${Colors.primary}08`, `${Colors.primary}03`, Colors.card]}
                  style={{
                    padding: 32,
                    alignItems: "center",
                  }}
                >
                  {/* Animated sparkle icon */}
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      backgroundColor: `${Colors.primary}12`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                      borderWidth: 2,
                      borderColor: `${Colors.primary}20`,
                    }}
                  >
                    <Ionicons
                      name="sparkles"
                      size={36}
                      color={Colors.primary}
                    />
                  </View>

                  <Text
                    style={{
                      fontSize: 26,
                      fontWeight: "900",
                      color: Colors.text,
                      textAlign: "center",
                      letterSpacing: -0.5,
                      marginBottom: 8,
                    }}
                  >
                    Elevate Your Ride
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: Colors.textSecondary,
                      textAlign: "center",
                      lineHeight: 20,
                      fontWeight: "500",
                      paddingHorizontal: 16,
                      marginBottom: 24,
                    }}
                  >
                    Subscribe and enjoy hassle-free car care delivered to your
                    doorstep. Save time and money every month.
                  </Text>

                  {/* CTA */}
                  <LinearGradient
                    colors={[Colors.primary, "#A8D000"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 16, overflow: "hidden" }}
                  >
                    <InteractivePressable
                      onPress={() => setActiveSegment(1)}
                      style={{
                        paddingHorizontal: 32,
                        paddingVertical: 16,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#000",
                          fontSize: 15,
                          fontWeight: "800",
                        }}
                      >
                        Browse Plans
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color="#000"
                        style={{ marginLeft: 6 }}
                      />
                    </InteractivePressable>
                  </LinearGradient>
                </LinearGradient>
              </Animated.View>
            )}

            {/* Active Subscriptions */}
            {actuallyActive.length > 0 && (
              <Animated.View
                entering={FadeInUp.delay(100).duration(500)}
                style={{ marginBottom: 20 }}
              >
                <Text
                  style={{
                    fontSize: 27,
                    fontWeight: "800",
                    color: Colors.text,
                    // letterSpacing: 2,
                    // textTransform: "uppercase",
                    marginBottom: 14,
                    paddingHorizontal: 2,
                  }}
                >
                  Your Active Plans
                </Text>
                {actuallyActive.map((sub: any) => (
                  <ActiveSubscriptionCard key={sub._id} subscription={sub} />
                ))}
              </Animated.View>
            )}

            {/* Past Subscriptions (Collapsible) */}
            {pastSubs.length > 0 && (
              <Animated.View
                entering={FadeInUp.delay(200).duration(500)}
                style={{ marginBottom: 20 }}
              >
                <InteractivePressable
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut,
                    );
                    setShowPastSubs(!showPastSubs);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                    paddingHorizontal: 2,
                    paddingVertical: 6,
                    backgroundColor: "rgba(255,255,255,0.02)",
                    borderRadius: 12,
                    paddingLeft: 12,
                    paddingRight: 12,
                    borderWidth: 1,
                    borderColor: "rgba(255,255,255,0.04)",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Colors.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "800",
                        color: Colors.textSecondary,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                      }}
                    >
                      Past Services ({pastSubs.length})
                    </Text>
                  </View>
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

            {/* Stats + Benefits */}
            <Animated.View entering={FadeInUp.delay(300).duration(500)}>
              <SavingsCard />
              <BenefitsCard />
            </Animated.View>
          </View>
        )}

        {/* ============ BROWSE PLANS VIEW ============ */}
        {activeSegment === 1 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            {/* Header Row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 24,
                marginTop: 8,
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color: Colors.textSecondary,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Choose Your Plan
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "rgba(255,255,255,0.03)",
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={12}
                  color={Colors.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: "700",
                    color: Colors.textSecondary,
                    letterSpacing: 0.5,
                  }}
                >
                  Swipe to compare
                </Text>
              </View>
            </View>

            {/* Quick comparison strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingVertical: 10,
                gap: 8,
              }}
            >
              {plans?.map((plan: any, index: number) => {
                const isActive = index === activePlanIndex;
                const isHighlighted = !!plan.tag;
                const planColor = isHighlighted ? Colors.primary : "#A78BFA";
                return (
                  <InteractivePressable
                    key={`chip-${plan._id}`}
                    onPress={() => {
                      setActivePlanIndex(index);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 12,
                      backgroundColor: isActive
                        ? `${planColor}15`
                        : "rgba(255,255,255,0.03)",
                      borderWidth: 1,
                      borderColor: isActive
                        ? `${planColor}30`
                        : "rgba(255,255,255,0.05)",
                    }}
                  >
                    {isHighlighted && (
                      <Ionicons
                        name="star"
                        size={10}
                        color={Colors.primary}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: isActive ? "800" : "600",
                        color: isActive ? planColor : Colors.textSecondary,
                      }}
                    >
                      {plan.name}
                    </Text>
                  </InteractivePressable>
                );
              })}
            </ScrollView>

            {/* Horizontal Plan Carousel */}
            <ScrollView
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={false}
              snapToInterval={PLAN_CARD_SNAP}
              decelerationRate="fast"
              onScroll={onCarouselScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: 8,
              }}
            >
              {plans?.map((plan: any, index: number) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  isPopular={!!plan.tag}
                  index={index}
                />
              ))}
            </ScrollView>

            {/* Page indicator dots */}
            {plans && plans.length > 1 && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 14,
                  gap: 6,
                }}
              >
                {plans.map((_: any, index: number) => (
                  <View
                    key={`dot-${index}`}
                    style={{
                      width: activePlanIndex === index ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor:
                        activePlanIndex === index
                          ? Colors.primary
                          : "rgba(255,255,255,0.12)",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </View>
            )}

            {/* ===== Trust & Guarantee Section ===== */}
            <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
              <Animated.View
                entering={FadeInUp.delay(300).duration(500)}
                style={{
                  borderRadius: 24,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.06)",
                  marginBottom: 16,
                }}
              >
                <LinearGradient
                  colors={[Colors.card, "rgba(24, 24, 24, 0.5)"]}
                  style={{ padding: 22 }}
                >
                  {/* Trust items */}
                  {[
                    {
                      icon: "shield-checkmark",
                      color: "#4ADE80",
                      title: "Satisfaction Guarantee",
                      desc: "Not happy? Get a free re-wash within 24 hours",
                    },
                    {
                      icon: "card-outline",
                      color: "#38BDF8",
                      title: "Flexible Payments",
                      desc: "Pay securely via UPI, cards, or net banking",
                    },
                    {
                      icon: "close-circle-outline",
                      color: "#FB923C",
                      title: "Cancel Anytime",
                      desc: "No lock-in period. Cancel with one tap",
                    },
                  ].map((item, idx) => (
                    <View
                      key={item.title}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 12,
                        borderBottomWidth: idx < 2 ? 1 : 0,
                        borderBottomColor: "rgba(255,255,255,0.04)",
                      }}
                    >
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          backgroundColor: `${item.color}10`,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 14,
                          borderWidth: 1,
                          borderColor: `${item.color}18`,
                        }}
                      >
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color={item.color}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "800",
                            color: Colors.text,
                            marginBottom: 2,
                          }}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "500",
                            color: Colors.textSecondary,
                            lineHeight: 15,
                          }}
                        >
                          {item.desc}
                        </Text>
                      </View>
                    </View>
                  ))}
                </LinearGradient>
              </Animated.View>

              {/* Need help choosing? */}
              {/* <Animated.View
                entering={FadeInUp.delay(400).duration(500)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 14,
                  paddingHorizontal: 18,
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.04)",
                  marginBottom: 16,
                }}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color={Colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: Colors.textSecondary,
                    flex: 1,
                  }}
                >
                  Need help choosing?{" "}
                  <Text style={{ color: Colors.primary, fontWeight: "800" }}>
                    Chat with us
                  </Text>
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={Colors.primary}
                />
              </Animated.View> */}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
