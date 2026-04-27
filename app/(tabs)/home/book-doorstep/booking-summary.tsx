import { RootState } from "@/store";
import { Colors } from "@/constants/Colors";
import { toast } from "@/utils/toast";
import {
  useCreateBookingMutation,
  useLazyGetBookingByIdQuery,
} from "@/store/api/bookingApi";
import { useGetAddonsQuery } from "@/store/api/subscriptionApi";
import { logout } from "@/store/slices/authSlice";
import { addAddress } from "@/store/slices/profileSlice";
import { addCar } from "@/store/slices/userSlice";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { WebView } from "react-native-webview";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useAlert } from "@/components/providers/AlertProvider";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import BookingStepper from "../../../../components/BookingStepper";
import PulseLoader from "../../../../components/PulseLoader";
import socketService from "@/services/socketService";
import { InteractivePressable } from "@/components/ui/InteractivePressable";

const VEHICLE_TYPE_MAP: Record<string, string> = {
  sedan: "Sedan",
  suv: "SUV",
  hatchback: "Hatchback",
  luxury: "Luxury",
  bike: "Bike",
  scooter: "Scooter",
  others: "Car",
};

export default function BookingSummaryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const dispatch = useDispatch();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const [createBooking, { isLoading: isCreatingBooking }] =
    useCreateBookingMutation();
  const [triggerGetBooking] = useLazyGetBookingByIdQuery();

  const userState = useSelector((state: RootState) => state.user);
  const token = useSelector((state: RootState) => state.auth.token);
  const userId = userState?.user?._id;

  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [showGateway, setShowGateway] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState("");
  const currentBookingIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<any | null>(null);

  const {
    serviceName,
    servicePrice,
    addons,
    vehicleType,
    vehicleNumber,
    selectedDate,
    selectedTime,
    address,
    serviceId,
    addressType,
  } = params;

  const { data: addonsList } = useGetAddonsQuery(undefined);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  useEffect(() => {
    try {
      if (addons) {
        setSelectedAddons(JSON.parse(addons as string));
      }
    } catch (e) {
      console.log("Error parsing addons", e);
    }
  }, [addons]);

  const toggleAddon = useCallback((addon: any) => {
    setSelectedAddons((prev) => {
      const addonId = addon.id || addon._id;
      const exists = prev.find((a) => (a.id || a._id) === addonId);
      if (exists) {
        return prev.filter((a) => (a.id || a._id) !== addonId);
      } else {
        return [...prev, addon];
      }
    });
  }, []);

  const displayServicePrice = parseFloat(servicePrice as string) || 0;
  const addonsTotal = useMemo(() => {
    return Array.isArray(selectedAddons)
      ? selectedAddons.reduce(
          (acc: number, curr: any) => acc + (parseFloat(curr.price) || 0),
          0,
        )
      : 0;
  }, [selectedAddons]);

  const displayGrandTotal = useMemo(() => {
    return displayServicePrice + addonsTotal;
  }, [displayServicePrice, addonsTotal]);

  useEffect(() => {
    navigation.getParent()?.setOptions({ tabBarStyle: { display: "none" } });
  }, [navigation]);

  useEffect(() => {
    if (userId && token) socketService.connect(userId, token);

    const handlePaymentSuccess = (data: any) => {
      const { bookingId } = data;
      if (
        currentBookingIdRef.current &&
        bookingId === currentBookingIdRef.current &&
        isVerifyingPayment
      ) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setIsVerifyingPayment(false);
        setShowGateway(false);
        router.push({
          pathname: "/(tabs)/home/book-doorstep/order-confirmation",
          params: {
            ...params,
            grandTotal: displayGrandTotal,
            bookingId,
            paymentMethod: "razorpay",
          },
        });
      }
    };

    socketService.on("payment_success", handlePaymentSuccess);
    return () => {
      socketService.off("payment_success");
    };
  }, [userId, token, isVerifyingPayment, params, displayGrandTotal, router]);

  const checkPaymentStatus = async (
    bookingId: string,
    isOneTimeCheck: boolean = false,
  ) => {
    setIsVerifyingPayment(true);
    let attempts = 0;
    const maxAttempts = 10;

    const performCheck = async (isFinalOneTime: boolean = false) => {
      attempts++;
      try {
        const result = await triggerGetBooking(bookingId).unwrap();
        const status = result?.data?.status?.toLowerCase();
        if (
          status === "confirmed" ||
          status === "paid" ||
          status === "successful"
        ) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsVerifyingPayment(false);
          setShowGateway(false);
          router.push({
            pathname: "/(tabs)/home/book-doorstep/order-confirmation",
            params: {
              ...params,
              grandTotal: displayGrandTotal,
              bookingId,
              paymentMethod: "razorpay",
            },
          });
          return true;
        } else if (status === "cancelled" || status === "failed") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsVerifyingPayment(false);
          setShowGateway(false);
          router.push({
            pathname: "/(tabs)/home/book-doorstep/payment-failed",
            params: {
              ...params,
              grandTotal: displayGrandTotal,
              bookingId,
            },
          });
          return true;
        } else if (isFinalOneTime) {
          setIsVerifyingPayment(false);
          setShowGateway(false);
          router.push({
            pathname: "/(tabs)/home/book-doorstep/payment-failed",
            params: {
              ...params,
              grandTotal: displayGrandTotal,
              bookingId,
            },
          });
          return true;
        } else if (!isOneTimeCheck && attempts >= maxAttempts) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setIsVerifyingPayment(false);
          setShowGateway(false);
          showAlert({
            title: "Verification Pending",
            message: "Payment confirmation is taking longer. Check 'My Bookings' later.",
            type: "info",
            buttons: [
              {
                text: "My Bookings",
                onPress: () => router.push("/(tabs)/bookings"),
              },
              { text: "Close", style: "cancel" },
            ],
          });
          return true; // Stop
        }
        return false; // Continue
      } catch (err) {
        console.log("Poll err", err);
        return false;
      }
    };

    if (isOneTimeCheck) {
      setTimeout(async () => {
        await performCheck(true);
      }, 2000);
      return;
    }

    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      const stopped = await performCheck();
      if (stopped && pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }, 5000);
  };

  const handlePay = async () => {
    try {
      const addressParts =
        (address as string)?.split(",").map((s) => s.trim()) || [];
      const postalCodeMatch = (address as string)?.match(/\b\d{6}\b/);
      const postalCode = postalCodeMatch ? postalCodeMatch[0] : "000000";

      let hour = 10;
      if (selectedTime) {
        const [time, modifier] = (selectedTime as string).split(" ");
        let [h] = time.split(":").map(Number);
        if (modifier === "PM" && h < 12) h += 12;
        if (modifier === "AM" && h === 12) h = 0;
        hour = h;
      }

      const bookingPayload: any = {
        houseOrFlatNo: String(addressParts[0] || "0"),
        locality: String(addressParts[1] || "Locality"),
        landmark: String(addressParts[2] || "Landmark"),
        city: String(addressParts[2] || "City"), // Fallback to index 2 or 1
        postalCode: postalCode,
        addressType: (addressType as string) || "Home",
        washPackage: serviceId as string,
        vehicleType:
          VEHICLE_TYPE_MAP[(vehicleType as string)?.toLowerCase()] ||
          (vehicleType as string) ||
          "Sedan",
        vehicleNo: String(vehicleNumber || "N/A"),
        bookingDate: selectedDate
          ? (selectedDate as string)
          : new Date().toISOString().split("T")[0],
        bookingTime: Number(hour),
        addons: selectedAddons.map((a: any) => a.id || a._id),
      };

      const response = await createBooking(bookingPayload).unwrap();

      // Save info locally
      if (address) {
        dispatch(
          addAddress({
            id: `addr-${Date.now()}`,
            houseOrFlatNo: bookingPayload.houseOrFlatNo,
            locality: bookingPayload.locality,
            landmark: bookingPayload.landmark,
            city: bookingPayload.city,
            postalCode: postalCode,
            addressType: ((addressType as string) || "Home") as any,
            fullAddress: address as string,
          }),
        );
      }
      if (vehicleNumber) {
        dispatch(
          addCar({
            id: `car-${Date.now()}`,
            name: `${vehicleType || "Car"}`,
            type: bookingPayload.vehicleType,
            number: vehicleNumber as string,
            image: "",
          }),
        );
      }

      const bookingId =
        response?.data?.bookingId || response?.data?._id || response?.bookingId;
      if (!bookingId) throw new Error("No booking ID");

      currentBookingIdRef.current = bookingId;
      const paymentLink =
        response?.data?.paymentLinkUrl || response?.data?.short_url;

      if (paymentLink) {
        setPaymentUrl(paymentLink);
        setShowGateway(true);
        checkPaymentStatus(bookingId);
      } else checkPaymentStatus(bookingId);
    } catch (err: any) {
      if (err.status === 401) {
        dispatch(logout());
      } else {
        toast.error(
          "Booking Failed",
          err?.data?.message || "Something went wrong",
        );
      }
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
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 150 + insets.bottom,
        }}
      >
        <View className="bg-card p-5 rounded-[32px] border border-border/50 mb-6 shadow-sm">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-yellow-500/10 items-center justify-center mr-4">
              <Ionicons name="location" size={22} color="#EAB308" />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-[800] color-text">
                Service Location
              </Text>
              <Text
                className="text-[12px] color-textSecondary font-[600] mt-0.5"
                numberOfLines={1}
              >
                {address || "Your Address"}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-card p-6 rounded-[32px] border border-border/50 mb-6 shadow-sm">
          <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px] mb-6 px-1">
            Booking Details
          </Text>

          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-4">
              <Ionicons name="sparkles" size={18} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-wider">
                Service
              </Text>
              <Text className="text-[15px] font-[800] color-text mt-0.5">
                {serviceName || "Doorstep Wash"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-6">
            <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-4">
              <Ionicons name="car-sport" size={18} color={Colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-wider">
                Vehicle
              </Text>
              <Text className="text-[15px] font-[800] color-text mt-0.5">
                {vehicleType} - {vehicleNumber}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-4">
              <Ionicons
                name="calendar-clear"
                size={18}
                color={Colors.primary}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[11px] font-[700] color-textSecondary uppercase tracking-wider">
                Schedule
              </Text>
              <Text className="text-[15px] font-[800] color-text mt-0.5">
                {selectedDate
                  ? new Date(selectedDate as string).toLocaleDateString(
                      undefined,
                      { weekday: "short", day: "numeric", month: "short" },
                    )
                  : "N/A"}
                , {selectedTime}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-card p-6 rounded-[32px] border border-border/50 shadow-sm">
          <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px] mb-6 px-1">
            Bills Summary
          </Text>

          <View className="flex-row justify-between mb-4 px-1">
            <Text className="text-[14px] font-[600] color-textSecondary">
              {serviceName}
            </Text>
            <Text className="text-[14px] font-[800] color-text">
              ₹{displayServicePrice}
            </Text>
          </View>

          {selectedAddons.map((addon: any) => (
            <View
              key={addon.id || addon._id}
              className="flex-row justify-between mb-4 px-1 items-center"
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-[14px] font-[600] color-textSecondary">
                  {addon.name}
                </Text>
                <InteractivePressable
                  onPress={() => toggleAddon(addon)}
                  className="ml-2"
                >
                  <Ionicons name="close-circle" size={16} color="#ef4444" />
                </InteractivePressable>
              </View>
              <Text className="text-[14px] font-[800] color-text">
                +₹{addon.price}
              </Text>
            </View>
          ))}

          <View className="my-2 border-t border-border/30 border-dashed w-full h-1" />

          <View className="flex-row justify-between items-center mt-3 px-1">
            <Text className="text-[16px] font-[800] color-text uppercase tracking-tight">
              Amount to Pay
            </Text>
            <Text className="text-[24px] font-[900] color-primary">
              ₹{displayGrandTotal}
            </Text>
          </View>
        </View>

        {/* Enhance Your Wash Section */}
        {addonsList &&
          addonsList.some(
            (a) => !selectedAddons.find((sa) => (sa.id || sa._id) === a._id),
          ) && (
            <View className="mt-8">
              <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px] mb-4 px-1">
                Enhance Your Wash
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 12 }}
              >
                {addonsList
                  .filter(
                    (a) =>
                      !selectedAddons.find((sa) => (sa.id || sa._id) === a._id),
                  )
                  .map((addon: any) => (
                    <InteractivePressable
                      key={addon._id}
                      onPress={() => toggleAddon(addon)}
                      className="bg-card border border-border/50 p-4 rounded-[24px] w-[160px] shadow-sm"
                    >
                      {/* <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mb-3">
                        <MaterialCommunityIcons
                          name={(addon.icon as any) || "sparkles"}
                          size={20}
                          color={Colors.primary}
                        />
                      </View> */}
                      <Text
                        className="text-[13px] font-[800] color-text mb-1"
                        numberOfLines={1}
                      >
                        {addon.name}
                      </Text>
                      <Text className="text-[11px] color-textSecondary mb-3 h-8 leading-4 font-[500]">
                        {addon.description?.substring(0, 40)}...
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[14px] font-[900] color-primary">
                          ₹{addon.price}
                        </Text>
                        <View className="w-7 h-7 rounded-full bg-primary items-center justify-center">
                          <Ionicons name="add" size={18} color="#000" />
                        </View>
                      </View>
                    </InteractivePressable>
                  ))}
              </ScrollView>
            </View>
          )}
      </ScrollView>

      {/* Footer */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-card px-6 pt-6 rounded-t-[44px] border-t border-border shadow-2xl"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <InteractivePressable
          className={`h-14 rounded-2xl flex-row items-center justify-between px-6 shadow-lg ${isCreatingBooking ? "bg-border/30" : "bg-primary shadow-primary/30"}`}
          onPress={handlePay}
          disabled={isCreatingBooking}
        >
          <View className="flex-row items-center">
            <Text className="text-[20px] font-[900] color-black">
              ₹{displayGrandTotal}
            </Text>
            <View className="w-[1px] h-6 bg-black/20 mx-4" />
            <Text className="text-[14px] font-[900] color-black/70">
              PAY NOW
            </Text>
          </View>
          {isCreatingBooking ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Ionicons name="arrow-forward" size={20} color="#000" />
          )}
        </InteractivePressable>
      </View>

      {/* Loading Overlay */}
      {isVerifyingPayment && (
        <View className="absolute inset-0 bg-black/80 items-center justify-center z-[1000] px-10">
          <View className="bg-card p-10 rounded-[40px] border border-border items-center w-full shadow-2xl">
            <PulseLoader size={80} color={Colors.primary} />
            <Text className="text-[20px] font-[900] color-text mt-8 text-center">
              Verifying Payment
            </Text>
            <Text className="text-[14px] color-textSecondary font-[600] mt-3 text-center leading-5">
              Please keep this screen open while we verify your transaction
              status.
            </Text>
          </View>
        </View>
      )}

      {/* Webview Modal */}
      <Modal visible={showGateway} transparent animationType="slide">
        <View 
          className="flex-1 bg-background pt-10"
          style={{ paddingBottom: insets.bottom }}
        >
          <View className="flex-row justify-between items-center px-6 py-4 border-b border-border/30">
            <Text className="text-[18px] font-[800] color-text">
              Secure Checkout
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (pollIntervalRef.current) {
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
                setIsVerifyingPayment(false);
                setShowGateway(false);
                if (currentBookingIdRef.current)
                  checkPaymentStatus(currentBookingIdRef.current, true);
              }}
            >
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: paymentUrl }}
            className="flex-1"
            startInLoadingState
            renderLoading={() => (
              <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator color={Colors.primary} size="large" />
              </View>
            )}
          />
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
