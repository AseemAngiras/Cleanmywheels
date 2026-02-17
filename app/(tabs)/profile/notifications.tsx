import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Switch, Text, View, ScrollView } from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";

export default function Notifications() {
  const [state, setState] = useState({
    booking: true,
    reminder: true,
    promo: false,
    updates: true,
    general: true,
  });

  const Item = ({
    label,
    value,
    keyName,
    icon,
  }: {
    label: string;
    value: boolean;
    keyName: keyof typeof state;
    icon: any;
  }) => (
    <View className="flex-row items-center justify-between bg-card p-4 rounded-[24px] mb-4 border border-border">
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-3.5 border border-border">
          <Ionicons name={icon} size={18} color={Colors.text} />
        </View>
        <Text className="text-base text-text font-[600]">{label}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={(v) => setState({ ...state, [keyName]: v })}
        trackColor={{ false: "#333333", true: Colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

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
            Notifications
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Item
            label="Booking Confirmations"
            value={state.booking}
            keyName="booking"
            icon="ticket-outline"
          />
          <Item
            label="Booking Reminders"
            value={state.reminder}
            keyName="reminder"
            icon="time-outline"
          />
          <Item
            label="Promotions & Offers"
            value={state.promo}
            keyName="promo"
            icon="pricetag-outline"
          />
          <Item
            label="App Updates"
            value={state.updates}
            keyName="updates"
            icon="download-outline"
          />
          <Item
            label="General Announcements"
            value={state.general}
            keyName="general"
            icon="megaphone-outline"
          />

          <Pressable
            onPress={() =>
              setState({
                booking: false,
                reminder: false,
                promo: false,
                updates: false,
                general: false,
              })
            }
            className="mt-6 mb-4 active:opacity-60"
          >
            <Text className="text-center text-textSecondary text-[15px] font-[500]">
              Disable All Notifications
            </Text>
          </Pressable>
        </ScrollView>

        <View className="py-6 border-t border-border/50">
          <Text className="text-center text-textSecondary/50 text-[13px] font-[500]">
            Version 2.4.0
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
}

import { TouchableOpacity } from "react-native";
