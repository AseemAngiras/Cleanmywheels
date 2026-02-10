import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

  if (isAdmin) {
    return <AdminSubscriptionScreen />;
  }

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
        <ActivityIndicator size="large" color="#0F172A" />
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

  const activeSubs = Array.isArray(subscriptions)
    ? subscriptions
    : subscriptions
      ? [subscriptions]
      : [];
  const hasActiveSubs = activeSubs.length > 0;

  return (
    <ScreenWrapper
      style={styles.container}
      backgroundColor="#F8FAFC"
      statusBarStyle="dark-content"
    >
      {/* HEADER */}
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          {arePlansVisible ? (
            <TouchableOpacity onPress={togglePlans} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </TouchableOpacity>
          ) : (
            <View>
              <Text style={styles.headerTitle}>My Garage</Text>
              <Text style={styles.headerSubtitle}>Manage your clean rides</Text>
            </View>
          )}

          {arePlansVisible && (
            <Text style={styles.planHeaderTitle}>Select Plan</Text>
          )}

          {arePlansVisible && <View style={{ width: 24 }} />}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ACTIVE SUBSCRIPTIONS */}
        {hasActiveSubs && !arePlansVisible && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Subscriptions</Text>
            </View>
            {activeSubs.map((sub: any) => (
              <ActiveSubscriptionCard key={sub._id} subscription={sub} />
            ))}
          </View>
        )}

        {!arePlansVisible && (
          <View style={[styles.section, { marginTop: hasActiveSubs ? 10 : 0 }]}>
            {hasActiveSubs && (
              <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>
                Add Another Vehicle
              </Text>
            )}
            <SavingsCard />
            <BenefitsCard onExplore={togglePlans} />
          </View>
        )}

        {arePlansVisible && (
          <View style={styles.plansContainer}>
            <View style={styles.plansGrid}>
              {plans?.map((plan: any, index: number) => (
                <PlanCard
                  key={plan._id}
                  plan={plan}
                  onSubscribe={handleSubscribe}
                  isPopular={index === 1}
                />
              ))}
            </View>
            <SavingsCard />
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenWrapper>
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
    backgroundColor: "#F8FAFC",
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
  headerContainer: {
    backgroundColor: "#F8FAFC",
    paddingBottom: 16,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerContent: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
    fontWeight: "500",
  },
  planHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  backBtn: {
    padding: 4,
    marginLeft: -8,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  plansContainer: {
    flex: 1,
  },
  plansGrid: {
    flexDirection: "column",
    marginBottom: 0,
  },
});
