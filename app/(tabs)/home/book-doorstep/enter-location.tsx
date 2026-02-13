import { Colors } from "@/constants/Colors";
import { RootState } from "@/store";
import {
  useCreateAddressMutation,
  useGetAddressesQuery,
  useLazyGetAddressesQuery,
} from "@/store/api/addressApi";
import { setBookingAddress } from "@/store/slices/bookingSlice";
import { addAddress, Address } from "@/store/slices/profileSlice";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { nanoid } from "@reduxjs/toolkit";
import * as Location from "expo-location";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { getLeafletHtml } from "@/app/utils/leafletHtml";
import { useDispatch, useSelector } from "react-redux";

// const { width, height } = Dimensions.get("window");

export default function EnterLocationScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const isFromProfile = params.source === "profile";

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [triggerGetAddresses] = useLazyGetAddressesQuery();

  const { data: addressesData } = useGetAddressesQuery(undefined);
  const insets = useSafeAreaInsets();

  const fetchedAddresses = useMemo(() => {
    const list = addressesData?.data?.addressList || addressesData?.data || [];
    return Array.isArray(list) ? list : [];
  }, [addressesData]);

  const profileAddresses = useSelector(
    (state: RootState) => state.profile.addresses,
  );

  const savedAddresses = useMemo(() => {
    return fetchedAddresses.length > 0
      ? fetchedAddresses.map((addr: any) => ({
          ...addr,
          id: addr._id || addr.id,
          fullAddress:
            addr.fullAddress ||
            `${addr.houseOrFlatNo}, ${addr.locality}, ${addr.city} - ${addr.postalCode}`,
        }))
      : profileAddresses || [];
  }, [fetchedAddresses, profileAddresses]);

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
    (state: RootState) => state.profile.defaultAddressId,
  );

  const [flatNumber, setFlatNumber] = useState("");
  const [locality, setLocality] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Work">("Home");

  React.useEffect(() => {
    const isFormEmpty = !flatNumber && !locality && !city && !postalCode;

    if (
      savedAddresses.length > 0 &&
      !selectedSavedAddressId &&
      !isFromProfile &&
      isFormEmpty
    ) {
      if (defaultAddressId) {
        const def = savedAddresses.find((a) => a.id === defaultAddressId);
        if (def) {
          setSelectedSavedAddressId(def.id);
          fillAddressInputs(def);
          return;
        }
      }
      if (!defaultAddressId && savedAddresses[0]) {
        setSelectedSavedAddressId(savedAddresses[0].id);
        fillAddressInputs(savedAddresses[0]);
      }
    }
  }, [
    defaultAddressId,
    savedAddresses,
    selectedSavedAddressId,
    isFromProfile,
    flatNumber,
    locality,
    city,
    postalCode,
  ]);

  const [errorMsg, setErrorMsg] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = React.useRef<WebView>(null);

  const [mapVisible, setMapVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [selectedCoord, setSelectedCoord] = useState<{
    lat: number;
    long: number;
  } | null>(null);

  const initialMapHtml = React.useMemo(() => {
    if (!mapVisible) return "";
    return getLeafletHtml(
      selectedCoord?.lat || 51.505,
      selectedCoord?.long || -0.09,
    );
  }, [mapVisible]);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        searchPlaces(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchPlaces = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?key=${process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
          query,
        )}&format=json&addressdetails=1&limit=5`,
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.log("Search error", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    setSearchQuery("");
    setSearchResults([]);

    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    setSelectedCoord({ lat, long: lon });

    const addr = place.address;
    setFlatNumber(addr.house_number || "");
    setLocality(addr.suburb || addr.neighbourhood || addr.residential || "");
    setCity(addr.city || addr.town || addr.village || "");
    setPostalCode(addr.postcode || "");

    setMapVisible(true);

    setTimeout(() => {
      if (mapRef.current) {
        console.log("Sending updateLocation message to map:", {
          lat,
          lng: lon,
        });
        mapRef.current.postMessage(
          JSON.stringify({
            type: "updateLocation",
            payload: { lat: lat, lng: lon },
          }),
        );
      } else {
        console.log("Map ref is null, cannot send updateLocation");
      }
    }, 500);
  };

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
        : null,
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
    console.log("Confirming map location with coords:", selectedCoord);
    if (!selectedCoord) return;
    setMapVisible(false);
    setIsLocating(true);

    if (selectedSavedAddressId) {
      setSelectedSavedAddressId(null);
    }

    try {
      console.log(
        "Using API Key:",
        process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY
          ? process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY.substring(0, 5) + "..."
          : "UNDEFINED",
      );

      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY}&lat=${selectedCoord.lat}&lon=${selectedCoord.long}&format=json&addressdetails=1`,
      );

      if (response.status === 429) {
        setErrorMsg("Location service busy. Please fill address manually.");
        setIsLocating(false);
        return;
      }

      const text = await response.text();
      console.log("Geocoding response text:", text);
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse geocoding response", text);
        setErrorMsg("Error fetching address. Please enter manually.");
        return;
      }

      if (data && data.address) {
        const addr = data.address;
        setFlatNumber(addr.house_number || addr.building || addr.name || "");
        setLocality(
          addr.suburb || addr.neighbourhood || addr.residential || "",
        );
        setCity(
          addr.city || addr.town || addr.village || addr.city_district || "",
        );
        setPostalCode(addr.postcode || "");
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
        (a) => a.id === selectedSavedAddressId,
      );
      dispatch(
        setBookingAddress({
          addressId: selectedSavedAddressId,
        }),
      );

      if (isFromProfile) {
        router.back();
        return;
      }

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
      setSelectedSavedAddressId(fallbackId);

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
          addr.fullAddress === fullAddress && addr.addressType === addressType,
      );

      if (newAddress) {
        dispatch(addAddress(newAddress));
        dispatch(
          setBookingAddress({ addressId: newAddress.id || newAddress._id }),
        );
        setSelectedSavedAddressId(newAddress.id || newAddress._id);

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
        setSelectedSavedAddressId(fallbackId);

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
    <ScreenWrapper
      backgroundColor={Colors.background}
      statusBarStyle="light-content"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
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
                <ActivityIndicator size="small" color={Colors.black} />
              ) : (
                <Ionicons name="navigate" size={18} color={Colors.black} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.clTitle}>
                {isLocating ? "Fetching location..." : "Use current location"}
              </Text>
              <Text style={styles.clSubtitle}>Enable location services</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textSecondary}
            />
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
                  borderColor: Colors.border,
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
                    <Ionicons name="location" size={18} color={Colors.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>
                      {savedAddresses.find(
                        (a) => a.id === selectedSavedAddressId,
                      )?.addressType || "Select Address"}
                    </Text>
                    <Text style={styles.rowSubtitle} numberOfLines={1}>
                      {savedAddresses.find(
                        (a) => a.id === selectedSavedAddressId,
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
                  <View style={{ backgroundColor: Colors.card }}>
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
                                ? "rgba(200, 240, 0, 0.1)"
                                : Colors.card,
                            },
                          ]}
                          onPress={() => {
                            setSelectedSavedAddressId(addr.id);
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
                                  ? "rgba(200, 240, 0, 0.2)"
                                  : Colors.background,
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
                                  ? Colors.primary
                                  : isDefault
                                    ? "#EAB308"
                                    : Colors.textSecondary
                              }
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.rowTitle,
                                isSelected && { color: Colors.primary },
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
              placeholderTextColor={Colors.textSecondary}
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
              placeholderTextColor={Colors.textSecondary}
              value={locality}
              onChangeText={handleInputChange(setLocality)}
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder="Landmark (Optional)"
            placeholderTextColor={Colors.textSecondary}
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
              placeholderTextColor={Colors.textSecondary}
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
              placeholderTextColor={Colors.textSecondary}
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
                color={
                  addressType === "Home" ? Colors.black : Colors.textSecondary
                }
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
                color={
                  addressType === "Work" ? Colors.black : Colors.textSecondary
                }
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
      <View style={[styles.footer, { paddingBottom: 20 + insets.bottom }]}>
        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        <TouchableOpacity
          style={[styles.confirmButton, isCreating && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color={Colors.black} />
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
        <View style={{ flex: 1, backgroundColor: "white" }}>
          {/* Header in Modal */}
          <View
            style={{
              position: "absolute",
              top: 50,
              left: 20,
              right: 20,
              zIndex: 100,
            }}
          >
            <View
              style={[
                styles.searchContainer,
                {
                  backgroundColor: "white",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 5,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={20}
                color={Colors.textSecondary}
                style={{ marginRight: 10 }}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a location..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {isSearching && (
                <ActivityIndicator size="small" color={Colors.primary} />
              )}
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <View
                style={[
                  styles.searchResultsContainer,
                  { top: 60, maxHeight: 250 },
                ]}
              >
                <ScrollView keyboardShouldPersistTaps="handled">
                  {searchResults.map((place, index) => (
                    <TouchableOpacity
                      key={place.place_id || index}
                      style={styles.searchResultItem}
                      onPress={() => handleSelectPlace(place)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={16}
                        color={Colors.textSecondary}
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.searchResultText}>
                        {place.display_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <WebView
            ref={mapRef}
            source={{
              html: initialMapHtml,
            }}
            style={{ flex: 1 }}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.type === "log") {
                  console.log("WebView Log:", data.payload);
                  return;
                }
                if (data.type === "locationSelected") {
                  console.log("Location selected from map:", data.payload);
                  /* 
                    We tracks 'selectedCoord' for the final confirmation.
                    The HTML source is memoized so it won't reload.
                    Map 'lng' from Leaflet to 'long' in our state.
                   */
                  setSelectedCoord({
                    lat: data.payload.lat,
                    long: data.payload.lng,
                  });
                }
              } catch (e) {
                console.error("JSON Parse error in onMessage", e);
              }
            }}
          />

          <View style={[styles.mapFooter, { bottom: 30 + insets.bottom }]}>
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
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 36,
    height: 36,
    backgroundColor: Colors.card,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },

  currentLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  locationIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  clTitle: { fontSize: 14, fontWeight: "bold", color: Colors.text },
  clSubtitle: { fontSize: 12, color: Colors.textSecondary },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 15,
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "bold",
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 20,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.card,
    marginRight: 12,
  },
  tagSelected: {
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.primary,
    elevation: 1,
  },
  tagText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  tagTextSelected: { color: Colors.black },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  confirmButton: {
    backgroundColor: Colors.primary,

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
    color: Colors.black,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  inputError: {
    borderWidth: 1,
    borderColor: Colors.error,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
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
    backgroundColor: Colors.card,
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
    color: Colors.text,
    fontWeight: "bold",
  },
  confirmMapButton: {
    backgroundColor: Colors.primary,
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
    color: Colors.black,
    fontWeight: "bold",
  },
  savedAddressCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 10,
    marginBottom: 10,
  },

  savedAddressSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(200, 240, 0, 0.1)",
  },

  savedAddressHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },

  savedAddressType: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    fontWeight: "600",
  },

  savedAddressText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },

  // Dropdown Styles from Profile
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  rowSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000",
  },
  searchResultsContainer: {
    position: "absolute",
    top: 60,
    left: 12,
    right: 12,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: 250,
    zIndex: 1001,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  searchResultItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    alignItems: "flex-start",
    gap: 10,
  },
  searchResultText: {
    fontSize: 14,
    color: "#000",
    flex: 1,
  },
});
