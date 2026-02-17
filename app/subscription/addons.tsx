import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React, { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import {
  useCreateAddonOrderMutation,
  useVerifyAddonPaymentMutation,
  useGetAddonsQuery,
  useGetMySubscriptionQuery,
} from "@/store/api/subscriptionApi";

export default function AddonsScreen() {
  const router = useRouter();

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
  const [serviceDate, setServiceDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (activeSubscriptions.length > 0 && !selectedSubId) {
      setSelectedSubId(activeSubscriptions[0]?._id ?? null);
    }
  }, [activeSubscriptions, selectedSubId]);

  const activeSubscription = activeSubscriptions.find(
    (s: any) => s._id === selectedSubId,
  );

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

  const totalAmount = selectedAddons.reduce(
    (sum, item) => sum + (item.price || 0),
    0,
  );

  const handlePayment = async () => {
    if (!activeSubscription) {
      Alert.alert("Error", "No active subscription selected.");
      return;
    }
    if (selectedAddons.length === 0) {
      Alert.alert("Select Add-ons", "Please select at least one add-on.");
      return;
    }

    const now = new Date();
    if (serviceDate < new Date(now.setHours(0, 0, 0, 0))) {
      Alert.alert("Invalid Date", "Please select a future date or today.");
      return;
    }
    const subEnd = new Date(activeSubscription.endDate);
    if (serviceDate > subEnd) {
      Alert.alert("Invalid Date", "Date cannot be after subscription expiry.");
      return;
    }

    try {
      const orderPayload = {
        amount: totalAmount,
        subscriptionId: activeSubscription._id,
        addons: selectedAddons,
        serviceDate: serviceDate.toISOString(),
      };

      const response = await createAddonOrder(orderPayload).unwrap();
      const { paymentLinkUrl, subscriptionId, referenceId } = response;

      if (paymentLinkUrl) {
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
            serviceDate: serviceDate.toISOString(),
            serviceName: "Add-on Services",
            address: "Your Location",
          },
        } as any);
        return;
      }

      Alert.alert("Error", "Failed to generate payment link.");
    } catch (err: any) {
      Alert.alert("Error", err?.data?.message || "Failed to create order");
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
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text className="text-[20px] font-[700] color-text ml-4">
            Add-ons
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20 }}
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
                  <TouchableOpacity
                    key={sub._id}
                    className={`flex-row items-center p-4 rounded-[24px] border ${
                      isSelected
                        ? "bg-primary/5 border-primary"
                        : "bg-card border-border"
                    }`}
                    style={{ width: 220 }}
                    onPress={() => setSelectedSubId(sub._id)}
                    activeOpacity={0.8}
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
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Date Selection */}
          {activeSubscription && (
            <View className="mt-8">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-[18px] font-[700] color-text">
                    Select Date
                  </Text>
                  <Text className="text-[14px] color-textSecondary mt-1">
                    When do you want this service?
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(true)}
                  className="bg-card px-5 py-3.5 rounded-[20px] border border-border flex-row items-center"
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={Colors.primary}
                    className="mr-3"
                  />
                  <Text className="color-text font-[600] ml-2">
                    {serviceDate.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={Colors.textSecondary}
                    className="ml-3"
                  />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={serviceDate}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  maximumDate={new Date(activeSubscription.endDate)}
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (date) {
                      const isDone = activeSubscription.serviceHistory?.some(
                        (h: any) =>
                          new Date(h.date).toDateString() ===
                            date.toDateString() && h.status === "completed",
                      );

                      if (isDone) {
                        Alert.alert(
                          "Service Completed",
                          "Service for this date is already marked as done.",
                        );
                        return;
                      }
                      setServiceDate(date);
                    }
                  }}
                />
              )}
            </View>
          )}

          {/* Add-ons List */}
          {activeSubscription && (
            <View className="mt-10">
              <Text className="text-[18px] font-[700] color-text">
                Select Services
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
                    <TouchableOpacity
                      key={addon._id}
                      className={`p-4 rounded-[24px] flex-row items-center border ${
                        isSelected
                          ? "bg-primary/5 border-primary"
                          : "bg-card border-border"
                      }`}
                      onPress={() => toggleAddon(addon)}
                      activeOpacity={0.8}
                    >
                      <Image
                        source={{
                          uri:
                            addon.icon ||
                            "https://cdn-icons-png.flaticon.com/512/2099/2099192.png",
                        }}
                        className="w-14 h-14 rounded-2xl bg-background border border-border/50"
                      />
                      <View className="flex-1 ml-4">
                        <Text
                          className={`text-[16px] font-[700] ${
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
                          ₹{addon.price}
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
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View className="h-32" />
        </ScrollView>

        {/* Bottom Bar */}
        {selectedAddons.length > 0 && activeSubscription && (
          <View className="absolute bottom-0 left-0 right-0 bg-card p-6 rounded-t-[40px] border-t border-border shadow-2xl flex-row justify-between items-center">
            <View>
              <Text className="text-[12px] color-textSecondary font-[600] tracking-wider uppercase">
                TOTAL
              </Text>
              <Text className="text-[28px] font-[800] color-text">
                ₹{totalAmount}
              </Text>
            </View>
            <TouchableOpacity
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
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}
