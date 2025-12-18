import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const focused = state.index === index;

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
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.tab,
                  focused ? styles.activeTab : styles.inactiveTab,
                ]}
              >
                <Ionicons
                  name={icon}
                  size={22}
                  color={focused ? "#000" : "#000"}
                />

                {focused && (
                  <Text style={styles.label}>{label}</Text>
                )}
              </View>
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
    alignItems: "center",
    justifyContent: "center",
  },

  inactiveTab: {
    width: 48,
    height: 48,
    backgroundColor: "#fff",
    borderRadius: 24,
  },

  activeTab: {
    flexDirection: "row",
    height: 48,
    backgroundColor: "#C8F000",
    borderRadius: 24,
    paddingHorizontal: 18,
    alignItems: "center",
  },

  label: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
});
