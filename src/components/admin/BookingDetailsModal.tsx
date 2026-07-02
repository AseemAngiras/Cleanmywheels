import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { formatPrice } from "@/utils/formatPrice";
import { useAlert } from "@/providers/AlertProvider";

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
  const { showAlert } = useAlert();
  if (!booking) return null;

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() =>
      showAlert({ title: "Error", message: "Could not open dialer", type: "error" }),
    );
  };

  const formatWhatsAppPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) return `91${cleaned}`;
    return cleaned;
  };

  const notifyUser = () => {
    const phone = formatWhatsAppPhone(booking.phone);
    const date = new Date(booking.bookingDate || Date.now()).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "long" },
    );
    const workerInfo = booking.workerName
      ? `\n\nProfessional: *${booking.workerName}* (+91 ${booking.workerPhone})`
      : "";

    const message = `Hello, your booking for *${booking.service}* is confirmed! 🚗✨${workerInfo}\n\nDate: ${date}\nTime: ${booking.time}\nAddress: ${booking.address}\n\nThank you for choosing Cleanmywheels!`;
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() =>
      showAlert({ title: "Error", message: "WhatsApp not installed", type: "error" }),
    );
  };

  const notifyWorker = () => {
    if (!booking.workerPhone) {
      showAlert({
        title: "Error",
        message: "No professional assigned to this booking",
        type: "error",
      });
      return;
    }
    const phone = formatWhatsAppPhone(booking.workerPhone);
    const date = new Date(booking.bookingDate || Date.now()).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "long" },
    );

    const message = `🛠️ *New Job Assigned!*\n\nCustomer: *${booking.customerName}* (+91 ${booking.phone})\nService: ${booking.service}\nCar: ${booking.car}\n\nDate: ${date}\nTime: ${booking.time}\nAddress: ${booking.address}\n\nPlease reach on time.`;
    const url = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;

    Linking.openURL(url).catch(() =>
      showAlert({ title: "Error", message: "WhatsApp not installed", type: "error" }),
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
                {/* <View className="w-16 h-16 rounded-full bg-background items-center justify-center mr-4 border border-border/50 overflow-hidden">
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
                </View> */}
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
                    {booking.car}
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
            {/* Add-ons */}
            {booking.addons && booking.addons.length > 0 && (
              <View className="mb-8">
                <Text className="text-[13px] font-[800] color-textSecondary uppercase tracking-widest mb-4 px-2">
                  Selected Add-ons
                </Text>
                <View className="bg-background/30 rounded-[32px] border border-border/50 p-6 gap-3">
                  {booking.addons.map((addon: any, index: number) => (
                    <View key={index} className="flex-row justify-between items-center bg-card/50 p-4 rounded-2xl border border-border/30">
                      <View className="flex-row items-center flex-1">
                        <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
                          <Ionicons name="add" size={16} color={Colors.primary} />
                        </View>
                        <Text className="text-[15px] color-text font-[600] flex-1">
                          {addon.addOn?.name || "Extra Service"}
                        </Text>
                      </View>
                      <Text className="text-[15px] font-[800] color-primary ml-2">
                        ₹{formatPrice(addon.price)}
                      </Text>
                    </View>
                  ))}
                  <View className="h-[1px] bg-border/50 my-2" />
                  <View className="flex-row justify-between items-center px-2">
                    <Text className="text-[14px] font-[700] color-textSecondary">Add-ons Total</Text>
                    <Text className="text-[16px] font-[900] color-text">₹{formatPrice(booking.addonsTotal || 0)}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Address */}
            <View className="mb-8">
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

            {/* Assigned Worker */}
            {booking.workerName && (
              <View className="mb-8">
                <Text className="text-[13px] font-[800] color-textSecondary uppercase tracking-widest mb-4 px-2">
                  Assigned Professional
                </Text>
                <View className="bg-background/50 p-5 rounded-[32px] border border-border/50">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4 border border-primary/20">
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={Colors.primary}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[16px] font-[800] color-text">
                        {booking.workerName}
                      </Text>
                      {booking.workerPhone && (
                        <Text className="text-[13px] color-textSecondary font-[600] mt-0.5">
                          +91 {booking.workerPhone}
                        </Text>
                      )}
                    </View>
                    {booking.workerPhone && (
                      <TouchableOpacity
                        onPress={() => handleCall(booking.workerPhone)}
                        className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center border border-blue-500/20"
                      >
                        <Ionicons name="call" size={16} color="#3B82F6" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Notification Actions */}
          <View className="flex-row gap-4 mb-6">
            <TouchableOpacity
              onPress={notifyUser}
              className="flex-1 bg-green-500/10 border border-green-500/20 py-4 rounded-2xl flex-row items-center justify-center"
            >
              <Ionicons name="logo-whatsapp" size={18} color="#22C55E" />
              <Text className="text-green-600 font-[800] ml-2 text-[13px]">
                Notify User
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={notifyWorker}
              className={`flex-1 ${booking.workerName ? "bg-primary/10 border-primary/20" : "bg-background border-border opacity-50"} border py-4 rounded-2xl flex-row items-center justify-center`}
              disabled={!booking.workerName}
            >
              <Ionicons
                name="logo-whatsapp"
                size={18}
                color={booking.workerName ? Colors.primary : Colors.textSecondary}
              />
              <Text
                className={`font-[800] ml-2 text-[13px] ${booking.workerName ? "color-primary" : "color-textSecondary"}`}
              >
                Notify Worker
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status & Price */}
          <View className="flex-row gap-4 pt-6 mb-5 border-t border-border/50 bg-card">
            <View className="flex-1 bg-background/50 rounded-2xl p-4 border border-border/50 items-center">
              <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-widest">
                Status
              </Text>
              <Text
                className={`text-[16px] font-[900] ${booking.status === "COMPLETED" ? "text-green-500" : "text-orange-500"}`}
              >
                {booking.status}
              </Text>
            </View>
            <View className="flex-1 bg-primary rounded-2xl p-4 items-center shadow-lg shadow-primary/20">
              <Text className="text-[11px] font-[800] color-black/60 uppercase tracking-widest">
                Amount
              </Text>
              <Text className="text-[18px] font-[900] color-black">
                ₹{formatPrice(booking.price)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
