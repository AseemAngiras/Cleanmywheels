import { RootState } from "@/store";
import { useCreateAddressMutation } from "@/store/api/addressApi";
import { useCreateBookingMutation } from "@/store/api/bookingApi";
import { useCreateVehicleMutation } from "@/store/api/vehicleApi";
import { logout } from "@/store/slices/authSlice";
import { addBooking } from "@/store/slices/bookingSlice";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  const [createBooking, { isLoading: isCreatingBooking }] = useCreateBookingMutation();
  const [createAddress] = useCreateAddressMutation();
  const [createVehicle] = useCreateVehicleMutation();
  const currentBooking = useSelector(
    (state: RootState) => state.bookings.currentBooking
  );
  const authState = useSelector((state: RootState) => state.auth);

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


  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >("upi");
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const itemTotal = parseFloat(totalPrice as string) || 0;
  const taxAmount = Math.round(itemTotal * 0.18);
  const grandTotal = itemTotal + taxAmount;

  const paymentOptions = [
    {
      id: "upi",
      label: "UPI",
      subLabel: "Pay via Google Pay, PhonePe, Paytm",
      icon: "wallet-outline",
      recommended: true,
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
    (opt) => opt.id === selectedPaymentMethod
  );

  const parsedAddons = addons ? JSON.parse(addons as string) : {};
  const addonNames = Object.keys(parsedAddons).filter((k) => parsedAddons[k]);

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
  }, [navigation]);

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
        {/* Service Location (No Map) */}
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

          {/* Service Name */}
          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="sparkles" size={20} color="#555" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Service</Text>
              <Text style={styles.value}>
                {serviceName || "Premium Wash"}
              </Text>
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
                  : "Sedan"}{" "}
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

          <View style={styles.divider} />

          <View style={styles.row}>
            <View style={styles.iconBox}>
              <Ionicons name="call" size={20} color="#555" />
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.label}>Contact Number</Text>
              <Text style={styles.value}>+91 {userPhone || "N/A"}</Text>
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

          {Array.isArray(parsedAddons) && parsedAddons.map((addon: any) => (
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
          style={styles.paymentMethodSelector}
          onPress={() => setShowPaymentModal(true)}
        >
          <View style={styles.payUsingRow}>
            {selectedPaymentOption && (
              <Ionicons
                name={selectedPaymentOption.icon as any}
                size={14}
                color="#666"
                style={{ marginRight: 4 }}
              />
            )}
            <Text style={styles.payUsingText}>PAY USING</Text>
            <Ionicons
              name="caret-up"
              size={10}
              color="#666"
              style={{ marginLeft: 4 }}
            />
          </View>
          <Text style={styles.selectedMethodText} numberOfLines={1}>
            {selectedPaymentOption
              ? selectedPaymentOption.label
              : "Select Payment Mode"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.payButton,
            (!selectedPaymentMethod || isCreatingBooking) && styles.payButtonDisabled,
          ]}
          disabled={!selectedPaymentMethod || isCreatingBooking}
          onPress={async () => {
            if (!selectedPaymentMethod) {
              Alert.alert(
                "Payment Method Required",
                "Please select a payment option to proceed."
              );
              return;
            }

            try {
                const addressParts = (address as string)?.split(',').map(s => s.trim()) || [];
                
                const houseNumRaw = addressParts[0] || "0";
                const houseNumClean = parseInt(houseNumRaw.replace(/\D/g, '')) || 0;

                let hour = 10; 
                if (selectedTime) {
                    const [time, modifier] = (selectedTime as string).split(' ');
                    let [h] = time.split(':').map(Number);
                    if (modifier === 'PM' && h < 12) h += 12;
                    if (modifier === 'AM' && h === 12) h = 0;
                    hour = h;
                }

                console.log("🛠 [BookingSummary] Address Raw:", address);
                console.log("🛠 [BookingSummary] Address Parts Length:", addressParts.length);

                const isValidObjectId = (id: any) => /^[0-9a-fA-F]{24}$/.test(id);

                let currentAddressId: string | undefined = Array.isArray(params.addressId) ? params.addressId[0] : params.addressId;
                if (currentAddressId === "undefined" || currentAddressId === "null") currentAddressId = undefined;
                
                // If ID exists but is NOT a valid Mongo ID (e.g. nanoid), treat as missing so we create a new one
                if (currentAddressId && !isValidObjectId(currentAddressId)) {
                    console.log("[BookingSummary] Address ID is temporary/invalid, will create new:", currentAddressId);
                    currentAddressId = undefined;
                }

                if (!currentAddressId && currentBooking.address && isValidObjectId(currentBooking.address)) {
                     currentAddressId = currentBooking.address;
                }

                // If no addressId but we have address text, try to create it
                if (!currentAddressId && address) {
                  try {
                    const newAddrPayload = {
                      houseOrFlatNo: String(houseNumClean),
                      locality: String(addressParts[1] || "Locality"),
                      landmark: String(addressParts[2] || "Landmark"),
                      city: String(addressParts[2] || (addressParts[1] ? "City" : "Your City")),
                      postalCode: String(addressParts[3] || "000000"),
                      addressType: "Home",
                    };
                    console.log("[BookingSummary] Creating new Address:", newAddrPayload);
                    const addrRes = await createAddress(newAddrPayload).unwrap();
                    if (addrRes?.data?._id) {
                       currentAddressId = addrRes.data._id;
                       console.log("[BookingSummary] New Address Created:", currentAddressId);
                    }
                  } catch (e) {
                     console.error("[BookingSummary] Failed to auto-create address", e);
                  }
                }

                let currentVehicleId: string | undefined = Array.isArray(params.vehicleId) ? params.vehicleId[0] : params.vehicleId;
                if (currentVehicleId === "undefined" || currentVehicleId === "null") currentVehicleId = undefined;

                if (currentVehicleId && !isValidObjectId(currentVehicleId)) {
                     console.log("[BookingSummary] Vehicle ID is temporary/invalid, will create new:", currentVehicleId);
                     currentVehicleId = undefined;
                }

                if (!currentVehicleId && vehicleNumber) {
                   try {
                     const vType = VEHICLE_TYPE_MAP[(vehicleType as string)?.toLowerCase()] || (vehicleType as string) || "Sedan";
                     const vehiclePayload = {
                        vehicleType: vType,
                        vehicleNo: String(vehicleNumber),
                     };
                     console.log("[BookingSummary] Creating new Vehicle:", vehiclePayload);
                     const vehRes = await createVehicle(vehiclePayload).unwrap();
                     if (vehRes?.data?._id) {
                        currentVehicleId = vehRes.data._id;
                        console.log("[BookingSummary] New Vehicle Created:", currentVehicleId);
                     }
                   } catch (e) {
                      console.error("[BookingSummary] Failed to auto-create vehicle", e);
                   }
                }

                    const finalWashPackageId = serviceId as string;

                    if (!finalWashPackageId || finalWashPackageId.length !== 24) {
                        console.error("❌ [BookingSummary] Invalid washPackage ID format:", serviceId);
                        Alert.alert("Selection Error", "Invalid wash package selected. Please go back and select a service again.");
                        return;
                    }

                    const bookingPayload: any = {
                        houseOrFlatNo: String(houseNumClean),
                        locality: String(addressParts[1] || "Locality"),
                        landmark: String(addressParts[2] || "Landmark"),
                        city: String(addressParts[2] || (addressParts[1] ? "City" : "Your City")),
                        postalCode: String(addressParts[3] || "000000"),
                        addressType: "Home",
                        washPackage: finalWashPackageId,
                        vehicleType: VEHICLE_TYPE_MAP[(vehicleType as string)?.toLowerCase()] || (vehicleType as string) || "Sedan",
                        vehicleNo: String(vehicleNumber ? (vehicleNumber as string) : "N/A"),
                        bookingDate: selectedDate ? (selectedDate as string) : new Date().toISOString().split('T')[0],
                        bookingTime: Number(hour)
                    };

                    if (currentAddressId) bookingPayload.address = currentAddressId;
                    if (currentVehicleId) bookingPayload.vehicle = currentVehicleId;

                console.log("[BookingSummary] TRACE - Auth Token:", authState.token);
                console.log("[BookingSummary] TRACE - Payload:", JSON.stringify(bookingPayload, null, 2));
                const response = await createBooking(bookingPayload).unwrap();
                console.log("[BookingSummary] TRACE - Response:", response);

                dispatch(
                  addBooking({
                    center: (shopName as string) || "Your Location",
                    date: selectedDate as string,
                    timeSlot: selectedTime as string,
                    car: vehicleType ? `${vehicleType} - ${vehicleNumber}` : "Vehicle",
                    carImage: "https://cdn-icons-png.flaticon.com/512/743/743007.png",
                    phone: userPhone as string,
                    price: Number(grandTotal),
                    address: address as string,
                    plate: vehicleNumber as string,
                    serviceName: serviceName as string,
                    serviceId: finalWashPackageId,
                  })
                );
    
                router.push({
                  pathname: "/(tabs)/home/book-doorstep/order-confirmation",
                  params: {
                    ...params,
                    grandTotal,
                    paymentMethod: selectedPaymentMethod,
                    bookingId: response?.data?._id || "temp-id"
                  },
                });

            } catch (err: any) {
                console.error("❌ [BookingSummary] FULL ERROR OBJECT:", JSON.stringify(err, null, 2));
                if (err.status === 401) {
                    Alert.alert(
                        "Session Expired",
                        "Your technical session has expired or is invalid. Please log out and log in again.",
                        [{ text: "OK", onPress: () => dispatch(logout()) }]
                    );
                } else {
                    const errorMsg = err?.data?.message || err?.message || "Something went wrong while creating your booking.";
                    Alert.alert("Booking Failed", errorMsg);
                }
            }
          }}
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

      {/* Payment Options Modal */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowPaymentModal(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Options</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#1a1a1a" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              {paymentOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.optionCard,
                    selectedPaymentMethod === option.id &&
                    styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedPaymentMethod(option.id);
                    setShowPaymentModal(false);
                  }}
                >
                  <View style={styles.optionRow}>
                    <View style={styles.radioContainer}>
                      <View
                        style={[
                          styles.radioInfo,
                          selectedPaymentMethod === option.id
                            ? styles.radioSelected
                            : styles.radioUnselected,
                        ]}
                      >
                        {selectedPaymentMethod === option.id && (
                          <View style={styles.radioDot} />
                        )}
                      </View>
                    </View>

                    <View
                      style={[
                        styles.optionIconContainer,
                        {
                          backgroundColor:
                            selectedPaymentMethod === option.id
                              ? "#f0f9eb"
                              : "#F5F5F5",
                        },
                      ]}
                    >
                      <Ionicons
                        name={option.icon as any}
                        size={24}
                        color={
                          selectedPaymentMethod === option.id
                            ? "#1a1a1a"
                            : "#666"
                        }
                      />
                    </View>

                    <View style={styles.optionContent}>
                      <Text style={styles.optionLabel}>{option.label}</Text>
                      <Text style={styles.optionSubLabel}>
                        {option.subLabel}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
