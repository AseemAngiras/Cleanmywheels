import { RootState } from "@/store";
import {
  useCreateAddressMutation,
  useLazyGetAddressesQuery,
} from "@/store/api/addressApi";
import { setBookingAddress } from "@/store/slices/bookingSlice";
import { addAddress, Address } from "@/store/slices/profileSlice";
import { Ionicons } from "@expo/vector-icons";
import { nanoid } from "@reduxjs/toolkit";
import * as Location from "expo-location";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useDispatch, useSelector } from "react-redux";

const { width, height } = Dimensions.get("window");

export default function EnterLocationScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const isFromProfile = params.source === "profile";

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [triggerGetAddresses] = useLazyGetAddressesQuery();

  const savedAddresses = useSelector(
    (state: RootState) => state.profile.addresses
  );

  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  React.useLayoutEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "none" },
    });
  }, [navigation]);

  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<
    string | null
  >(null);

  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const defaultAddressId = useSelector(
    (state: RootState) => state.profile.defaultAddressId
  );

  // Sync default address on mount
  React.useEffect(() => {
    if (savedAddresses.length > 0 && !selectedSavedAddressId) {
      // If we have a default preference, use it
      if (defaultAddressId) {
        const def = savedAddresses.find((a) => a.id === defaultAddressId);
        if (def) {
          setSelectedSavedAddressId(def.id);
          fillAddressInputs(def);
          return;
        }
      }
      // Fallback to first if needed? Or keep null.
      // User asked "default address in profile should be default selected".
      // If no default is set in profile, we might leave it or pick first.
      // Let's stick to only selecting if defaultAddressId exists to be safe,
      // but typically we might want to select *something*.
      // For now, consistent with "profile" logic which falls back to [0].
      if (!defaultAddressId && savedAddresses[0]) {
        setSelectedSavedAddressId(savedAddresses[0].id);
        fillAddressInputs(savedAddresses[0]);
      }
    }
  }, [defaultAddressId, savedAddresses, selectedSavedAddressId]);

  const [flatNumber, setFlatNumber] = useState("");
  const [locality, setLocality] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Work">("Home");

  const [errorMsg, setErrorMsg] = useState("");

  const [mapVisible, setMapVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [selectedCoord, setSelectedCoord] = useState<{
    lat: number;
    long: number;
  } | null>(null);

  const fillAddressInputs = (addr: Address) => {
    setFlatNumber(addr.houseOrFlatNo);
    setLocality(addr.locality);
    setLandmark(addr.landmark || "");
    setCity(addr.city);
    setPostalCode(addr.postalCode);
    setAddressType(addr.addressType);
    setSelectedCoord(
      addr.latitude && addr.longitude
        ? { lat: addr.latitude, long: addr.longitude }
        : null
    );
  };

  const handleInputChange = (setter: (val: string) => void) => {
    return (value: string) => {
      setter(value);
      if (selectedSavedAddressId) {
        setSelectedSavedAddressId(null);
      }
      if (errorMsg) setErrorMsg("");
    };
  };

  const getCurrentLocation = async () => {
    setIsLocating(true);
    setErrorMsg("");
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        setIsLocating(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
      setSelectedCoord({ lat: latitude, long: longitude });
      setMapVisible(true);
    } catch (error) {
      console.log(error);
      setErrorMsg("Could not fetch location");
    } finally {
      setIsLocating(false);
    }
  };

  const confirmMapLocation = async () => {
    if (!selectedCoord) return;
    setMapVisible(false);
    setIsLocating(true);

    if (selectedSavedAddressId) {
      setSelectedSavedAddressId(null);
    }

    try {
      let addressResponse = await Location.reverseGeocodeAsync({
        latitude: selectedCoord.lat,
        longitude: selectedCoord.long,
      });

      if (addressResponse && addressResponse.length > 0) {
        const addr = addressResponse[0];
        setFlatNumber(addr.name || "");
        setLocality(addr.district || addr.subregion || "");
        setCity(addr.city || addr.region || "");
        setPostalCode(addr.postalCode || "");
      }
    } catch (e) {
      console.log("Geocoding error", e);
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirm = async () => {
    setErrorMsg("");
    if (!flatNumber.trim()) {
      setErrorMsg("Please enter House / Flat Number");
      return;
    }
    if (!locality.trim()) {
      setErrorMsg("Please enter Locality / Area");
      return;
    }

    if (!city.trim()) {
      setErrorMsg("Please enter City");
      return;
    }
    if (!postalCode.trim() || postalCode.length < 6) {
      setErrorMsg("Please enter a valid 6-digit Postal Code");
      return;
    }

    if (selectedSavedAddressId) {
      const savedAddr = savedAddresses.find(
        (a) => a.id === selectedSavedAddressId
      );
      dispatch(
        setBookingAddress({
          addressId: selectedSavedAddressId,
        })
      );

      router.push({
        pathname: "/(tabs)/home/book-doorstep/select-service",
        params: {
          address: savedAddr?.fullAddress,
          latitude: savedAddr?.latitude,
          longitude: savedAddr?.longitude,
          addressId: selectedSavedAddressId,
        },
      });
      return;
    }

    const fullAddress = `${flatNumber}, ${locality}, ${city}, ${postalCode}`;

    const addressPayload = {
      houseOrFlatNo: flatNumber,
      locality,
      landmark: landmark.trim() ? landmark : `Near ${locality}`,
      city,
      postalCode,
      addressType,
    };

    if (!isLoggedIn) {
      console.log("Guest User: Saving address locally");
      const fallbackId = nanoid();
      const fallbackAddr = {
        ...addressPayload,
        fullAddress,
        latitude: selectedCoord?.lat,
        longitude: selectedCoord?.long,
        id: fallbackId,
      };

      dispatch(addAddress(fallbackAddr));
      dispatch(setBookingAddress({ addressId: fallbackId }));

      if (isFromProfile) {
        router.back();
        return;
      }

      router.push({
        pathname: "/(tabs)/home/book-doorstep/select-service",
        params: {
          address: fullAddress,
          latitude: selectedCoord?.lat,
          longitude: selectedCoord?.long,
          addressId: fallbackId,
        },
      });
      return;
    }

    try {
      await createAddress(addressPayload).unwrap();

      const result = await triggerGetAddresses().unwrap();
      const addressList = result.addressList || [];

      const newAddress = addressList.find(
        (addr: any) =>
          addr.fullAddress === fullAddress && addr.addressType === addressType
      );

      if (newAddress) {
        dispatch(addAddress(newAddress));
        dispatch(
          setBookingAddress({ addressId: newAddress.id || newAddress._id })
        );

        if (isFromProfile) {
          router.back();
          return;
        }

        router.push({
          pathname: "/(tabs)/home/book-doorstep/select-service",
          params: {
            address: fullAddress,
            latitude: selectedCoord?.lat,
            longitude: selectedCoord?.long,
            addressId: newAddress.id || newAddress._id,
          },
        });
      } else {
        console.warn("New address not found in list, using local fallback");
        const fallbackId = nanoid();
        const fallbackAddr = {
          ...addressPayload,
          fullAddress,
          latitude: selectedCoord?.lat,
          longitude: selectedCoord?.long,
          id: fallbackId,
        };
        dispatch(addAddress(fallbackAddr));
        dispatch(setBookingAddress({ addressId: fallbackId }));

        if (isFromProfile) {
          router.back();
          return;
        }

        router.push({
          pathname: "/(tabs)/home/book-doorstep/select-service",
          params: {
            address: fullAddress,
            latitude: selectedCoord?.lat,
            longitude: selectedCoord?.long,
            addressId: fallbackId,
          },
        });
      }
    } catch (err) {
      console.error("Failed to create address", err);
      setErrorMsg("Failed to save address. Please try again.");
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
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Location</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Use Current Location */}
          <TouchableOpacity
            style={styles.currentLocationRow}
            onPress={getCurrentLocation}
            disabled={isLocating}
          >
            <View style={styles.locationIconBg}>
              {isLocating ? (
                <ActivityIndicator size="small" color="#1a1a1a" />
              ) : (
                <Ionicons name="navigate" size={18} color="#1a1a1a" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clTitle}>
                {isLocating ? "Fetching location..." : "Use current location"}
              </Text>
              <Text style={styles.clSubtitle}>Enable location services</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <View style={styles.divider} />
          {savedAddresses.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>SAVED ADDRESSES</Text>

              <View
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "#f0f0f0",
                  marginBottom: 20,
                }}
              >
                {/* Dropdown Trigger */}
                <TouchableOpacity
                  style={[
                    styles.addressRow,
                    { borderBottomWidth: isAddressDropdownOpen ? 1 : 0 },
                  ]}
                  onPress={() =>
                    setIsAddressDropdownOpen(!isAddressDropdownOpen)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.iconBox}>
                    <Ionicons name="location" size={18} color="#1a1a1a" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {savedAddresses.find(
                        (a) => a.id === selectedSavedAddressId
                      )?.addressType || "Select Address"}
                    </Text>
                    <Text style={styles.rowSubtitle} numberOfLines={1}>
                      {savedAddresses.find(
                        (a) => a.id === selectedSavedAddressId
                      )?.fullAddress || "Choose from saved addresses"}
                    </Text>
                  </View>
                  <Ionicons
                    name={isAddressDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>

                {/* Dropdown List */}
                {isAddressDropdownOpen && (
                  <View style={{ backgroundColor: "#F9F9F9" }}>
                    {savedAddresses.map((addr: any, idx: number) => {
                      const isSelected = selectedSavedAddressId === addr.id;
                      const isDefault = defaultAddressId === addr.id;

                      return (
                        <TouchableOpacity
                          key={addr.id || idx}
                          style={[
                            styles.addressRow,
                            {
                              paddingLeft: 24,
                              backgroundColor: isSelected
                                ? "#F0FDF4"
                                : "#F9F9F9",
                            },
                          ]}
                          onPress={() => {
                            setSelectedSavedAddressId(addr.id);
                            // Also fill inputs logic
                            fillAddressInputs(addr);
                            setErrorMsg("");

                            setIsAddressDropdownOpen(false);
                          }}
                        >
                          <View
                            style={[
                              styles.iconBox,
                              {
                                backgroundColor: isSelected
                                  ? "#DCFCE7"
                                  : "#EEEEEE",
                              },
                            ]}
                          >
                            <Ionicons
                              name={
                                isSelected
                                  ? "checkmark"
                                  : isDefault
                                    ? "star"
                                    : "location-outline"
                              }
                              size={16}
                              color={
                                isSelected
                                  ? "#166534"
                                  : isDefault
                                    ? "#EAB308"
                                    : "#666"
                              }
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.rowTitle,
                                isSelected && { color: "#166534" },
                              ]}
                            >
                              {addr.addressType || "Home"}{" "}
                              {isDefault && !isSelected && (
                                <Text
                                  style={{ fontSize: 10, color: "#EAB308" }}
                                >
                                  (Default)
                                </Text>
                              )}
                            </Text>
                            <Text style={styles.rowSubtitle} numberOfLines={1}>
                              {addr.fullAddress ||
                                `${addr.flatNumber}, ${addr.locality}, ${addr.city}`}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={styles.divider} />
            </>
          )}

          <Text style={styles.sectionHeader}>ADDRESS DETAILS</Text>

          {/* Inputs */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput
              style={[
                styles.input,
                { flex: 1 },
                !flatNumber.trim() &&
                errorMsg.includes("House") &&
                styles.inputError,
              ]}
              placeholder="House / Flat No."
              placeholderTextColor="#ccc"
              value={flatNumber}
              onChangeText={handleInputChange(setFlatNumber)}
            />
            <TextInput
              style={[
                styles.input,
                { flex: 1 },
                !locality.trim() &&
                errorMsg.includes("Locality") &&
                styles.inputError,
              ]}
              placeholder="Locality / Area"
              placeholderTextColor="#ccc"
              value={locality}
              onChangeText={handleInputChange(setLocality)}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Landmark (Optional)"
            placeholderTextColor="#ccc"
            value={landmark}
            onChangeText={handleInputChange(setLandmark)}
          />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TextInput
              style={[
                styles.input,
                { flex: 1 },
                !city.trim() && errorMsg.includes("City") && styles.inputError,
              ]}
              placeholder="City"
              placeholderTextColor="#ccc"
              value={city}
              onChangeText={handleInputChange(setCity)}
            />
            <TextInput
              style={[
                styles.input,
                { flex: 1 },
                (!postalCode.trim() || postalCode.length < 6) &&
                errorMsg.includes("Postal Code") &&
                styles.inputError,
              ]}
              placeholder="Postal Code"
              placeholderTextColor="#ccc"
              keyboardType="number-pad"
              maxLength={6}
              value={postalCode}
              onChangeText={handleInputChange(setPostalCode)}
            />
          </View>

          {/* Address Type Tags */}
          <View style={styles.tagRow}>
            <TouchableOpacity
              style={[styles.tag, addressType === "Home" && styles.tagSelected]}
              onPress={() => {
                setAddressType("Home");
                if (selectedSavedAddressId) {
                  setSelectedSavedAddressId(null);
                }
                if (errorMsg) setErrorMsg("");
              }}
            >
              <Ionicons
                name="home"
                size={16}
                color={addressType === "Home" ? "#1a1a1a" : "#666"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.tagText,
                  addressType === "Home" && styles.tagTextSelected,
                ]}
              >
                Home
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tag, addressType === "Work" && styles.tagSelected]}
              onPress={() => {
                setAddressType("Work");
                if (selectedSavedAddressId) {
                  setSelectedSavedAddressId(null);
                }
                if (errorMsg) setErrorMsg("");
              }}
            >
              <Ionicons
                name="briefcase"
                size={16}
                color={addressType === "Work" ? "#1a1a1a" : "#666"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.tagText,
                  addressType === "Work" && styles.tagTextSelected,
                ]}
              >
                Work
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Button */}
      <View style={styles.footer}>
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        <TouchableOpacity
          style={[styles.confirmButton, isCreating && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#1a1a1a" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Address</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Map Modal */}
      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() => setMapVisible(false)}
      >
        <View style={{ flex: 1 }}>
          <MapView
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={(e) =>
              setSelectedCoord({
                lat: e.nativeEvent.coordinate.latitude,
                long: e.nativeEvent.coordinate.longitude,
              })
            }
          >
            {selectedCoord && (
              <Marker
                coordinate={{
                  latitude: selectedCoord.lat,
                  longitude: selectedCoord.long,
                }}
              />
            )}
          </MapView>

          <View style={styles.mapFooter}>
            <TouchableOpacity
              style={styles.closeMapButton}
              onPress={() => setMapVisible(false)}
            >
              <Text style={styles.closeMapText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmMapButton}
              onPress={confirmMapLocation}
            >
              <Text style={styles.confirmMapText}>Confirm Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12, // Reduced from 15
    backgroundColor: "#fff",
  },
  backButton: {
    width: 36, // Reduced slightly
    height: 36,
    backgroundColor: "#f5f5f5",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90, // Reduced from 100
  },

  currentLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10, // Reduced from 20
  },
  locationIconBg: {
    width: 36, // Reduced from 40
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFF9C4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clTitle: { fontSize: 14, fontWeight: "bold", color: "#1a1a1a" },
  clSubtitle: { fontSize: 12, color: "#888" },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginBottom: 15, // Reduced from 25
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 12,
    color: "#666",
    fontWeight: "bold",
    marginBottom: 12, // Reduced from 20
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12, // Reduced radius slightly
    paddingHorizontal: 15, // Reduced padding
    paddingVertical: 14, // Reduced height
    fontSize: 14,
    color: "#1a1a1a",
    marginBottom: 12, // Reduced from 15
  },
  tagRow: {
    flexDirection: "row",
    marginTop: 5, // Reduced from 10
    marginBottom: 20, // Reduced from 30
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 12,
  },
  tagSelected: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 1,
  },
  tagText: { fontSize: 13, fontWeight: "600", color: "#666" },
  tagTextSelected: { color: "#1a1a1a" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  confirmButton: {
    backgroundColor: "#C8F000",

    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  confirmButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#d32f2f",
    backgroundColor: "#ffebee",
  },

  // Map Styles
  mapFooter: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  closeMapButton: {
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeMapText: {
    color: "#1a1a1a",
    fontWeight: "bold",
  },
  confirmMapButton: {
    backgroundColor: "#C8F000",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confirmMapText: {
    color: "#1a1a1a",
    fontWeight: "bold",
  },
  savedAddressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    marginBottom: 10,
  },

  savedAddressSelected: {
    borderColor: "#1a1a1a",
    backgroundColor: "#f4f4f4",
  },

  savedAddressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  savedAddressType: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "600",
  },

  savedAddressText: {
    fontSize: 14,
    color: "#111",
    lineHeight: 20,
  },

  // Dropdown Styles from Profile
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
    backgroundColor: "#fff",
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F3F4F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  rowSubtitle: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
});
