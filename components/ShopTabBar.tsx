import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  const labelOpacity = progress;
  const labelTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
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
        style={[
          styles.tab,
          focused ? styles.activeTab : styles.inactiveTab,
          { width },
        ]}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={focused ? "#000" : "#94a3b8"}
        />
        {focused && (
          <Animated.Text
            style={[
              styles.label,
              {
                opacity: labelOpacity,
                transform: [{ translateX: labelTranslate }],
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
    <View style={[styles.wrapper, { bottom: 12 + insets.bottom }]}>
      <View style={styles.container}>
        {ORDER.map((name, index) => {
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

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
  },
  container: {
    backgroundColor: "#1C1C1C",
    borderRadius: 40,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tab: {
    height: 48,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  inactiveTab: {
    // No specific style needed for inactive items inside animated view
  },
  activeTab: {
    backgroundColor: "#C8F000",
    paddingHorizontal: 18,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
});
