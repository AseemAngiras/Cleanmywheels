import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

// Types
type TimeSlot = {
  id: string;
  time: string;
  period: "Morning" | "Afternoon" | "Evening";
  available: boolean;
};

export default function SelectSlotScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { shopName, shopAddress } = params as { shopName?: string; shopAddress?: string };
  // --- State ---
  const [selectedDate, setSelectedDate] = useState<number>(0); // Index of selected date
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // ID of selected slot

  // --- Mock Data ---

  // Generate next 7 days
  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      id: i,
      day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: d.getDate(),
      fullDate: d,
    };
  });

  const now = new Date();
  const selectedDateObj = dates[selectedDate].fullDate;
  const isToday =
    selectedDateObj.getDate() === now.getDate() &&
    selectedDateObj.getMonth() === now.getMonth() &&
    selectedDateObj.getFullYear() === now.getFullYear();

  const timeSlots: TimeSlot[] = [
    // Morning
    { id: "1", time: "08:00 AM", period: "Morning", available: true },
    { id: "2", time: "08:30 AM", period: "Morning", available: true },
    { id: "3", time: "09:00 AM", period: "Morning", available: false },
    { id: "4", time: "09:30 AM", period: "Morning", available: true },
    { id: "5", time: "10:00 AM", period: "Morning", available: true },
    { id: "6", time: "10:30 AM", period: "Morning", available: false },

    // Afternoon
    { id: "7", time: "12:00 PM", period: "Afternoon", available: true },
    { id: "8", time: "12:30 PM", period: "Afternoon", available: true },
    { id: "9", time: "01:00 PM", period: "Afternoon", available: true },
    { id: "10", time: "01:30 PM", period: "Afternoon", available: true },
    { id: "11", time: "02:00 PM", period: "Afternoon", available: true },
    { id: "12", time: "02:30 PM", period: "Afternoon", available: false },

    // Evening
    { id: "13", time: "05:00 PM", period: "Evening", available: true },
    { id: "14", time: "05:30 PM", period: "Evening", available: false },
    { id: "15", time: "06:00 PM", period: "Evening", available: true },
  ].map((slot) => {
    const typedSlot = slot as TimeSlot;
    if (!isToday) return typedSlot;

    const [timeStr, modifier] = typedSlot.time.trim().split(/\s+/);
    let [hours, minutes] = timeStr.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const slotDate = new Date();
    slotDate.setHours(hours, minutes, 0, 0);

    const bufferTime = new Date(now.getTime() + 30 * 60000); // 30 mins ahead

    if (slotDate < bufferTime) {
      return { ...typedSlot, available: false };
    }
    return typedSlot;
  });

  const slotsByPeriod = {
    Morning: timeSlots.filter((s) => s.period === "Morning"),
    Afternoon: timeSlots.filter((s) => s.period === "Afternoon"),
    Evening: timeSlots.filter((s) => s.period === "Evening"),
  };

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
  }, [navigation]);

  const DateItem = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedDate === index;
    return (
      <TouchableOpacity
        className={`w-[68px] h-[85px] rounded-[30px] items-center justify-center mr-3 border ${
          isSelected
            ? "bg-primary border-primary shadow-lg shadow-primary/30"
            : "bg-card border-border/50"
        }`}
        activeOpacity={0.8}
        onPress={() => setSelectedDate(index)}
      >
        <Text
          className={`text-[10px] uppercase font-[700] mb-2 ${isSelected ? "color-black" : "color-textSecondary"}`}
        >
          {item.day}
        </Text>
        <Text
          className={`text-[20px] font-[900] ${isSelected ? "color-black" : "color-text"}`}
        >
          {item.date}
        </Text>
      </TouchableOpacity>
    );
  };

  const SlotItem = ({ item }: { item: TimeSlot }) => {
    const isSelected = selectedSlot === item.id;
    const isUnavailable = !item.available;

    if (isUnavailable) {
      return (
        <View className="w-[31%] h-12 bg-background/30 rounded-2xl items-center justify-center mb-4 border border-border/20 opacity-40">
          <Text className="text-[13px] font-[600] color-textSecondary line-through">
            {item.time}
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        className={`w-[31%] h-12 rounded-2xl items-center justify-center mb-4 border ${
          isSelected
            ? "bg-primary border-primary shadow-sm"
            : "bg-card border-border/50"
        }`}
        activeOpacity={0.7}
        onPress={() => setSelectedSlot(item.id)}
      >
        <Text
          className={`text-[13px] font-[800] ${isSelected ? "color-black" : "color-text"}`}
        >
          {item.time}
        </Text>
        {isSelected && (
          <View className="absolute -top-2 -right-2 bg-text w-5 h-5 rounded-full items-center justify-center border-2 border-primary">
            <Ionicons name="checkmark" size={12} color={Colors.primary} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getSelectedDateTimeString = () => {
    if (!selectedSlot) return "Select a convenient time";
    const dateObj = dates[selectedDate].fullDate;
    const dateStr = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const timeStr = timeSlots.find((s) => s.id === selectedSlot)?.time;
    return `${dateStr}, ${timeStr}`;
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 bg-background">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-[18px] font-[800] color-text tracking-tight ml-[-32px]">
          Select Time Slot
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 + insets.bottom }}
      >
        {/* Shop Info Card */}
        <View className="mx-5 my-6 bg-card rounded-[32px] p-5 flex-row items-center border border-border/50 shadow-sm">
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
            <Ionicons name="car-sport" size={22} color={Colors.primary} />
          </View>
          <View className="flex-1">
            <Text
              className="text-[16px] font-[800] color-text"
              numberOfLines={1}
            >
              {shopName || "Service Center"}
            </Text>
            <Text
              className="text-[12px] color-textSecondary font-[500] mt-0.5"
              numberOfLines={1}
            >
              {shopAddress || "Cleaning Location"}
            </Text>
          </View>
        </View>

        {/* Date Selector */}
        <View className="mb-8">
          <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-6">
            Choose Date
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
          >
            {dates.map((item, index) => (
              <DateItem key={index} item={item} index={index} />
            ))}
          </ScrollView>
        </View>

        {/* Legend */}
        <View className="flex-row justify-center items-center mb-10 gap-6">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full border border-border/50 bg-card mr-2" />
            <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-tighter">
              Available
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-primary mr-2" />
            <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-tighter">
              Selected
            </Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-background/40 mr-2 border border-border/10" />
            <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-tighter">
              Sold Out
            </Text>
          </View>
        </View>

        {/* Time Slots - Morning */}
        <View className="px-5 mb-8">
          <View className="flex-row justify-between items-center mb-6 px-1">
            <Text className="text-[16px] font-[900] color-text">Morning</Text>
            <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <Text className="text-[10px] font-[900] color-primary">
                {slotsByPeriod.Morning.filter((s) => s.available).length} Slots
                Left
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {slotsByPeriod.Morning.map((slot) => (
              <SlotItem key={slot.id} item={slot} />
            ))}
          </View>
        </View>

        {/* Time Slots - Afternoon */}
        <View className="px-5 mb-8">
          <Text className="text-[16px] font-[900] color-text mb-6 px-1">
            Afternoon
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {slotsByPeriod.Afternoon.map((slot) => (
              <SlotItem key={slot.id} item={slot} />
            ))}
          </View>
        </View>

        {/* Time Slots - Evening */}
        <View className="px-5 mb-8">
          <View className="flex-row justify-between items-center mb-6 px-1">
            <Text className="text-[16px] font-[900] color-text">Evening</Text>
            <View className="bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              <Text className="text-[10px] font-[900] color-red-500">
                High Demand
              </Text>
            </View>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {slotsByPeriod.Evening.map((slot) => (
              <SlotItem key={slot.id} item={slot} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-card p-6 rounded-t-[40px] border-t border-border shadow-2xl"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-[10px] font-[900] color-textSecondary uppercase tracking-widest mb-1">
              Schedule
            </Text>
            <Text className="text-[15px] font-[800] color-text">
              {getSelectedDateTimeString()}
            </Text>
          </View>
          {selectedSlot && (
            <View className="bg-primary/20 w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="time" size={20} color={Colors.primary} />
            </View>
          )}
        </View>

        <TouchableOpacity
          className={`bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 ${!selectedSlot ? "opacity-50" : ""}`}
          disabled={!selectedSlot}
          onPress={() => {
            router.push({
              pathname: "/home/book-service/booking-summary",
              params: {
                ...params,
                selectedDate: dates[selectedDate].fullDate.toISOString(),
                selectedTime: timeSlots.find((s) => s.id === selectedSlot)
                  ?.time,
                selectedTimeSlotId: selectedSlot,
              },
            });
          }}
        >
          <Text className="text-[16px] font-[900] color-black mr-2">
            Review Summary
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#000" />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
