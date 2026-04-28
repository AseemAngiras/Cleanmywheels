import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors } from "@/constants/Colors";
import React from "react";
import {
  ActivityIndicator,
  NativeModules,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useAlert } from "@/components/providers/AlertProvider";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { InteractivePressable } from "@/components/ui/InteractivePressable";
import RazorpayCheckout from "react-native-razorpay";
import {
  useCreateSubscriptionMutation,
  useGetPlansQuery,
  useVerifySubscriptionMutation,
} from "@/store/api/subscriptionApi";
import { useGetProfileQuery } from "@/store/api/authApi";
import { useGetVehiclesQuery } from "@/store/api/vehicleApi";
import { useGetAddressesQuery } from "@/store/api/addressApi";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatPrice } from "@/utils/formatPrice";

const APP_NAME = "CleanMyWheels";
const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "";

const getPriceKey = (type: string) => {
  switch (type?.toLowerCase()?.replace(/\s+/g, "")) {
    case "hatchback":
      return "hatchback";
    case "sedan":
      return "sedan";
    case "suv":
      return "suv";
    case "twowheeler":
    case "bike":
      return "twoWheeler";
    default:
      return "sedan";
  }
};

export default function SubscriptionSummaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();
  const {
    planId,
    vehicleId,
    timeSlot,
    startDate,
    isAutoPay,
    frequencyType = "TWICE_MONTHLY",
    addons: addonsStr,
  } = useLocalSearchParams();

  const selectedAddons = React.useMemo(() => {
    try {
      return addonsStr ? JSON.parse(addonsStr as string) : [];
    } catch {
      return [];
    }
  }, [addonsStr]);

  const { data: plans } = useGetPlansQuery();
  const { data: vehicles } = useGetVehiclesQuery();
  const { data: addressesResponse, isLoading: isLoadingAddresses } =
    useGetAddressesQuery();
  const { data: userProfile } = useGetProfileQuery({});

  const [createSubscription, { isLoading: isCreating }] =
    useCreateSubscriptionMutation();
  const [verifySubscription] = useVerifySubscriptionMutation();

  const selectedPlan = plans?.find((p) => p._id === planId);
  const selectedVehicle = vehicles?.find((v: any) => v._id === vehicleId);

  const defaultAddressId = useSelector(
    (state: RootState) => state.profile.defaultAddressId,
  );

  const addressList =
    addressesResponse?.data?.addressList || addressesResponse?.data || [];

  const defaultAddress =
    addressList.find(
      (a: any) =>
        a._id === defaultAddressId || a.id === defaultAddressId || a.isDefault,
    ) || addressList[0];

  const defaultAddressStr = defaultAddress
    ? defaultAddress.fullAddress ||
      `${defaultAddress.houseOrFlatNo}, ${defaultAddress.locality}, ${defaultAddress.city} - ${defaultAddress.postalCode}`
    : "Your Registered Address";

  if (!selectedPlan || !selectedVehicle) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const priceKey = getPriceKey(selectedVehicle?.vehicleType || "Sedan") as
    | "hatchback"
    | "sedan"
    | "suv"
    | "twoWheeler";

  const basePrice =
    (selectedPlan.prices as any)?.[priceKey]?.[frequencyType as any] ||
    selectedPlan.price ||
    0;

  const totalAddonsCost = (selectedAddons as any[]).reduce(
    (sum: number, a: any) => {
      const freqPrice = a.priceMatrix?.[frequencyType as string];
      if (freqPrice && freqPrice > 0) {
        return sum + freqPrice;
      }
      const perServicePrice = a.subscriptionPrice || a.price || 0;
      return sum + perServicePrice;
    },
    0,
  );

  const finalPrice = Math.round(basePrice + totalAddonsCost);

  const handlePayment = async () => {
    if (!selectedPlan || !selectedVehicle) {
      showAlert({
        title: "Error",
        message: "Required selection data missing.",
        type: "error",
      });
      return;
    }

    try {
      const response = await createSubscription({
        planId: selectedPlan._id,
        vehicleId: selectedVehicle._id,
        timeSlot: timeSlot as string,
        startDate: startDate as string,
        isAutoPay: isAutoPay === "true",
        frequencyType: frequencyType as string,
        addons: selectedAddons,
      }).unwrap();

      const {
        subscriptionId,
        paymentLinkUrl,
        id: orderId,
        razorpaySubscriptionId,
      } = response;

      if (paymentLinkUrl) {
        const confirmationParams = {
          addons: JSON.stringify(selectedAddons),
          grandTotal: String(finalPrice),
          vehicleType: selectedVehicle.vehicleType,
          vehicleNumber: selectedVehicle.vehicleNo,
          serviceDate: startDate as string,
          serviceName: selectedPlan.name,
                  address: defaultAddressStr,
          timeSlot: timeSlot as string,
        };

        if (!NativeModules.RazorpayCheckout || !razorpaySubscriptionId) {
          router.push({
            pathname: "/(tabs)/home/book-doorstep/payment-webview",
            params: {
              url: paymentLinkUrl,
              bookingId: subscriptionId,
              type: "SUBSCRIPTION",
              ...confirmationParams,
            },
          } as any);
          return;
        }
      }

      const user = userProfile?.data || userProfile;

      const options: any = {
        description: `Subscription for ${selectedPlan.name}`,
        image: "https://placehold.co/400?text=CleanMyWheels",
        currency: "INR",
        key: RAZORPAY_KEY,
        name: APP_NAME,
        theme: { color: Colors.primary },
        prefill: {
          email: user?.email || "test@example.com",
          contact: user?.phone || "9999999999",
        },
      };

      if (razorpaySubscriptionId) {
        options.subscription_id = razorpaySubscriptionId;
      } else {
        options.order_id = orderId || response.id;
        options.amount = response.amount || finalPrice * 100;
        options.recurring = isAutoPay === "true";
      }

      if (!NativeModules.RazorpayCheckout) {
        showAlert({
          title: "Error",
          message: "Native Payment Module Missing and no Web Link provided.",
          type: "error",
        });
        return;
      }

      RazorpayCheckout.open(options)
        .then(async (data: any) => {
          setTimeout(async () => {
            await verifySubscription({
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              razorpay_signature: data.razorpay_signature,
              razorpay_subscription_id: data.razorpay_subscription_id,
              subscriptionId,
            }).unwrap();

            router.replace({
              pathname: "/subscription-flow/order-confirmation",
              params: {
                status: "success",
                grandTotal: String(finalPrice),
                vehicleType: selectedVehicle.vehicleType,
                vehicleNumber: selectedVehicle.vehicleNo,
                serviceDate: startDate as string,
                serviceName: selectedPlan.name,
                address:
                  defaultAddress?.fullAddress ||
                  (defaultAddress
                    ? `${defaultAddress.houseOrFlatNo}, ${defaultAddress.locality}, ${defaultAddress.city}`
                    : "Your Registered Address"),
                paymentMethod: "Online",
                selectedDate: startDate as string,
                selectedTime: timeSlot as string,
                frequencyType: frequencyType as string,
              },
            } as any);
          }, 5000);
        })
        .catch((error: any) => {
          showAlert({
            title: "Payment Cancelled",
            message: error.description || "Payment failed",
            type: "warning",
          });
        });
    } catch (err: any) {
      showAlert({
        title: "Error",
        message: err?.data?.message || "Failed to initiate subscription",
        type: "error",
      });
    }
  };

  if (!selectedPlan || !selectedVehicle) {
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
          <InteractivePressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-background items-center justify-center border border-border"
          >
            <Ionicons name="arrow-back" size={20} color={Colors.text} />
          </InteractivePressable>
          <Text className="text-[20px] font-[700] color-text ml-4">
            Order Summary
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16 }}
        >
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 bg-card rounded-[24px] p-5 mr-3 border border-border shadow-sm">
              <Text className="text-[12px] font-[700] color-textSecondary mb-2 tracking-widest uppercase">
                Plan
              </Text>
              <Text
                className="text-[16px] font-[800] text-text mb-1"
                numberOfLines={1}
              >
                {selectedPlan.name}
              </Text>
              <Text className="text-[14px] font-[700] color-primary">
                ₹{formatPrice(basePrice)}
              </Text>
            </View>
            <View className="flex-1.2 bg-card rounded-[24px] p-5 border border-border shadow-sm">
              <Text className="text-[12px] font-[700] color-textSecondary mb-2 tracking-widest uppercase">
                Vehicle
              </Text>
              <Text
                className="text-[16px] font-[800] text-text mb-1"
                numberOfLines={1}
              >
                {selectedVehicle.vehicleNo}
              </Text>
              <Text className="text-[14px] font-[600] color-textSecondary">
                {selectedVehicle.vehicleType}
              </Text>
            </View>
          </View>

          <View className="bg-card rounded-[24px] p-5 mb-4 border border-border shadow-sm">
            <Text className="text-[13px] font-[700] color-textSecondary mb-4 tracking-widest uppercase">
              Service Timing
            </Text>
            <View className="flex-row justify-between mb-3 items-center">
              <Text className="text-sm font-[500] color-textSecondary">
                Time Slot
              </Text>
              <View className="bg-background px-3 py-1.5 rounded-full border border-border/50">
                <Text className="text-sm font-[700] color-text">
                  {timeSlot}
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-[500] color-textSecondary">
                Starts From
              </Text>
              <Text className="text-sm font-[700] color-text">
                {new Date(startDate as string).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>
          </View>

          {selectedAddons.length > 0 && (
            <View className="bg-card rounded-[24px] p-5 mb-4 border border-border shadow-sm">
              <Text className="text-[13px] font-[700] color-textSecondary mb-4 tracking-widest uppercase">
                Add-ons Included
              </Text>
              {selectedAddons.map((addon: any, index: number) => (
                <View
                  key={addon._id || index}
                  className={`flex-row justify-between items-center ${index !== 0 ? "mt-3 pt-3 border-t border-border/30" : ""}`}
                >
                  <View className="flex-row items-center flex-1">
                    <MaterialCommunityIcons
                      name={(addon.icon as any) || "sparkles"}
                      size={18}
                      color={Colors.primary}
                    />
                    <Text
                      className="text-[14px] font-[600] color-text ml-2 flex-1"
                      numberOfLines={1}
                    >
                      {addon.name}
                    </Text>
                  </View>
                  <Text className="text-[14px] font-[700] color-text">
                    +₹
                    {addon.priceMatrix?.[frequencyType as string] &&
                    addon.priceMatrix[frequencyType as string] > 0
                      ? formatPrice(addon.priceMatrix[frequencyType as string])
                      : formatPrice(addon.subscriptionPrice || addon.price || 0)}
                  </Text>
                </View>
              ))}
              <View className="mt-4 pt-4 border-t border-border/50 flex-row justify-between items-center">
                <Text className="text-[12px] font-[700] color-textSecondary uppercase tracking-widest">
                  Total Add-on Cost (Monthly)
                </Text>
                <Text className="text-[14px] font-[800] color-primary">
                  ₹{formatPrice(totalAddonsCost)}
                </Text>
              </View>
            </View>
          )}

          <View className="bg-card rounded-[24px] p-5 mb-4 border border-border shadow-sm">
            <Text className="text-[13px] font-[700] color-textSecondary mb-4 tracking-widest uppercase">
              Service Address
            </Text>
            {isLoadingAddresses ? (
              <ActivityIndicator color={Colors.primary} />
            ) : (
              <View>
                <View className="flex-row bg-primary/10 p-4 rounded-2xl mb-4 items-start border border-primary/20">
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color={Colors.primary}
                  />
                  <Text className="text-[12px] color-textSecondary ml-3 flex-1 leading-5">
                    This subscription uses your{" "}
                    <Text className="font-[800] color-text">
                      Default Address
                    </Text>
                    . You can update it in your profile.
                  </Text>
                </View>

                <View className="flex-row items-start bg-background p-4 rounded-2xl border border-border">
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                    <Ionicons
                      name="location"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[12px] font-[700] color-textSecondary mb-1 tracking-widest uppercase">
                      Current Default Address
                    </Text>
                    <Text className="text-[14px] color-text leading-5 font-[500]">
                      {defaultAddress ? defaultAddressStr : "No default address found. Service will be provided at your registered location."}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          <View className="mt-4 px-2">
            <View className="flex-row justify-between mb-3 items-center">
              <Text className="text-[15px] font-[600] color-textSecondary">
                Frequency (
                {selectedPlan.frequencies?.find((f) => f.type === frequencyType)
                  ?.label || "2 Times a Month"}
                )
              </Text>
              <Text className="text-[16px] font-[700] color-text">
                ₹{formatPrice(finalPrice)}
              </Text>
            </View>
            <View className="h-[1px] bg-border/50 w-full my-4" />
            <View className="flex-row justify-between items-center">
              <Text className="text-[18px] font-[800] color-text">
                Grand Total
              </Text>
              <Text className="text-[22px] font-[900] color-primary">
                ₹{formatPrice(finalPrice)}
              </Text>
            </View>
          </View>

          <View className="h-10" />
        </ScrollView>

        <View 
          className="p-6 bg-card border-t border-border/50 shadow-2xl"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <InteractivePressable
            className={`bg-primary py-5 rounded-2xl items-center shadow-lg shadow-primary/30 ${isCreating ? "opacity-70" : ""}`}
            onPress={handlePayment}
            disabled={isCreating}
          >
            {isCreating ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="color-black text-[16px] font-[800]">
                Pay ₹{formatPrice(finalPrice)}
              </Text>
            )}
          </InteractivePressable>
        </View>
      </View>
    </ScreenWrapper>
  );
}
