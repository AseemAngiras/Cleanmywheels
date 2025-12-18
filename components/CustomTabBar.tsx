import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

export function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {state.routes.map((route: any, index: number) => {
          const focused = state.index === index;

          const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

          useEffect(() => {
            Animated.spring(progress, {
              toValue: focused ? 1 : 0,
              useNativeDriver: false,
              friction: 8,
              tension: 80,
            }).start();
          }, [focused]);

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
            route.name === "home"
              ? focused ? "home" : "home-outline"
              : route.name === "my-cars"
              ? focused ? "car" : "car-outline"
              : route.name === "bookings"
              ? focused ? "receipt" : "receipt-outline"
              : focused ? "person" : "person-outline";

          const label =
            route.name === "home"
              ? "Home"
              : route.name === "my-cars"
              ? "My Cars"
              : route.name === "bookings"
              ? "Bookings"
              : "Profile";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.tab,
                  focused ? styles.activeTab : styles.inactiveTab,
                  { width },
                ]}
              >
                <Ionicons
                  name={icon}
                  size={22}
                  color="#000"
                />

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
              </Animated.View>
            </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
    paddingLeft: 23,
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
