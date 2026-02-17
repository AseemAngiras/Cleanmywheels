import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Colors } from "@/constants/Colors";

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: "flex" },
    });
  }, []);

  const params = useLocalSearchParams();
  const {
    shopName,
    shopImage,
    shopAddress,
    shopRating,
    date,
    time,
    shopLat,
    shopLong,
  } = params;

  // Generate a random token number for demo
  const tokenNumber = Math.floor(100 + Math.random() * 900);

  const handleNavigate = () => {
    const lat = shopLat;
    const lng = shopLong;
    const label = (shopName as string) || "Service Station";

    const scheme = Platform.select({
      ios: "maps:0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${lat},${lng}`;

    let url: string = "";
    if (lat && lng) {
      url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`,
      }) as string;
    } else {
      const query = shopAddress || shopName;
      url = Platform.select({
        ios: `maps:0,0?q=${query}`,
        android: `geo:0,0?q=${query}`,
      }) as string;
    }

    Linking.openURL(url);
  };

  return (
    <ScreenWrapper backgroundColor={Colors.background}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View className="items-center pt-10 px-6">
          <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-10">
            Booking Confirmation
          </Text>

          {/* Success Icon */}
          <View className="w-24 h-24 rounded-full bg-primary/20 items-center justify-center mb-8 border-[10px] border-primary/5">
            <View className="w-16 h-16 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/40">
              <Ionicons name="checkmark" size={40} color="#000" />
            </View>
          </View>

          <Text className="text-[28px] font-[900] color-text mb-2">
            Booking Confirmed!
          </Text>
          <Text className="text-[14px] color-textSecondary font-[600] mb-10">
            Your slot has been secured successfully.
          </Text>

          {/* Token Card (Ticket Style) */}
          <View className="w-full bg-card rounded-[32px] overflow-hidden p-8 border border-border/50 shadow-sm relative mb-10">
            <View className="absolute top-0 left-0 right-0 h-1.5 bg-primary" />

            <View className="items-center">
              <Text className="text-[11px] font-[800] color-textSecondary uppercase tracking-[3px] mb-3">
                Your Token Number
              </Text>
              <Text className="text-[36px] font-[900] color-primary mb-6">
                #TK-{tokenNumber}
              </Text>

              {/* Dashed Divider */}
              <View className="w-full h-[1px] bg-border border-dashed border border-border/50 my-6" />

              <Text className="text-[13px] color-textSecondary font-[500] text-center px-4">
                Please present this token at the station when you arrive for
                your service.
              </Text>
            </View>

            {/* Ticket Notches */}
            <View className="absolute left-[-12px] top-[48%] w-6 h-6 rounded-full bg-background border border-border/50" />
            <View className="absolute right-[-12px] top-[48%] w-6 h-6 rounded-full bg-background border border-border/50" />
          </View>

          {/* Station Details */}
          <View className="w-full px-2">
            <Text className="text-[14px] font-[800] color-textSecondary uppercase tracking-widest mb-5 px-1">
              Station Details
            </Text>

            <View className="bg-card rounded-[28px] p-4 flex-row items-center border border-border/50 shadow-sm mb-6">
              <Image
                source={{
                  uri:
                    (shopImage as string) ||
                    "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80",
                }}
                className="w-20 h-20 rounded-2xl bg-background"
              />
              <View className="flex-1 ml-4 py-1">
                <Text
                  className="text-[16px] font-[800] color-text"
                  numberOfLines={1}
                >
                  {shopName || "Speedy Wash Station"}
                </Text>
                <View className="flex-row items-center mt-1.5 mb-1.5">
                  <View className="bg-primary/20 px-1.5 py-0.5 rounded-md flex-row items-center">
                    <Ionicons name="star" size={10} color={Colors.primary} />
                    <Text className="text-[11px] font-[900] color-primary ml-1">
                      {shopRating || "4.8"}
                    </Text>
                  </View>
                  <View className="w-1 h-1 rounded-full bg-border mx-2" />
                  <Text className="text-[12px] color-textSecondary font-[600]">
                    {date}
                  </Text>
                </View>
                <Text
                  className="text-[12px] color-textSecondary font-[500]"
                  numberOfLines={1}
                >
                  {shopAddress || "123 Main St, Downtown"}
                </Text>
              </View>
            </View>

            {/* Action Row */}
            <View className="flex-row gap-4">
              <TouchableOpacity className="flex-1 flex-row items-center justify-center h-14 bg-card border border-border rounded-2xl shadow-sm">
                <Ionicons name="call" size={18} color={Colors.primary} />
                <Text className="text-[14px] font-[800] color-text ml-2">
                  Call Shop
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center h-14 bg-primary rounded-2xl shadow-lg shadow-primary/20"
                onPress={handleNavigate}
              >
                <Ionicons name="navigate" size={18} color="#000" />
                <Text className="text-[14px] font-[800] color-black ml-2">
                  Navigate
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Return Action */}
      <View className="absolute bottom-0 left-0 right-0 bg-card p-6 pb-10 border-t border-border shadow-2xl">
        <TouchableOpacity
          className="bg-background h-14 rounded-2xl items-center justify-center border border-border"
          onPress={() => router.replace("/(tabs)/home")}
        >
          <Text className="text-[16px] font-[900] color-textSecondary">
            Back to Dashboard
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}
