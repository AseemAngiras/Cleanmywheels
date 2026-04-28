import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React, { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  View,
} from "react-native";
import { InteractivePressable } from "@/components/ui/InteractivePressable";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useCreateAddonOrderMutation,
  useVerifyAddonPaymentMutation,
  useGetAddonsQuery,
  useGetMySubscriptionQuery,
} from "@/store/api/subscriptionApi";
import { useAlert } from "@/components/providers/AlertProvider";
import { formatPrice } from "@/utils/formatPrice";

export default function AddonsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();

  const { data: subscriptions, isLoading: isSubLoading } =
    useGetMySubscriptionQuery(undefined);

  const activeSubscriptions = useMemo(() => {
    return Array.isArray(subscriptions)
      ? subscriptions.filter((s: any) =>
          ["active", "ongoing"].includes(s.status),
        )
      : ["active", "ongoing"].includes((subscriptions as any)?.status)
        ? [subscriptions]
        : [];
  }, [subscriptions]);

  const { data: addonsList, isLoading: isAddonsLoading } =
    useGetAddonsQuery(undefined);

  const [createAddonOrder, { isLoading: isCreatingOrder }] =
    useCreateAddonOrderMutation();
  const [verifyAddonPayment, { isLoading: isVerifying }] =
    useVerifyAddonPaymentMutation();
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  useEffect(() => {
    if (activeSubscriptions.length > 0 && !selectedSubId) {
      setSelectedSubId(activeSubscriptions[0]?._id ?? null);
    }
  }, [activeSubscriptions, selectedSubId]);

  useEffect(() => {
    if (selectedSubId) {
      setSelectedAddons([]);
      setSelectedDates([]);
    }
  }, [selectedSubId]);

  const activeSubscription = activeSubscriptions.find(
    (s: any) => s._id === selectedSubId,
  );

  const availableDates = useMemo(() => {
    if (!activeSubscription?.serviceDates) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return activeSubscription.serviceDates
      .filter((sd: any) => {
        const d = new Date(sd.date);
        return sd.status === "pending" && d >= today;
      })
      .map((sd: any) => new Date(sd.date))
      .slice()
      .sort((a: Date, b: Date) => a.getTime() - b.getTime());
  }, [activeSubscription]);

  useEffect(() => {
    if (availableDates.length > 0 && selectedDates.length === 0) {
      setSelectedDates([availableDates[0]]);
    }
  }, [availableDates]);

  const toggleDate = (date: Date) => {
    setSelectedDates((prev) => {
      const isSelected = prev.some((d) => d.toDateString() === date.toDateString());
      if (isSelected) {
        if (prev.length === 1) return prev; // Keep at least one date selected
        return prev.filter((d) => d.toDateString() !== date.toDateString());
      } else {
        const nextDates = [...prev, date];
        return nextDates.sort((a, b) => a.getTime() - b.getTime());
      }
    });
  };

  const toggleAddon = (addon: any) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a._id === addon._id);
      if (exists) {
        return prev.filter((a) => a._id !== addon._id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const totalAmount =
    selectedAddons.reduce((sum, item) => sum + (item.price || 0), 0) *
    selectedDates.length;

  const handlePayment = async () => {
    if (!activeSubscription) {
      showAlert({
        title: "Error",
        message: "No active subscription selected.",
        type: "error",
      });
      return;
    }
    if (selectedAddons.length === 0) {
      showAlert({
        title: "Select Add-ons",
        message: "Please select at least one add-on.",
      });
      return;
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (selectedDates.length === 0) {
      showAlert({
        title: "Select Date",
        message: "Please select at least one service date.",
        type: "error",
      });
      return;
    }

    if (selectedDates[0] < now) {
      showAlert({
        title: "Invalid Date",
        message: "Please select a future date or today.",
        type: "error",
      });
      return;
    }

    const subEnd = new Date(activeSubscription.endDate);
    if (selectedDates[selectedDates.length - 1] > subEnd) {
      showAlert({
        title: "Invalid Date",
        message: "Date cannot be after subscription expiry.",
        type: "error",
      });
      return;
    }

    try {
      const orderPayload = {
        amount: totalAmount,
        subscriptionId: activeSubscription._id,
        addons: selectedAddons,
        serviceDate: selectedDates[0].toISOString(),
        serviceDates: JSON.stringify(selectedDates.map(d => d.toISOString())),
      };

      const response = await createAddonOrder(orderPayload).unwrap();
      const { paymentLinkUrl, subscriptionId, referenceId } = response;

      if (paymentLinkUrl) {
        // ... (router.push logic)
        router.push({
          pathname: "/(tabs)/home/book-doorstep/payment-webview",
          params: {
            url: paymentLinkUrl,
            bookingId: referenceId,
            type: "ADDON",
            subscriptionId: subscriptionId,
            addons: JSON.stringify(selectedAddons),
            grandTotal: totalAmount,
            vehicleType: activeSubscription.vehicle?.brand || "Vehicle",
            vehicleNumber: activeSubscription.vehicle?.vehicleNo || "",
            serviceDate: selectedDates[0].toISOString(),
            serviceDates: JSON.stringify(selectedDates.map(d => d.toISOString())),
            serviceName: "Add-on Services",
            address: "Your Location",
          },
        } as any);
        return;
      }

      showAlert({
        title: "Error",
        message: "Failed to generate payment link.",
        type: "error",
      });
    } catch (err: any) {
      showAlert({
        title: "Error",
        message: err?.data?.message || "Failed to create order",
        type: "error",
      });
    }
  };

  if (isSubLoading || isAddonsLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center px-5 pt-4 pb-6 bg-card border-b border-border/50">
          <InteractivePressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </InteractivePressable>
          <Text className="text-[20px] font-[700] color-text ml-4">
            Add-ons
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 150 + insets.bottom,
          }}
        >
          {/* Car Selection */}
          <Text className="text-[18px] font-[700] color-text">
            Select Vehicle
          </Text>
          <Text className="text-[14px] color-textSecondary mb-5 mt-1">
            Which car would you like to add services for?
          </Text>

          {activeSubscriptions.length === 0 ? (
            <View className="p-8 bg-card rounded-[24px] items-center justify-center border border-border">
              <Ionicons
                name="car-sport-outline"
                size={48}
                color={Colors.textSecondary}
              />
              <Text className="mt-4 color-textSecondary font-[600]">
                No Active Subscriptions Found
              </Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              contentContainerStyle={{ gap: 12 }}
            >
              {activeSubscriptions.map((sub: any) => {
                const isSelected = sub._id === selectedSubId;
                const vehicleName = sub.vehicle?.vehicleType || "Vehicle";
                const vehicleNo = sub.vehicle?.vehicleNo || "No Number";

                return (
                  <InteractivePressable
                    key={sub._id}
                    className={`flex-row items-center p-4 rounded-[24px] border ${
                      isSelected
                        ? "bg-primary/5 border-primary"
                        : "bg-card border-border"
                    }`}
                    style={{ width: 220 }}
                    onPress={() => setSelectedSubId(sub._id)}
                  >
                    <View className="w-11 h-11 rounded-full bg-background items-center justify-center mr-3 border border-border/50">
                      <Ionicons
                        name="car"
                        size={22}
                        color={
                          isSelected ? Colors.primary : Colors.textSecondary
                        }
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={`text-[14px] font-[700] ${
                          isSelected ? "text-text" : "text-textSecondary"
                        }`}
                        numberOfLines={1}
                      >
                        {vehicleName}
                      </Text>
                      <Text
                        className={`text-[12px] ${
                          isSelected
                            ? "text-textSecondary"
                            : "text-textSecondary/70"
                        }`}
                      >
                        {vehicleNo}
                      </Text>
                    </View>
                    {isSelected && (
                      <View className="absolute top-3 right-3 bg-primary w-5 h-5 rounded-full items-center justify-center border border-black/10">
                        <Ionicons name="checkmark" size={12} color="#000" />
                      </View>
                    )}
                  </InteractivePressable>
                );
              })}
            </ScrollView>
          )}

          {/* Date Selection */}
          {activeSubscription && (
            <View className="mt-8">
              <Text className="text-[18px] font-[700] color-text">
                Select Service Date
              </Text>
              <Text className="text-[14px] color-textSecondary mt-1 mb-4">
                Choose from your scheduled subscription dates
              </Text>

              {availableDates.length === 0 ? (
                <View className="p-6 bg-card rounded-[24px] border border-border/50 items-center">
                  <Ionicons
                    name="calendar-clear-outline"
                    size={32}
                    color={Colors.textSecondary}
                  />
                  <Text className="mt-2 color-textSecondary text-center font-[600]">
                    No upcoming scheduled services found for this vehicle.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 4, gap: 12 }}
                  className="py-2"
                >
                  {availableDates.map((date: Date, index: number) => {
                    const isSelected = selectedDates.some(
                      (d) => d.toDateString() === date.toDateString(),
                    );
                    return (
                      <InteractivePressable
                        key={index}
                        onPress={() => toggleDate(date)}
                        className={`px-5 py-5 rounded-[28px] border items-center justify-center shadow-sm ${
                          isSelected
                            ? "bg-primary border-primary shadow-primary/20"
                            : "bg-card border-border shadow-black/5"
                        }`}
                        style={{ minWidth: 95 }}
                      >
                        {isSelected && (
                          <View className="absolute -top-1.5 -right-1.5 bg-black w-6 h-6 rounded-full items-center justify-center border-2 border-primary">
                            <Ionicons name="checkmark" size={14} color={Colors.primary} />
                          </View>
                        )}
                        <Text
                          className={`text-[11px] font-[800] uppercase tracking-widest ${
                            isSelected ? "text-black" : "text-textSecondary"
                          }`}
                        >
                          {date.toLocaleDateString("en-IN", {
                            weekday: "short",
                          })}
                        </Text>
                        <Text
                          className={`text-[24px] font-[900] mt-1 mb-1 ${
                            isSelected ? "text-black" : "text-text"
                          }`}
                        >
                          {date.getDate()}
                        </Text>
                        <Text
                          className={`text-[11px] font-[700] ${
                            isSelected ? "text-black/60" : "text-textSecondary"
                          }`}
                        >
                          {date.toLocaleDateString("en-IN", {
                            month: "short",
                          })}
                        </Text>
                      </InteractivePressable>
                    );
                  })}
                </ScrollView>
              )}


            </View>
          )}

          {/* Add-ons List */}
          {activeSubscription && (
            <View className="mt-10">
              <Text className="text-[25px] font-[700] color-text">
                Select Extra Services
              </Text>
              <Text className="text-[14px] color-textSecondary mb-6 mt-1">
                For {activeSubscription.vehicle?.brand || "your vehicle"}
              </Text>

              <View className="gap-4">
                {addonsList?.map((addon: any) => {
                  const isSelected = selectedAddons.some(
                    (a) => a._id === addon._id,
                  );
                  return (
                    <InteractivePressable
                      key={addon._id}
                      className={`p-4 rounded-[24px] flex-row items-center border ${
                        isSelected
                          ? "bg-primary/5 border-primary"
                          : "bg-card border-border"
                      }`}
                      onPress={() => toggleAddon(addon)}
                    >
                      {/* <Image
                        source={{
                          uri:
                            addon.icon ||
                            "https://cdn-icons-png.flaticon.com/512/2099/2099192.png",
                        }}
                        className="w-14 h-14 rounded-2xl bg-background border border-border/50"
                      /> */}
                      <View className="flex-1 ml-4">
                        <Text
                          className={`text-[16px] text-white font-[700] ${
                            isSelected ? "text-text" : "text-textSemi"
                          }`}
                        >
                          {addon.name}
                        </Text>
                        <Text
                          className="text-[12px] color-textSecondary mt-1 leading-4"
                          numberOfLines={2}
                        >
                          {addon.description}
                        </Text>
                      </View>
                      <View className="items-end ml-4">
                        <Text
                          className={`text-[16px] font-[800] ${
                            isSelected ? "text-primary" : "text-text"
                          }`}
                        >
                          ₹{formatPrice(addon.price)}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color={Colors.primary}
                            className="mt-2"
                          />
                        )}
                      </View>
                    </InteractivePressable>
                  );
                })}
              </View>
            </View>
          )}

          <View className="h-32" />
        </ScrollView>

        {/* Bottom Bar */}
        {selectedAddons.length > 0 && activeSubscription && (
          <View
            className="absolute bottom-0 left-0 right-0 bg-card p-6 rounded-t-[40px] border-t border-border shadow-2xl flex-row justify-between items-center"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            <View>
              <Text className="text-[12px] color-textSecondary font-[600] tracking-wider uppercase">
                TOTAL
              </Text>
              <Text className="text-[28px] font-[800] color-text">
                ₹{formatPrice(totalAmount)}
              </Text>
            </View>
            <InteractivePressable
              className="bg-primary px-10 py-4 rounded-2xl shadow-lg shadow-primary/30"
              onPress={handlePayment}
              disabled={isCreatingOrder || isVerifying}
            >
              {isCreatingOrder || isVerifying ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text className="color-black font-[800] text-[16px]">
                  Pay Now
                </Text>
              )}
            </InteractivePressable>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
