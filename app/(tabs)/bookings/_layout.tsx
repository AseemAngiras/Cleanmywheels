import { RootState } from "@/store";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";

export default function BookingsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user.user);
  const isAdmin = user?.accountType === "Super Admin";

  if (isAdmin) {
    // Admins get the AdminBookingsScreen via index.tsx, rendered inside this Slot.
    // We return ONLY Slot to avoid wrapping it in the seeker's Header/Layout.
    return <Slot />;
  }

  const isUpcoming = pathname.includes("upcoming");
  const isPast = pathname.includes("past");

  return (
    <ScreenWrapper className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pb-5 pt-2.5 z-10">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={Colors.text} />
        </TouchableOpacity>

        <Text className="text-[22px] font-[600] text-text">My Bookings</Text>

        <View className="w-[26px]" />
      </View>

      {/* Toggle */}
      <View className="flex-row rounded-full mx-4 p-1 mb-2 bg-card z-10 border border-border">
        <TouchableOpacity
          className={`flex-1 py-[10px] items-center rounded-[20px] ${
            isUpcoming ? "bg-primary" : ""
          }`}
          onPress={() => router.replace("/bookings/upcoming-services")}
        >
          <Text
            className={`text-[15px] ${
              isUpcoming ? "text-black font-[600]" : "text-text"
            }`}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-[10px] items-center rounded-[20px] ${
            isPast ? "bg-primary" : ""
          }`}
          onPress={() => router.replace("/bookings/past-services")}
        >
          <Text
            className={`text-[15px] ${
              isPast ? "text-black font-[600]" : "text-text"
            }`}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <Slot />
    </ScreenWrapper>
  );
}
