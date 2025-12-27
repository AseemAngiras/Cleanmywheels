import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

export function ShopTabBar({ state, descriptors, navigation }: any) {
    // Filter out unwanted routes if necessary, but href:null handles that in _layout.

    const currentRouteKey = state.routes[state.index].key;
    const { options } = descriptors[currentRouteKey];

    if (options.tabBarStyle?.display === "none") {
        return null;
    }

    console.log('ShopTabBar Routes:', state.routes.map((r: any) => r.name));

    const ORDER = ["dashboard", "bookings", "home", "profile"];

    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {ORDER.map((name, index) => {
                    // Handle route lookup including dashboard variation
                    const route = state.routes.find((r: any) =>
                        r.name === name ||
                        (name === 'dashboard' && r.name === 'dashboard/index')
                    );

                    if (!route) return null;

                    const activeRoute = state.routes[state.index];
                    const focused = activeRoute ? activeRoute.key === route.key : false;

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

                    // Icons specific for Shop Owner
                    const icon =
                        name === "home"
                            ? focused ? "alert-circle" : "alert-circle-outline"
                            : name === "dashboard"
                                ? focused ? "grid" : "grid-outline"
                                : name === "bookings"
                                    ? focused ? "receipt" : "receipt-outline"
                                    : focused ? "person" : "person-outline";

                    const label =
                        name === "home"
                            ? "Complaint"
                            : name === "dashboard"
                                ? "Dashboard"
                                : name === "bookings"
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
        // Let's make it distinct slightly as per user request to "make it separate". 
        // Maybe black background is fine, but let's ensure it handles dashboard correctly.
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
