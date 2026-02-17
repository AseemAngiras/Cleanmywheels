import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";

export default function PaymentMethods() {
  return (
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      <View className="flex-1 bg-background px-5">
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 pb-6">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border shadow-sm"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text className="text-[20px] font-[700] text-text">
            Payment Methods
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Active Payment Method Card */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-[700] text-text">
              Active Payment Gateway
            </Text>
            <View className="flex-row items-center bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
              <Ionicons name="shield-checkmark" size={12} color="#4ADE80" />
              <Text className="text-[10px] font-[700] color-[#4ADE80] ml-1">
                SECURE
              </Text>
            </View>
          </View>

          <LinearGradient
            colors={["#1A1A1A", "#0A0A0A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-[32px] p-6 mb-8 border border-border shadow-2xl"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-[800] text-text tracking-wider">
                Razorpay
              </Text>
              <View className="flex-row items-center bg-white/10 px-3 py-1.5 rounded-full">
                <View className="w-2 h-2 rounded-full bg-primary mr-2" />
                <Text className="text-white text-[12px] font-[600]">
                  Active
                </Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-textSecondary text-[14px] leading-5">
                Seamless & secure payments for your bookings. Supports Cards,
                UPI, and Netbanking.
              </Text>
            </View>

            <View className="pt-4 border-t border-white/5">
              <View className="flex-row items-center">
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color={Colors.textSecondary}
                />
                <Text className="text-textSecondary text-[12px] font-[500] ml-2">
                  End-to-End Encrypted
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Coming Soon Section */}
          <Text className="text-base font-[700] text-text mb-4">
            Coming Soon
          </Text>

          <View className="flex-row flex-wrap justify-between gap-y-4">
            <View className="w-[47%] bg-card p-5 rounded-[24px] items-center border border-border">
              <View className="w-12 h-12 rounded-full bg-blue-500/10 items-center justify-center mb-3">
                <Ionicons name="logo-google" size={24} color="#3B82F6" />
              </View>
              <Text className="text-[14px] font-[600] text-text">
                Google Pay
              </Text>
            </View>

            <View className="w-[47%] bg-card p-5 rounded-[24px] items-center border border-border">
              <View className="w-12 h-12 rounded-full bg-pink-500/10 items-center justify-center mb-3">
                <Ionicons name="wallet-outline" size={24} color="#EC4899" />
              </View>
              <Text className="text-[14px] font-[600] text-text">PhonePe</Text>
            </View>

            <View className="w-[47%] bg-card p-5 rounded-[24px] items-center border border-border">
              <View className="w-12 h-12 rounded-full bg-green-500/10 items-center justify-center mb-3">
                <Ionicons name="card-outline" size={24} color="#22C55E" />
              </View>
              <Text className="text-[14px] font-[600] text-text">
                Saved Cards
              </Text>
            </View>

            <View className="w-[47%] bg-card p-5 rounded-[24px] items-center border border-border">
              <View className="w-12 h-12 rounded-full bg-orange-500/10 items-center justify-center mb-3">
                <Ionicons name="cash-outline" size={24} color="#F97316" />
              </View>
              <Text className="text-[14px] font-[600] text-text">
                Pay Later
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}
