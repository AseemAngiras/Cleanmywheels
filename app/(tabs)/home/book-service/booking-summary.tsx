import { RootState } from "@/store";
import { useCreateBookingMutation } from "@/store/api/bookingApi";
import { addBooking } from "@/store/slices/bookingSlice";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useDispatch, useSelector } from "react-redux";
import BookingStepper from "../../../../components/BookingStepper";
import { Colors } from "@/constants/Colors";

export default function BookingSummaryScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const { bookingDraft } = useLocalSearchParams();

  const parsedBooking = bookingDraft
    ? JSON.parse(bookingDraft as string)
    : null;
  const user = useSelector((state: RootState) => state.user);
  const { service, vehicle, shop, slot } = parsedBooking || {};

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >("upi");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // API Mutation
  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const itemTotal = service?.totalPrice || 0;
  const taxAmount = Math.round(itemTotal * 0.18);
  const grandTotal = itemTotal + taxAmount;

  const paymentOptions = [
    {
      id: "upi",
      label: "UPI",
      subLabel: "Google Pay, PhonePe, Paytm",
      icon: "wallet-outline",
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
      label: "Pay with Cash",
      subLabel: "Pay after service completion",
      icon: "cash-outline",
    },
  ];

  const selectedPaymentOption = paymentOptions.find(
    (opt) => opt.id === selectedPaymentMethod,
  );

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
  }, [navigation]);

  const handleBooking = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert("Payment Required", "Please select a payment option");
      return;
    }

    try {
      const bookingPayload = {
        center: shop.name,
        address: shop.address,
        phone: user.user?.phone || "",
        serviceName: service.name,
        price: grandTotal,
        date: new Date(slot.date).toDateString(),
        timeSlot: slot.time,
        car: `${vehicle.type} - ${vehicle.number}`,
        plate: vehicle.number,
        carImage: shop.image,
        status: "upcoming",
        shopId: shop.id,
        userId: user.user?._id || "guest",
        paymentMethod: selectedPaymentMethod,
        isPaid: selectedPaymentMethod !== "cash",
      };

      await createBooking(bookingPayload).unwrap();
      dispatch(addBooking(bookingPayload));

      router.replace({
        pathname: "/(tabs)/home/book-service/order-confirmation",
        params: {
          shopName: shop.name,
          shopAddress: shop.address,
          shopImage: shop.image,
          shopRating: shop.rating,
          date: new Date(slot.date).toDateString(),
          time: slot.time,
          shopLat: shop.location?.lat,
          shopLong: shop.location?.long,
          serviceName: service.name,
        },
      });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err?.data?.message || "Failed to create booking. Please try again.",
      );
    }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="flex-row justify-between items-center px-5 py-4 bg-background">
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text className="text-[18px] font-[800] color-text tracking-tight">
          Booking Summary
        </Text>
        <View className="w-8" />
      </View>

      <BookingStepper currentStep={3} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Shop Info Card */}
        <View className="mx-5 mt-6 mb-6 bg-card rounded-[32px] p-5 flex-row items-center border border-border/50 shadow-sm">
          <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
            <Ionicons name="location" size={22} color={Colors.primary} />
          </View>
          <View className="flex-1">
            <Text
              className="text-[16px] font-[800] color-text"
              numberOfLines={1}
            >
              {shop?.name}
            </Text>
            <Text
              className="text-[12px] color-textSecondary font-[500] mt-0.5"
              numberOfLines={1}
            >
              {shop?.address}
            </Text>
          </View>
        </View>

        {/* Booking Details Card */}
        <View className="mx-5 mb-6 bg-card rounded-[32px] p-6 border border-border/50 shadow-sm">
          <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-1">
            Booking Info
          </Text>

          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-4 border border-border/50">
              <Ionicons
                name="car-sport"
                size={20}
                color={Colors.textSecondary}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-tighter mb-0.5">
                Vehicle
              </Text>
              <Text className="text-[15px] font-[800] color-text">
                {vehicle?.type?.toUpperCase()} • {vehicle?.number}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-4 border border-border/50">
              <Ionicons
                name="calendar"
                size={20}
                color={Colors.textSecondary}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-tighter mb-0.5">
                Scheduled For
              </Text>
              <Text className="text-[15px] font-[800] color-text">
                {new Date(slot?.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}{" "}
                • {slot?.time}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-4 border border-border/50">
              <Ionicons name="call" size={20} color={Colors.textSecondary} />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-tighter mb-0.5">
                Contact
              </Text>
              <Text className="text-[15px] font-[800] color-text">
                +91 {user.user?.phone}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary Card */}
        <View className="mx-5 mb-6 bg-card rounded-[32px] p-6 border border-border/50 shadow-sm">
          <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-6 px-1">
            Cost Breakdown
          </Text>

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[14px] color-textSecondary font-[600]">
              {service?.name}
            </Text>
            <Text className="text-[14px] color-text font-[800]">
              ₹{service?.basePrice}
            </Text>
          </View>

          {service?.addons &&
            Array.isArray(service.addons) &&
            service.addons.map((addon: any) => (
              <View
                key={addon.id}
                className="flex-row justify-between items-center mb-4"
              >
                <Text className="text-[14px] color-textSecondary font-[600]">
                  {addon.name}
                </Text>
                <Text className="text-[14px] color-primary font-[800]">
                  +₹{addon.price}
                </Text>
              </View>
            ))}

          <View className="h-[1px] bg-border/50 my-4 border-dashed border border-border/50" />

          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-[14px] color-textSecondary font-[600]">
              Tax (18% GST)
            </Text>
            <Text className="text-[14px] color-text font-[800]">
              ₹{taxAmount}
            </Text>
          </View>

          <View className="flex-row justify-between items-center pt-4 border-t border-border/50">
            <Text className="text-[17px] font-[900] color-text">
              Grand Total
            </Text>
            <Text className="text-[20px] font-[900] color-primary">
              ₹{grandTotal}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Checkout */}
      <View className="absolute bottom-0 left-0 right-0 bg-card px-6 pt-6 pb-12 rounded-t-[40px] border-t border-border shadow-2xl flex-row justify-between items-center">
        <TouchableOpacity
          className="flex-1 mr-6"
          onPress={() => setShowPaymentModal(true)}
        >
          <View className="flex-row items-center mb-1">
            <Text className="text-[10px] font-[900] color-textSecondary uppercase tracking-widest mr-1">
              Pay via
            </Text>
            <Ionicons name="caret-up" size={10} color={Colors.textSecondary} />
          </View>
          <View className="flex-row items-center">
            {selectedPaymentOption && (
              <Ionicons
                name={selectedPaymentOption.icon as any}
                size={16}
                color={Colors.primary}
                className="mr-2"
              />
            )}
            <Text
              className="text-[15px] font-[800] color-text"
              numberOfLines={1}
            >
              {selectedPaymentOption?.label || "Select Mode"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`bg-primary h-14 w-[180px] rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 ${isLoading ? "opacity-70" : ""}`}
          disabled={!selectedPaymentMethod || isLoading}
          onPress={handleBooking}
        >
          <View className="flex-row items-center">
            <Text className="text-[16px] font-[900] color-black">
              {isLoading ? "Processing" : "Pay ₹" + grandTotal}
            </Text>
            {!isLoading && (
              <Ionicons
                name="arrow-forward"
                size={18}
                color="#000"
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Payment Options Bottom Sheet */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View className="flex-1 justify-end">
          <TouchableWithoutFeedback onPress={() => setShowPaymentModal(false)}>
            <View className="flex-1 bg-black/60" />
          </TouchableWithoutFeedback>
          <View className="bg-card rounded-t-[40px] px-8 pt-4 pb-12 shadow-2xl border-t border-border">
            <View className="w-10 h-1 bg-border/50 rounded-full self-center mb-8" />

            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-[22px] font-[900] color-text">
                Payment Method
              </Text>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                className="p-1"
              >
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {paymentOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  className={`flex-row items-center p-5 rounded-[24px] mb-4 border ${
                    selectedPaymentMethod === option.id
                      ? "bg-primary/10 border-primary"
                      : "bg-background/50 border-border"
                  }`}
                  onPress={() => {
                    setSelectedPaymentMethod(option.id);
                    setShowPaymentModal(false);
                  }}
                >
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

                  <View className="flex-1">
                    <Text
                      className={`text-[15px] font-[800] ${selectedPaymentMethod === option.id ? "color-text" : "color-text"}`}
                    >
                      {option.label}
                    </Text>
                    <Text className="text-[12px] color-textSecondary font-[500] mt-0.5">
                      {option.subLabel}
                    </Text>
                  </View>

                  <Ionicons
                    name={option.icon as any}
                    size={22}
                    color={
                      selectedPaymentMethod === option.id
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
