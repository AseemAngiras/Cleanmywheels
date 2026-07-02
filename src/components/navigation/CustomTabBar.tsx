import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Animated, View, Text } from "react-native";
import { InteractivePressable } from "../ui/InteractivePressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";

const TabItem = ({ route, state, navigation }: any) => {
  const focused = state.routes[state.index].key === route.key;

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
    route.name === "home"
      ? focused
        ? "home"
        : "home-outline"
      : route.name === "subscriptions"
        ? focused
          ? "star"
          : "star-outline"
        : route.name === "dashboard"
          ? focused
            ? "grid"
            : "grid-outline"
          : route.name === "bookings"
            ? focused
              ? "receipt"
              : "receipt-outline"
            : focused
              ? "person"
              : "person-outline";

  const label =
    route.name === "home"
      ? "Home"
      : route.name === "subscriptions"
        ? "Plans"
        : route.name === "dashboard"
          ? "Dashboard"
          : route.name === "bookings"
            ? "Bookings"
            : "Profile";

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate(route.name);
  };

  return (
    <InteractivePressable
      onPress={handlePress}
    >
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
    </InteractivePressable>
  );
};

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const currentRouteKey = state.routes[state.index].key;
  const { options } = descriptors[currentRouteKey];
  const insets = useSafeAreaInsets();

  if (options.tabBarStyle?.display === "none") {
    return null;
  }

  return (
    <View
      className="bg-black border-t border-white/10 flex-row justify-between items-center px-4"
      style={[
        {
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: 12,
        },
      ]}
    >
      {state.routes
        .filter((route: any) =>
          ["home", "subscriptions", "bookings", "profile"].includes(route.name),
        )
        .map((route: any) => (
          <TabItem
            key={route.key}
            route={route}
            state={state}
            navigation={navigation}
          />
        ))}
    </View>
  );
}
