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
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import { getLeafletHtml } from "@/utils/leafletHtml";
import { useDispatch, useSelector } from "react-redux";
import { InteractivePressable } from "@/components/ui/InteractivePressable";

export default function EnterLocationScreen() {
  const dispatch = useDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const isFromProfile = params.source === "profile";

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [triggerGetAddresses] = useLazyGetAddressesQuery();

  const { data: addressesData } = useGetAddressesQuery(undefined);

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
  const [addressType, setAddressType] = useState<"Home" | "Office" | "Other">(
    "Home",
  );
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
  }, [mapVisible, selectedCoord?.lat, selectedCoord?.long]);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) searchPlaces(searchQuery);
      else setSearchResults([]);
    }, 1000);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const searchPlaces = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?key=${process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`,
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
      mapRef.current?.postMessage(
        JSON.stringify({ type: "updateLocation", payload: { lat, lng: lon } }),
      );
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

  const handleInputChange =
    (setter: (val: string) => void) => (value: string) => {
      // Only allow letters, numbers, spaces, and hyphens
      const filteredValue = value.replace(/[^a-zA-Z0-9\s-]/g, "");
      setter(filteredValue);
      if (selectedSavedAddressId) setSelectedSavedAddressId(null);
      if (errorMsg) setErrorMsg("");
    };

  const getCurrentLocation = async () => {
    setIsLocating(true);
    setErrorMsg("");
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setSelectedCoord({
        lat: location.coords.latitude,
        long: location.coords.longitude,
      });
      setMapVisible(true);
    } catch (error) {
      setErrorMsg("Could not fetch location");
    } finally {
      setIsLocating(false);
    }
  };

  const confirmMapLocation = async () => {
    if (!selectedCoord) return;
    setMapVisible(false);
    setIsLocating(true);
    if (selectedSavedAddressId) setSelectedSavedAddressId(null);
    try {
      const resp = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${process.env.EXPO_PUBLIC_LOCATIONIQ_API_KEY}&lat=${selectedCoord.lat}&lon=${selectedCoord.long}&format=json&addressdetails=1`,
      );
      if (resp.status === 429) {
        setErrorMsg("Location service busy. Manual entry needed.");
        return;
      }
      const data = await resp.json();
      if (data?.address) {
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
      console.log(e);
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirm = async () => {
    if (
      !flatNumber.trim() ||
      !locality.trim() ||
      !city.trim() ||
      !postalCode.trim()
    ) {
      setErrorMsg("All address fields are required");
      return;
    }

    if (selectedSavedAddressId) {
      const savedAddr = savedAddresses.find(
        (a) => a.id === selectedSavedAddressId,
      );
      dispatch(setBookingAddress({ addressId: selectedSavedAddressId }));
      if (isFromProfile) router.back();
      else
        router.push({
          pathname: "/(tabs)/home/book-doorstep/select-service",
          params: {
            address: savedAddr?.fullAddress,
            latitude: savedAddr?.latitude,
            longitude: savedAddr?.longitude,
            addressId: selectedSavedAddressId,
            addressType: savedAddr?.addressType || "Home",
          },
        });
      return;
    }

    const fullAddress = `${flatNumber}, ${locality}, ${city}, ${postalCode}`;
    const payload = {
      houseOrFlatNo: flatNumber,
      locality,
      landmark: landmark.trim() || `Near ${locality}`,
      city,
      postalCode,
      addressType,
    };

    if (!isLoggedIn) {
      const id = nanoid();
      dispatch(
        addAddress({
          ...payload,
          fullAddress,
          latitude: selectedCoord?.lat,
          longitude: selectedCoord?.long,
          id,
        }),
      );
      dispatch(setBookingAddress({ addressId: id }));
      if (isFromProfile) router.back();
      else
        router.push({
          pathname: "/(tabs)/home/book-doorstep/select-service",
          params: {
            address: fullAddress,
            latitude: selectedCoord?.lat,
            longitude: selectedCoord?.long,
            addressId: id,
            addressType: addressType,
          },
        });
      return;
    }

    try {
      await createAddress(payload).unwrap();
      const res = await triggerGetAddresses().unwrap();
      const list = res.addressList || [];
      const newAddr = list.find(
        (a: any) =>
          a.fullAddress === fullAddress && a.addressType === addressType,
      );
      const id = newAddr ? newAddr.id || newAddr._id : nanoid();
      dispatch(addAddress(newAddr || { ...payload, fullAddress, id }));
      dispatch(setBookingAddress({ addressId: id }));
      if (isFromProfile) router.back();
      else
        router.push({
          pathname: "/(tabs)/home/book-doorstep/select-service",
          params: {
            address: fullAddress,
            latitude: selectedCoord?.lat,
            longitude: selectedCoord?.long,
            addressId: id,
            addressType: addressType,
          },
        });
    } catch {
      const errorMessage = "Please check your connection and try again.";
      setErrorMsg(errorMessage);
      Alert.alert("Failed to save address", errorMessage);
    }
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <View className="flex-row justify-between items-center px-5 py-4 bg-background">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-card items-center justify-center border border-border/50"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text className="text-[18px] font-[800] color-text tracking-tight">
          Enter Location
        </Text>
        <View className="w-10" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            className={`flex-row items-center bg-card p-5 rounded-[28px] mt-6 mb-8 border border-border/50 shadow-sm ${isLocating ? "opacity-70" : ""}`}
            onPress={getCurrentLocation}
            disabled={isLocating}
          >
            <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center mr-4">
              {isLocating ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="navigate" size={22} color="#000" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-[800] color-text">
                {isLocating ? "Locating..." : "Use current location"}
              </Text>
              <Text className="text-[12px] color-textSecondary font-[600] mt-0.5">
                Quickly find your spot
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {savedAddresses.length > 0 && (
            <View className="mb-8">
              <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px] mb-4 ml-1">
                Saved Addresses
              </Text>

              <View className="bg-card rounded-[28px] border border-border/50 overflow-hidden shadow-sm">
                <TouchableOpacity
                  className={`flex-row items-center p-5 ${isAddressDropdownOpen ? "border-b border-border/30" : ""}`}
                  onPress={() =>
                    setIsAddressDropdownOpen(!isAddressDropdownOpen)
                  }
                >
                  <View className="w-10 h-10 rounded-xl bg-background items-center justify-center mr-4">
                    <Ionicons
                      name="location"
                      size={20}
                      color={Colors.primary}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-[14px] font-[800] color-text">
                      {savedAddresses.find(
                        (a) => a.id === selectedSavedAddressId,
                      )?.addressType || "Choose Address"}
                    </Text>
                    <Text
                      className="text-[12px] color-textSecondary font-[500] mt-0.5"
                      numberOfLines={1}
                    >
                      {savedAddresses.find(
                        (a) => a.id === selectedSavedAddressId,
                      )?.fullAddress || "Select from saved spots"}
                    </Text>
                  </View>
                  <Ionicons
                    name={isAddressDropdownOpen ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>

                {isAddressDropdownOpen && (
                  <View className="bg-background/20">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedSavedAddressId === addr.id;
                      return (
                        <TouchableOpacity
                          key={addr.id}
                          className={`flex-row items-center p-4 border-b border-border/20 last:border-b-0 ${isSelected ? "bg-primary/5" : ""}`}
                          onPress={() => {
                            setSelectedSavedAddressId(addr.id);
                            fillAddressInputs(addr);
                            setErrorMsg("");
                            setIsAddressDropdownOpen(false);
                          }}
                        >
                          <Ionicons
                            name={
                              isSelected
                                ? "checkmark-circle"
                                : defaultAddressId === addr.id
                                  ? "star"
                                  : "location-outline"
                            }
                            size={18}
                            color={
                              isSelected ? Colors.primary : Colors.textSecondary
                            }
                            style={{ marginHorizontal: 8 }}
                          />
                          <View className="flex-1 ml-2">
                            <Text
                              className={`text-[14px] font-[700] ${isSelected ? "color-primary" : "color-text"}`}
                            >
                              {addr.addressType}
                            </Text>
                            <Text
                              className="text-[11px] color-textSecondary"
                              numberOfLines={1}
                            >
                              {addr.fullAddress}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

          <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[2px] mb-4 ml-1">
            Manual Entry
          </Text>

          <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
              <TextInput
                className={`bg-card rounded-2xl p-4 h-14 color-text font-[600] border ${errorMsg.includes("House") ? "border-red-500/50" : "border-border/50"}`}
                placeholder="House / Flat No."
                placeholderTextColor="#64748B"
                value={flatNumber}
                onChangeText={handleInputChange(setFlatNumber)}
              />
            </View>
            <View className="flex-1">
              <TextInput
                className={`bg-card rounded-2xl p-4 h-14 color-text font-[600] border ${errorMsg.includes("Locality") ? "border-red-500/50" : "border-border/50"}`}
                placeholder="Locality / Area"
                placeholderTextColor="#64748B"
                value={locality}
                onChangeText={handleInputChange(setLocality)}
              />
            </View>
          </View>

          <TextInput
            className="bg-card rounded-2xl p-4 h-14 color-text font-[600] border border-border/50 mb-4"
            placeholder="Landmark (Optional)"
            placeholderTextColor="#64748B"
            value={landmark}
            onChangeText={handleInputChange(setLandmark)}
          />

          <View className="flex-row gap-4 mb-8">
            <View className="flex-1">
              <TextInput
                className={`bg-card rounded-2xl p-4 h-14 color-text font-[600] border ${errorMsg.includes("City") ? "border-red-500/50" : "border-border/50"}`}
                placeholder="City"
                placeholderTextColor="#64748B"
                value={city}
                onChangeText={handleInputChange(setCity)}
              />
            </View>
            <View className="flex-1">
              <TextInput
                className={`bg-card rounded-2xl p-4 h-14 color-text font-[600] border ${errorMsg.includes("Postal Code") ? "border-red-500/50" : "border-border/50"}`}
                placeholder="Postal Code"
                placeholderTextColor="#64748B"
                keyboardType="number-pad"
                maxLength={6}
                value={postalCode}
                onChangeText={(text) => setPostalCode(text.replace(/[^0-9]/g, ""))}
              />
            </View>
          </View>

          <View className="flex-row mb-6">
            <InteractivePressable
              className={`flex-row items-center px-6 py-3 rounded-full mr-4 border ${addressType === "Home" ? "bg-primary border-primary" : "bg-card border-border/50"}`}
              onPress={() => {
                setAddressType("Home");
                if (selectedSavedAddressId) setSelectedSavedAddressId(null);
                setErrorMsg("");
              }}
            >
              <Ionicons
                name="home"
                size={16}
                color={addressType === "Home" ? "#000" : Colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`text-[13px] font-[800] ${addressType === "Home" ? "color-black" : "color-textSecondary"}`}
              >
                Home
              </Text>
            </InteractivePressable>

            <InteractivePressable
              className={`flex-row items-center px-6 py-3 rounded-full border ${addressType === "Office" ? "bg-primary border-primary" : "bg-card border-border/50"}`}
              onPress={() => {
                setAddressType("Office");
                if (selectedSavedAddressId) setSelectedSavedAddressId(null);
                setErrorMsg("");
              }}
            >
              <Ionicons
                name="briefcase"
                size={16}
                color={addressType === "Office" ? "#000" : Colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`text-[13px] font-[800] ${addressType === "Office" ? "color-black" : "color-textSecondary"}`}
              >
                Office
              </Text>
            </InteractivePressable>

            <InteractivePressable
              className={`flex-row items-center px-6 py-3 rounded-full border ${addressType === "Other" ? "bg-primary border-primary" : "bg-card border-border/50"}`}
              onPress={() => {
                setAddressType("Other");
                if (selectedSavedAddressId) setSelectedSavedAddressId(null);
                setErrorMsg("");
              }}
            >
              <Ionicons
                name="location"
                size={16}
                color={addressType === "Other" ? "#000" : Colors.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text
                className={`text-[13px] font-[800] ${addressType === "Other" ? "color-black" : "color-textSecondary"}`}
              >
                Other
              </Text>
            </InteractivePressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-card px-6 pt-5 rounded-t-[40px] border-t border-border shadow-2xl"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        {errorMsg ? (
          <Text className="text-[12px] font-[700] color-red-500 text-center mb-4 uppercase tracking-tighter">
            {errorMsg}
          </Text>
        ) : null}
        <InteractivePressable
          className={`bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 ${isCreating ? "opacity-70" : ""}`}
          onPress={handleConfirm}
          disabled={isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text className="text-[16px] font-[900] color-black">
              Confirm Location
            </Text>
          )}
        </InteractivePressable>
      </View>

      <Modal
        visible={mapVisible}
        animationType="slide"
        onRequestClose={() => setMapVisible(false)}
      >
        <View className="flex-1 bg-background">
          <View className="absolute top-12 left-5 right-5 z-[100]">
            <View className="flex-row items-center bg-card rounded-2xl px-4 h-14 border border-border shadow-lg">
              <Ionicons
                name="search"
                size={20}
                color={Colors.textSecondary}
                className="mr-3"
              />
              <TextInput
                className="flex-1 text-[15px] color-text font-[600]"
                placeholder="Search spot..."
                placeholderTextColor="#64748B"
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text.replace(/[<>'"%;()&+]/g, ""))}
              />
              {isSearching && (
                <ActivityIndicator
                  size="small"
                  color={Colors.primary}
                  className="mr-2"
                />
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

            {searchResults.length > 0 && (
              <View className="mt-2 bg-card rounded-2xl border border-border max-h-60 shadow-xl overflow-hidden">
                <ScrollView keyboardShouldPersistTaps="handled">
                  {searchResults.map((place, idx) => (
                    <TouchableOpacity
                      key={idx}
                      className="flex-row p-4 border-b border-border/30 last:border-b-0"
                      onPress={() => handleSelectPlace(place)}
                    >
                      <Ionicons
                        name="location-outline"
                        size={18}
                        color={Colors.textSecondary}
                        style={{ marginTop: 2, marginRight: 10 }}
                      />
                      <Text className="text-[13px] color-text font-[500] flex-1">
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
            source={{ html: initialMapHtml }}
            className="flex-1"
            onMessage={(e) => {
              try {
                const data = JSON.parse(e.nativeEvent.data);
                if (data.type === "locationSelected")
                  setSelectedCoord({
                    lat: data.payload.lat,
                    long: data.payload.lng,
                  });
              } catch (err) {}
            }}
          />

          <View className="absolute bottom-10 left-6 right-6 flex-row gap-4">
            <TouchableOpacity
              className="flex-1 bg-card h-14 rounded-2xl items-center justify-center border border-border"
              onPress={() => setMapVisible(false)}
            >
              <Text className="text-[15px] font-[800] color-textSecondary">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-[1.5] bg-primary h-14 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
              onPress={confirmMapLocation}
            >
              <Text className="text-[15px] font-[900] color-black">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}
