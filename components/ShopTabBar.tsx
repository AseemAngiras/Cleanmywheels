import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

const TabItem = ({
  name,
  focused,
  onPress,
  label,
}: {
  name: string;
  focused: boolean;
  onPress: () => void;
  label: string;
}) => {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      useNativeDriver: false,
      friction: 8,
      tension: 80,
    }).start();
  }, [focused, progress]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 120],
  });

  const icon =
    name === "subscriptions"
      ? focused
        ? "alert-circle"
        : "alert-circle-outline"
      : name === "dashboard"
        ? focused
          ? "grid"
          : "grid-outline"
        : name === "bookings"
          ? focused
            ? "receipt"
            : "receipt-outline"
          : focused
            ? "person"
            : "person-outline";

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        className={`h-12 rounded-[24px] flex-row items-center justify-center overflow-hidden ${
          focused ? "bg-primary px-[18px]" : "bg-transparent"
        }`}
        style={[{ width }]}
      >
        <Ionicons
          name={icon as any}
          size={22}
          color={focused ? "#000" : Colors.textSecondary}
        />
        {focused && (
          <Animated.Text
            className="ml-2 text-sm font-bold text-black"
            style={[
              {
                opacity: progress,
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {label}
          </Animated.Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function ShopTabBar({ state, descriptors, navigation }: any) {
  const currentRouteKey = state.routes[state.index].key;
  const { options } = descriptors[currentRouteKey];
  const insets = useSafeAreaInsets();

  if (options.tabBarStyle?.display === "none") {
    return null;
  }

  const ORDER = ["dashboard", "bookings", "subscriptions", "profile"];

  return (
    <View
      className="absolute left-4 right-4"
      style={[{ bottom: Math.max(insets.bottom, 12) }]}
    >
      <View className="bg-[#1C1C1C]/95 border border-white/5 rounded-[40px] p-[10px] flex-row justify-between items-center shadow-2xl">
        {ORDER.map((name) => {
          const route = state.routes.find(
            (r: any) =>
              r.name === name ||
              (name === "dashboard" && r.name === "dashboard/index"),
          );

          if (!route) return null;

          const activeRoute = state.routes[state.index];
          const focused = activeRoute ? activeRoute.key === route.key : false;

          const label =
            name === "subscriptions"
              ? "Subscription"
              : name === "dashboard"
                ? "Dashboard"
                : name === "bookings"
                  ? "Bookings"
                  : "Profile";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={name}
              name={name}
              focused={focused}
              onPress={onPress}
              label={label}
            />
          );
        })}
      </View>
    </View>
  );
}
