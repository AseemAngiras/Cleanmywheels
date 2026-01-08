import { RootState } from "@/store";
import {
  useCreateBookingMutation,
  useLazyGetBookingByIdQuery,
  useUpdateBookingStatusMutation,
} from "@/store/api/bookingApi";
import { logout } from "@/store/slices/authSlice";
import { addAddress } from "@/store/slices/profileSlice";
import { addCar } from "@/store/slices/userSlice";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import BookingStepper from "../../../../components/BookingStepper";

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
  const [createBooking, { isLoading: isCreatingBooking }] =
    useCreateBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const authState = useSelector((state: RootState) => state.auth);

  // Payment state tracking
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const currentBookingIdRef = useRef<string | null>(null);

  const [triggerGetBooking] = useLazyGetBookingByIdQuery();

  const {
    serviceName,
    servicePrice,
    addons,
    vehicleType,
    vehicleNumber,
    shopName,
    shopLat,
    shopLong,
    selectedDate,
    selectedTime,

    userPhone,
    userName,

    address,
    latitude,
    longitude,

    totalPrice,
    serviceId,
  } = params;

  const lat = parseFloat(latitude as string) || 37.7749;
  const long = parseFloat(longitude as string) || -122.4194;

  const isDoorstep = shopName === "Your Location";

  const itemTotal = parseFloat(totalPrice as string) || 0;
  const taxAmount = Math.round(itemTotal * 0.18);
  const grandTotal = itemTotal + taxAmount;

  const parsedAddons = addons ? JSON.parse(addons as string) : {};
  const addonNames = Object.keys(parsedAddons).filter((k) => parsedAddons[k]);

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
  }, [navigation]);

  const checkPaymentStatus = async (bookingId: string) => {
    setIsVerifyingPayment(true);
    let attempts = 0;
    const maxAttempts = 10;

    // Poll every 3 seconds for 30 seconds total
    const pollInterval = setInterval(async () => {
      attempts++;
      try {
        console.log(
          `[Payment] Polling status... Attempt ${attempts}/${maxAttempts}`
        );
        const result = await triggerGetBooking(bookingId).unwrap();
        const status = result?.data?.status?.toLowerCase();

        console.log(`[Payment] Status received:`, status);

        if (
          status === "confirmed" ||
          status === "paid" ||
          status === "successful"
        ) {
          console.log("✅ [Payment] SUCCESS! Status is:", status);
          console.log("✅ [Payment] Redirecting to Order Confirmation...");
          clearInterval(pollInterval);
          setIsVerifyingPayment(false);
          router.push({
            pathname: "/(tabs)/home/book-doorstep/order-confirmation",
            params: {
              ...params,
              grandTotal,
              bookingId,
              paymentMethod: "razorpay",
            },
          });
        } else if (status === "cancelled" || status === "failed") {
          clearInterval(pollInterval);
          setIsVerifyingPayment(false);
          Alert.alert("Payment Failed", "The payment was cancelled or failed.");
        } else if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setIsVerifyingPayment(false);
          Alert.alert(
            "Payment Verification Failed",
            "We couldn't confirm your payment status yet. Please check 'My Bookings'.",
            [
              {
                text: "Check Bookings",
                onPress: () => router.push("/(tabs)/bookings"),
              },
              { text: "Close", style: "cancel" },
            ]
          );
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);
  };

  const handlePay = async () => {
    try {
      const addressParts =
        (address as string)?.split(",").map((s) => s.trim()) || [];

      const houseNumRaw = addressParts[0] || "0";
      const houseNumClean = houseNumRaw.trim();

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

      console.log("🛠 [BookingSummary] Address Raw:", address);

      const finalWashPackageId = serviceId as string;

      if (!finalWashPackageId || finalWashPackageId.length !== 24) {
        Alert.alert(
          "Selection Error",
          "Invalid wash package selected. Please go back and select a service again."
        );
        return;
      }

      const cityPart =
        addressParts.find(
          (part, index) => index >= 2 && !/^\d{6}$/.test(part)
        ) ||
        addressParts[2] ||
        "City";

      const bookingPayload: any = {
        houseOrFlatNo: String(houseNumClean),
        locality: String(addressParts[1] || "Locality"),
        landmark: String(addressParts[2] || "Landmark"),
        city: String(cityPart),
        postalCode: postalCode,
        addressType: "Home",
        washPackage: finalWashPackageId,
        vehicleType:
          VEHICLE_TYPE_MAP[(vehicleType as string)?.toLowerCase()] ||
          (vehicleType as string) ||
          "Sedan",
        vehicleNo: String(vehicleNumber ? (vehicleNumber as string) : "N/A"),
        bookingDate: selectedDate
          ? (selectedDate as string)
          : new Date().toISOString().split("T")[0],
        bookingTime: Number(hour),
        address: params.addressId as string,
        serviceName: (serviceName as string) || "Premium Wash",
      };

      console.log(
        "[BookingSummary] TRACE - Payload:",
        JSON.stringify(bookingPayload, null, 2)
      );
      const response = await createBooking(bookingPayload).unwrap();
      console.log("[BookingSummary] TRACE - Response:", response);

      // Save address to Redux profile
      if (address) {
        dispatch(
          addAddress({
            id: `addr-${Date.now()}`,
            flatNumber: String(houseNumClean),
            locality: String(addressParts[1] || "Locality"),
            landmark: String(addressParts[2] || ""),
            city: String(cityPart),
            postalCode: postalCode,
            addressType: "Home",
            fullAddress: address as string,
          })
        );
      }

      // Save vehicle to Redux user cars
      if (vehicleNumber) {
        dispatch(
          addCar({
            id: `car-${Date.now()}`,
            name: `${vehicleType || "Car"}`,
            type:
              VEHICLE_TYPE_MAP[(vehicleType as string)?.toLowerCase()] ||
              "Sedan",
            number: vehicleNumber as string,
            image: "https://cdn-icons-png.flaticon.com/512/743/743007.png",
          })
        );
      }

      const paymentUrl =
        response?.data?.paymentLinkUrl || response?.data?.short_url;

      console.log(
        "[BookingSummary] DEBUG - Raw Response Keys:",
        Object.keys(response || {})
      );
      if (response?.data)
        console.log(
          "[BookingSummary] DEBUG - Response.data Keys:",
          Object.keys(response.data || {})
        );

      // Try multiple paths for ID
      const bookingId =
        response?.data?.bookingId ||
        response?.data?._id ||
        response?.bookingId ||
        response?._id;

      if (!bookingId || bookingId === "temp-id") {
        console.error(
          "[BookingSummary] ❌ CRITICAL: No Booking ID found in response!",
          response
        );
        Alert.alert(
          "Error",
          "Could not create booking. Please try again. (Missing ID)"
        );
        return;
      }

      console.log("[BookingSummary] ✅ Booking ID Extracted:", bookingId);

      currentBookingIdRef.current = bookingId;

      // 2. Open AuthSession & Wait for Return
      let result = { type: "cancel" };
      if (paymentUrl) {
        console.log(
          "[BookingSummary] Opening Razorpay AuthSession:",
          paymentUrl
        );
        try {
          // @ts-ignore
          result = await WebBrowser.openAuthSessionAsync(
            paymentUrl,
            "cleanmywheels://payment-success"
          );
        } catch (e) {
          console.log("Browser Error", e);
        }
      }

      // 3. Handle Result
      // 3. Handle Result + Fallback
      if (result.type === "success") {
        // Auto-redirected! Success!
        // Verify via backend polling just to be safe (and show UI feedback)
        checkPaymentStatus(bookingId);
      } else {
        // 4. Fallback: If dismissed/cancelled
        // User might have paid but closed the tab manually. Poll to confirm.
        checkPaymentStatus(bookingId);
      }
    } catch (err: any) {
      console.error(
        "❌ [BookingSummary] FULL ERROR OBJECT:",
        JSON.stringify(err, null, 2)
      );
      if (err.status === 401) {
        Alert.alert(
          "Session Expired",
          "Your technical session has expired or is invalid. Please log out and log in again.",
          [{ text: "OK", onPress: () => dispatch(logout()) }]
        );
      } else {
        const errorMsg =
          err?.data?.message ||
          err?.message ||
          "Something went wrong while creating your booking.";
        Alert.alert("Booking Failed", errorMsg);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Summary</Text>
        <View style={{ width: 40 }} />
      </View>

      <BookingStepper
        currentStep={3}
        steps={[
          { id: 1, label: "Service" },
          { id: 2, label: "Slot" },
          { id: 3, label: "Payment" },
        ]}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* Service Location */}
        <View style={[styles.card, { marginTop: 10 }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.shopIconContainer}>
              <Ionicons name="home" size={20} color="#fbc02d" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pinShopName}>Service Location</Text>
              <Text style={styles.pinShopAddress} numberOfLines={1}>
                {address || "Your Address"}
              </Text>
            </View>
          </View>
        </View>

        {/* Booking Details Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Booking Details</Text>

          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="sparkles" size={20} color="#555" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Service</Text>
              <Text style={styles.value}>{serviceName || "Premium Wash"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="car-sport" size={20} color="#555" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Vehicle</Text>
              <Text style={styles.value}>
                {vehicleType
                  ? (vehicleType as string).charAt(0).toUpperCase() +
                  (vehicleType as string).slice(1)
                  : "Same"}{" "}
                - {vehicleNumber || "N/A"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar" size={20} color="#555" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Date & Time</Text>
              <Text style={styles.value}>
                {selectedDate
                  ? new Date(selectedDate as string).toLocaleDateString(
                    undefined,
                    { weekday: "short", day: "numeric", month: "short" }
                  )
                  : "Date"}
                , {selectedTime || "Time"}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>{serviceName || "Service"}</Text>
            <Text style={styles.paymentValue}>₹{servicePrice || 0}</Text>
          </View>

          {Array.isArray(parsedAddons) &&
            parsedAddons.map((addon: any) => (
              <View key={addon.id} style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>{addon.name}</Text>
                <Text style={styles.paymentValue}>+₹{addon.price}</Text>
              </View>
            ))}

          <View style={styles.totalDivider} />

          <View style={styles.paymentRow}>
            <Text style={styles.totalTextLabel}>Tax (18% GST)</Text>
            <Text style={styles.totalTextValue}>₹{taxAmount}</Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.paymentRow}>
            <Text style={styles.totalTextLabel}>Grand Total</Text>
            <Text style={styles.totalTextValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.payButton,
            isCreatingBooking && styles.payButtonDisabled,
          ]}
          disabled={isCreatingBooking}
          onPress={handlePay}
        >
          <View style={styles.payButtonContent}>
            <View style={styles.payButtonPriceContainer}>
              <Text style={styles.payButtonPriceText}>₹{grandTotal}</Text>
              <Text style={styles.payButtonTotalLabel}>TOTAL</Text>
            </View>
            <View style={styles.payButtonActionContainer}>
              <Text style={styles.payButtonActionText}>
                {isCreatingBooking ? "Processing..." : "Pay Now"}
              </Text>
              {!isCreatingBooking && (
                <Ionicons
                  name="caret-forward"
                  size={16}
                  color="#1a1a1a"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {isVerifyingPayment && (
        <View style={styles.modalOverlay}>
          <View style={[styles.card, { padding: 30, alignItems: "center" }]}>
            <ActivityIndicator size="large" color="#C8F000" />
            <Text style={{ marginTop: 20, fontSize: 16, fontWeight: "bold" }}>
              Verifying Payment...
            </Text>
            <Text style={{ marginTop: 10, color: "#666", textAlign: "center" }}>
              Please wait while we confirm with the bank.
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#f9f9f9",
  },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },

  mapContainer: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 10,
    marginBottom: 20,
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    bottom: 15,
    left: 15,
    right: 15,
  },
  shopPinCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 15,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  shopIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff3e0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  pinShopName: { fontSize: 14, fontWeight: "bold", color: "#1a1a1a" },
  pinShopAddress: { fontSize: 10, color: "#666", marginTop: 2 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  paymentTitle: {
    marginLeft: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  rowContent: {
    flex: 1,
  },
  label: { fontSize: 12, color: "#888", marginBottom: 2 },
  value: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 12,
    marginLeft: 51,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  paymentLabel: { fontSize: 14, color: "#666" },
  paymentValue: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  totalDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  totalTextLabel: { fontSize: 16, fontWeight: "bold", color: "#1a1a1a" },
  totalTextValue: { fontSize: 18, fontWeight: "bold", color: "#1a1a1a" },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  paymentMethodSelector: {
    flex: 1,
    marginRight: 15,
    justifyContent: "center",
  },
  payUsingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  payUsingText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#888",
    textTransform: "uppercase",
  },
  selectedMethodText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  payButton: {
    backgroundColor: "#C8F000",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1.2,
    height: 50,
    justifyContent: "center",
  },
  payButtonDisabled: {
    backgroundColor: "#f0f0f0",
    opacity: 0.7,
  },
  payButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  payButtonPriceContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  payButtonPriceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  payButtonTotalLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1a1a1a",
    opacity: 0.6,
  },
  payButtonActionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  payButtonActionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  modalScroll: {
    paddingBottom: 20,
  },

  optionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
    position: "relative",
    overflow: "hidden",
  },
  optionCardSelected: {
    borderColor: "#84c95c",
    backgroundColor: "#f8fff5",
  },
  recommendedBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FFEB3B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 10,
  },
  recommendedText: { fontSize: 10, fontWeight: "bold", color: "#1a1a1a" },
  optionRow: { flexDirection: "row", alignItems: "flex-start" },
  radioContainer: { marginRight: 15, paddingTop: 2 },
  radioInfo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioUnselected: { borderColor: "#ddd" },
  radioSelected: { borderColor: "#84c95c" },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#84c95c",
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  optionContent: { flex: 1 },
  optionLabel: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  optionSubLabel: { fontSize: 12, color: "#888", marginBottom: 5 },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  securityText: { fontSize: 12, color: "#999", marginLeft: 5 },
});
