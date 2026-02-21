import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { serviceName, servicePrice, addons, totalPrice } = params;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");

  // Calculations
  const itemTotal = parseFloat(totalPrice as string) || 0;
  const taxAmount = Math.round(itemTotal * 0.18);
  const grandTotal = itemTotal + taxAmount;

  const parsedAddons = addons ? JSON.parse(addons as string) : {};
  const addonNames = Object.keys(parsedAddons).filter((k) => parsedAddons[k]);
  const addonsTotal = addonNames.reduce(
    (acc, curr) => acc + (curr === "acService" ? 10 : 5),
    0,
  );

  const baseServicePrice =
    parseFloat(servicePrice as string) || itemTotal - addonsTotal;

  const paymentOptions = [
    {
      id: "upi",
      label: "UPI",
      subLabel: "Pay via Google Pay, PhonePe, Paytm",
      icon: "wallet-outline",
      recommended: true,
    },
    {
      id: "card",
      label: "Credit / Debit Cards",
      subLabel: "VISA, MasterCard",
      icon: "card-outline",
    },
    {
      id: "netbanking",
      label: "Netbanking",
      subLabel: "All major banks supported",
      icon: "business-outline",
    },
    {
      id: "cash",
      label: "Pay on Delivery / Cash",
      subLabel: "Pay after service completion",
      icon: "cash-outline",
    },
  ];

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-background">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[18px] font-[800] color-text tracking-tight ml-[-32px]">
          Payment
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 + insets.bottom }}
      >
        {/* Hero Amount */}
        <View className="items-center my-8">
          <Text className="text-[12px] color-textSecondary font-[800] uppercase tracking-widest mb-2">
            Amount to Pay
          </Text>
          <Text className="text-[36px] font-[900] color-text tracking-tighter">
            ₹{grandTotal}
          </Text>
        </View>

        {/* Bill Summary */}
        <View className="mx-5 mb-8 bg-card rounded-[32px] p-6 border border-border/50 shadow-sm">
          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-4">
              <Ionicons
                name="receipt-outline"
                size={20}
                color={Colors.primary}
              />
            </View>
            <View>
              <Text className="text-[16px] font-[800] color-text">
                Bill Summary
              </Text>
              <Text className="text-[11px] color-primary font-[700] uppercase tracking-tighter">
                Order #GW-{Math.floor(Math.random() * 90000) + 10000}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[14px] color-textSecondary font-[600]">
              Item Total ({serviceName || "Service"})
            </Text>
            <Text className="text-[14px] color-text font-[800]">
              ₹{baseServicePrice}
            </Text>
          </View>

          {addonsTotal > 0 && (
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[14px] color-textSecondary font-[600]">
                Add-ons ({addonNames.length})
              </Text>
              <Text className="text-[14px] color-primary font-[800]">
                ₹{addonsTotal}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[14px] color-textSecondary font-[600]">
              Taxes & Fees (GST 18%)
            </Text>
            <Text className="text-[14px] color-text font-[800]">
              ₹{taxAmount}
            </Text>
          </View>

          <View className="h-[1px] bg-border/50 my-4 border-dashed border border-border/50" />

          <View className="flex-row justify-between items-center">
            <Text className="text-[17px] font-[900] color-text">
              Grand Total
            </Text>
            <Text className="text-[20px] font-[900] color-primary">
              ₹{grandTotal}
            </Text>
          </View>
        </View>

        {/* Payment Options */}
        <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-6">
          Payment Options
        </Text>

        {paymentOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            className={`mx-5 mb-4 p-5 rounded-[28px] border overflow-hidden ${
              selectedPaymentMethod === option.id
                ? "bg-card border-primary shadow-sm"
                : "bg-card border-border/50"
            }`}
            activeOpacity={0.9}
            onPress={() => setSelectedPaymentMethod(option.id)}
          >
            {option.recommended && (
              <View className="absolute top-0 right-0 bg-primary px-3 py-1 rounded-bl-xl">
                <Text className="text-[10px] font-[900] color-black uppercase">
                  Recommended
                </Text>
              </View>
            )}

            <View className="flex-row items-center">
              <View className="mr-5">
                <View
                  className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    selectedPaymentMethod === option.id
                      ? "border-primary"
                      : "border-border"
                  }`}
                >
                  {selectedPaymentMethod === option.id && (
                    <View className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </View>
              </View>

              <View
                className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                  selectedPaymentMethod === option.id
                    ? "bg-primary/10"
                    : "bg-background"
                }`}
              >
                <Ionicons
                  name={option.icon as any}
                  size={24}
                  color={
                    selectedPaymentMethod === option.id
                      ? Colors.primary
                      : Colors.textSecondary
                  }
                />
              </View>

              <View className="flex-1">
                <Text
                  className={`text-[15px] font-[800] ${selectedPaymentMethod === option.id ? "color-text" : "color-text"}`}
                >
                  {option.label}
                </Text>
                <Text className="text-[12px] color-textSecondary font-[500] mt-0.5">
                  {option.subLabel}
                </Text>

                {option.id === "upi" && selectedPaymentMethod === "upi" && (
                  <View className="flex-row mt-3 gap-2">
                    <View className="bg-background px-3 py-1.5 rounded-lg border border-border/30">
                      <Text className="text-[10px] font-[800] color-textSecondary uppercase">
                        GPay
                      </Text>
                    </View>
                    <View className="bg-background px-3 py-1.5 rounded-lg border border-border/30">
                      <Text className="text-[10px] font-[800] color-textSecondary uppercase">
                        PhonePe
                      </Text>
                    </View>
                    <View className="bg-background px-3 py-1.5 rounded-lg border border-border/30">
                      <Text className="text-[10px] font-[800] color-textSecondary uppercase">
                        Paytm
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View className="flex-row items-center justify-center mt-6 gap-3">
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={Colors.textSecondary}
          />
          <Text className="text-[12px] color-textSecondary font-[600]">
            100% Safe & Secure Payments
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 p-6 bg-card rounded-t-[40px] border-t border-border shadow-2xl flex-row justify-between items-center"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View>
          <Text className="text-[10px] font-[900] color-textSecondary uppercase tracking-widest mb-1">
            Total Amount
          </Text>
          <Text className="text-[24px] font-[900] color-text tracking-tighter">
            ₹{grandTotal}
          </Text>
        </View>

        <TouchableOpacity
          className="bg-primary h-14 w-[180px] rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
          onPress={() => router.push("/(tabs)/home")}
        >
          <Ionicons
            name="lock-closed"
            size={18}
            color="#000"
            style={{ marginRight: 8 }}
          />
          <Text className="text-[16px] font-[900] color-black">Pay Now</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
