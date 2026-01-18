import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  Dimensions,
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
} from "../../store/api/subscriptionApi";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

export default function SubscriptionPlansScreen() {
  const router = useRouter();
  const [arePlansVisible, setArePlansVisible] = useState(false);

  const {
    data: plans,
    isLoading: isPlansLoading,
    error: plansError,
  } = useGetPlansQuery();
  const { data: subscriptions, isLoading: isSubLoading } =
    useGetMySubscriptionQuery();

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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D1F803" />
      </View>
    );
  }

  if (plansError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load plans.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.btnSecondary}
        >
          <Text style={styles.btnSecondaryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const activeSubs = Array.isArray(subscriptions)
    ? subscriptions
    : subscriptions
      ? [subscriptions]
      : [];
  const hasActiveSubs = activeSubs.length > 0;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Subscriptions</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTIVE SUBSCRIPTIONS SECTION */}
        {hasActiveSubs && (
          <View style={styles.activeSectionWrapper}>
            {activeSubs.map((sub: any) => (
              <TouchableOpacity
                key={sub._id}
                activeOpacity={0.9}
                onPress={() =>
                  router.push(`/subscription/details/${sub._id}` as any)
                }
                style={{ marginBottom: 16 }}
              >
                <LinearGradient
                  colors={["#ffffff", "#f0fdf4"]}
                  style={styles.activeSubCard}
                >
                  <View style={styles.activeCardContent}>
                    <View style={styles.activeSubTop}>
                      <View>
                        <Text style={styles.activePlanName}>
                          {sub.plan?.name || "Premium Plan"}
                        </Text>
                        <Text style={styles.activeSubId}>
                          #{sub._id.slice(-6).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusText}>ACTIVE</Text>
                      </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.activeSubDetails}>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>VEHICLE</Text>
                        <Text style={styles.detailValue}>
                          {sub.vehicle?.vehicleType || "-"}
                        </Text>
                        <Text style={styles.detailSubValue}>
                          {sub.vehicle?.vehicleNo || sub.vehicle?.number || "-"}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.detailColumn,
                          { alignItems: "flex-end" },
                        ]}
                      >
                        <Text style={styles.detailLabel}>EXPIRES</Text>
                        <Text style={styles.detailValue}>
                          {formatDate(sub.endDate)}
                        </Text>
                        <Text
                          style={[
                            styles.detailSubValue,
                            { color: sub.daysLeft < 5 ? "#ff4d4d" : "#64748B" },
                          ]}
                        >
                          {sub.endDate
                            ? Math.ceil(
                                (new Date(sub.endDate).getTime() - Date.now()) /
                                  (1000 * 60 * 60 * 24),
                              )
                            : 0}{" "}
                          days left
                        </Text>
                      </View>
                    </View>

                    {/* View Details Button */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 16,
                        backgroundColor: "rgba(0,0,0,0.04)",
                        paddingVertical: 10,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.05)",
                      }}
                    >
                      <Text
                        style={{
                          fontWeight: "700",
                          fontSize: 13,
                          color: "#1a1a1a",
                          marginRight: 6,
                        }}
                      >
                        View Day-wise Logs
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color="#1a1a1a"
                      />
                    </View>
                  </View>
                  {/* Decorative Element */}
                  <View style={styles.activeCardDecoration} />
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* PROMO BANNER (To Toggle Plans) */}
        {!arePlansVisible && (
          <TouchableOpacity
            style={styles.promoBanner}
            onPress={togglePlans}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#111", "#222"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerIcon}>
                  <Ionicons name="sparkles" size={24} color="#D1F803" />
                </View>
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>
                    Get Premium for Another Car
                  </Text>
                  <Text style={styles.bannerSubtitle}>
                    Tap to view subscription plans
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={24} color="#666" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* AVAILABLE PLANS SECTION (Collapsible) */}
        {arePlansVisible && (
          <View style={styles.plansSection}>
            <View style={styles.plansHeader}>
              <Text style={styles.sectionTitle}>Available Plans</Text>
              <TouchableOpacity onPress={togglePlans} style={styles.hideBtn}>
                <Text style={styles.hideBtnText}>Hide</Text>
                <Ionicons name="chevron-up" size={16} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionSubtitle}>
              Choose a plan to subscribe for another vehicle
            </Text>

            {plans?.map((plan) => {
              return (
                <View key={plan._id} style={styles.planCard}>
                  {/* Highlight Banner */}
                  <View style={styles.popularBanner}>
                    <Text style={styles.popularText}>BEST VALUE</Text>
                  </View>

                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={styles.currency}>₹</Text>
                      <Text style={styles.planPrice}>{plan.price}</Text>
                      <Text style={styles.planPeriod}>/mo</Text>
                    </View>
                  </View>

                  <View style={styles.featuresList}>
                    {plan.features?.map((feature: string, idx: number) => (
                      <View key={idx} style={styles.featureRow}>
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#D1F803"
                        />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.subscribeBtn}
                    onPress={() => handleSubscribe(plan)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.subscribeBtnText}>
                      Choose {plan.name}
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color="#000"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 16,
  },
  btnSecondary: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#E2E8F0",
  },
  btnSecondaryText: {
    color: "#1E293B",
  },

  // HEADER
  headerContainer: {
    backgroundColor: "#111",
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  backBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },

  scrollContent: {
    padding: 20,
  },
  // ACTIVE SECTION
  activeSection: {
    backgroundColor: "#fff",
    margin: 20,
    marginTop: 10,
    borderRadius: 24,
    padding: 20,
    // Soft shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },

  activeSubCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    position: "relative",
  },
  activeCardContent: {
    padding: 20,
    zIndex: 2,
  },
  activeCardDecoration: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(209, 248, 3, 0.2)",
    zIndex: 1,
  },

  activeSubTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  activePlanName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  activeSubId: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#166534",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 16,
  },
  activeSubDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  detailSubValue: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },

  sectionSeparator: {
    height: 10,
    backgroundColor: "transparent",
    marginBottom: 10,
  },

  plansSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: "#111",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#333",
  },
  popularBanner: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#D1F803",
    borderBottomLeftRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 10,
  },
  popularText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
  },
  planHeader: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    paddingBottom: 20,
  },
  planName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    fontSize: 24,
    color: "#D1F803",
    fontWeight: "600",
    marginRight: 4,
  },
  planPrice: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: -1,
  },
  planPeriod: {
    fontSize: 16,
    color: "#94A3B8",
    marginLeft: 6,
    fontWeight: "500",
  },
  featuresList: {
    marginBottom: 28,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  featureText: {
    marginLeft: 12,
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "500",
  },
  subscribeBtn: {
    backgroundColor: "#D1F803",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D1F803",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  subscribeBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  activeSectionWrapper: {
    marginHorizontal: 20,
    marginTop: 10,
    gap: 16,
  },
  promoBanner: {
    margin: 20,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#D1F803",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  bannerGradient: {
    padding: 24,
  },
  bannerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(209, 248, 3, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "rgba(209, 248, 3, 0.3)",
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },
  plansHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  hideBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  hideBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
});
