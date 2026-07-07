import { RootState } from "@/store";
import { setUser } from "@/store/slices/userSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import BookingStepper from "../../../../src/components/booking/BookingStepper";
import { Colors } from "@/constants/Colors";

// Types
type TimeSlot = {
  id: string;
  time: string;
  period: "Morning" | "Afternoon" | "Evening";
  available: boolean;
};

export default function ShopsListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();
  const bookingDraft = params.bookingDraft
    ? JSON.parse(params.bookingDraft as string)
    : null;

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);

  // Login Logic States
  const [isLoading, setIsLoading] = useState(false);
  const [modalStep, setModalStep] = useState<"details" | "otp">("details");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");

  // Slot Picker State
  const [showSlotPicker, setShowSlotPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: "none" },
      });
    }, [navigation]),
  );

  // Mock Data
  const allShops = [
    {
      id: "1",
      name: "Sparkle Station Main St.",
      rating: 4.8,
      distance: "1.2km away",
      slots: "3 slots available",
      price: 25.0,
      image:
        "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      slotsColor: "rgba(34, 197, 94, 0.1)",
      slotsTextColor: "#22c55e",
      address: "123 Main St, Downtown",
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      id: "2",
      name: "GlowWash Downtown",
      rating: 4.5,
      distance: "2.5km away",
      slots: "2-3 slots available",
      price: 22.0,
      image:
        "https://images.unsplash.com/photo-1552930294-6b595f4c2974?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      slotsColor: "rgba(34, 197, 94, 0.1)",
      slotsTextColor: "#22c55e",
      address: "456 Central Ave, Westside",
      latitude: 37.7849,
      longitude: -122.4094,
    },
    {
      id: "3",
      name: "Sunny Side Wash",
      rating: 4.2,
      distance: "3.0km away",
      slots: "1 slot left",
      price: 18.0,
      image:
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      slotsColor: "rgba(249, 115, 22, 0.1)",
      slotsTextColor: "#f97316",
      address: "789 Sunshine Blvd, Eastside",
      latitude: 37.7649,
      longitude: -122.4294,
    },
    {
      id: "4",
      name: "Blue Wave Auto",
      rating: 4.9,
      distance: "0.8km away",
      slots: "5+ slots available",
      price: 30.0,
      image:
        "https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
      slotsColor: "rgba(34, 197, 94, 0.1)",
      slotsTextColor: "#22c55e",
      address: "101 Ocean Dr, Coastal",
      latitude: 37.7549,
      longitude: -122.4394,
    },
  ];

  const dates = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      id: i,
      day: d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
      date: d.getDate(),
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
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
    { id: "1", time: "08:00 AM", period: "Morning", available: true },
    { id: "2", time: "08:30 AM", period: "Morning", available: true },
    { id: "3", time: "09:00 AM", period: "Morning", available: false },
    { id: "4", time: "09:30 AM", period: "Morning", available: true },
    { id: "5", time: "10:00 AM", period: "Morning", available: true },
    { id: "6", time: "10:30 AM", period: "Morning", available: false },
    { id: "7", time: "12:00 PM", period: "Afternoon", available: true },
    { id: "8", time: "12:30 PM", period: "Afternoon", available: true },
    { id: "9", time: "01:00 PM", period: "Afternoon", available: true },
    { id: "10", time: "01:30 PM", period: "Afternoon", available: true },
    { id: "11", time: "02:00 PM", period: "Afternoon", available: true },
    { id: "12", time: "02:30 PM", period: "Afternoon", available: false },
    { id: "13", time: "05:00 PM", period: "Evening", available: true },
    { id: "14", time: "05:30 PM", period: "Evening", available: false },
    { id: "15", time: "06:00 PM", period: "Evening", available: true },
  ].map((slot) => {
    if (!isToday) return slot as TimeSlot;
    const [timeStr, modifier] = slot.time.split(/\s+/);
    let [hours, minutes] = timeStr.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    const slotDate = new Date();
    slotDate.setHours(hours, minutes, 0, 0);
    const bufferTime = new Date(now.getTime() + 30 * 60000);
    if (slotDate < bufferTime) return { ...slot, available: false } as TimeSlot;
    return slot as TimeSlot;
  });

  const filteredShops = allShops.filter((shop) =>
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleSendOtp = () => {
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      alert("Please enter a valid phone number.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setModalStep("otp");
    }, 1500);
  };

  const handleVerifyOtp = () => {
    const otpValue = otp.join("");
    if (otpValue.length < 4) {
      alert("Please enter the complete 4-digit OTP.");
      return;
    }
    dispatch(
      setUser({
        _id: `guest_${Date.now()}`,
        name: name.trim(),
        phone: phoneNumber.trim(),
        countryCode: "+91",
        formattedPhone: `+91 ${phoneNumber.trim()}`,
        accountType: "Seeker",
        status: "Active",
        authTokenIssuedAt: Date.now(),
        isMobileVerified: true,
      }),
    );
    setIsLoginModalVisible(false);
    setModalStep("details");
    setOtp(["", "", "", ""]);
    setShowSlotPicker(true);
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 3) inputRefs.current[index + 1]?.focus();
    if (!text && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const renderShopCard = ({ item }: { item: any }) => (
    <View className="bg-card rounded-[32px] mb-5 overflow-hidden border border-border/50 shadow-sm">
      <Image
        source={{ uri: item.image }}
        className="w-full h-44 bg-background"
      />
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-[17px] font-[800] color-text flex-1 mr-4">
            {item.name}
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-2.5 rounded-full shadow-lg shadow-primary/30"
            onPress={() => {
              setSelectedShop(item);
              if (user?.user?.name && user?.user?.phone)
                setShowSlotPicker(true);
              else setIsLoginModalVisible(true);
            }}
          >
            <Text className="text-[12px] font-[900] color-black">Select</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center mb-3">
          <View className="bg-primary px-2 py-0.5 rounded-lg flex-row items-center mr-2">
            <Ionicons name="star" size={10} color="#000" />
            <Text className="text-[11px] font-[900] color-black ml-1">
              {item.rating}
            </Text>
          </View>
          <Text className="text-[12px] color-textSecondary font-[600]">
            {item.distance}
          </Text>
        </View>

        <View className="flex-row justify-between items-center mt-2 pt-4 border-t border-border/50">
          <View
            className="px-3 py-1.5 rounded-full"
            style={{ backgroundColor: item.slotsColor }}
          >
            <Text
              className="text-[10px] font-[800]"
              style={{ color: item.slotsTextColor }}
            >
              {item.slots.toUpperCase()}
            </Text>
          </View>
          <Text className="text-[20px] font-[900] color-text">
            ₹{item.price.toFixed(0)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="px-5 py-4 bg-background h-[72px] flex-row items-center justify-between">
        {isSearchVisible ? (
          <View className="flex-1 flex-row items-center bg-card rounded-2xl px-4 py-2 border border-border">
            <TextInput
              className="flex-1 text-[16px] color-text font-[600]"
              placeholder="Search shops..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setIsSearchVisible(false);
                setSearchQuery("");
              }}
            >
              <Ionicons
                name="close-circle"
                size={22}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity onPress={() => router.back()} className="p-1">
              <Ionicons name="chevron-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text className="text-[18px] font-[800] color-text tracking-tight">
              Shops List
            </Text>
            <TouchableOpacity
              onPress={() => setIsSearchVisible(true)}
              className="p-1"
            >
              <Ionicons name="search" size={24} color={Colors.text} />
            </TouchableOpacity>
          </>
        )}
      </View>

      <BookingStepper currentStep={2} />

      <FlatList
        data={filteredShops}
        renderItem={renderShopCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Text className="color-textSecondary text-[16px] font-[600]">
              {
                "No shops found in &quot;All&quot; category. Try another filter."
              }
            </Text>
          </View>
        }
      />

      {/* Slot Picker Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showSlotPicker}
        onRequestClose={() => setShowSlotPicker(false)}
      >
        <ScreenWrapper backgroundColor={Colors.background}>
          <View className="px-5 py-4 bg-background flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => setShowSlotPicker(false)}
              className="p-1"
            >
              <Ionicons name="close" size={26} color={Colors.text} />
            </TouchableOpacity>
            <Text className="text-[18px] font-[800] color-text tracking-tight">
              Select Slot
            </Text>
            <View className="w-10" />
          </View>

          <BookingStepper currentStep={2} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 180 + insets.bottom }}
          >
            {/* Shop Context Card */}
            <View className="mx-5 mt-6 mb-8 bg-card rounded-[28px] p-4 flex-row items-center border border-border/50 shadow-sm">
              <Image
                source={{ uri: selectedShop?.image }}
                className="w-20 h-20 rounded-2xl"
              />
              <View className="flex-1 ml-4 py-1">
                <Text
                  className="text-[16px] font-[800] color-text"
                  numberOfLines={1}
                >
                  {selectedShop?.name}
                </Text>
                <View className="flex-row items-center mt-1.5 mb-1.5">
                  <View className="bg-primary/20 px-1.5 py-0.5 rounded-md flex-row items-center">
                    <Ionicons name="star" size={10} color={Colors.primary} />
                    <Text className="text-[11px] font-[900] color-primary ml-1">
                      {selectedShop?.rating}
                    </Text>
                  </View>
                  <View className="w-1 h-1 rounded-full bg-border mx-2" />
                  <Text className="text-[12px] color-textSecondary font-[600]">
                    {selectedShop?.distance}
                  </Text>
                </View>
                <Text
                  className="text-[12px] color-textSecondary font-[500]"
                  numberOfLines={1}
                >
                  {selectedShop?.address}
                </Text>
              </View>
            </View>

            <View className="px-5">
              <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-5">
                Select Date
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-8"
              >
                {dates.map((item, index) => {
                  const isSelected = selectedDate === index;
                  return (
                    <TouchableOpacity
                      key={index}
                      className={`w-16 h-24 rounded-2xl items-center justify-center mr-3 border ${
                        isSelected
                          ? "bg-primary border-primary shadow-lg shadow-primary/30"
                          : "bg-card border-border"
                      }`}
                      onPress={() => setSelectedDate(index)}
                    >
                      <Text
                        className={`text-[10px] font-[700] uppercase ${isSelected ? "color-black/60" : "color-textSecondary"}`}
                      >
                        {item.month}
                      </Text>
                      <Text
                        className={`text-[22px] font-[900] my-0.5 ${isSelected ? "color-black" : "color-text"}`}
                      >
                        {item.date}
                      </Text>
                      <Text
                        className={`text-[10px] font-[700] uppercase ${isSelected ? "color-black/60" : "color-textSecondary"}`}
                      >
                        {item.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-1.5">
                Select Start Time
              </Text>
              <Text className="text-[12px] color-textSecondary font-[500] mb-5 italic">
                Estimated duration: ~58 minutes
              </Text>

              <View className="flex-row flex-wrap justify-between">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.id;
                  const isUnavailable = !slot.available;
                  const offer =
                    slot.id === "2"
                      ? "5% OFF"
                      : slot.id === "3" || slot.id === "4"
                        ? "10% OFF"
                        : null;

                  return (
                    <TouchableOpacity
                      key={slot.id}
                      className={`w-[31%] h-14 items-center justify-center rounded-2xl mb-4 border relative ${
                        isSelected
                          ? "bg-primary/10 border-primary"
                          : isUnavailable
                            ? "bg-background border-border/30 opacity-40"
                            : "bg-card border-border"
                      }`}
                      disabled={isUnavailable}
                      onPress={() => setSelectedSlot(slot.id)}
                    >
                      {offer && (
                        <View className="absolute -top-2 -right-1 bg-primary px-1.5 py-0.5 rounded-md z-10 border border-black/5">
                          <Text className="text-[7px] font-[900] color-black">
                            {offer}
                          </Text>
                        </View>
                      )}
                      <Text
                        className={`text-[13px] font-[800] ${isSelected ? "color-primary" : isUnavailable ? "color-textSecondary line-through" : "color-text"}`}
                      >
                        {slot.time}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Floating Slot Summary & Action */}
          <View
            className="absolute bottom-0 left-0 right-0 bg-card p-6 rounded-t-[40px] border-t border-border shadow-2xl"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            {selectedSlot ? (
              <View className="flex-row items-center mb-6 bg-background/50 p-4 rounded-3xl border border-border/50">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
                  <Ionicons
                    name="calendar-outline"
                    size={22}
                    color={Colors.primary}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-[800] color-textSecondary uppercase tracking-widest mb-0.5">
                    Selected Schedule
                  </Text>
                  <Text className="text-[14px] font-[900] color-text">
                    {dates[selectedDate].day}, {dates[selectedDate].date}{" "}
                    {dates[selectedDate].month} •{" "}
                    {timeSlots.find((s) => s.id === selectedSlot)?.time}
                  </Text>
                </View>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.primary}
                />
              </View>
            ) : (
              <View className="mb-6 h-[72px] items-center justify-center bg-background/30 rounded-3xl border border-dashed border-border/50">
                <Text className="color-textSecondary font-[700] text-[13px]">
                  Please select a starting time
                </Text>
              </View>
            )}

            <TouchableOpacity
              className={`bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 ${!selectedSlot ? "opacity-50" : ""}`}
              disabled={!selectedSlot}
              onPress={() => {
                if (!bookingDraft) return;
                const updatedDraft = {
                  ...bookingDraft,
                  shop: {
                    id: selectedShop.id,
                    name: selectedShop.name,
                    address: selectedShop.address,
                    image: selectedShop.image,
                    rating: selectedShop.rating,
                    location: {
                      lat: selectedShop.latitude,
                      long: selectedShop.longitude,
                    },
                  },
                  slot: {
                    date: dates[selectedDate].fullDate.toISOString(),
                    time: timeSlots.find((s) => s.id === selectedSlot)?.time,
                    slotId: selectedSlot,
                  },
                };
                setShowSlotPicker(false);
                router.push({
                  pathname: "/home/book-service/booking-summary",
                  params: { bookingDraft: JSON.stringify(updatedDraft) },
                });
              }}
            >
              <Text className="text-[16px] font-[900] color-black">
                Confirm & Proceed
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#000"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </ScreenWrapper>
      </Modal>

      {/* Login Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={isLoginModalVisible}
        onRequestClose={() => {
          setIsLoginModalVisible(false);
          setModalStep("details");
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setIsLoginModalVisible(false);
              setModalStep("details");
            }}
          >
            <View className="flex-1 bg-black/60" />
          </TouchableWithoutFeedback>

          <View
            className="bg-card rounded-t-[40px] px-8 pt-4 shadow-2xl border-t border-border"
            style={{ paddingBottom: Math.max(insets.bottom, 24) }}
          >
            <View className="w-10 h-1 bg-border/50 rounded-full self-center mb-8" />

            {modalStep === "details" ? (
              <>
                <Text className="text-[24px] font-[900] color-text mb-1.5">
                  Get Started
                </Text>
                <Text className="text-[14px] color-textSecondary font-[600] mb-8">
                  Confirm your identity to book a slot.
                </Text>

                <View className="mb-6">
                  <Text className="text-[12px] font-[800] color-textSecondary uppercase tracking-widest mb-3 ml-1">
                    Full Name
                  </Text>
                  <View className="flex-row items-center bg-background border border-border rounded-2xl px-5 h-14">
                    <TextInput
                      className="flex-1 text-[15px] color-text font-[700]"
                      placeholder="e.g. Rahul Sharma"
                      placeholderTextColor="#64748B"
                      value={name}
                      onChangeText={setName}
                    />
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </View>
                </View>

                <View className="mb-10">
                  <Text className="text-[12px] font-[800] color-textSecondary uppercase tracking-widest mb-3 ml-1">
                    Phone Number
                  </Text>
                  <View className="flex-row items-center bg-background border border-border rounded-2xl px-5 h-14">
                    <Text className="text-[15px] font-[800] color-text mr-3">
                      +91
                    </Text>
                    <View className="w-[1.5px] h-6 bg-border mr-4" />
                    <TextInput
                      className="flex-1 text-[15px] color-text font-[700]"
                      placeholder="9876543210"
                      placeholderTextColor="#64748B"
                      keyboardType="phone-pad"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                    />
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={Colors.textSecondary}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  className={`bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 ${isLoading ? "opacity-70" : ""}`}
                  onPress={handleSendOtp}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <>
                      <Text className="text-[16px] font-[900] color-black">
                        Send OTP
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={18}
                        color="#000"
                        style={{ marginLeft: 6 }}
                      />
                    </>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View className="flex-row items-center mb-1.5">
                  <TouchableOpacity
                    onPress={() => setModalStep("details")}
                    className="mr-3"
                  >
                    <Ionicons name="arrow-back" size={24} color={Colors.text} />
                  </TouchableOpacity>
                  <Text className="text-[24px] font-[900] color-text">
                    Verify OTP
                  </Text>
                </View>
                <Text className="text-[14px] color-textSecondary font-[600] mb-8">
                  Enter the 4-digit code sent to +91 {phoneNumber}
                </Text>

                <View className="flex-row justify-between mb-8">
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      className="w-[22%] h-16 bg-background border border-border rounded-2xl text-[24px] font-[900] color-text text-center"
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                    />
                  ))}
                </View>

                <View className="flex-row justify-center items-center mb-8">
                  <Text className="text-[14px] color-textSecondary font-[600]">
                    Didn't receive code?
                  </Text>
                  <TouchableOpacity className="ml-2">
                    <Text className="text-[14px] font-[800] color-primary">
                      Resend OTP
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30"
                  onPress={handleVerifyOtp}
                >
                  <Text className="text-[16px] font-[900] color-black">
                    Verify & Proceed
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScreenWrapper>
  );
}
