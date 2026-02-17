import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";

interface BookingDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  booking: any;
}

export default function BookingDetailsModal({
  visible,
  onClose,
  booking,
}: BookingDetailsModalProps) {
  if (!booking) return null;

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert("Error", "Could not open dialer"),
    );
  };

  const handleWhatsApp = (phone: string) => {
    const url = `whatsapp://send?phone=${phone}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "WhatsApp not installed"),
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <TouchableOpacity
          className="absolute inset-0 bg-black/70"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-card rounded-t-[40px] h-[75%] p-6 pb-12 shadow-2xl border-t border-border">
          <View className="w-12 h-1.5 bg-border/50 rounded-full self-center mb-6" />

          <View className="flex-row justify-between items-center mb-6 px-2">
            <Text className="text-[22px] font-[800] color-text">
              Booking Details
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
            >
              <Ionicons name="close" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            {/* User Info */}
            <View className="mb-8 p-5 bg-background/50 rounded-[32px] border border-border/50">
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-full bg-background items-center justify-center mr-4 border border-border/50 overflow-hidden">
                  {booking.avatar ? (
                    <Image
                      source={{ uri: booking.avatar }}
                      className="w-16 h-16"
                    />
                  ) : (
                    <Text className="text-[24px] font-[800] color-text">
                      {booking.customerName?.charAt(0)}
                    </Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[18px] font-[800] color-text">
                    {booking.customerName}
                  </Text>
                  <Text className="text-[14px] color-textSecondary font-[600] mt-0.5">
                    +91 {booking.phone}
                  </Text>
                </View>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => handleCall(booking.phone)}
                    className="w-11 h-11 rounded-full bg-blue-500/10 items-center justify-center border border-blue-500/20"
                  >
                    <Ionicons name="call" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleWhatsApp(booking.phone)}
                    className="w-11 h-11 rounded-full bg-green-500/10 items-center justify-center border border-green-500/20"
                  >
                    <Ionicons name="logo-whatsapp" size={18} color="#22C55E" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Service Info */}
            <View className="mb-8">
              <Text className="text-[13px] font-[800] color-textSecondary uppercase tracking-widest mb-4 px-2">
                Service Details
              </Text>
              <View className="bg-background/30 rounded-[32px] border border-border/50 p-6 gap-5">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-4">
                    <Ionicons
                      name="car-sport-outline"
                      size={16}
                      color={Colors.primary}
                    />
                  </View>
                  <Text className="text-[15px] color-text font-[600] flex-1">
                    {booking.car} ({booking.license})
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-4">
                    <Ionicons
                      name="sparkles-outline"
                      size={16}
                      color={Colors.primary}
                    />
                  </View>
                  <Text className="text-[15px] color-text font-[600] flex-1">
                    {booking.service}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-4">
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={Colors.primary}
                    />
                  </View>
                  <Text className="text-[15px] color-text font-[600] flex-1">
                    {booking.time}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-4">
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={Colors.primary}
                    />
                  </View>
                  <Text className="text-[15px] color-text font-[600] flex-1">
                    {new Date(
                      booking.bookingDate || Date.now(),
                    ).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Address */}
            <View>
              <Text className="text-[13px] font-[800] color-textSecondary uppercase tracking-widest mb-4 px-2">
                Location
              </Text>
              <View className="bg-background/30 rounded-[32px] border border-border/50 p-6 flex-row items-start">
                <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-4 mt-0.5">
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={Colors.primary}
                  />
                </View>
                <Text className="text-[15px] color-text font-[600] flex-1 leading-6">
                  {booking.address}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Status & Price */}
          <View className="flex-row gap-4 pt-6 border-t border-border/50 bg-card">
            <View className="flex-1 bg-background/50 rounded-2xl p-4 border border-border/50 items-center">
              <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-widest mb-1.5">
                Status
              </Text>
              <Text
                className={`text-[16px] font-[900] ${booking.status === "COMPLETED" ? "text-green-500" : "text-orange-500"}`}
              >
                {booking.status}
              </Text>
            </View>
            <View className="flex-1 bg-primary rounded-2xl p-4 items-center shadow-lg shadow-primary/20">
              <Text className="text-[11px] font-[800] color-black/60 uppercase tracking-widest mb-1.5">
                Amount
              </Text>
              <Text className="text-[18px] font-[900] color-black">
                ₹{booking.price}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
